export const ru = {
	globals: {
		weekdayNames: ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"],
		monthNames: ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"],
		firstDayOffset: 0, // 0: first day of the week Sunday, 1: first day of the week monday
		menu: {
			logout: "Logout",
			profile: "Profile",
			contacts: "Contacts",
			dogs: "Dogs",
			appointments: "Appointments",
		},
	},
	shared: {
		val: {
			emailInvalid: "Invalid E-Mail address",
			emailProvide: "Please provide an E-Mail address",
			pwdProvide: "Please provide a password",
			modalFields: "Please make sure all fields are filled out correctly",
		},
		labels: {
			username: "Username",
			email: "E-Mail",
			password: "Password",
		},
	},

	register: {
		title: "Register",
		passwordConfirm: "Password Confirmation",
		submit: "Register",
		infotext: "Already have an Account?",
		loginLink: "Login",
		val: {
			pwdConfirm: "Please confirm your password",
			pwdNoMatch: "Passwords do not match",
			userProvide: "Please pick a username",
			userExists: "This E-Mail address is already in use",
			modalRegisterSuccess: "Registration successful",
			modalRegisterFailed: "Registration failed",
		},
	},

	login: {
		title: "Login",
		submit: "Login",
		infotext: "No Account yet?",
		regLink: "Register",
		val: {
			modalLoginSuccess: "Login successful",
			modalLoginFailed: "Wrong E-Mail or Password",
		},
	},
	apptIndex: {},
};
