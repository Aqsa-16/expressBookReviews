const express = require('express');
const axios = require('axios');

let books = require('./booksdb.js');
let isValid = require('./auth_users.js').isValid;
let users = require('./auth_users.js').users;

const public_users = express.Router();

// Register a new user
public_users.post('/register', (req, res) => {
    const username = req.body.username;
    const password = req.body.password;

    if (!username || !password) {
        return res.status(400).json({
            message: 'Username and password are required'
        });
    }

    if (isValid(username)) {
        return res.status(400).json({
            message: 'Username already exists'
        });
    }

    users.push({
        username: username,
        password: password
    });

    return res.status(201).json({
        message: 'User successfully registered'
    });
});


// Get all books
public_users.get('/', async (req, res) => {
    try {
        const response = await axios.get(
            `http://localhost:${process.env.PORT || 5000}/api/books`
        );

        return res.status(200).json(response.data);
    } catch (error) {
        return res.status(500).json({
            message: 'Unable to retrieve books'
        });
    }
});


// Internal API used by Axios
public_users.get('/api/books', (req, res) => {
    return res.status(200).json(books);
});


// Get book details by ISBN
public_users.get('/isbn/:isbn', (req, res) => {
    const isbn = req.params.isbn;

    if (books[isbn]) {
        return res.status(200).json(books[isbn]);
    }

    return res.status(404).json({
        message: 'Book not found'
    });
});


// Get books by author
public_users.get('/author/:author', (req, res) => {
    const author = req.params.author.toLowerCase();
    const result = {};

    for (const isbn in books) {
        if (books[isbn].author.toLowerCase() === author) {
            result[isbn] = books[isbn];
        }
    }

    if (Object.keys(result).length === 0) {
        return res.status(404).json({
            message: 'No books found for this author'
        });
    }

    return res.status(200).json(result);
});


// Get books by title
public_users.get('/title/:title', (req, res) => {
    const title = req.params.title.toLowerCase();
    const result = {};

    for (const isbn in books) {
        if (books[isbn].title.toLowerCase() === title) {
            result[isbn] = books[isbn];
        }
    }

    if (Object.keys(result).length === 0) {
        return res.status(404).json({
            message: 'No books found with this title'
        });
    }

    return res.status(200).json(result);
});


// Get book review
public_users.get('/review/:isbn', (req, res) => {
    const isbn = req.params.isbn;

    if (!books[isbn]) {
        return res.status(404).json({
            message: 'Book not found'
        });
    }

    return res.status(200).json(books[isbn].reviews);
});


   module.exports.general = public_users;