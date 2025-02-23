import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
    username: { type: String, unique: true, required: true, minlength: 3 },
    email: { type: String, unique: true, required: true },
    password: { type: String, required: true, minlength: 6 },
    profilePicture: { type: String, default: ''},
    private: { type: Boolean, default: false },
    bio: { type: String, default: '' },
    gender: { type: String, enum: ['male', 'female'] },
    followers: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    followings: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    followRequests: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    posts: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Post' }],
    bookmarks: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Post' }],
}, { timestamps: true });

export const User = mongoose.model('User', userSchema);