module.exports = {
	up: function (queryInterface, Sequelize) {
		return Promise.all([queryInterface.addColumn("appointments", "accepted", { type: Sequelize.BOOLEAN, defaultValue: false })]);
	},

	down: function (queryInterface, Sequelize) {
		return Promise.all([queryInterface.removeColumn("appointments", "accepted")]);
	},
};
