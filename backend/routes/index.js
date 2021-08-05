const express = require("express");
const router = express.Router();
const passport = require("passport");
const genPassword = require("../misc/passwordUtils").genPassword;
const User = require("../sequelize/models/User");
const path = require("path");

router.get("/", (req, res) => {
	res.sendFile(path.join(__dirname, "../html/index.html"));
});

router.get("/isAuthenticated", (req, res) => {
	if (req.isAuthenticated()) {
		res.send(200);
	} else {
		res.send(401);
	}
});

// Get User Info
router.get("/user", (req, res) => {
	if (req.isAuthenticated()) {
		User.findOne({ where: { id: req.user.id } })
			.then((user) => {
				const dataToSend = {
					username: user.username,
					metadata: user.metadata,
				};
				res.send(dataToSend);
			})
			.catch((err) => {
				res.send(err);
			});
	} else {
		res.status(403).send("Forbidden");
	}
});

// REGISTER ROUTES
router.get("/register", (req, res) => {
	res.sendFile(path.join(__dirname, "../html/register.html"));
});
router.post("/register", (req, res) => {
	const saltHash = genPassword(req.body.password);

	const salt = saltHash.salt;
	const hash = saltHash.hash;

	// TODO: check if USER already exists
	// TODO: implement password 'confirm'

	const newUser = User.build({
		username: req.body.username,
		email: req.body.email,
		metadata: {
			calendarLastViewed: { year: 2021, month: 0 },
		},
		hash: hash,
		salt: salt,
	});

	// TODO: error checking
	// TODO: proper status codes for frontend to redirect

	newUser.save().then((user) => {
		console.log(user);
	});

	res.redirect("/login");
});

// LOGIN ROUTES

// can be deleted
router.get("/login", (req, res, next) => {
	res.sendFile(path.join(__dirname, "../html/login.html"));
});

// passport.authenticate expects a 'username' and 'password' field on the request body
// see passport.js for implementation details
router.post("/login", passport.authenticate("local", { failureRedirect: "/login-failure", successRedirect: "/login-success" }));

// login successful
router.get("/login-success", (req, res, next) => {
	res.send('<p>You successfully logged in. --> <a href="/protected-route">Go to protected route</a></p>');
});
// login failed
router.get("/login-failure", (req, res, next) => {
	res.status(401).send("Login failed");
});

// LOGOUT ROUTE

router.get("/logout", (req, res, next) => {
	req.logOut();
	res.redirect("/");
});

// PROTECTED ROUTE

router.get("/protected-route", (req, res, next) => {
	if (req.isAuthenticated()) {
		res.status(200).send("Success!");
	} else {
		res.status(403).send("Forbidden");
	}
});

module.exports = router;
