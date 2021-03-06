'use strict';

/** @module Employee Controller */

var Sequelize = require('sequelize');

/**
 * Gets all employees from the database and renders them.
 */
module.exports.getEmployees = (req, res, next) => {
	const { employee, department } = req.app.get('models');
	employee
		.findAll({ include: [{ model: department }] })
		.then(employees => {
			res.render('employees-list', { employees });
		})
		.catch(err => {
			next(err);
		});
};

/**
 * Gets employee details and send them to template for rendering.
 */
module.exports.showEmployeeDetails = (req, res, next) => {
	const { employee } = req.app.get('models');
	employee
		.findAll({
			include: [{ all: true }],
			where: { id: req.params.id }
		})
		.then(results => {
			let employee = results[0].dataValues;
			let department = employee.department;
			let computers = employee.computers;
			let programs = employee.training_programs;
			res.render('employee-view', {
				employee,
				department,
				computers,
				programs
			});
		})
		.catch(err => {
			next(err);
		});
};

/**
 * Gets an employee by their Id and displays them for editing
 */
module.exports.editEmployeeDetails = (req, res, next) => {
	const { employee, department, computer, training_program } = req.app.get(
		'models'
	);
	const data = {};
	employee
		.findAll({
			include: [{ all: true }],
			where: { id: req.params.id }
		})
		.then(results => {
			data.employee = results[0].dataValues;
			department.findAll().then(departments => {
				data.departments = departments;
				computer
					.findAll({
						include: [
							{
								model: employee
							}
						],
						where: {
							$return_date$: { $ne: null },
							decommission_date: null
						}
					})
					.then(computers => {
						data.computers = computers;
						training_program.findAll().then(programs => {
							data.programs = programs;
							res.render('employee-edit', { data });
						});
					});
			});
		})
		.catch(err => {
			next(err);
		});
};

/**
 * Gets employee by ID
 */
module.exports.getEmployeeById = (req, res, next) => {
	const { employee, department } = req.app.get('models');
	employee
		.findById(req.params.id, {
			include: [{ model: department }]
		})
		.then(employee => {
			res.render('employee-edit', { employee });
		})
		.catch(err => {
			next(err);
		});
};

/**
 * Displays form for creating a new employee
 */
module.exports.showEmployeeForm = (req, res, next) => {
	const { department } = req.app.get('models');
	department
		.findAll()
		.then(departments => {
			res.render('employee-add', { departments });
		})
		.catch(err => {
			next(err);
		});
};

/**
 * Adds an employee to the database then redirects to the list of employees
 */
module.exports.addEmployee = (req, res, next) => {
	const { employee } = req.app.get('models');
	employee
		.create(req.body)
		.then(() => {
			res.redirect('/employees');
		})
		.catch(err => {
			next(err);
		});
};

/**
 * Saves data from form to database on form submit
 */
module.exports.saveEmployeeDetails = (req, res, next) => {
	let {
		last_name,
		departmentId,
		removed_computer_id,
		added_computer_id,
		removed_program_id,
		added_program_id
	} = req.body;
	const { employee, employees_computers } = req.app.get('models');

	let promisedUpdates = [];

	if (removed_program_id) {
		promisedUpdates.push(
			new Promise((resolve, reject) => {
				employee
					.findById(req.params.id)
					.then(user => {
						return user.removeTraining_program(removed_program_id);
					})
					.then(data => {
						resolve(data);
					})
					.catch(err => {
						reject(err);
					});
			})
		);
	}

	if (added_program_id) {
		promisedUpdates.push(
			new Promise((resolve, reject) => {
				employee
					.findById(req.params.id)
					.then(user => {
						return user.addTraining_program(added_program_id);
					})
					.then(data => {
						resolve(data);
					})
					.catch(err => {
						reject(err);
					});
			})
		);
	}

	if (removed_computer_id) {
		promisedUpdates.push(
			new Promise((resolve, reject) => {
				employees_computers
					.update(
						{ return_date: Sequelize.NOW() },
						{
							where: {
								employeeId: req.params.id,
								computerId: removed_computer_id
							}
						}
					)
					.then(data => {
						resolve(data);
					})
					.catch(err => {
						reject(err);
					});
			})
		);
	}

	if (added_computer_id != 0) {
		promisedUpdates.push(
			new Promise((resolve, reject) => {
				employee
					.findById(req.params.id)
					.then(userInfo => {
						userInfo
							.addComputer(added_computer_id, {
								through: {
									assign_date: `${new Date().toDateString()}`,
									return_date: null
								}
							})
							.then(data => {
								resolve(data);
							});
					})
					.catch(err => {
						reject(err);
					});
			})
		);
	}

	employee
		.update(
			{ last_name, departmentId },
			{
				where: { id: req.params.id },
				fields: { last_name, departmentId }
			}
		)
		.then(() => {
			// use promise.all to ensure all changes made to db before sending to render
			return Promise.all(promisedUpdates);
		})
		.then(() => {
			res.redirect(`/employees/${req.params.id}`);
		})
		.catch(err => {
			next(err);
		});
};
