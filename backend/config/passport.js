const passport = require("passport");
const LocalStrategy = require("passport-local");
const User = require("../sequelize/models/User");
const { validatePassword } = require("../misc/passwordUtils");

const customFields = {
	usernameField: "email",
	passwordField: "password",
};

// verifyCallback that verifies the user
const verifyCallback = (email, password, done) => {
	User.findOne({ where: { email: email } })
		.then((user) => {
			if (!user) {
				console.log("User not found");
				return done(null, false);
			}
			const isValid = validatePassword(password, user.hash, user.salt);

			if (isValid) {
				console.log("password is valid, user authenticated");
				return done(null, user);
			} else {
				return done(null, false);
			}
		})
		.catch((err) => done(err));
};

// define the auth-strategy and attach verifyCallback
const strategy = new LocalStrategy(customFields, verifyCallback);

// call middleware
passport.use(strategy);

// called after the user was successfully verified in the verifyCallback
// attaches the user id to req.session.passport.user
passport.serializeUser((user, done) => {
	console.log(`serializing user with id${user.id}`);
	done(null, user.id);
});

// called after 'serializeUser', attaches the user(data) to req.user
// looks for the user's id in the req.session.passport.user property
// then fetches the user from the DB
passport.deserializeUser((userId, done) => {
	console.log(`deserializing user with id${userId}`);
	User.findOne({ where: { id: userId } })
		.then((user) => {
			done(null, user);
		})
		.catch((err) => {
			done(err);
		});
});
