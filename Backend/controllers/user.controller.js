import {User} from '../models/user.model.js';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import getDataUri from "../utils/datauri.js";
import cloudinary from "../utils/cloudinary.js";

export const register = async (req, res) => {
    try {
        const {username, email, password} = req.body;
        if (!username || !email || !password) {
            return res.status(400).json({
                message: 'Username, email, and password are required.',
                success: false,
            });
        }

        const existingUser = await User.findOne({email});
        if (existingUser) {
            return res.status(409).json({
                message: 'User with this email already exists.',
                success: false,
            });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const newUser = await User.create({
            username,
            email,
            password: hashedPassword,
        });

        return res.status(201).json({
            message: 'User created successfully.',
            success: true,
            user: {
                id: newUser._id,
                username: newUser.username,
                email: newUser.email,
            }
        });
    } catch (error) {
        console.error('Error during user registration:', error);
        return res.status(500).json({
            message: 'Internal Server Error.',
            success: false,
        });
    }
};

export const login = async (req, res) => {
    try {
        const {email, password} = req.body;
        if (!email || !password) {
            return res.status(400).json({
                message: 'Email, and password are required.',
                success: false,
            });
        }

        const user = await User.findOne({email});
        if (!user) {
            return res.status(401).json({
                message: 'Invalid email or password.',
                success: false,
            });
        }

        const isPasswordMatch = await bcrypt.compare(password, user.password);
        if (!isPasswordMatch) {
            return res.status(401).json({
                message: 'Invalid email or password.',
                success: false,
            });
        }

        // Prepare user object to return (excluding password)
        const userPayload = {
            _id: user._id,
            username: user.username,
            email: user.email,
            profilePicture: user.profilePicture,
            bio: user.bio,
            followers: user.followers,
            following: user.following,
            posts: user.posts,
        }

        const token = await jwt.sign({userId: user._id,}, process.env.SECRET_KEY, {expiresIn: '1d'});
        return res.status(200).cookie('token', token, {
            httpOnly: true,
            sameSite: "strict",
            maxAge: 24 * 60 * 60 * 1000
        }).json({
            message: `Welcome ${user.username} !`,
            success: true,
            user: userPayload // Send the user information
        });

    } catch (error) {
        console.error('Error during login:', error);
        return res.status(500).json({
            message: 'Internal server error.',
            success: false,
        })
    }
};

export const logout = async (req, res) => {
    try {
        res.clearCookie('token');
        return res.status(200).json({
            message: 'Logged out successfully.',
            success: true,
        });
    } catch (error) {
        console.error('Error during logout:', error);
        return res.status(500).json({
            message: 'Internal server error',
            success: false,
        });
    }
};

export const getProfile = async (req, res) => {
    try {
        const userId = req.params.id;
        let user = await User.findById(userId);

        if (!user) {
            return res.status(404).json({
                message: 'User not found',
                success: false,
            });
        }

        return res.status(200).json({
            user,
            success: true,
        });

    } catch (error) {
        console.error('Error during getUserProfile:', error);
        return res.status(500).json({
            message: 'Internal server error',
            success: false,
        });
    }
};

export const editProfile = async (req, res) => {
    try {
        const userId = req.id; //from decode.id
        const {bio, gender} = req.body;
        const profilePicture = req.file;
        let cloudResponse;

        if (profilePicture) {
            const fileUri = getDataUri(profilePicture);
            cloudResponse = await cloudinary.uploader.upload(fileUri);
        }

        const user = await User.findById(userId);

        if (!user) {
            return res.status(404).json({
                message: 'User not found',
                success: false,
            });
        }

        if (bio) user.bio = bio;
        if (gender) user.gender = gender;
        if (profilePicture) user.profilePicture = cloudResponse.secure_url;

        await user.save();

        return res.status(200).json({
            message: 'Profile updated successfully.',
            success: true,
            user
        });

    } catch (error) {
        console.error('Error during editProfile:', error);
        return res.status(500).json({
            message: 'Internal server error',
            success: false,
        });

    }
};

export const getSuggestedUser = async (req, res) => {
    try {
        // Find all users except the logged-in user (exclude the user with req.id)
        // The "$ne" (Not Equal) operator ensures the logged-in user is not included

        const suggestedUsers = await User.find({_id: {$ne: req.id}}).select(-password);
        if (suggestedUsers.length === 0) {
            return res.status(404).json({
                message: 'User not found',
            });
        }

        return res.status(200).json({
            success: true,
            users: suggestedUsers
        });
    } catch (error) {
        console.error('Error during getSuggestedUser:', error);
        return res.status(500).json({
            message: 'Something went wrong while fetching suggested users.',
            error: error.message
        });
    }
};

