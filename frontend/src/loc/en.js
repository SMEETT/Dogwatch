export const en = {
	// ********************************************************
	// GLOBALS / SHARED
	// ********************************************************
	globals: {
		weekdayNames: ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"],
		monthNames: ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"],
		menu: {
			logout: "Logout",
			profile: "Profile",
			contacts: "Contacts",
			dogs: "Dogs",
			appointments: "Appointments",
		},
	},
	shared: {
		misc: {
			pleaseSelect: "Please select",
		},
		labels: {
			username: "Username",
			email: "E-Mail",
			password: "Password",
			notes: "Notes",
			date: "Date",
			time: "h",
			minutesShort: "min",
			hoursShort: "hour",
			chars: "characters",
		},
		modal: {
			missingFields: "Please fill out all fields correctly",
			notLoggedIn: "User not logged in.",
			unknownError: "An unknown error occured.",
		},
		val: {
			emailInvalid: "Invalid e-mail address",
			emailProvide: "Please provide an e-mail address",
			pwdProvide: "Please provide a password",
			notesLength: "Note can't be longer than 500 characters",
		},
	},
	// ********************************************************
	// REGISTER
	// ********************************************************
	register: {
		misc: {
			headline: "Register",
			pageTitle: "Dogwatch / Register",
			submit: "Register",
			infotext: "Already got an account?",
			loginLink: "Login",
		},
		labels: {
			passwordConfirm: "Confirm Password",
		},
		modal: {
			registerSuccess: "Registration was successful",
			registerFailed: "Registration failed",
		},
		val: {
			pwdConfirm: "Please confirm your password",
			pwdNoMatch: "Passwords do not match",
			userProvide: "Please choose a username",
			userExists: "E-mail address already in use",
		},
	},
	// ********************************************************
	// LOGIN
	// ********************************************************
	login: {
		misc: {
			headline: "Login",
			pageTitle: "Dogwatch / Login",
			submit: "Login",
			infotext: "No account yet?",
			regLink: "Register",
		},
		modal: {
			loginSuccess: "Successfully logged in",
			loginFailed: "Wrong e-mail address or password",
		},
	},
	// ********************************************************
	// APPOINTMENTS
	// ********************************************************
	appointments: {
		misc: {
			pageTitle: "Dogwatch / Appointments",
			noAppointments: "No appointments for this day yet.",
			btnAddAllDogs: "Add all dogs",
			appointmentStatus: {
				pending: "Pending",
				accepted: "Accepted",
				denied: "Denied",
			},
			eventWalk: "Walk",
			eventFeed: "Feeding",
		},
		labels: {
			creator: "Creator",
			caretaker: "Caretaker", // singular
			observers: "Observer", // plural
			arrival: "Arrival",
			departure: "Departure",
			dogs: "Dogs", // plural
			events: "Events",
		},
		modal: {
			showCreatorAppointments: "Displayed Appointments: Creator",
			showCaretakerAppointments: "Displayed Appointments: Caretaker/Observer",
			updateSuccess: "Appointment successfully updated",
			addSuccess: "Appointment successfully added",
		},
		val: {
			arrivalProvide: "Please provide time of arrival",
			departureProvide: "Please provide time of departure",
			startDateProvide: "Please provide startdate",
			endDateProvide: "Please provide enddate",
			endDateLTstartDate: "Time of departure before time of arrival",
		},
	},
	// ********************************************************
	// DOGS
	// ********************************************************
	dogs: {
		misc: {
			pageTitle: "Dogwatch / Dogs",
			noDogsYet: "You haven't added any dogs yet :)",
			formContextAdd: "Add Dog",
			formContextEdit: "Edit Dog",
			btnSelectPicture: "Choose/Take picture",
			genders: {
				male: "Male",
				female: "Female",
			},
		},
		labels: {
			name: "Name",
			birthday: "Birthday",
			age: "Age",
			race: "Race",
			gender: "Gender",
			weight: "Weight",
			foodAmount: "Food amount",
			medication: "Medication",
			feedTimes: "Feedtimes",
			walkTimes: "Walktimes",
			walkDuration: "Walk duration",
		},
		modal: {
			dogExists: "already exists.", // will be completed by injected string in code
			dogAdded: "was added successfully", // will be completed by injected string in code
			dogUpdated: "was updated successfuly", // will be completed by injected string in code
		},
		val: {
			nameProvide: "Please provide a name",
			nameLength: "Name can't be more than 20 characters long",
			birthdayProvide: "Please provide the birthday",
			raceProvide: "Please provide a race",
			raceLength: "Race can't more than 40 characters long",
			genderProvide: "Please select a gender",
			weightProvide: "Please provide weight",
			foodAmountProvide: "Please provide the food amount",
			walkDurationProvide: "Please provide the duration",
			walksProvide: "Please provide the walktime(s)",
			feedsProvide: "Please provide the feedtime(s)",
		},
		placeholders: {
			name: "Please provide name",
			race: "Please provide race",
			weight: "Please provide weight",
			foodAmount: "Please provide food amount",
			walkDuration: "Please provide walk duration",
			medication: "Please provide medication",
		},
	},
	contacts: {
		misc: {
			pageTitle: "Dogwatch / Contacts",
			btnAdd: "Add",
			btnDelete: "Delete",
			noResult: "No results for your search :/",
		},
		labels: {
			contacts: "Contacts",
			search: "Search",
			searchResults: "Searchresults",
			contactList: "Contactlist",
		},
		modal: {
			addSuccess: "Contact was added successfully",
			deleteSuccess: "Contact was removed successfully",
			alreadyExists: "You already added this contact",
		},
		placeholders: {
			search: "E-Mail address or username",
		},
	},
	profile: {
		misc: {
			headline: "Profile",
			pageTitle: "Dogwatch / Profile",
			btnSaveSettings: "Save settings",
		},
		labels: {
			firstDayOfWeek: "First day of the week",
		},
		modal: {
			saveSuccess: "Settings successfully saved",
		},
	},
};
