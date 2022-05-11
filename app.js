const inquirer = require("./node_modules/inquirer/lib/inquirer"); // Inquirer module
const cTable = require('console.table');
// Import classes
const {
    PromptObj,
    Choices
} = require('./classes/prompts');
const db = require("./db/connection");
const query = require('./db/queries_helper');


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
    ]
};

const addEmployeeOption = {

    employeeInfo: [
        new PromptObj("name", "What is the employees first name? ", "input", function (input) {
            return handleExceptions(input);
        }),
        new PromptObj("sirname", "What is the employees sirname ", "input", function (input) {
            return handleExceptions(input);
        })
    ]
};

const getDepartments = (deptNames) => [new Choices("departmentSelection", "Which department will this role belong too? \n", "list", deptNames)];
const getEmployeeName = (employees)=> [new Choices("employName", `Whose role will be updated? \n`, "list", employees)];
const getRoleName = (name, roleNames) => [new Choices("roleName", `Which role is ${name} being assigned? \n`, "list", roleNames)];
const checkManagerName = (names) => [new Choices("manager", "Who is this persons Manager? ", "list", names)]

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
const provideMenu = async () => {
    const menuPrompt = await inquirer.prompt(menuOptions);
    // Get Department Data
    if (menuPrompt.optionsSelect === 'View all departments') {
        getDeptInfo();
    } else if (menuPrompt.optionsSelect === 'Add a department') {
        promptDept();
    } else if (menuPrompt.optionsSelect === 'View all roles') {
        getRolesInfo();
    } else if (menuPrompt.optionsSelect === 'Add a role') {
        promptRole();
    } else if (menuPrompt.optionsSelect === 'View all employees') {
        getEmploInfo();
    } else if (menuPrompt.optionsSelect === 'Add an employee') {
        promptEmployee();
    } else if (menuPrompt.optionsSelect === 'Update an employee role') {
        updateEmployee();
    } else if (menuPrompt.optionsSelect === 'Finish') {
        // End Program
        console.log(greenText, "Updated completed. Application terminating.")
        process.exit();
    }
};

// Render Table Info
const present = async (info) => {
    spacer();
    console.table(info);
    spacer();
}

// Get Info on Departments
const getDeptInfo = async () => {
    const departmentData = await db.promise().query(query.selectDepartment)
    await present(departmentData[0]);
    return provideMenu();
};

// Add a Department
const promptDept = async () => {
    const addDeptOpt = await inquirer.prompt(AddDepartmentOption);
    await db.promise().query(query.addDeptName, addDeptOpt.departmentName);
    return getDeptInfo();
};

// View Roles
const getRolesInfo = async () => {
    const rolesData = await db.promise().query(query.selectRoles)
    await present(rolesData[0]);
    return provideMenu();
}

// Add a Role
const promptRole = async () => {
    
    // Return user input of Role & Salary.
    const rolesInfo = await inquirer.prompt(addRoleOption.roleInfo);
    const { roleName, salary } = rolesInfo;
    const getAllDepts = await db.promise().query(query.selectDepartment);
    const deptNames = getAllDepts[0].map(dept => dept.name);
    
    // return user input of Department the role will belong to.
    const departmentAnswer = await inquirer.prompt(getDepartments(deptNames));
    const { departmentSelection } = departmentAnswer;
    
    // Add data to Department table
    const findDeptId = await db.promise().query(query.findDeptId, departmentSelection);
    await db.promise().query(query.addRoleName, [roleName, salary, findDeptId[0][0].id]);

    getRolesInfo();
};

// View Roles
const getEmploInfo = async () => {
    const employData = await db.promise().query(query.selectEmployees)
    await present(employData[0]);
    return provideMenu();
}

// Add an employee
const promptEmployee = async () => {

    // Get existing data from employee & role
    const getAllData = await db.promise().query(query.getemplAndRoleData); // Get all data

    // Prompts
    // Get first name and last name adding
    const addEmplOpt = await inquirer.prompt(addEmployeeOption.employeeInfo); 
    const { name, sirname } = addEmplOpt; // Save employee name

    // Get new role
    const getRoles = await db.promise().query(query.getRoles);
    const roleNames = getRoles[0].map(role => role.title);
    const assignRole = await inquirer.prompt(getRoleName(name, roleNames));

    // Check if this role belongs to a manager
    const roles = getAllData[0].filter(person => person.title === assignRole.roleName ? person : false);

    console.log(roles[0])
    // Send data to DB
    if (roles[0].managers_name) {
        await db.promise().query(query.addNewEmployee, [name, sirname, roles[0].role_id, roles[0].manager_id]) // Add an employee
    } else {
        await db.promise().query(query.addNewManager, [name, sirname, roles[0].role_id]) // Add a manager
    }

    return getEmploInfo();
}

