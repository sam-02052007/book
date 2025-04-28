require('dotenv').config();
const express = require('express');
const cors = require('cors');
// const mongoose = require('mongoose'); // Uncomment when database connection is needed

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static(__dirname)); // Serve static files from the root directory

// Basic Route
// Serve index.html for the root route
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

// Book Routes (Tasks 1-5, 10-13)
const bookRoutes = require('./routes/books').router; // Import the router specifically
app.use('/books', bookRoutes);

// User Routes (Tasks 6-7)
const authRoutes = require('./routes/auth').router; // Import the router specifically
app.use('/auth', authRoutes);

// Review routes are currently handled within book routes, requiring authentication later
// We will add authentication middleware before implementing Tasks 8 & 9

// // Connect to MongoDB (Example - uncomment and configure when needed)
// mongoose.connect(process.env.MONGODB_URI, { useNewUrlParser: true, useUnifiedTopology: true })
//   .then(() => console.log('MongoDB connected'))
//   .catch(err => console.error('MongoDB connection error:', err));

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});