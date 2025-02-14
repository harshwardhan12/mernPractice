import express from 'express';
import isAuthenticated from '../middlewares/isAuthenticated.js';
import upload from '../middlewares/multer.js';
import { addComment, addNewPost, bookmarkPost, deletePost, getAllPost, getCommentsOfPost, getUserPost, likeOrUnlikePost } from '../controllers/post.controller.js';

const router = express.Router();

router.route('/add-post').post(isAuthenticated, upload.single('image'), addNewPost);
router.route('/feed').get(isAuthenticated, getAllPost);
router.route('/user-posts').get(isAuthenticated, getUserPost);

router.route('/:id/like-unlike').put(isAuthenticated, likeOrUnlikePost);
router.route('/:id/comment').post(isAuthenticated, addComment);
router.route('/:id/get-comment').post(isAuthenticated, getCommentsOfPost);

router.route("/delete/:id").delete(isAuthenticated, deletePost);
router.route("/:id/bookmark").put(isAuthenticated, bookmarkPost);




export default router;