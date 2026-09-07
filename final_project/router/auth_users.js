const express = require('express');
const jwt = require('jsonwebtoken');
let books = require('./booksdb.js');

const regd_users = express.Router();

let users = [];

const JWT_SECRET = 'expressBookReviewSecretKey';

// Check whether username is already registered
const isValid = (username) => {
    return users.some(user => user.username === username);
};

// Check username and password
const authenticatedUser = (username, password) => {
    return users.some(
        user => user.username === username && user.password === password
    );
};


// Login - only registered users can login
regd_users.post('/login', (req, res) => {
    const { username, password } = req.body;

    if (!username || !password) {
        return res.status(400).json({
            message: 'Username and password are required'
        });
    }

    if (!authenticatedUser(username, password)) {
        return res.status(401).json({
            message: 'Invalid username or password'
        });
    }

    const token = jwt.sign(
        { username: username },
        JWT_SECRET,
        { expiresIn: '1h' }
    );

    return res.status(200).json({
        message: 'Login successful',
        username: username,
        token: token
    });
});


// Authentication middleware
const authenticateToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
        return res.status(401).json({
            message: 'Authentication required'
        });
    }

    jwt.verify(token, JWT_SECRET, (err, user) => {
        if (err) {
            return res.status(403).json({
                message: 'Invalid or expired token'
            });
        }

        req.user = user;
        next();
    });
};


// Get authenticated user's review for a book
regd_users.get('/auth/review/:isbn', authenticateToken, (req, res) => {
    const isbn = req.params.isbn;

    if (!books[isbn]) {
        return res.status(404).json({
            message: 'Book not found'
        });
    }

    const username = req.user.username;

    return res.status(200).json({
        isbn: isbn,
        username: username,
        review: books[isbn].reviews[username] || null
    });
});


// Add or modify a book review
regd_users.put('/auth/review/:isbn', authenticateToken, (req, res) => {
    const isbn = req.params.isbn;

    if (!books[isbn]) {
        return res.status(404).json({
            message: 'Book not found'
        });
    }

    const username = req.user.username;

    const review =
        req.body.review ||
        req.query.review;

    if (!review) {
        return res.status(400).json({
            message: 'Review is required'
        });
    }

    books[isbn].reviews[username] = review;

    return res.status(200).json({
        message: 'Review added/modified successfully',
        isbn: isbn,
        username: username,
        review: review,
        reviews: books[isbn].reviews
    });
});


// Delete a book review
regd_users.delete('/auth/review/:isbn', authenticateToken, (req, res) => {
    const isbn = req.params.isbn;

    if (!books[isbn]) {
        return res.status(404).json({
            message: 'Book not found'
        });
    }

    const username = req.user.username;

    if (!books[isbn].reviews[username]) {
        return res.status(404).json({
            message: 'Review not found'
        });
    }

    delete books[isbn].reviews[username];

    return res.status(200).json({
        message: 'Review deleted successfully',
        isbn: isbn,
        reviews: books[isbn].reviews
    });
});


module.exports.authenticated = regd_users;
module.exports.isValid = isValid;
module.exports.users = users;
