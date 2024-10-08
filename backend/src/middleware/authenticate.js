const jwt = require('jsonwebtoken');
const path = require('path');
const { get_database } = require('../config/db_utils');
require('dotenv').config({ path: path.resolve(__dirname, '../../.env') });

const authenticateGoogleJWT = async (req, res, next) => {
  try {
    // Check if Authorization header is present
    const authHeader = req.headers['authorization'];
    if (!authHeader) {
      return res.status(401).json({ message: 'Authorization header missing' });
    }

    // Extract the token from the Authorization header
    const token = authHeader.split(' ')[1];
    if (!token) {
      return res.status(401).json({ message: 'Token missing from authorization header' });
    }

    // Verify the token
    const JWT_SECRET = process.env.JWT_SECRET;
    const decoded = jwt.verify(token, JWT_SECRET);
    
    // Extract gmail from decoded token
    const { gmail } = decoded;
    console.log("Decoded Gmail from Token:", gmail);

    if (!gmail) {
      return res.status(403).json({ message: 'Gmail not found in token' });
    }

    // Query to check Gmail in the faculty table
    const facultyQuery = 'SELECT * FROM faculty WHERE gmail = ?';
    const facultyRecord = await get_database(facultyQuery, [gmail]);

    let studentRecord = [];
    if (facultyRecord.length === 0) {
      // If not in faculty table, check in students table
      const studentQuery = 'SELECT * FROM students WHERE gmail = ?';
      studentRecord = await get_database(studentQuery, [gmail]);
    }

    // If no records are found in both faculty and students table
    if (facultyRecord.length === 0 && studentRecord.length === 0) {
      return res.status(403).json({ message: 'Gmail not found in the database' });
    }

    // Store user information in request object for further use in next middleware or routes
    req.user = decoded;
    next();
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return res.status(403).json({ message: 'Token has expired' });
    } else if (error.name === 'JsonWebTokenError') {
      return res.status(403).json({ message: 'Invalid token' });
    } else {
      console.error("Error in token verification:", error);
      return res.status(500).json({ message: 'Internal Server Error' });
    }
  }
};

module.exports = authenticateGoogleJWT;
