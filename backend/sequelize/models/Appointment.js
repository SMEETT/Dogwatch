const sequilize = require("sequelize");
const db = require("../../config/database");

const Appointment = db.define("appointment", {
	start_date: {
		type: sequilize.DATE,
	},
	end_date: {
		type: sequilize.DATE,
	},
	notes: {
		type: sequilize.STRING(500),
	},
});

module.exports = Appointment;
