// PM2 Configuration
module.exports = {
	apps: [
		{
			name: "dogwatch_backend",
			script: "./backend/server.js",
			watch: true,
			autorestart: true,
			env: {
				NODE_ENV: "development",
				BACKEND_PORT: 3001,
				DB_NAME: "db_dogwatch",
				DB_USER: "admin",
				DB_PASSWORD: "secret",
				DB_HOST: "localhost",
				SESSION_SECRET: "secret",
				FRONTEND_URL: "http://localhost:5000",
			},
		},
		{
			name: "dogwatch_frontend",
			script: "npm",
			args: "run dev --prefix ./frontend/",
			watch: true,
			autorestart: true,
			env: {
				NODE_ENV: "development",
				VITE_GQL_ENDPOINT_URL: "http://localhost:3001/gql",
			},
		},
	],
};
