const fs = require("fs");
const path = require("path");
// file 'secret' is a comma-separated list
const pathToSecretKey = path.join("/var/lib", "pm2node", "secrets");
const getSecretKeys = () => {
	try {
		const secretKeys = fs.readFileSync(pathToSecretKey, "utf8");
		const secretsArray = secretKeys.split(",");
		secretsArray[secretsArray.length - 1] = secretsArray[secretsArray.length - 1].replace(/(\r\n|\n|\r)/gm, "");
		return secretsArray;
	} catch (error) {
		console.error(`Error reading SecretKeys ${error}`);
		process.exit(1);
	}
};

let secretKeys = getSecretKeys();

module.exports = {
	development: {
		username: "admin",
		password: "secret",
		database: "db_dogwatch",
		host: "127.0.0.1",
		dialect: "postgres",
	},
	production: {
		database: secretKeys[0],
		username: secretKeys[1],
		password: secretKeys[2],
		host: "localhost",
		dialect: "postgres",
	},
};
