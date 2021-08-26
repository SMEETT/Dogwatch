const sequelize = require("sequelize");
const db = require("../../config/database");

const Comment = db.define("comment", {
	comment: {
		type: sequelize.STRING(500),
	},
});

module.exports = Comment;
