const mysql = require("mysql2");
const path = require("path");
require("dotenv").config({ path: path.resolve(__dirname, "../../.env") });

const createDBConnection = () => {
  const dbConnection = mysql.createPool({
    host: process.env.DB_HOST,
    user: process.env.DB_USERNAME,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    waitForConnections: true,
    connectionLimit: 10,  
    queueLimit: 0, 
  });

  const pool = dbConnection.promise();

  dbConnection.on('error', (err) => {
    if (err.code === 'PROTOCOL_CONNECTION_LOST') {
      console.error("MySQL connection was closed.");
    } else if (err.code === 'ER_CON_COUNT_ERROR') {
      console.error("MySQL has too many connections.");
    } else if (err.code === 'ECONNREFUSED') {
      console.error("MySQL connection was refused.");
    }
  });

  dbConnection.on('acquire', (connection) => {
    console.log(`Connection ${connection.threadId} acquired`);
  });

  dbConnection.on('release', (connection) => {
    console.log(`Connection ${connection.threadId} released`);
  });

  return pool;
};

const handleDisconnect = () => {
  const pool = createDBConnection();

  pool.getConnection((err, connection) => {
    if (err) {
      console.error("Error connecting to the database:", err);
      if (err.code === 'PROTOCOL_CONNECTION_LOST') {
        console.log("Attempting to reconnect to MySQL...");
        setTimeout(handleDisconnect, 2000);  
      }
    }

    if (connection) {
      console.log("Connected to MySQL Database successfully.");
      connection.release();  
    }
  });

  pool.on('error', (err) => {
    console.error("MySQL Pool Error:", err);
    if (err.code === 'PROTOCOL_CONNECTION_LOST') {
      console.log("Reconnecting to MySQL...");
      handleDisconnect(); 
    }
  });

  return pool;
};

const pool = handleDisconnect();

module.exports = { pool };
