const jwt = require('jsonwebtoken');
const path = require('path');
const { get_database } = require('../config/db_utils'); 
require('dotenv').config({ path: path.resolve(__dirname, '../../.env') });

const authenticateGoogleJWT = async (req, res, next) => {
  const authHeader = req.headers['userdata']; 

  if (authHeader) {
    try {
      const userdata = JSON.parse(authHeader);
      
      const { token, gmail } = userdata;
      console.log(token)
  
      
      if (!token) {
        return res.status(401).json({ message: 'Token missing from userdata' });
      }
      
      const JWT_SECRET = process.env.JWT_SECRET;
      
      const decoded = jwt.verify(token, JWT_SECRET);

      if (decoded.gmail !== gmail) {
        return res.status(403).json({ message: 'Token Gmail mismatch' });
      }

      req.user = decoded;

      const facultyQuery = 'SELECT * FROM faculty WHERE gmail = ?';
      const facultyRecord = await get_database(facultyQuery, [gmail]);

      let studentRecord;
      if (facultyRecord.length === 0) {
        const studentQuery = 'SELECT * FROM students WHERE gmail = ?';
        studentRecord = await get_database(studentQuery, [gmail]);
      }

      if (facultyRecord.length === 0 && (studentRecord ? studentRecord.length === 0 : true)) {
        return res.status(403).json({ message: 'Gmail not found in database' });
      }

      next(); 
    } catch (err) {
      console.error("Token verification error:", err);
      return res.status(403).json({ message: 'Invalid token or malformed userdata' });
    }
  } else {
    return res.status(401).json({ message: 'Authorization header missing or malformed' });
  }
};

module.exports = authenticateGoogleJWT;
