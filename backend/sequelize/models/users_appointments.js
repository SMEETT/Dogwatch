const { DataTypes } = require("sequelize");
const db = require("../../config/database");
const User = require("./User");
const Appointment = require("./Appointment");

const users_appointments = db.define("users_appointments", {
	userId: {
		type: DataTypes.INTEGER,
		references: {
			model: User,
			key: "id",
		},
	},
	appointmentId: {
		type: DataTypes.INTEGER,
		references: {
			model: Appointment,
			key: "id",
		},
	},
	role: {
		type: DataTypes.INTEGER,
	},
});

module.exports = users_appointments;
