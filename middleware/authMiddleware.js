// middleware/authMiddleware.js
const jwt = require('jsonwebtoken');

const authenticateToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

    if (token == null) {
        return res.status(401).json({ message: 'Authentication token required' }); // if there isn't any token
    }

    const secret = process.env.JWT_SECRET || 'your_jwt_secret'; // Use the same secret as in auth.js

    jwt.verify(token, secret, (err, user) => {
        if (err) {
            console.error('JWT Verification Error:', err.message);
            return res.status(403).json({ message: 'Invalid or expired token' }); // if token is invalid
        }
        req.user = user; // Add the decoded user payload (e.g., { userId: '...', username: '...' }) to the request object
        console.log('Authenticated User:', req.user); // For debugging
        next(); // pass the execution off to whatever request the client intended
    });
};

module.exports = authenticateToken;