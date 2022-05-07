const fs = require("fs"); // File system module
const inquirer = require("./node_modules/inquirer/lib/inquirer"); // Inquirer module
// Import classes
const { Department, Role, Employee } = require('./classes/employees');
const { PromptObj, Choices } = require('./classes/prompts');
const { getDeptInfo, getRolesInfo, getEmploInfo } = require('./db/queries');

// Validate Entries
const handleExceptions = () => {}

//  Construct Data from classes
const greeting = [new PromptObj("greetingConfirmation", "Welcome to your Employee Registry! Enter to begin your queries. Ready to begin? ", "confirm")];
const menuOptions = [new Choices("optionsSelect", "Choose an enquiry", "list", ["View all departments", "View all roles", "View all employees", "Add a department", "Add a role", "Add an employee", "Update an employee role"])];

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
        };
    });
};

begin();

