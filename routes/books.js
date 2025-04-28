// routes/books.js
const express = require('express');
const router = express.Router();
const axios = require('axios'); // Required for Tasks 10-13 if fetching externally
const { authenticateToken } = require('../middleware/auth');

// In-memory storage (replace with database in production)
let books = [
    { isbn: "123456789", title: "Sample Book 1", author: "Author 1" },
    { isbn: "987654321", title: "Sample Book 2", author: "Author 2" }
];

let reviews = {};

// Task 1: Get all books
router.get('/', async (req, res) => {
    try {
        res.json(books);
    } catch (err) {
        console.error("Error fetching all books:", err);
        return res.status(500).json({ message: "Failed to fetch books" });
    }
});

// Task 2: Get book by ISBN
router.get('/isbn/:isbn', async (req, res) => {
    try {
        const { isbn } = req.params;
        const book = books.find(b => b.isbn === isbn);
        
        if (!book) {
            return res.status(404).json({ message: "Book not found" });
        }
        
        res.json(book);
    } catch (error) {
        console.error(`Error fetching book with ISBN ${isbn}:`, error.message);
        res.status(500).json({ message: "Internal server error" });
    }
});

// Task 3: Get books by Author
router.get('/author/:author', async (req, res) => {
    try {
        const { author } = req.params;
        const authorBooks = books.filter(b => 
            b.author.toLowerCase().includes(author.toLowerCase())
        );
        
        if (authorBooks.length === 0) {
            return res.status(404).json({ message: "No books found for this author" });
        }
        
        res.json(authorBooks);
    } catch (error) {
        console.error(`Error fetching books by author ${author}:`, error.message);
        res.status(500).json({ message: "Internal server error" });
    }
});

// Task 4: Get books by Title
router.get('/title/:title', async (req, res) => {
    try {
        const { title } = req.params;
        const titleBooks = books.filter(b => 
            b.title.toLowerCase().includes(title.toLowerCase())
        );
        
        if (titleBooks.length === 0) {
            return res.status(404).json({ message: "No books found with this title" });
        }
        
        res.json(titleBooks);
    } catch (error) {
        console.error(`Error fetching books by title ${title}:`, error.message);
        res.status(500).json({ message: "Internal server error" });
    }
});

// Task 5: Get book reviews
router.get('/review/:isbn', (req, res) => {
    const { isbn } = req.params;
    const bookReviews = reviews[isbn] || {};
    res.json(bookReviews);
});

// Task 8: Add/Modify book review (requires authentication)
router.put('/auth/review/:isbn', authenticateToken, (req, res) => {
    const { isbn } = req.params;
    const { review } = req.body;
    const userId = req.user.id;
    const username = req.user.username;

    if (!reviews[isbn]) {
        reviews[isbn] = {};
    }

    reviews[isbn][userId] = {
        username,
        review
    };

    res.json({ message: "Review added/updated successfully" });
});

// Task 9: Delete book review (requires authentication)
router.delete('/auth/review/:isbn', authenticateToken, (req, res) => {
    const { isbn } = req.params;
    const userId = req.user.id;

    if (!reviews[isbn] || !reviews[isbn][userId]) {
        return res.status(404).json({ message: "Review not found" });
    }

    delete reviews[isbn][userId];
    
    // Clean up empty review objects
    if (Object.keys(reviews[isbn]).length === 0) {
        delete reviews[isbn];
    }

    res.json({ message: "Review deleted successfully" });
});

// Tasks 10-13: Node.js methods using Async/Await and Promises
// These methods can be used internally or exposed as additional endpoints

// Task 10: Get all books (Async/Await)
async function getAllBooks() {
    try {
        return books;
    } catch (error) {
        throw new Error("Failed to fetch books");
    }
}

// Task 11: Search by ISBN (Promise)
function searchByISBN(isbn) {
    return new Promise((resolve, reject) => {
        const book = books.find(b => b.isbn === isbn);
        if (book) {
            resolve(book);
        } else {
            reject(new Error("Book not found"));
        }
    });
}

// Task 12: Search by Author
async function searchByAuthor(author) {
    try {
        return books.filter(b => 
            b.author.toLowerCase().includes(author.toLowerCase())
        );
    } catch (error) {
        throw new Error("Failed to search by author");
    }
}

// Task 13: Search by Title
async function searchByTitle(title) {
    try {
        return books.filter(b => 
            b.title.toLowerCase().includes(title.toLowerCase())
        );
    } catch (error) {
        throw new Error("Failed to search by title");
    }
}

module.exports = router;