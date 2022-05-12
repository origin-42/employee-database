// Department queries

const selectDepartment = `
SELECT * 
FROM department`;

const findDeptId = `
SELECT id 
FROM department
WHERE name = ?`;

const addDeptName = `INSERT INTO department (name) VALUES (?)`;

const getDepartmentEmployees = `
SELECT employee.id, first_name, last_name, department.name AS department
FROM employee
LEFT JOIN role ON employee.role_id = role.id
LEFT JOIN department ON role.department_id = department.id
WHERE department.id = ?`;

const getDepartmentSalaries = `
SELECT role.salary
FROM employee
LEFT JOIN role ON employee.role_id = role.id
LEFT JOIN department ON role.department_id = department.id
WHERE department.id = ?`;

const deleteFromDepartment = `
DELETE FROM department
WHERE id = ?`;


// Role queries

const selectRoles = `
SELECT * 
FROM role`;

const getRoles = `
SELECT title, id
FROM role`;
const getRole = `
SELECT id, title
FROM role`;

const deleteByRole = `
DELETE FROM role
WHERE id = ?`;

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

const selectSubordinates = `
SELECT id, first_name, last_name FROM employee
WHERE manager_id = ?`;

module.exports = {
    selectDepartment,
    findDeptId,
    getDepartmentEmployees,
    getDepartmentSalaries,
    deleteFromDepartment,
    selectRoles,
    selectEmployees,
    addDeptName,
    addRoleName,
    getRoles,
    getRole,
    deleteByRole,
    getAllData,
    addNewEmployee,
    updateEmployeeRole,
    selectEmployeesInfo,
    getEmployInfo,
    updateManager,
    selectSubordinates
}
