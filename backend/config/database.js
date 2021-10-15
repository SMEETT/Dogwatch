const { Sequelize } = require("sequelize");
if (process.env.NOD_ENV !== "production") {
	require("dotenv").config();
}

const dbName = process.env.DB_NAME;
const dbUser = process.env.DB_USER;
const dbPassword = process.env.DB_PASSWORD;
const dbHost = process.env.DB_HOST;

const sequelize = new Sequelize(dbName, dbUser, dbPassword, {
	host: dbHost,
	logging: false,
	dialect: "postgres",
});

module.exports = sequelize;
