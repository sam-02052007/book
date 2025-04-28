const express = require('express');
const router = express.Router();
const booksdb = require('./booksdb.js');

// In-memory user database
let users = [];

// Task 6: Register new user
router.post('/register', (req, res) => {
    const { username, password } = req.body;
    
    if (!username || !password) {
        return res.status(400).json({ message: "Username and password are required" });
    }

    if (users.find(user => user.username === username)) {
        return res.status(400).json({ message: "Username already exists" });
    }

    users.push({ username, password });
    res.status(201).json({ message: "User registered successfully" });
});

// Task 7: Login as registered user
router.post('/login', (req, res) => {
    const { username, password } = req.body;
    
    const user = users.find(user => user.username === username && user.password === password);
    
    if (!user) {
        return res.status(401).json({ message: "Invalid username or password" });
    }

    res.json({ message: "Login successful" });
});

// Task 8: Add/Modify book review
router.put('/books/review/:isbn', (req, res) => {
    const { username, review } = req.body;
    const isbn = req.params.isbn;

    if (!booksdb[isbn]) {
        return res.status(404).json({ message: "Book not found" });
    }

    booksdb[isbn].reviews[username] = review;
    res.json({ message: "Review added/modified successfully" });
});

// Task 9: Delete book review
router.delete('/books/review/:isbn', (req, res) => {
    const { username } = req.body;
    const isbn = req.params.isbn;

    if (!booksdb[isbn]) {
        return res.status(404).json({ message: "Book not found" });
    }

    if (!booksdb[isbn].reviews[username]) {
        return res.status(404).json({ message: "Review not found" });
    }

    delete booksdb[isbn].reviews[username];
    res.json({ message: "Review deleted successfully" });
});

module.exports = router; 