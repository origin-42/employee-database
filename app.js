const inquirer = require("./node_modules/inquirer/lib/inquirer"); // Inquirer module
const cTable = require('console.table');
// Import classes
const {
    PromptObj,
    Choices
} = require('./classes/prompts');
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
    ]
};

const addAmployeeOption = {

    employeeInfo: [
        new PromptObj("name", "What is the employees first name? ", "input", function (input) {
            return handleExceptions(input);
        }),
        new PromptObj("sirname", "What is the employees sirname ", "input", function (input) {
            return handleExceptions(input);
        })
    ]
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
        } else if (response.optionsSelect === 'View all employees') {
            getEmploInfo();
        } else if (response.optionsSelect === 'Add an employee') {
            promptEmployee();
        } else if (response.optionsSelect === 'Update an employee role') {
            updateEmployee();
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
        .then(roleInfo => {
            const {
                roleName,
                salary
            } = roleInfo;
            db.query(query.selectDepartment, (err, departments) => {
                if (err) console.log(err);
                const deptNames = departments.map(dept => dept.name);
                inquirer.prompt({"name": "departmentSelection", "message": "Which department will this role belong too? ", "type": "list", "choices": deptNames})
                    .then(departmentAnswer => {
                        const { departmentSelection } = departmentAnswer;
                        db.query(query.findDeptId, departmentSelection, (err, response) => {
                            db.query(query.addRoleName, [roleName, salary, response[0].id], (err) => {
                                if (err) console.log(err);
                                return getRolesInfo();
                            })
                        })
                    });
            });
        });
};

// View Roles
const getEmploInfo = () => {
    db.query(query.selectEmployees, (err, response) => {
        if (err) console.log(err);
        //Render Department Info Table
        spacer();
        console.table(response);
        return provideMenu();
    })
}

// Add an employee
const promptEmployee = () => {
    return inquirer.prompt(addAmployeeOption.employeeInfo)
        .then(info => {
            const {
                name,
                sirname
            } = info;
            db.query(query.getRoles, (err, roles) => {
                const roleNames = roles.map(role => role.title);
                inquirer.prompt({"name": "roleName", "message": `Which role is ${name} being assigned? `, "type": "list", "choices": roleNames})
                    .then(role => {
                        db.query(query.checkForManagers, (err, manager_name) => {
                            const names = manager_name.map(x => x.managers_name).filter(y => y)
                            names.push('New Manager')
                            inquirer.prompt({"name": "manager", "message": "Who is this persons Manager? ", "type": "list", "choices": names})
                                .then(results => {
                                    db.query(query.getManagerId, role.roleName, (err, response) => {
                                        const { manager } = results;
                                        const arr = [name, sirname, response[0].id];
                                        if (manager === "New Manager") {
                                            db.query(query.addNewManager, arr, (err) => {
                                                if (err) console.log(err);
                                                return getEmploInfo();
                                            })
                                        } else {
                                            arr.push(response[0].id)
                                            db.query(query.addNewEmployee, arr, (err) => {
                                                if (err) console.log(err);
                                                return getEmploInfo();
                                            })
                                        }
                                    })
                                })
                        })
                    })
            })
        })
}

const updateEmployee = () => {
    db.query(query.selectEmployees, (err, employees_response) => {
        if (err) console.log(err);
        const employees = employees_response.map(x => x.employee_name)
        inquirer.prompt({"name": "selectdEmployee", "message": "Which employee? ", "type": "list", "choices": employees})
            .then(employee => {
                const employeeName = employee.selectdEmployee;
                db.query(query.selectRoles, (err, roles_response) => {
                    if (err) console.log(err);
                    const roles = roles_response.map(x => x.title);
                    inquirer.prompt({"name": "selectRole", "message": `Which role will ${employeeName} be assigned? `, "type": "list", "choices": roles})
                        .then(role => {
                            // Logic for assigning employee based off passed in information.
                            const employeeArr = employees_response.filter(x => {
                                if (x.employee_name === employeeName) {
                                    return x;
                                }  
                            })
                            roles_response.forEach(x => {
                                if (x.title === employeeArr[0].title) {
                                    employeeArr[0].role_id = x.id;
                                }
                                if (role.selectRole === x.title) {
                                    employeeArr[0].newRole = x.id;
                                }
                            })
                            db.query(query.confirmManager, employeeArr[0].newRole, (err, manager_info) => {
                                if (manager_info[0].manager_id) {
                                    // update as employee
                                    const updateEmployeeQuery = [employeeArr[0].newRole, employeeArr[0].employee_id];
                                } else {
                                    // Update as manager
                                    const updateEmployeeQuery = [employeeArr[0].newRole, employeeArr[0].employee_id];
                                }
                            })
                            
                        })
                })
            })
    })
                    // Update Employee

                    // Things to check: Check of other employees and see how they update also

                    
}

module.exports = begin;