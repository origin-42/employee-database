const mysql = require('mysql2');
// Import queries
const { selectDepartment, findDeptId, selectRoles, selectEmployees, selectDeptName, selectRoleName } = require('./queries_helper')
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
// Get Department Matching ID
const getDeptId = (value) => {

    return new Promise((resolve, reject) => {
        con.query(findDeptId, value, (err, response) => {
            if (err) {
                reject(err);
            } else {
                resolve(response);
            }
        });
    })
}

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

// Get Employee Data
const addDept = (name) => {

    con.query(selectDeptName, name, (err, response) => {
        if (err) console.log(err);
    });
};

const addRole = (name, salary, deptId) => {

    con.query(selectRoleName, [name, salary, deptId], (err, response) => {
        if (err) console.log(err);
    });

}

const endCon = () => {
    console.log("\x1b[33m", "Application closed")
    con.end();
}

module.exports = {
    getDeptInfo,
    getDeptId,
    getRolesInfo,
    getEmploInfo,
    addDept,
    endCon,
    addRole
}
