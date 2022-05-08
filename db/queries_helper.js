const selectDepartment = `
SELECT * 
FROM department`;

const findDeptId = `
SELECT id 
FROM department
WHERE name = ?`;

const selectRoles = `
SELECT * 
FROM role`;

const selectEmployees = `
SELECT employee.id AS employee_id, concat(employee.first_name, " ", employee.last_name) AS employee_name, employee.id AS manager_id, concat(manager.first_name, " ", manager.last_name) AS managers_name, title, department.name AS department_name, salary 
FROM Employee employee
JOIN role
ON role_id = role.id
JOIN department
ON department_id = department.id
LEFT JOIN Employee manager
ON employee.manager_id = manager.id`;

const addDeptName = `INSERT INTO department (name) VALUES (?)`;

const addRoleName = `
INSERT INTO role (title, salary, department_id)
VALUES
(?, ?, ?)`;

const getRoles = `
SELECT title, id
FROM role`;

const checkForManagers = `
SELECT DISTINCT concat(manager.first_name, " ", manager.last_name) AS managers_name 
FROM Employee employee
LEFT JOIN Employee manager
ON employee.manager_id = manager.id`;

const getManagerId = `
SELECT id
FROM role
WHERE title = ?`

const addNewEmployee = `
INSERT INTO employee (first_name, last_name, role_id, manager_id)
VALUES
(?, ?, ?, ?)`;
const addNewManager = `
INSERT INTO employee (first_name, last_name, role_id)
VALUES
(?, ?, ?)`;

module.exports = {
    selectDepartment,
    findDeptId,
    selectRoles,
    selectEmployees,
    addDeptName,
    addRoleName,
    getRoles,
    checkForManagers,
    addNewEmployee,
    addNewManager,
    getManagerId
}
