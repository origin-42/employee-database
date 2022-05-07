const mysql = require('mysql2');
// Import queries
const { selectDepartment, selectRoles, selectEmployees } = require('./queries_helper')
// ENV
require('dotenv').config();

// Create Connection
const con = mysql.createConnection({
    host: process.env.db_host,
    user: process.env.db_user,
    password: '',
    database: 'employee_tracker_db'
    });


// Get Department Data
const getDeptInfo = new Promise((resolve, reject) => {
    con.query(selectDepartment, (err, response) => {
        if (err) {
            reject(err);
        } else {
            resolve(response);
        }
    });
});

// Get Roles Data
const getRolesInfo = new Promise((resolve, reject) => {
    con.query(selectRoles, (err, response) => {
        if (err) {
            reject(err);
        } else {
            resolve(response);
        }
    });
});

// Get Employee Data
const getEmploInfo = new Promise((resolve, reject) => {
    con.query(selectEmployees, (err, response) => {
        if (err) {
            reject(err);
        } else {
            resolve(response);
        }
    });
});

module.exports = {
    getDeptInfo,
    getRolesInfo,
    getEmploInfo
}
