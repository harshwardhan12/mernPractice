import mongoose from 'mongoose';

const connectDB = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI, {
            dbName: 'mernInstaClone', // Explicitly specify database name
        });
        console.log("Connected to MongoDB");
    } catch (error) {
        console.error('MongoDB Connection Error:', error);
        process.exit(1);
    }
};

export default connectDB;