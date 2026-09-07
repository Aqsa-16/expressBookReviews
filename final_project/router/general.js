const express = require('express');
const axios = require('axios');

let books = require('./booksdb.js');
let isValid = require('./auth_users.js').isValid;
let users = require('./auth_users.js').users;

const public_users = express.Router();


// Internal API used by Axios
public_users.get('/api/books', (req, res) => {
    res.json(books);
});


// Get the book list available in the shop
public_users.get('/', async (req, res) => {
    try {
        const response = await axios.get(
            `http://localhost:${process.env.PORT || 5000}/api/books`
        );

        res.status(200).json(response.data);
    } catch (error) {
        res.status(500).json({
            message: 'Error retrieving books',
            error: error.message
        });
    }
});


// Get book details based on ISBN
public_users.get('/isbn/:isbn', async (req, res) => {
    try {
        const response = await axios.get(
            `http://localhost:${process.env.PORT || 5000}/api/books`
        );

        const isbn = req.params.isbn;
        const book = response.data[isbn];

        if (book) {
            res.status(200).json(book);
        } else {
            res.status(404).json({
                message: 'Book not found'
            });
        }
    } catch (error) {
        res.status(500).json({
            message: 'Error retrieving book',
            error: error.message
        });
    }
});


// Get book details based on author
public_users.get('/author/:author', async (req, res) => {
    try {
        const response = await axios.get(
            `http://localhost:${process.env.PORT || 5000}/api/books`
        );

        const author = decodeURIComponent(req.params.author).toLowerCase();

        const result = Object.values(response.data).filter(
            book => book.author.toLowerCase() === author
        );

        res.status(200).json(result);
    } catch (error) {
        res.status(500).json({
            message: 'Error retrieving books',
            error: error.message
        });
    }
});


// Get all books based on title
public_users.get('/title/:title', async (req, res) => {
    try {
        const response = await axios.get(
            `http://localhost:${process.env.PORT || 5000}/api/books`
        );

        const title = decodeURIComponent(req.params.title).toLowerCase();

        const result = Object.values(response.data).filter(
            book => book.title.toLowerCase() === title
        );

        res.status(200).json(result);
    } catch (error) {
        res.status(500).json({
            message: 'Error retrieving books',
            error: error.message
        });
    }
});


// Get book review
public_users.get('/review/:isbn', async (req, res) => {
    try {
        const response = await axios.get(
            `http://localhost:${process.env.PORT || 5000}/api/books`
        );

        const isbn = req.params.isbn;
        const book = response.data[isbn];

        if (book) {
            res.status(200).json(book.reviews);
        } else {
            res.status(404).json({
                message: 'Book not found'
            });
        }
    } catch (error) {
        res.status(500).json({
            message: 'Error retrieving review',
            error: error.message
        });
    }
});


module.exports.general = public_users;
