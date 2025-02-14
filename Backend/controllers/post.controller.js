import { User } from '../models/user.model.js';
import { Post } from '../models/post.model.js';
import { Comment } from '../models/comment.model.js';
import sharp from 'sharp';
import cloudinary from 'cloudinary';

export const addNewPost = async (req, res) => {
    try {
        const { caption } = req.body;
        const image = req.file;
        const authorId = req.id;

        if (!image) return res.status(400).json({ message: 'Image required' });

        // image upload 
        const optimizedImageBuffer = await sharp(image.buffer)
            .resize({ width: 800, height: 800, fit: 'inside' })
            .toFormat('jpeg', { quality: 80 })
            .toBuffer();

        // buffer to data uri
        const fileUri = `data:image/jpeg;base64,${optimizedImageBuffer.toString('base64')}`;
        const cloudResponse = await cloudinary.uploader.upload(fileUri);
        const post = await Post.create({
            caption: caption,
            media: cloudResponse.secure_url,
            author: authorId
        });
        
        await User.findByIdAndUpdate(authorId, { $push: { posts: post._id } });

        await post.populate({ path: 'author', select: '-password' });

        return res.status(201).json({
            message: 'New post added',
            post,
            success: true,
        }); 

    } catch (error) {
        console.error('Error in addNewPost:', error);
        return res.status(500).json({
            message: 'Internal Server Error',
            success: false,
        });
    }
}

export const getAllPost = async (req, res) => {
    try {
        const posts = await Post.find()
            .sort({ createdAt: -1 }) // Sort by newest first
            .populate({ 
                path: 'author', 
                select: 'username profilePicture' 
            })
            .populate({ 
                path: 'comments', 
                options: { sort: { createdAt: -1 } }, // Sort comments by newest first
                populate: { path: 'author', select: 'username profilePicture' } 
            });

        return res.status(200).json({
            success: true,
            posts,
        });

    } catch (error) {
        console.error('Error fetching posts:', error);
        return res.status(500).json({
            success: false,
            message: 'Internal Server Error. Could not retrieve posts.',
        });
    }
};

export const getUserPost = async (req, res) => {
    try {
        const authorId = req.id;
        const posts = await Post.find({ author: authorId })
            .sort({ createdAt: -1 })
            .populate({
                path: 'author',
                select: 'username profilePicture'
            })
            .populate({
                path: 'comments',
                sort: { createdAt: -1 },
                populate: { path: 'author', select: 'username profilePicture' }
            });

        return res.status(200).json({
            posts,
            success: true,
        });

    } catch (error) {
        console.error('Error fetching user posts:', error);
        return res.status(500).json({
            message: 'Internal Server Error',
            success: false,
        });
    }
};

export const likeOrUnlikePost = async (req, res) => {
    try {
        const userId = req.id;
        const postId = req.params.id; 

        // Find the post
        const post = await Post.findById(postId);
        if (!post) {
            return res.status(404).json({
                message: 'Post not found',
                success: false,
            });
        }

        // Check if the user already liked the post
        const hasLiked = post.likes.includes(userId);

        if (hasLiked) {
            // Unlike the post
            await post.updateOne({ $pull: { likes: userId } });
            return res.status(200).json({
                message: 'Post unliked',
                success: true,
            });
        } else {
            // Like the post
            await post.updateOne({ $addToSet: { likes: userId } });
            return res.status(200).json({
                message: 'Post liked',
                success: true,
            });
        }
    } catch (error) {
        console.error('Error in likeOrUnlikePost:', error);
        return res.status(500).json({
            message: 'Internal Server Error',
            success: false,
        });
    }
};

export const addComment = async (req, res) => {
    try {
        const userId = req.id;
        const postId = req.params.id;
        const { text } = req.body;

        const post = await Post.findById(postId);
        if (!post) {
            return res.status(404).json({
                message: 'Post not found',
                success: false,
            });
        }
        if (!text) {
            return res.status(400).json({
                message: 'Comment text required',
                success: false,
            });
        }

        const comment = await Comment.create({
            text,
            author: userId,
            post: postId,
        });

        await comment.populate('author', 'username profilePicture');

        await post.updateOne({ $push: { comments: comment._id } });

        return res.status(201).json({
            message: 'Comment added successfully',
            success: true,
            comment,
        });
    } catch (error) {
        console.error('Error in addComment:', error);
        return res.status(500).json({
            message: 'Internal Server Error',
            success: false,
        });
    }

};

export const getCommentsOfPost = async (req, res) => {
  try {
    const postId = req.params.id;
    const comments = await Comment.find({ post: postId }).populate(
      "author",
      "username profilePicture"
    );
    if (!comments) {
      return res.status(404).json({
        message: "No comments found",
        success: false,
      });
    }

    return res.status(200).json({ comments, success: true });
  } catch (error) {
    console.error("Error in getCommentsOfPost:", error);
    return res.status(500).json({
      message: "Internal Server Error",
      success: false,
    });
  }
};

export const deletePost = async (req, res) => {
    try {
        const userId = req.id;
        const postId = req.params.id;

        const post = await Post.findById(postId);
        if (!post) return res.status(404).json({message: 'Post not found',success: false,});
        
        if (post.author.toString() !== userId) {
            return res.status(403).json({
                message: 'Unauthorized',
                success: false,
            });
        }

        await Post.findByIdAndDelete(postId);

        //remove the post id from the user's post array
        let user = await User.findById(userId);
        user.posts = user.posts.filter((id) => id.toString() !== postId);
        await user.save();

        //delete associated comments
        await Comment.deleteMany({ post: postId });

        return res.status(200).json({
            message: 'Post deleted successfully',
            success: true,
        });

    } catch (error) {
        console.error('Error in deletePost:', error);
        return res.status(500).json({message: 'Internal Server Error',success: false,});
    }
};

export const bookmarkPost = async (req, res) => {
    try {
        const userId = req.id;
        const postId = req.params.id;

        const post = await Post.findById(postId);
        if (!post) {
            return res.status(404).json({message: 'Post not found',success: false,});
        }

        const user = await User.findById(userId);
        if (user.bookmarks.includes(postId)) {
            await user.updateOne({ $pull: { bookmarks: postId } });
            return res.status(200).json({
                type: 'unsaved',
                message: 'Post removed from bookmarks',
                success: true,
            });
        } else {
            await user.updateOne({ $addToSet: { bookmarks: postId } });
            return res.status(200).json({
                type: 'saved',
                message: 'Post added to bookmarks',
                success: true,
            });
        }
    } catch (error) {
        
    }
};