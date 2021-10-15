export const ru = {
	// ********************************************************
	// GLOBALS / SHARED
	// ********************************************************
	globals: {
		weekdayNames: ["вс", "пн", "вт", "ср", "чт", "пт", "сб"],
		monthNames: ["янв", "фев", "мар", "апр", "май", "июн", "июл", "авг", "сен", "окт", "ноя", "дек"],
		menu: {
			logout: "Выход",
			profile: "Профиль",
			contacts: "Контакты",
			dogs: "Собаки",
			appointments: "События",
		},
	},
	shared: {
		misc: {
			pleaseSelect: "Выберите",
		},
		labels: {
			username: "Имя пользователя",
			email: "E-Mail",
			password: "Пароль",
			notes: "Примечание",
			date: "Дата",
			time: "",
			minutesShort: "мин",
			hoursShort: "час",
			chars: "символов",
		},
		modal: {
			missingFields: "Пожалуйста, заполните все поля правильно",
			notLoggedIn: "Вход в систему не выполнен.",
			unknownError: "Произошла неизвестная ошибка.",
		},
		val: {
			emailInvalid: "Некорректный адрес e-mail",
			emailProvide: "Укажите адрес e-mail",
			pwdProvide: "Укажите пароль",
			notesLength: "Примечание не может быть длиннее 500 символов",
		},
	},
	// ********************************************************
	// REGISTER
	// ********************************************************
	register: {
		misc: {
			headline: "Регистрация",
			pageTitle: "Dogwatch / Регистрация",
			submit: "Зарегистрироваться",
			infotext: "Уже зарегистрированы?",
			loginLink: "Войти",
		},
		labels: {
			passwordConfirm: "Подтвердите пароль",
		},
		modal: {
			registerSuccess: "Регистрация прошла успешно",
			registerFailed: "Ошибка при регистрации",
		},
		val: {
			pwdConfirm: "Подтвердите пароль",
			pwdNoMatch: "Пароли не совпадают",
			userProvide: "Выберите имя пользователя",
			userExists: "Этот e-mail уже зарегистрирован",
		},
	},
	// ********************************************************
	// LOGIN
	// ********************************************************
	login: {
		misc: {
			headline: "Вход",
			pageTitle: "Dogwatch / Вход",
			submit: "Войти",
			infotext: "Не зарегистрированы?",
			regLink: "Регистрация",
		},
		modal: {
			loginSuccess: "Вход выполнен успешно",
			loginFailed: "Неверный адрес e-mail или пароль",
		},
	},
	// ********************************************************
	// APPOINTMENTS
	// ********************************************************
	appointments: {
		misc: {
			pageTitle: "Dogwatch / События",
			noAppointments: "В этот день событий пока нет.",
			btnAddAllDogs: "Добавить всех собак",
			appointmentStatus: {
				pending: "Ожидает",
				accepted: "Принято",
				denied: "Отклонено",
			},
			eventWalk: "Выгул",
			eventFeed: "Кормежка",
		},
		labels: {
			creator: "Создатель",
			caretaker: "Смотритель", // singular
			observers: "Наблюдатели", // plural
			arrival: "Прибытие",
			departure: "Отбытие",
			dogs: "Собаки", // plural
			events: "Распорядок",
		},
		modal: {
			showCreatorAppointments: "Отображаемые события: Создатель",
			showCaretakerAppointments: "Отображаемые события: Смотритель/Наблюдатель",
			updateSuccess: "Событие обновлено успешно",
			addSuccess: "Событие добавлено успешно",
		},
		val: {
			arrivalProvide: "Укажите время прибытия",
			departureProvide: "Укажите время отбытия",
			startDateProvide: "Укажите дату начала",
			endDateProvide: "Укажите дату конца",
			endDateLTstartDate: "Отбытие раньше прибытия",
		},
	},
	// ********************************************************
	// DOGS
	// ********************************************************
	dogs: {
		misc: {
			pageTitle: "Dogwatch / Собаки",
			noDogsYet: "Вы еще не добавили собак :)",
			formContextAdd: "Добавить собаку",
			formContextEdit: "Редактировать собаку",
			btnSelectPicture: "Выбрать/сделать фото",
			genders: {
				male: "Мужской",
				female: "Женский",
			},
		},
		labels: {
			name: "Имя",
			birthday: "Дата рождения",
			age: "Возраст",
			race: "Порода",
			gender: "Пол",
			weight: "Вес",
			foodAmount: "Количество корма",
			medication: "Медикаменты",
			feedTimes: "Выгулы",
			walkTimes: "Кормежки",
			walkDuration: "Продолжительность выгула",
		},
		modal: {
			dogExists: "уже существует.", // will be completed by injected string in code
			dogAdded: "добавлен(а) успешно", // will be completed by injected string in code
			dogUpdated: "изменен(а) успешно", // will be completed by injected string in code
		},
		val: {
			nameProvide: "Укажите имя",
			nameLength: "Имя не может быть длиннее 20 символов",
			birthdayProvide: "Укажите дату рождения",
			raceProvide: "Укажите породу",
			raceLength: "Порода не может быть длиннее 40 символов",
			genderProvide: "Выберите пол",
			weightProvide: "Укажите вес",
			foodAmountProvide: "Укажите количество корма",
			walkDurationProvide: "Укажите продолжительность выгула",
			walksProvide: "Введите выгулы",
			feedsProvide: "Введите кормежки)",
		},
		placeholders: {
			name: "Введите имя",
			race: "Введите породу",
			weight: "Введите вес",
			foodAmount: "Введите количество корма",
			walkDuration: "Введите продолжительность выгула",
			medication: "Введите медикаменты",
		},
	},
	contacts: {
		misc: {
			pageTitle: "Dogwatch / Контакты",
			btnAdd: "Добавить",
			btnDelete: "Удалить",
			noResult: "По вашему запросу ничего не найдено :/",
		},
		labels: {
			contacts: "Контакты",
			search: "Поиск",
			searchResults: "Результаты поиска",
			contactList: "Список контактов",
		},
		modal: {
			addSuccess: "Контакт добавлен успешно",
			deleteSuccess: "Контакт удален успешно",
			alreadyExists: "Вы уже добавили этот контакт",
		},
		placeholders: {
			search: "Адрес e-mail или имя пользователя",
		},
	},
	profile: {
		misc: {
			headline: "Профиль",
			pageTitle: "Dogwatch / Профиль",
			btnSaveSettings: "Сохранить настройки",
		},
		labels: {
			firstDayOfWeek: "Начало недели",
		},
		modal: {
			saveSuccess: "Настройки успешно сохранены",
		},
	},
};
