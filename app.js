const inquirer = require("./node_modules/inquirer/lib/inquirer"); // Inquirer module
const cTable = require('console.table');
// Import classes
const { PromptObj, Choices } = require('./classes/prompts');
const db = require("./db/connection");
const query = require('./db/queries_helper')


// Validate Entries
// Create red text
let redText = "\x1b[31m"; // Invalid input
let greenText = "\x1b[32m"; // Invalid input
let spacer = () => console.log("\n");

// Handle incorrect entries
const handleExceptions = (input, type) => {
    input = input.trim();
    if (type == "number") {
        if (!input.match(/^[0-9]*$/)) {
            console.log(redText, "This input must be only numbers.");
            return false;
        };
    } else if (type == "decimal") {
        if (!input.match(/^\d+\.\d{0,2}$/)) {
            console.log(redText, "Please match to decimal (.xx).");
            return false;
        };
    } 
    
    if (!input) {
        console.log(redText, "Nothing entered. Please enter a value");
        return false;
    } else if (input) {
        return true;
    } 
}

//  Construct Data from classes
const greeting = [new PromptObj("greetingConfirmation", "Welcome to your Employee Registry! Enter to begin your queries. Ready to begin? ", "confirm")];
const menuOptions = [new Choices("optionsSelect", "Choose an enquiry", "list", ["View all departments", "View all roles", "View all employees", "Add a department", "Add a role", "Add an employee", "Update an employee role", "Finish"])];
const AddDepartmentOption = [new PromptObj("departmentName", "What is the name of the department? ", "input", function (input) {
    return handleExceptions(input, "dept");
})];

const addRoleOption = {
    
    roleInfo: [
        new PromptObj("roleName", "What is the role called? ", "input", function (input) {
            return handleExceptions(input, "role");
        }),
        new PromptObj("salary", "What is the salary for this role? ", "input", function (input) {
            return handleExceptions(input, "decimal");
        })
    ],
    departments: (arr) => new Choices("departmentSelection", "Which department will this role belong too? ", "list", arr)
};

// Construct Inquiry
// Start Application
const begin = () => {
    inquirer.prompt(greeting)
        .then((response) => {
            // Open Menu
            response.greetingConfirmation ? provideMenu() : false;
        })
};
// Provide menu items
const provideMenu = () => {
    inquirer.prompt(menuOptions).then((response) => {
        // Get Department Data
        if (response.optionsSelect === 'View all departments') {
            getDeptInfo();
        } else if (response.optionsSelect === 'Add a department') {
            promptDept();
        } else if (response.optionsSelect === 'View all roles') {
            getRolesInfo();
        } else if (response.optionsSelect === 'Add a role') {
            promptRole();
        } else if (response.optionsSelect === 'Finish') {
            // End Program
            console.log(greenText, "Updated completed. Application terminating.")
            process.exit();
        }
    })
};

// Get Info on Departments
const getDeptInfo = () => {
    db.query(query.selectDepartment, (err, response) => {
        if (err) console.log(err);
        //Render Department Info Table
        spacer();
        console.table(response);
        return provideMenu();
    })
};

// Add a Department
const promptDept = () => {
    return inquirer.prompt(AddDepartmentOption).then(response => {
        db.query(query.addDeptName, response.departmentName, (err) => {
            if (err) console.log(err);
            return getDeptInfo();
        })
    })
};

// View Roles
const getRolesInfo = () => {
    db.query(query.selectRoles, (err, response) => {
        if (err) console.log(err);
        //Render Department Info Table
        spacer();
        console.table(response);
        return provideMenu();
    })
}

// Add a Role
const promptRole = () => {
    return inquirer.prompt(addRoleOption.roleInfo)
    .then (roleInfo => {
      const { roleName, salary } = roleInfo;
      db.query(query.selectDepartment, (err, departments) => {
        if (err) console.log(err);
        const deptNames = departments.map(dept => dept.name);
        inquirer.prompt(addRoleOption.departments(deptNames))
        .then(departmentAnswer => {
          console.log(departmentAnswer)
        });
      });
    });
  };



module.exports = begin;

