import mongoose from 'mongoose';

export async function connectToDatabase() {
    const mongoURI = process.env.MONGODB_URI || 'mongodb://localhost:27017/testDB';
    try {
        await mongoose.connect(mongoURI, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
        });
        console.log('Connected to MongoDB successfully');
    } catch (error) {
        console.error('Error connecting to MongoDB:', error);
        throw error;
    }
}
