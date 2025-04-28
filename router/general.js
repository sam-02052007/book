const express = require('express');
let books = require("./booksdb.js");
let isValid = require("./auth_users.js").isValid;
let users = require("./auth_users.js").users;
const public_users = express.Router();


public_users.post("/register", (req,res) => {
  const {username, password} = req.body

  if (username && password) {
    if (!isValid(username))
      return res.status(400).json({message: 'User with following username already exists'})

    users.push({username, password})
    return res.status(201).json({message: 'User successfully registered'})
  } else {
    return res.status(400).json({message: "Username or password not provided"})
  }
});

// Get the book list available in the shop
public_users.get('/',async function (req, res) {
  const getBooksPromise = new Promise((resolve, reject) => {
    resolve(res.status(200).send(JSON.stringify({books}, null, 4)))
  })
  return await getBooksPromise
});

// Get book details based on ISBN
public_users.get('/isbn/:isbn',async function (req, res) {
  const isbn = req.params.isbn

  const getBookPromise = new Promise((resolve, reject) => {
    const searchBook = books[isbn]

    if (searchBook)
      resolve(res.status(200).send(searchBook))
    else
      resolve(res.status(404).json({message: "No book found"}))
  })

  return await getBookPromise
 });

// Get book details based on author
public_users.get('/author/:author',async function (req, res) {
  const author = req.params.author

  const getBooksPromise = new Promise((resolve, reject) => {
    let searchBooks = []

    Object.keys(books).forEach(key => {
      if (books[key].author.toLowerCase() === author.toLowerCase())
        searchBooks.push(books[key])
    })

    resolve(res.status(200).send(JSON.stringify({books: searchBooks}, null, 4)))
  })

  return await getBooksPromise
});

// Get all books based on title
public_users.get('/title/:title',async function (req, res) {
  const title = req.params.title

  const getBookPromise = new Promise((resolve, reject) => {
    let searchBooks = []

    Object.keys(books).forEach(key => {
      if (books[key].title.toLowerCase() === title.toLowerCase())
        searchBooks.push(books[key])
    })

    resolve(res.status(200).send(JSON.stringify({books: searchBooks}, null, 4)))
  })

  return await getBookPromise
});

//  Get book review
public_users.get('/review/:isbn',function (req, res) {
  const isbn = req.params.isbn

  const searchBook = books[isbn]

  if (searchBook)
    return res.status(200).send(JSON.stringify({reviews: searchBook.reviews}, null, 4))
  else
    return res.status(404).json({message: "No book found"})
});

module.exports.general = public_users;