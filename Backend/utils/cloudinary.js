import { v1 as cloudinary_v1 } from 'cloudinary';
import dotenv from 'dotenv';
dotenv.config({});

cloudinary_v1.config({
    cloud_name: process.env.CLOUD_NAME,
    api_key: process.env.CLOUD_API_KEY,
    api_secret: process.env.CLOUD_API_SECRET,
});

export default cloudinary_v1;