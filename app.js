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
const menuOptions = [new Choices("optionsSelect", "Choose an enquiry", "list", ["View all departments", "View all roles", "View all employees", "Add a department", "Add a role", "Add an employee", "Update an employee role", "Update an employees manager", "View employees by manager", "View employees by department", "Delete a department", "Delete a role", "Get department budget", "Finish"])];
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
const selectRole = (list) => [new Choices("employee", `Whose role will be updated? \n`, "list", list)]
const getRoleName = (name, roleNames) => [new Choices("roleName", `Which role is ${name} being assigned? \n`, "list", roleNames)];
const checkManagerName = (names) => [new Choices("manager", "Who is this persons Manager? ", "list", names)];
const checkManager = (managers) => [new Choices("manager", "Which managers employees would you like to see? ", "list", managers)];
const checkDepartmentEmployees = (departments) => [new Choices("department", "Which departments staff would you like to see? ", "list", departments)];
const checkNumbrofEmployees = (departments) => [new Choices("department", "Which department do you want to view the budget for? ", "list", departments)];
const deleteByDepartment = (departments) => [new Choices("department", "which department will be deleted? ", "list", departments)];
const deleteByRole = (roles) => [new Choices("role", "which role will be deleted? ", "list", roles)];

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
    } else if (menuPrompt.optionsSelect === 'Update an employees manager') {
        updateEmployeeManager();
    } else if (menuPrompt.optionsSelect === 'View employees by manager') {
        viewByManager();
    } else if (menuPrompt.optionsSelect === 'View employees by department') {
        viewByDepartment();
    } else if (menuPrompt.optionsSelect === "Delete a department") {
        deleteDepartment();
    } else if (menuPrompt.optionsSelect === 'Delete a role') {
        deleteRole();
    } else if (menuPrompt.optionsSelect === 'Get department budget') {
        getBudget();
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
    const promptName = await inquirer.prompt(addEmployeeOption.employeeInfo);
    const details = [ promptName.name, promptName.sirname ]

    const allRoles = await db.promise().query(query.selectRoles);

    const roles = allRoles[0].map(({title, id}) => ({name: title, value: id}));
    const selectedrole = await inquirer.prompt(getRoleName(details[0], roles))
    details.push(selectedrole.roleName)

    const employeesInfo = await db.promise().query(query.selectEmployeesInfo);

    const managers = employeesInfo[0].map(({first_name, last_name, id}) => ({name: `${first_name} ${last_name}`, value: id}));
    managers.push({name: "No manager", value: null});

    const employeesManager = await inquirer.prompt(checkManagerName(managers));
    details.push(employeesManager.manager);

    await db.promise().query(query.addNewEmployee, details);
    
    getEmploInfo();
}

const updateEmployee = async () => {

    const selectEmployee = await db.promise().query(query.getEmployInfo);
    const employees = selectEmployee[0].map(({first_name, last_name, id}) => ({name: `${first_name} ${last_name}`, value: id}));
    
    const getEmployee = await inquirer.prompt(selectRole(employees));
    const details = [getEmployee.employee];
    
    const getEmployeeRole = await db.promise().query(query.getRoles);
    const roles = getEmployeeRole[0].map(({title, id}) => ({name: title, value: id}));

    const getNewRole = await inquirer.prompt(getRoleName("this employee", roles));
    const roleName = getNewRole.roleName;
    details.unshift(roleName);

    await db.promise().query(query.updateEmployeeRole, details);

    getEmploInfo();
};

const updateEmployeeManager = async () => {

    const selectEmployee = await db.promise().query(query.getEmployInfo);
    const employees = selectEmployee[0].map(({first_name, last_name, id}) => ({name: `${first_name} ${last_name}`, value: id}));

    const getEmployee = await inquirer.prompt(selectRole(employees));
    const details = [getEmployee.employee];

    const employeesInfo = await db.promise().query(query.selectEmployeesInfo);
    
    const managers = employeesInfo[0].map(({first_name, last_name, id}) => ({name: `${first_name} ${last_name}`, value: id}));
    managers.push({name: "No manager", value: null});

    const employeesManager = await inquirer.prompt(checkManagerName(managers));
    details.unshift(employeesManager.manager);

    await db.promise().query(query.updateManager, details)
    console.log(details)
          
    getEmploInfo();
};

const viewByManager = async () => {

    const selectEmployee = await db.promise().query(query.getEmployInfo);
    const employees = selectEmployee[0].map(({first_name, last_name, id}) => ({name: `${first_name} ${last_name}`, value: id}));
   
    const managerSelected = await inquirer.prompt(checkManager(employees));
    const details = [managerSelected.manager];

    const managersEmployees = await db.promise().query(query.selectSubordinates, details);

    if (managersEmployees[0].length > 0) {
        present(managersEmployees[0]);
        return provideMenu();
    } else {
        console.log(`\nThis employee manages nobody.\n`);
        return provideMenu();
    }
}

const viewByDepartment = async () => {

    let departments = await db.promise().query(query.selectDepartment);
    departments = departments[0].map(({name, id}) => ({name: name, value: id}));

    const departmentSelected = await inquirer.prompt(checkDepartmentEmployees(departments));
    const details = [departmentSelected.department];

    const departmentEmployees = await db.promise().query(query.getDepartmentEmployees, details);

    present(departmentEmployees[0]);
    return provideMenu();

};

const deleteDepartment = async () => {

    let departments = await db.promise().query(query.selectDepartment);
    departments = departments[0].map(({name, id}) => ({name: name, value: id}));

    const DepartmentToDelete = await inquirer.prompt(deleteByDepartment(departments));
    const details = [DepartmentToDelete.department];

    await db.promise().query(query.deleteFromDepartment, details);

    getDeptInfo();
};

const deleteRole = async () => {

    let roles = await db.promise().query(query.getRole);
    roles = roles[0].map(({title, id}) => ({name: title, value: id}));

    const roleToDelete = await inquirer.prompt(deleteByRole(roles));
    const details = roleToDelete.role;

    await db.promise().query(query.deleteByRole, details);

    getRolesInfo();
};

const getBudget = async () => {

    let departments = await db.promise().query(query.selectDepartment);
    departments = departments[0].map(({name, id}) => ({name: name, value: id}));

    const departmentSelected = await inquirer.prompt(checkNumbrofEmployees(departments));
    const details = [departmentSelected.department];
    
    const departmentEmployees = await db.promise().query(query.getDepartmentSalaries, details);
    const salaries = departmentEmployees[0].map(({salary, ...rest}) => +salary ).reduce(
        (previousValue, currentValue) => previousValue + currentValue);

    console.log(greenText, `\nThe total utilised budget for this department is: $${salaries} anually.\n`);

    return provideMenu();
}

module.exports = begin;

