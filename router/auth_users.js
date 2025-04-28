const express = require('express');
const jwt = require('jsonwebtoken');
let books = require("./booksdb.js");
const registered_users = express.Router();

let users = [];

const isValid = (username)=>{ //returns boolean
  return !users.filter(user => user.username === username).length
}

const authenticatedUser = (username,password)=>{ //returns boolean
  return !!users.filter(user => user.username === username && user.password === password).length
}

//only registered users can login
registered_users.post("/login", (req,res) => {
  const {username, password} = req.body

  if (username && password) {
    if (authenticatedUser(username, password)) {
      let accessToken = jwt.sign({data: password}, 'access', {expiresIn: 60 * 60})

      req.session.authorization = {accessToken, username}
      return res.status(200).json({message: 'User successfully logged in'})
    } else {
      return res.status(400).json({message: 'Invalid username or password'})
    }
  } else {
    return res.status(400).json({message: "Username or password not provided"})
  }
});

// Add a book review
registered_users.put("/auth/review/:isbn", (req, res) => {
  const isbn = req.params.isbn

  const {review} = req.query
  const username = req.session.authorization.username

  const book = books[isbn]

  if (!book)
    return res.status(404).json({message: 'Book with following isbn not found'})

  book.reviews[username] = review

  books[isbn] = {...book}

  return res.status(200).json({message: "Book review successfully added"});
});

// Delete book review
registered_users.delete("/auth/review/:isbn", (req, res) => {
  const isbn = req.params.isbn
  const username = req.session.authorization.username

  const book = books[isbn]

  if (!book)
    return res.status(404).json({message: 'Book with following isbn not found'})

  delete book.reviews[username]

  books[isbn] = {...book}

  return res.status(200).json({message: "Book review successfully deleted"});
})

module.exports.authenticated = registered_users;
module.exports.isValid = isValid;
module.exports.users = users;