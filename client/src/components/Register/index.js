import React, { useState } from 'react';
import axios from 'axios';

function App() {
    const [user, setUser] = useState({
        id: '',
        name: '',
        email: '',
        password: '',
    });

    const [post, setPost] = useState({
        userId: '',
        title: '',
        content: '',
    });

    const [err, setErr] = useState('');
    const [message, setMessage] = useState('');

    // Register User
    const onRegisterUser = async (event) => {
        event.preventDefault();
        try {
            const res = await axios.post('http://localhost:5000/registerUser', user);
            setMessage(res.data.message);
            setErr('');
        } catch (error) {
            setErr(error.response?.data?.message);
            setMessage('');
        }
    };

    // Create Post
    const onCreatePost = async (event) => {
        event.preventDefault();
        try {
            const res = await axios.post('http://localhost:5000/createPost', post);
            setMessage(res.data.message);
            setErr('');
            setPost({
                userId: '',
                title: '',
                content: '',
            });
        } catch (error) {
            setErr(error.response?.data?.message);
            setMessage('');
        }
    };

    return (
        <div className="App">
            <h1>User Registration and Post Creation</h1>

            <h2>Register User</h2>
            <form onSubmit={onRegisterUser}>
                <input
                    type="text"
                    placeholder="ID"
                    value={user.id}
                    onChange={(e) => setUser({ ...user, id: e.target.value })}
                />
                <input
                    type="text"
                    placeholder="Name"
                    value={user.name}
                    onChange={(e) => setUser({ ...user, name: e.target.value })}
                />
                <input
                    type="email"
                    placeholder="Email"
                    value={user.email}
                    onChange={(e) => setUser({ ...user, email: e.target.value })}
                />
                <input
                    type="password"
                    placeholder="Password"
                    value={user.password}
                    onChange={(e) => setUser({ ...user, password: e.target.value })}
                />
                <button type="submit">Register</button>
            </form>

            <h2>Create Post</h2>
            <form onSubmit={onCreatePost}>
                <input
                    type="text"
                    placeholder="User ID"
                    value={post.userId}
                    onChange={(e) => setPost({ ...post, userId: e.target.value })}
                />
                <input
                    type="text"
                    placeholder="Title"
                    value={post.title}
                    onChange={(e) => setPost({ ...post, title: e.target.value })}
                />
                <textarea
                    placeholder="Content"
                    value={post.content}
                    onChange={(e) => setPost({ ...post, content: e.target.value })}
                />
                <button type="submit">Create Post</button>
            </form>

            {message && <p style={{ color: 'green' }}>{message}</p>}
            {err && <p style={{ color: 'red' }}>{err}</p>}
        </div>
    );
}

export default App;
