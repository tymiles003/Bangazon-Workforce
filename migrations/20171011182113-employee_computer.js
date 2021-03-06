'use strict';

module.exports = {
	up: (queryInterface, Sequelize) => {
		return queryInterface.createTable('employees_computers', {
			id: {
				allowNull: false,
				autoIncrement: true,
				primaryKey: true,
				type: Sequelize.INTEGER
			},
			employeeId: {
				type: Sequelize.INTEGER,
				allowNull: false,
				references: {
					// Again, note the plural!!!!!
					model: 'employees',
					key: 'id'
				},
				onUpdate: 'cascade',
				onDelete: 'cascade'
			},
			computerId: {
				type: Sequelize.INTEGER,
				allowNull: false,
				references: {
					model: 'computers',
					key: 'id'
				},
				onUpdate: 'cascade',
				onDelete: 'cascade'
			},
			createdAt: {
				allowNull: false,
				type: Sequelize.DATE
			},
			updatedAt: {
				allowNull: false,
				type: Sequelize.DATE
			},
			assign_date: {
				type: Sequelize.DATEONLY
			},
			return_date: {
				type: Sequelize.DATEONLY
			}
		});
	},

	down: (queryInterface, Sequelize) => {
		return queryInterface.dropTable('employees_computers');
	}
};
