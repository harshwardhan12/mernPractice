import express from 'express';
import {
    editProfile,
    followOrUnfollow,
    getProfile,
    getSuggestedUser, handleFollowRequest,
    login,
    logout,
    register, removeFollower, toggleProfilePrivacy
} from "../controllers/user.controller.js";
import isAuthenticated from "../middlewares/isAuthenticated.js";
import upload from "../middlewares/multer.js";
import validateUser from '../middlewares/validateUser.js';

const router = express.Router();

router.route('/register').post(validateUser("register"), register);
router.route('/login').post(validateUser("login"), login);
router.route('/logout').get(logout);

router.route('/profile/:id').get(isAuthenticated, getProfile);
router.route('/profile/edit').put(isAuthenticated, upload.single('profilePicture'), editProfile);
router.route('/profile/privacy').put(isAuthenticated, toggleProfilePrivacy); // Added a route for toggling privacy

router.route('/suggested').get(isAuthenticated, getSuggestedUser);

router.route('/:id/follow').put(isAuthenticated, followOrUnfollow);
router.route('/:id/follow-request').put(isAuthenticated, handleFollowRequest);
router.delete('/remove-follower/:id', isAuthenticated, removeFollower);
    
export default router;