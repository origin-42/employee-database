// Department queries

const selectDepartment = `
SELECT * 
FROM department`;

const findDeptId = `
SELECT id 
FROM department
WHERE name = ?`;

const addDeptName = `INSERT INTO department (name) VALUES (?)`;

// Role queries

const selectRoles = `
SELECT * 
FROM role`;

const getRoles = `
SELECT title, id
FROM role`;

const selectEmployees = `
SELECT employee.id AS employee_id, concat(employee.first_name, " ", employee.last_name) AS employee_name, manager.id AS manager_id, concat(manager.first_name, " ", manager.last_name) AS managers_name, title, department.name AS department_name, salary 
FROM Employee employee
JOIN role
ON role_id = role.id
JOIN department
ON department_id = department.id
LEFT JOIN Employee manager
ON employee.manager_id = manager.id`;

const addRoleName = `
INSERT INTO role (title, salary, department_id)
VALUES
(?, ?, ?)`;

// Employee queries

const selectEmployeesInfo = `
SELECT *
FROM employee`;

const getEmployInfo = `
SELECT first_name, last_name, id FROM employee`;

const getAllData = `
SELECT employee.id AS employee_id, concat(employee.first_name, " ", employee.last_name) AS employee_name, manager.id AS manager_id, concat(manager.first_name, " ", manager.last_name) AS managers_name, title, employee.role_id, role.department_id, department.name
FROM Employee employee
LEFT JOIN Employee manager
ON employee.manager_id = manager.id
LEFT JOIN role
ON employee.role_id = role.id
LEFT JOIN department
ON department.id = role.department_id`;

const checkForManagers = `
SELECT DISTINCT concat(manager.first_name, " ", manager.last_name) AS managers_name 
FROM Employee employee
LEFT JOIN Employee manager
ON employee.manager_id = manager.id`;

const addNewEmployee = `
INSERT INTO employee (first_name, last_name, role_id, manager_id)
VALUES
(?, ?, ?, ?)`;

const updateEmployeeRole = `
UPDATE employee
SET role_id = ?
WHERE id = ?`;

const updateManager = `
UPDATE employee
SET manager_id = ?
WHERE id = ?`;

module.exports = {
    selectDepartment,
    findDeptId,
    selectRoles,
    selectEmployees,
    addDeptName,
    addRoleName,
    getRoles,
    checkForManagers,
    getAllData,
    addNewEmployee,
    updateEmployeeRole,
    selectEmployeesInfo,
    getEmployInfo,
    updateManager
}
