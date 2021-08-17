const { Sequelize } = require("sequelize");

const dbName = process.env.DB_NAME;
const dbUser = process.env.DB_USER;
const dbPassword = process.env.DB_PASSWORD;
const dbHost = process.env.DB_HOST;
const dbDialect = "postgres";

const sequelize = new Sequelize(dbName, dbUser, dbPassword, {
	host: dbHost,
	logging: false,
	dialect: dbDialect,
});

module.exports = sequelize;
