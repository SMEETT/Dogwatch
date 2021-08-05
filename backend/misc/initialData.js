const User = require("../models/User");

async function createInitialData() {
	const username1 = "Ben";

	User.findOne({ where: { username: username1 } }).then((user) => {
		async function createUser() {
			if (!user) {
				const user = await User.create({
					username: username1,
					password: "12345",
					metadata: {
						calendarLastViewed: { year: 2021, month: 0 },
					},
					email: `${username1.toLowerCase()}@example.com`,
				});
			}
		}
		createUser();
	});

	const username2 = "Joe";

	User.findOne({ where: { username: username2 } }).then((user) => {
		async function createUser() {
			if (!user) {
				const user = await User.create({
					username: username2,
					password: "12345",
					email: `${username2.toLowerCase()}@example.com`,
				});
			}
		}
		createUser();
	});
}

module.exports = createInitialData();
