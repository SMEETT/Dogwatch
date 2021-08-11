const express = require("express");
const db = require("./config/database");
const session = require("express-session");
const SequelizeStore = require("connect-session-sequelize")(session.Store);
const passport = require("passport");
const cookieParser = require("cookie-parser");
const routes = require("./routes");
const { expressCspHeader, NONE, SELF, INLINE, EVAL } = require("express-csp-header");
const cors = require("cors");
// graphQL
const { graphqlHTTP } = require("express-graphql");
const graphQLSchema = require("./graphql/schema/schema");

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
require("dotenv").config();

// CSP Header
app.use(
	expressCspHeader({
		directives: {
			"default-src": [SELF, process.env.FRONTEND_URL],
			"script-src": [SELF, INLINE, EVAL],
			"style-src": [SELF, INLINE, "https://fonts.googleapis.com", "https://fonts.gstatic.com"],
			"img-src": [SELF],
			"worker-src": [NONE],
			"block-all-mixed-content": true,
			"font-src": ["https://fonts.googleapis.com", "https://fonts.gstatic.com"],
			"frame-ancestors": [NONE],
			"connect-src": [SELF, process.env.FRONTEND_URL],
		},
	})
);

app.use(cors({ origin: [process.env.FRONTEND_URL], credentials: true }));

// on first request attaches a cookie to the response (inside the setCookie header) and writes
// a session ID to the database, after that the session (incl. the cookie to identify it)
// is send (by the browser) on each request and is then available via 'req.session' inside Express
const maxSessionAge = 1000 * 60 * 60;
app.use(
	session({
		secret: process.env.SESSION_SECRET,
		resave: true,
		rolling: true,
		saveUninitialized: true,
		httpOnly: true,
		store: new SequelizeStore({
			db: db,
			expiration: maxSessionAge,
		}),
		proxy: true, // if you do SSL outside of node.
		cookie: {
			maxAge: maxSessionAge,
			// sameSite: "none",
			// secure: false,
			// (requires HTTPS or the cookie won't be set)
		},
	})
);

// Test the DB connection
db.authenticate()
	.then(() => console.log("Successfully connected to DB"))
	.catch((err) => console.log("Connection to DB failed: ", err));

// contains sequelize model relations
require("./sequelize/models/_relations");

// sync all Sequelize Models with the DB (and add some initial Data)
async function syncDB() {
	console.log("Syncing Database...");
	// await db.sync({ force: true });
	await db.sync({});
	// require("./misc/initialData");
}
syncDB();

// Passport
require("./config/passport");

// re-run on each request, 'passport.initialize' first checks..
// if req.session.passport.user !== null, if there is a user ..
// the user is deserialized (see passport.js)
app.use(passport.initialize());
app.use(passport.session());

app.use(cookieParser());

// app.use(function (req, res, next) {
// let options = {
// 	maxAge: maxSessionAge - 10000,
// 	sameSite: "none",
// 	secure: true,
// 	// signed: true, // Indicates if the cookie should be signed
// };
// if (req.isAuthenticated()) {
// 	// Set cookie
// 	res.cookie("isAuthenticated", "true", { sameSite: "lax", secure: true }); // options is optional
// 	console.log("cookie created successfully");
// } else {
// 	// not Authenticated
// 	res.cookie("isAuthenticated", "false", { sameSite: "none", secure: true });
// 	console.log("No Auth, no Cookie");
// }
// 	next();
// });

// Imports all of the routes from ./routes/index.js
// app.use(routes);

app.use(
	"/gql",
	graphqlHTTP((req, res) => ({
		schema: graphQLSchema,
		graphiql: true,
		context: { req, res, maxSessionAge },
	}))
);

app.listen(process.env.BACKEND_PORT, () => {
	console.log(`App running on Port ${process.env.BACKEND_PORT}`);
});
