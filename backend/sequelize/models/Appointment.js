const sequelize = require("sequelize");
const db = require("../../config/database");

const Appointment = db.define("appointment", {
	start_date: {
		type: sequelize.DATE,
	},
	end_date: {
		type: sequelize.DATE,
	},
	notes: {
		type: sequelize.STRING(500),
	},
	color: {
		type: sequelize.STRING(),
	},
	accepted: {
		type: sequelize.BOOLEAN,
	},
});

module.exports = Appointment;
