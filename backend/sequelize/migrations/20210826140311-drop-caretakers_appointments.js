module.exports = {
	up: function (queryInterface, Sequelize) {
		return Promise.all([queryInterface.dropTable("caretakers_appointments")]);
	},

	down: function (queryInterface, Sequelize) {
		return Promise.all([queryInterface.dropTable("caretakers_appointments")]);
	},
};
