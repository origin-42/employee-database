const mysql = require('mysql2');
require('dotenv').config();

// Create Connection
const con = mysql.createConnection({
    host: process.env.db_host,
    user: process.env.db_user,
    password: '',
    database: 'employee_tracker_db'
});

module.exports = con;