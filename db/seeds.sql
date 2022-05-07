-- Populate departments
INSERT INTO department (name)
VALUES
('Human Resources'),
('Finance'),
('Operations'),
('Purchasing');

-- Populate Roles
INSERT INTO role (title, salary, department_id)
VALUES
('HR manager', 115000, 1),
('HR employee', 85000, 1),
('Finance manager', 110000, 2),
('Finance employee', 70000, 2),
('Operations manager', 118000, 3),
('Operations employee', 90000, 3),
('Purchasing manager', 118000, 4),
('Purchasing employee', 90000, 4);

-- Populate Managers
INSERT INTO employee (first_name, last_name, role_id)
VALUES
('Brett', 'Johnson', 1),
('Dave', 'Plummer', 3),
('John', 'Smith', 5),
('Batista', 'Cena', 7);

-- Populate Employees
INSERT INTO employee (first_name, last_name, role_id, manager_id)
VALUES
('Mike', 'Johnson', 2, 1),
('Talia', 'Jones', 2, 1),
('Rook', 'Smitherson', 2, 1),
('Sam', 'Hendon', 4, 2),
('Rick', 'Jordon', 4, 2),
('Mickaela', 'George', 4, 2),
('Rodriguez', 'Spanada', 6, 3),
('Jim', 'Gordon', 6, 3),
('Will', 'Hensley', 6, 3),
('Antson', 'Corley', 8, 4),
('Anita', 'Corke', 8, 4),
('Riley', 'Steven', 8, 4);

