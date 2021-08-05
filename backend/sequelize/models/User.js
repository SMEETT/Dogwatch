const { DataTypes } = require("sequelize");
const db = require("../../config/database");

const User = db.define("user", {
	username: {
		type: DataTypes.STRING,
	},
	email: {
		type: DataTypes.STRING,
	},
	hash: {
		type: DataTypes.STRING,
	},
	salt: {
		type: DataTypes.STRING,
	},
	metadata: {
		type: DataTypes.JSON,
	},
	preferences: {
		type: DataTypes.JSON,
	},
});

module.exports = User;
