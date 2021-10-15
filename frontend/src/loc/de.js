export const de = {
	// ********************************************************
	// GLOBALS / SHARED
	// ********************************************************
	globals: {
		weekdayNames: ["So", "Mo", "Di", "Mi", "Do", "Fr", "Sa"],
		monthNames: ["Jan", "Feb", "Mär", "Apr", "Mai", "Jun", "Jul", "Aug", "Sep", "Okt", "Nov", "Dez"],
		menu: {
			logout: "Logout",
			profile: "Profil",
			contacts: "Kontakte",
			dogs: "Hunde",
			appointments: "Termine",
		},
	},
	shared: {
		misc: {
			pleaseSelect: "Bitte auswählen",
		},
		labels: {
			username: "Benutzername",
			email: "E-Mail",
			password: "Passwort",
			notes: "Notizen",
			date: "Datum",
			time: "",
			minutesShort: "Min",
			hoursShort: "Std",
			chars: "Zeichen",
		},
		modal: {
			missingFields: "Bitte füllen Sie alle Felder korrekt aus",
			notLoggedIn: "Sie sind nicht eingeloggt.",
			unknownError: "Ein ubekannter Fehler ist aufgetreten.",
		},
		val: {
			emailInvalid: "Ungültige E-Mail Adresse",
			emailProvide: "Bitte geben Sie eine E-Mail Adresse an",
			pwdProvide: "Bitte Passwort eingeben",
			notesLength: "Die Notiz darf maximal 500 Zeichen lang sein",
		},
	},
	// ********************************************************
	// REGISTER
	// ********************************************************
	register: {
		misc: {
			headline: "Registrieren",
			pageTitle: "Dogwatch / Registrieren",
			submit: "Registrieren",
			infotext: "Sie haben bereits einen Account?",
			loginLink: "Login",
		},
		labels: {
			passwordConfirm: "Passwort bestätigen",
		},
		modal: {
			registerSuccess: "Registrierung erfolgreich",
			registerFailed: "Registrierung fehlgeschlagen",
		},
		val: {
			pwdConfirm: "Bitte bestätigen Sie Ihr Passwort",
			pwdNoMatch: "Passwörter stimmen nicht überein",
			userProvide: "Bitte wählen Sie einen Benutzernamen",
			userExists: "Diese E-Mail Adresse wird bereits verwendet",
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
			infotext: "Sie haben noch keinen Account?",
			regLink: "Registrieren",
		},
		modal: {
			loginSuccess: "Login erfolgreich",
			loginFailed: "Falsche E-Mail Adresse od. Passwort",
		},
	},
	// ********************************************************
	// APPOINTMENTS
	// ********************************************************
	appointments: {
		misc: {
			pageTitle: "Dogwatch / Termine",
			noAppointments: "Noch keine Termine an diesem Tag.",
			btnAddAllDogs: "Alle Hunde hinzufügen",
			appointmentStatus: {
				pending: "Offen",
				accepted: "Bestätigt",
				denied: "Abgelehnt",
			},
			eventWalk: "Spaziergang",
			eventFeed: "Fütterung",
		},
		labels: {
			creator: "Ersteller",
			caretaker: "Aufpasser", // singular
			observers: "Beobachter", // plural
			arrival: "Ankunft",
			departure: "Abholung",
			dogs: "Hunde", // plural
			events: "Ablauf",
		},
		modal: {
			showCreatorAppointments: "Angezeigte Termine: Ersteller",
			showCaretakerAppointments: "Angezeigte Termine: Aufpasser/Beobachter",
			updateSuccess: "Termin wurde erfolgreich aktualisiert",
			addSuccess: "Termin wurde erfolgreich angelegt",
		},
		val: {
			arrivalProvide: "Bitte Ankunftszeit angeben",
			departureProvide: "Bitte Abholzeit angeben",
			startDateProvide: "Bitte Startdatum angeben",
			endDateProvide: "Bitte Enddatum angeben",
			endDateLTstartDate: "Zeitpunkt der Abholung liegt vor der Ankunft",
		},
	},
	// ********************************************************
	// DOGS
	// ********************************************************
	dogs: {
		misc: {
			pageTitle: "Dogwatch / Hunde",
			noDogsYet: "Sie haben bisher noch keine Hunde angelegt.",
			formContextAdd: "Hund anlegen",
			formContextEdit: "Hund bearbeiten",
			btnSelectPicture: "Bild wählen",
			genders: {
				male: "Männlich",
				female: "Weiblich",
			},
		},
		labels: {
			name: "Name",
			birthday: "Geburtsdatum",
			age: "Alter",
			race: "Rasse",
			gender: "Geschlecht",
			weight: "Gewicht",
			foodAmount: "Futtermenge",
			medication: "Medikamente",
			feedTimes: "Fütterungen",
			walkTimes: "Spaziergänge",
			walkDuration: "Spaziergang Dauer",
		},
		modal: {
			dogExists: "existiert bereit.", // will be completed by injected string in code
			dogAdded: "wurde erfolgreich angelegt", // will be completed by injected string in code
			dogUpdated: "wurde erfolgreich aktualisiert", // will be completed by injected string in code
		},
		val: {
			nameProvide: "Bitte geben Sie einen Namen ein",
			nameLength: "Der Name darf maximal 20 Zeichen lang sein",
			birthdayProvide: "Bitte geben Sie ein Geburtsdatum an",
			raceProvide: "Bitte geben Sie die Rasse an",
			raceLength: "Die Rasse darf maximal 40 Zeichen lang sein",
			genderProvide: "Bitte wählen Sie das Geschlecht",
			weightProvide: "Bitte geben Sie das Gewicht an",
			foodAmountProvide: "Bitte geben Sie die Futtermenge an",
			walkDurationProvide: "Bitte geben Sie die Dauer an",
			walksProvide: "Bitte Spaziergangzeit(en) angeben",
			feedsProvide: "Bitte Fütterungszeit(en) angeben",
		},
		placeholders: {
			name: "Bitte Name angeben",
			race: "Bitte Rasse angeben",
			weight: "Bitte Gewicht angeben",
			foodAmount: "Bitte Futtermenge angeben",
			walkDuration: "Bitte Spaziergangdauer angeben",
			medication: "Bitte Medikamente angeben",
		},
	},
	contacts: {
		misc: {
			pageTitle: "Dogwatch / Kontakte",
			btnAdd: "Hinzufügen",
			btnDelete: "Entfernen",
			noResult: "Ihre Suche ergab keine Treffer :/",
		},
		labels: {
			contacts: "Kontakte",
			search: "Suche",
			searchResults: "Suchergebnisse",
			contactList: "Kontaktliste",
		},
		modal: {
			addSuccess: "Kontakt wurde erfolgreich hinzugefügt",
			deleteSuccess: "Kontakt wurde erfolgreich entfernt",
			alreadyExists: "Sie haben diesen Kontakt bereits hinzugefügt",
		},
		placeholders: {
			search: "E-Mail oder Benutzername",
		},
	},
	profile: {
		misc: {
			headline: "Profil",
			pageTitle: "Dogwatch / Profil",
			btnSaveSettings: "Einstellungen speichern",
		},
		labels: {
			firstDayOfWeek: "Erster Tag der Woche",
		},
		modal: {
			saveSuccess: "Einstellungen wurden erfolgreich gespeichert",
		},
	},
};
