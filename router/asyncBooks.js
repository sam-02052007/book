const booksdb = require('./booksdb.js');
const axios = require('axios');

// Task 10: Get all books using async callback
async function getAllBooks() {
    return new Promise((resolve) => {
        setTimeout(() => {
            resolve(booksdb);
        }, 1000);
    });
}

// Task 11: Search by ISBN using Promises
function searchByISBN(isbn) {
    return new Promise((resolve, reject) => {
        setTimeout(() => {
            const book = booksdb[isbn];
            if (book) {
                resolve(book);
            } else {
                reject(new Error("Book not found"));
            }
        }, 1000);
    });
}

// Task 12: Search by Author
async function searchByAuthor(author) {
    return new Promise((resolve) => {
        setTimeout(() => {
            const books = Object.entries(booksdb)
                .filter(([_, book]) => book.author.toLowerCase().includes(author.toLowerCase()))
                .map(([isbn, book]) => ({ isbn, ...book }));
            resolve(books);
        }, 1000);
    });
}

// Task 13: Search by Title
async function searchByTitle(title) {
    return new Promise((resolve) => {
        setTimeout(() => {
            const books = Object.entries(booksdb)
                .filter(([_, book]) => book.title.toLowerCase().includes(title.toLowerCase()))
                .map(([isbn, book]) => ({ isbn, ...book }));
            resolve(books);
        }, 1000);
    });
}

module.exports = {
    getAllBooks,
    searchByISBN,
    searchByAuthor,
    searchByTitle
}; 