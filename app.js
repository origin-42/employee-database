const fs = require("fs"); // File system module
const inquirer = require("./node_modules/inquirer/lib/inquirer"); // Inquirer module
// Import classes
const { Department, Role, Employee } = require('./classes/employees');
const { PromptObj, Choices } = require('./classes/prompts');
const { getDeptInfo, getDeptId, getRolesInfo, getEmploInfo, addDept, endCon, addRole } = require('./db/queries');
const { finished } = require("stream");

// Validate Entries

// Create red text
let redText = "\x1b[31m"; // Invalid input

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

const AddRoleOption = (arr) => {
    
    return [
        new PromptObj("roleName", "What is the role called? ", "input", function (input) {
            return handleExceptions(input, "role");
        }),
        new PromptObj("salary", "What is the salary for this role? ", "input", function (input) {
            return handleExceptions(input, "decimal");
        }),
        new Choices("departmentSelection", "Which department will this role belong too? ", "list", arr)
    ];
};

// Construct Inquiry
// Start Application
const begin = () => {
    inquirer.prompt(greeting).then((response) => {
        response.greetingConfirmation ? provideMenu() : false;
    })
};
// Provide menu items
const provideMenu = async () => {
    inquirer.prompt(menuOptions).then((response) => {
        // Get Department Data
        if (response.optionsSelect === 'View all departments') {
            getDeptInfo
            .then((res) => {
                console.table(res);
                provideMenu();
            })
        } else if (response.optionsSelect === 'View all roles') {
            getRolesInfo
            .then((res) => {
                console.table(res);
                provideMenu();
            })
        } else if (response.optionsSelect === 'View all employees') {
            getEmploInfo
            .then((res) => {
                console.table(res);
                provideMenu();
            })
        } else if (response.optionsSelect === 'Add a department') {
            promptDept();
        } else if (response.optionsSelect === 'Add a role') {
            promptRole();
        } else if (response.optionsSelect === 'Finish') {
            endCon();
        };
    })
};
// Add a Department
const promptDept = () => {
    inquirer.prompt(AddDepartmentOption).then((response) => {
        addDept(response.departmentName);
    });
};
// Add a Role
const promptRole = async () => {
    let departments = [];

    await getDeptInfo
    .then((res) => {
        res.forEach(department => {
            departments.push(department);
        })
    })
    .then(() => {
        inquirer.prompt(AddRoleOption(departments)).then((response) => {
            getDeptId(response.departmentSelection)
            .then((res) => {
                addRole(response.roleName, response.salary , res[0].id);
                console.log("\x1b[32m", ` Role added with; name: ${response.roleName}, Salary: ${response.salary}, and ID: ${res[0].id} (${response.departmentSelection}).`);
                provideMenu();
            })
        });
    })
};

begin();

