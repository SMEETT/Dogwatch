// PM2 Configuration
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
	apps: [
		{
			name: "dogwatch_backend",
			script: "./backend/server.js",
			watch: true,
			autorestart: true,
			env: {
				NODE_ENV: "production",
				BACKEND_PORT: 3001,
				DB_NAME: secretKeys[0],
				DB_USER: secretKeys[1],
				DB_PASSWORD: secretKeys[2],
				DB_HOST: "localhost",
				SESSION_SECRET: secretKeys[3],
				FRONTEND_URL: "https://dogwatch.borisfries.dev",
			},
		},
		{
			name: "dogwatch_frontend",
			script: "serve -l 5000 ./frontend/dist",
			// args: "run serve --prefix ./frontend/",
			watch: true,
			autorestart: true,
			env: {
				NODE_ENV: "production",
				VITE_GQL_ENDPOINT_URL: "https://dw-api.borisfries.dev/gql",
			},
		},
	],
};
