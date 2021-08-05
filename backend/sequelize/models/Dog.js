const { DataTypes } = require("sequelize");
const db = require("../../config/database");

const Dog = db.define("dog", {
	image: {
		type: DataTypes.TEXT,
	},
	name: {
		type: DataTypes.STRING,
	},
	birthday: {
		type: DataTypes.STRING,
	},
	race: {
		type: DataTypes.STRING,
	},
	gender: {
		type: DataTypes.STRING,
	},
	weight: {
		type: DataTypes.INTEGER,
	},
	food_amount: {
		type: DataTypes.INTEGER,
	},
	medications: {
		type: DataTypes.ARRAY(DataTypes.STRING),
	},
	walk_duration: {
		type: DataTypes.INTEGER,
	},
	walktimes: {
		type: DataTypes.ARRAY(DataTypes.STRING),
	},
	feedtimes: {
		type: DataTypes.ARRAY(DataTypes.STRING),
	},
	notes: {
		type: DataTypes.STRING(500),
	},
});

module.exports = Dog;
