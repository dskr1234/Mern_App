const express = require('express');
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const cors = require('cors');
require('dotenv').config();
const app = express();

// Define the Post Schema as a subdocument (nested)
const PostSchema = new mongoose.Schema({
    title: { type: String, required: true },
    content: { type: String, required: true },
    createdAt: { type: Date, default: Date.now },
});

// Define the User Schema, embedding posts as an array of objects
const UserSchema = new mongoose.Schema({
    id: { type: String, required: true, unique: true },
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    posts: [PostSchema], // Embedding the Post schema as an array
});

const User = mongoose.model('User', UserSchema);

app.use(cors());
app.use(express.json());

// Register User
app.post('/registerUser', async (req, res) => {
    const { id, name, email, password } = req.body;

    if (!id.trim() || !name.trim() || !email.trim() || !password.trim()) {
        return res.status(400).json({ message: 'All fields are required' });
    }

    try {
        const hashedPassword = await bcrypt.hash(password, 10);
        const newUser = new User({ id, name, email, password: hashedPassword });
        await newUser.save();
        return res.status(201).json({ message: 'User registered successfully' });
    } catch (err) {
        if (err.code === 11000) {
            return res.status(409).json({ message: 'User already exists' });
        }
        return res.status(500).json({ message: err.message });
    }
});

// Create Post for User
app.post('/createPost', async (req, res) => {
    const { userId, title, content } = req.body;

    if (!userId || !title || !content) {
        return res.status(400).json({ message: 'All fields are required' });
    }

    try {
        const user = await User.findOne({ id: userId });
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        // Create the new post
        const newPost = { title, content };

        // Push the new post to the user's posts array
        user.posts.push(newPost);

        // Save the user with the new post added
        await user.save();

        return res.status(201).json({ message: 'Post created successfully', newPost });
    } catch (err) {
        return res.status(500).json({ message: err.message });
    }
});

// Connect to MongoDB and start server
mongoose.connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true })
    .then(() => {
        console.log('MongoDB Connected');
        app.listen(5000, () => {
            console.log('Server is running at http://localhost:5000');
        });
    })
    .catch((err) => {
        console.error('Error occurred while connecting to MongoDB', err);
    });