const updateEmployee = async () => {

    const getAllData = await db.promise().query(query.getAllData); // Get all data
    const getAllEmployees = await db.promise().query(query.selectEmployees) // get all employees
    const getAllRoles = await db.promise().query(query.getRoles) // get distinct managers

    const employeeNames = getAllEmployees[0].map(employee => employee.employee_name) // Get employee names
    const roleNames = getAllRoles[0].map(role => role.title) // Get role names

    // Prompts
    const selectedEmployee = await inquirer.prompt(getEmployeeName(employeeNames)) // Prompt for employee
    const selectedRole = await inquirer.prompt(getRoleName(selectedEmployee.employName, roleNames)) // Prompt for role
    
    const employeeInfo = getAllData[0].find(employee => employee.employee_name == selectedEmployee.employName) // Get current info
    const employeeNewRole = getAllData[0].find(role => role.title == selectedRole.roleName) // Get new info

    // Manager selection clauses 
    if (employeeInfo.role_id === employeeNewRole.role_id) {
        // If the same role is selected, return menu.
        console.log(redText, `You've selected the same role. No updates made.`);
         return getEmploInfo();
    } else if (!employeeInfo.manager_id && !employeeNewRole.manager_id) {
        // Old role needs filling & new roles current manager needs their role reassigned
        await updateOldManager(employeeInfo, getAllData, employeeNames, roleNames);

        console.log(redText, `The ${employeeInfo.title} role remains unnassigned. A new manager is required. Please update the position.\n`);
        await updateNewManager(employeeNewRole, getAllData, employeeNames);
    } else if (!employeeInfo.manager_id) {
        // Old role needs filling
        await updateOldManager(employeeInfo, getAllData, employeeNames, roleNames);
    } else if (!employeeNewRole.manager_id) {
        // New roles current manager needs their role reassigned
        console.log(redText, `The ${employeeInfo.title} role belonged to ${employeeNewRole.managers_name}. A new manager is required. Please update the position.\n`);
        await updateNewManager(employeeNewRole, getAllData, employeeNames);
    }

    
    // Update employee
    console.log(greenText, `${employeeInfo.employee_name} has been assigned as ${employeeNewRole.title}.`);
    await db.promise().query(query.updateEmployeeRole, [employeeNewRole.role_id, employeeNewRole.manager_id, employeeInfo.employee_id]);
    return getEmploInfo();
}

const updateOldManager = async (oldEmployee, data, employeeNames) => {
    // Remove selected employee and managers from list
    const newNames = await formatEmployees(oldEmployee, employeeNames)
    
    // Prompt for new employee to add to old, unnassigned role
    console.log(redText, `\nSomebody will need to replace ${oldEmployee.employee_name} as the ${oldEmployee.title}.\n`)
    const selectedEmployee = await inquirer.prompt(getEmployeeName(newNames)) // Prompt for employee
    
    const employeeInfo = data[0].find(employee => employee.employee_name == selectedEmployee.employName) // Get current info
    
    // Assign the old role
    console.log(greenText, `${employeeInfo.employee_name} has been assigned as ${oldEmployee.title}.\n`);
    await db.promise().query(query.updateEmployeeRole, [employeeInfo.role_id, employeeInfo.manager_id, oldEmployee.employee_id]);
  
}
const updateNewManager = async (employeeInfo, data, employeeNames) => {
    // Remove selected employee and managers from list
    const newNames = await formatEmployees(oldEmployee, employeeNames)

    // Prompt for the role which the current manager will be taking
    const selectedEmployee = await inquirer.prompt(getEmployeeName(newNames)) // Prompt for employee
    
    employeeInfo = data[0].find(employee => employee.employee_name == selectedEmployee.employName) // Get current info

    // Assign the old role
    console.log(greenText, `${employeeInfo.employee_name} has been assigned as ${employeeInfo.title}.\n`);
    await db.promise().query(query.updateEmployeeRole, [employeeInfo.role_id, employeeInfo.manager_id, employeeInfo.employee_id]);

}

const formatEmployees = async (oldEmployee, employeeNames) => {
    const managers = await db.promise().query(query.checkForManagers);
   
    // Remove selected employee from list
    let newNames = employeeNames.filter(employee => employee != oldEmployee.employee_name) // refresh employee list
    newNames.forEach(name => {
        console.log(name)
        managers[0].forEach(manager => {
            if (name === manager.managers_name) {
                let index = newNames.indexOf(name);
                newNames.splice(index, 1);
            }
        })
    })
    return newNames;
}


module.exports = begin;