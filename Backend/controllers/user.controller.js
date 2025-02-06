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
            followings: user.followings,
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
            user: userPayload, // Send the user information
            token: token,
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
        let user = await User.findById(userId).select('-password');

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

        const user = await User.findById(userId).select('-password');

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

        const suggestedUsers = await User.find({_id: {$ne: req.id}}).select('-password');
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

export const followOrUnfollow = async (req, res) => {
    try {
        const currentUserId = req.id;
        const targetUserId = req.params.id;

        if (currentUserId === targetUserId) {
            return res.status(400).json({
                message: 'You cannot follow/unfollow yourself',
                success: false,
            });
        }

        // const user = await User.findById(currentUser);
        // const targetUser = await User.findById(jiskoFollowKrunga);

        const [currentUser, targetUser] = await Promise.all([
            User.findById(currentUserId),
            User.findById(targetUserId),
        ]);


        if (!currentUser || !targetUser) {
            return res.status(404).json({
                message: 'User not found',
                success: false,
            });
        }

        const isFollowing = currentUser.followings.includes(targetUserId);

        if (isFollowing) {
            //Unfollow krne ka logic
            await Promise.all([
                User.findByIdAndUpdate(currentUserId, {$pull: {followings: targetUserId}}, {new: true}),
                User.findByIdAndUpdate(targetUserId, {$pull: {followers: currentUserId}}, {new: true}),
            ]);

            return res.status(200).json({
                message: `Unfollowed ${targetUser.username} successfully.`,
                success: true,
            })

        } else {
            //Follow krne ka logic
            if (targetUser.private) {
                // ✅ Follow Request Logic for Private Account
                if (targetUser.followRequests.includes(currentUserId)) {
                    return res.status(400).json({
                        message: 'Follow request already sent.',
                        success: false,
                    });
                }

                await User.findByIdAndUpdate(targetUserId, {$addToSet: {followRequests: currentUserId}}, {new: true});
                return res.status(200).json({
                    message: 'Follow request sent.',
                    success: true,
                });

            } else {
                await Promise.all([
                    User.findByIdAndUpdate(currentUserId, {$addToSet: {followings: targetUserId}}, {new: true}),
                    User.findByIdAndUpdate(targetUserId, {$addToSet: {followers: currentUserId}}, {new: true}),
                ]);

                return res.status(200).json({
                    message: `Now following ${targetUser.username}.`,
                    success: true,
                });
            }
        }
    } catch (error) {
        console.error('Error during followOrUnfollow:', error);
        return res.status(500).json({
            message: 'Internal server error',
            success: false,
        });
    }
};

export const handleFollowRequest = async (req, res) => {
    try {
        const {action} = req.body;
        const userId = req.id;
        const requestSenderId = req.params.id;

        const user = await User.findById(userId);
        const requestSender = await User.findById(requestSenderId);

        if (!user || !requestSender) {
            return res.status(404).json({message: 'User not found', success: false,});
        }
        if (!user.followRequests.includes(requestSenderId)) {
            return res.status(404).json({message: 'No follow request found', success: false,});
        }

        if (action === 'accept') {
            await Promise.all([
                User.updateOne({_id: userId}, {
                    $pull: {followRequests: requestSenderId},
                    $addToSet: {followers: requestSenderId}
                }),
                User.updateOne({_id: requestSenderId}, {$addToSet: {followings: userId}})
            ]);

            return res.status(200).json({message: 'Follow request accepted', success: true});
        } else if (action === 'reject') {
            await Promise.all([
                User.updateOne({_id: userId}, {$pull: {followRequests: requestSenderId}}),
            ]);

            return res.status(200).json({message: 'Follow request rejected', success: true});
        }

        return res.status(400).json({message: 'Invalid action', success: false});
    } catch (error) {
        console.error('Error handling follow request:', error);
        return res.status(500).json({message: 'Internal server error', success: false});
    }
};

export const toggleProfilePrivacy = async (req, res) => {
    try {
        const userId = req.id; // Logged-in user
        const user = await User.findById(userId);

        if (!user) {
            return res.status(404).json({
                message: 'User not found',
                success: false,
            });
        }

        // Toggle the privacy status
        user.private = !user.private;
        await user.save();

        return res.status(200).json({
            message: `Profile is now ${user.private ? 'Private' : 'Public'}`,
            success: true,
            private: user.private,
        });

    } catch (error) {
        console.error('Error during profile privacy toggle:', error);
        return res.status(500).json({
            message: 'Internal server error',
            success: false,
        });
    }
};

export const removeFollower = async (req, res) => {
    try {
        const userId = req.id;
        const followerId = req.params.id;

        const user = await User.findById(userId);
        const follower = await User.findById(followerId);

        if (!user || !follower) {
            return res.status(404).json({
                message: 'User not found',
                success: false,
            });
        }

        if (!user.followers.includes(followerId)) {
            return res.status(400).json({message: 'This user is not following you.', success: false});
        }

        await Promise.all([
            User.updateOne({_id: userId}, {$pull: {followers: followerId}}),
            User.updateOne({_id: followerId}, {$pull: {followings: userId}})

            // User.findByIdAndUpdate(userId, {$pull: {followers: followerId}}, {new: true}),
            // User.findByIdAndUpdate(followerId, {$pull: {followers: userId}}, {new: true})

        ]);

        return res.status(200).json({message: 'Follower removed successfully', success: true});

    } catch (error) {
        console.error('Error during removeFollower:', error);
        return res.status(500).json({message: 'Internal server error',success: false});
    }
};