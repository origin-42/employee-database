const selectDepartment = `SELECT * FROM department`;
const selectRoles = `SELECT * FROM role`;
const selectEmployees = `SELECT id, first_name, last_name, title FROM employee, role WHERE role.id = employee.role_id ORDER BY last_name`;

module.exports = {
    selectDepartment,
    selectRoles,
    selectEmployees
}