const express = require('express');
const bodyParser = require('body-parser');
const booksdb = require('./router/booksdb.js');
const axios = require('axios');

const app = express();
const port = 5000;

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Task 1: Get all books
app.get('/books', async (req, res) => {
    try {
        res.json(booksdb);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Task 2: Get book by ISBN
app.get('/books/isbn/:isbn', async (req, res) => {
    try {
        const isbn = req.params.isbn;
        const book = booksdb[isbn];
        if (book) {
            res.json(book);
        } else {
            res.status(404).json({ message: "Book not found" });
        }
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Task 3: Get books by Author
app.get('/books/author/:author', async (req, res) => {
    try {
        const author = req.params.author;
        const books = Object.entries(booksdb)
            .filter(([_, book]) => book.author.toLowerCase().includes(author.toLowerCase()))
            .map(([isbn, book]) => ({ isbn, ...book }));
        res.json(books);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Task 4: Get books by Title
app.get('/books/title/:title', async (req, res) => {
    try {
        const title = req.params.title;
        const books = Object.entries(booksdb)
            .filter(([_, book]) => book.title.toLowerCase().includes(title.toLowerCase()))
            .map(([isbn, book]) => ({ isbn, ...book }));
        res.json(books);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Task 5: Get book reviews
app.get('/books/review/:isbn', async (req, res) => {
    try {
        const isbn = req.params.isbn;
        const book = booksdb[isbn];
        if (book) {
            res.json(book.reviews);
        } else {
            res.status(404).json({ message: "Book not found" });
        }
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
}); 