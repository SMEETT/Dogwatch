const graphql = require("graphql");
const { GraphQLObjectType, GraphQLSchema } = graphql;
const { GraphQLString, GraphQLID, GraphQLInt, GraphQLBoolean, GraphQLNonNull, GraphQLList } = graphql;
const { GraphQLJSON, GraphQLJSONObject } = require("graphql-type-json");
const User = require("../../sequelize/models/User");
const Dog = require("../../sequelize/models/Dog");
const Appointment = require("../../sequelize/models/Appointment");
// const users_appointments = require("../../sequelize/models/users_appointments");
const db = require("../../config/database");

const { validatePassword, genPassword } = require("../../misc/passwordUtils");
const { Op } = require("sequelize");

// ***********************************************************
// GQL TYPES
// ***********************************************************
const UserType = new GraphQLObjectType({
	name: "User",
	fields: () => ({
		id: { type: GraphQLID },
		username: { type: GraphQLString },
		email: { type: GraphQLString },
		// email: {
		// 	type: GraphQLString,
		// 	resolve(parent, args, { req, res }) {
		// 		if (req.user.id === parent.id) {
		// 			return parent.email;
		// 		} else {
		// 			return null;
		// 		}
		// 	},
		// },
		metadata: {
			type: GraphQLJSONObject,
			resolve(parent, args, { req, res }) {
				if (req.user.id === parent.id) {
					return parent.metadata;
				} else {
					return null;
				}
			},
		},
		preferences: {
			type: GraphQLJSONObject,
			resolve(parent, args, { req, res }) {
				if (req.user.id === parent.id) {
					return parent.preferences;
				} else {
					return null;
				}
			},
		},
		dogs: {
			type: new GraphQLList(DogType),
			async resolve(parent, args, { req, res }) {
				if (req.user.id === parent.id) {
					return await Dog.findAll({ where: { userId: req.user.id } });
				} else {
					return null;
				}
			},
		},
		contacts: {
			type: new GraphQLList(UserType),
			async resolve(parent, args, { req, res }) {
				if (req.user.id === parent.id) {
					const user = await User.findOne({ where: { id: req.user.id } });
					const users = await user.getUsers({});
					const contacts = await user.getContacts({});

					// put all found connections into a single array
					const combinedArray = [...contacts, ...users];
					// filter out the id's
					const combinedIds = combinedArray.map((el) => el.id);
					// filter out all Id's that are not duplicates (we want duplicates!)
					const filteredIds = combinedIds.filter((el, index) => {
						return combinedIds.indexOf(el) !== index;
					});
					// final array of established contacts
					const actualContacts = [];
					// use filtered Id's to get the User instances && make sure each user only gets added once
					combinedArray.forEach((user) => {
						if (filteredIds.includes(user.id) && !actualContacts.find((el) => el.id === user.id)) {
							// user.email = null;
							actualContacts.push(user);
						}
					});
					return actualContacts;
				} else {
					return null;
				}
			},
		},

		createdAppointments: {
			args: {
				start_of_range: { type: GraphQLString },
				end_of_range: { type: GraphQLString },
			},
			type: new GraphQLList(AppointmentType),
			async resolve(parent, args, { req, res }) {
				if (req.user.id === parent.id) {
					const createdAppointments = await parent.getCreatedAppointments({
						where: {
							[Op.not]: {
								[Op.or]: [
									{
										start_date: {
											[Op.gt]: args.end_of_range,
										},
									},
									{
										end_date: {
											[Op.lt]: args.start_of_range,
										},
									},
								],
							},
						},
					});
					return createdAppointments;
				} else {
					return null;
				}
			},
		},
		caretakerAppointments: {
			args: {
				start_of_range: { type: GraphQLString },
				end_of_range: { type: GraphQLString },
			},
			type: new GraphQLList(AppointmentType),
			async resolve(parent, args, { req, res }) {
				if (req.user.id === parent.id) {
					const caretakerAppointments = await parent.getCaretakerAppointments({
						where: {
							[Op.not]: {
								[Op.or]: [
									{
										start_date: {
											[Op.gt]: args.end_of_range,
										},
									},
									{
										end_date: {
											[Op.lt]: args.start_of_range,
										},
									},
								],
							},
						},
					});
					return caretakerAppointments;
				} else {
					return null;
				}
			},
		},
		observerAppointments: {
			args: {
				start_of_range: { type: GraphQLString },
				end_of_range: { type: GraphQLString },
			},
			type: new GraphQLList(AppointmentType),
			async resolve(parent, args, { req, res }) {
				if (req.user.id === parent.id) {
					const observerAppointments = await parent.getObserverAppointments({
						where: {
							[Op.not]: {
								[Op.or]: [
									{
										start_date: {
											[Op.gt]: args.end_of_range,
										},
									},
									{
										end_date: {
											[Op.lt]: args.start_of_range,
										},
									},
								],
							},
						},
					});
					return observerAppointments;
				} else {
					return null;
				}
			},
		},
		status: { type: GraphQLJSON },
	}),
});

const DogType = new GraphQLObjectType({
	name: "Dog",
	fields: () => ({
		id: { type: GraphQLID },
		name: { type: GraphQLString },
		image: { type: GraphQLString },
		birthday: { type: GraphQLString },
		race: { type: GraphQLString },
		gender: { type: GraphQLString },
		weight: { type: GraphQLInt },
		food_amount: { type: GraphQLInt },
		medications: { type: GraphQLList(GraphQLString) },
		walk_duration: { type: GraphQLInt },
		walktimes: { type: GraphQLList(GraphQLString) },
		feedtimes: { type: GraphQLList(GraphQLString) },
		notes: { type: GraphQLString },
		status: { type: GraphQLJSON },
	}),
});

const AppointmentType = new GraphQLObjectType({
	name: "Appointment",
	fields: () => ({
		id: { type: GraphQLID },
		start_date: { type: GraphQLString },
		end_date: { type: GraphQLString },
		accepted: { type: GraphQLBoolean },
		color: { type: GraphQLString },
		creator: {
			type: UserType,
			async resolve(parent, args, { req, res }) {
				return await parent.getCreator();
			},
		},
		caretaker: {
			type: UserType,
			async resolve(parent, args) {
				return await parent.getCaretaker();
			},
		},
		observers: {
			type: GraphQLList(UserType),
			async resolve(parent, args) {
				return await parent.getObservers();
			},
		},
		dogs: {
			type: new GraphQLList(DogType),
			async resolve(parent, args) {
				return await parent.getDogs();
			},
		},
		notes: { type: GraphQLString },
		status: { type: GraphQLJSON },
	}),
});

// ***********************************************************
// ROOT QUERIES
// ***********************************************************

const RootQuery = new GraphQLObjectType({
	name: "RootQueryType",
	fields: {
		// ----------------------------------------------------
		// GET USER INFO
		// ----------------------------------------------------
		getUser: {
			type: UserType,
			args: {
				id: { type: GraphQLInt },
			},
			async resolve(parent, args, { req, res }) {
				if (!req.isAuthenticated()) {
					return { status: 401, message: "Unauthorized", node: null };
				}
				if (args.id) {
					return await User.findOne({ where: { id: args.id } });
				}
				return await User.findOne({ where: { id: req.user.id } });
			},
		},
		getDog: {
			type: DogType,
			args: {
				id: { type: GraphQLInt },
			},
			async resolve(parent, args, { req, res }) {
				if (!req.isAuthenticated()) {
					return { status: 401, message: "Unauthorized", node: null };
				}
				return await Dog.findOne({ where: { userId: req.user.id, id: args.id } });
			},
		},
		getAppointment: {
			type: AppointmentType,
			args: {
				id: { type: GraphQLInt },
			},
			async resolve(parent, args, { req, res }) {
				if (!req.isAuthenticated()) {
					return { status: 401, message: "Unauthorized", node: null };
				}
				return await Appointment.findOne({ where: { creatorId: req.user.id, id: args.id } });
			},
		},
		// getAppointments: {
		// 	type: GraphQLList(AppointmentType),
		// 	args: {
		// 		start_of_range: { type: GraphQLString },
		// 		end_of_range: { type: GraphQLString },
		// 	},
		// 	async resolve(parent, args, { req, res }) {
		// 		// if (!req.isAuthenticated()) {
		// 		// 	return { status: 401, message: "Unauthorized", node: null };
		// 		// }
		// 		return await Appointment.findAll({
		// 			where: {
		// 				[Op.not]: {
		// 					[Op.or]: [
		// 						{
		// 							start_date: {
		// 								[Op.gt]: args.end_of_range,
		// 							},
		// 						},
		// 						{
		// 							end_date: {
		// 								[Op.lt]: args.start_of_range,
		// 							},
		// 						},
		// 					],
		// 				},
		// 			},
		// 		});
		// 	},
		// },
		getAuthStatus: {
			type: GraphQLBoolean,
			resolve(parent, args, { req, res }) {
				console.log("getAuthStatus");
				if (req.isAuthenticated()) {
					return true;
				} else {
					return false;
				}
			},
		},
		// ----------------------------------------------------
		// FIND CONTACT
		// ----------------------------------------------------
		findContact: {
			type: UserType,
			args: {
				searchterm: { type: new GraphQLNonNull(GraphQLString) },
			},
			async resolve(parent, args, { req, res, maxSessionAge }) {
				if (!req.isAuthenticated()) {
					return { status: { code: 401, message: "Unauthorized" } };
				} else {
					const user = await User.findOne({ where: { [Op.or]: [{ email: args.searchterm }, { username: args.searchterm }] } });
					return user;
				}
			},
		},
	},
});

// ***********************************************************
// MUTATIONS
// ***********************************************************

const Mutation = new GraphQLObjectType({
	name: "Mutation",
	fields: {
		// ----------------------------------------------------
		// REGISTER
		// ----------------------------------------------------
		registerUser: {
			type: GraphQLJSON,
			args: {
				username: { type: new GraphQLNonNull(GraphQLString) },
				email: { type: new GraphQLNonNull(GraphQLString) },
				password: { type: new GraphQLNonNull(GraphQLString) },
			},
			async resolve(parent, args, { req, res, maxSessionAge }) {
				// check if the email is already in use
				console.log("registerUser backend");
				const userWithSameEmail = await User.findOne({ where: { email: args.email } });
				console.log(userWithSameEmail);
				if (userWithSameEmail) {
					return { status: 409, message: "Already exists", node: false };
				}

				const saltHash = genPassword(args.password);
				const salt = saltHash.salt;
				const hash = saltHash.hash;

				const newUser = User.build({
					username: args.username,
					email: args.email,
					metadata: {
						calendarLastViewed: { year: 2021, month: 0 },
					},
					hash: hash,
					salt: salt,
				});
				return newUser
					.save()
					.then((user) => {
						console.log(user);
						return { status: 200, message: "OK", email: user.email };
					})
					.catch((err) => {
						console.log("Registering User Failed: ", err);
					});
			},
		},
		// ----------------------------------------------------
		// LOGIN
		// ----------------------------------------------------
		loginUser: {
			type: GraphQLJSON,
			args: {
				email: { type: new GraphQLNonNull(GraphQLString) },
				password: { type: new GraphQLNonNull(GraphQLString) },
			},
			async resolve(parent, args, { req, res, maxSessionAge }) {
				const user = await User.findOne({ where: { email: args.email } });
				if (!user || !validatePassword(args.password, user.hash, user.salt)) {
					return { status: 403, message: "Forbidden", node: false };
				} else {
					req.login(user, (error) => (error ? error : user));
					// cookie is unsecure and only used to help the frontend routing
					// since the auth-cookie is HTTP only

					let cookieOptions;

					const cookieOptionsDev = {
						maxAge: maxSessionAge - 10000,
						sameSite: "none",
						secure: true,
					};
					const cookieOptionsProd = {
						domain: "borisfries.dev",
						path: "/",
						maxAge: maxSessionAge - 10000,
						sameSite: "none",
						secure: true,
					};

					process.env.NODE_ENV === "production" ? (cookieOptions = cookieOptionsProd) : (cookieOptions = cookieOptionsDev);
					console.log(process.env.NODE_ENV);

					res.cookie("isAuthenticated", "true", cookieOptions);
					return { status: 200, message: "OK", node: true };
				}
			},
		},
		// ----------------------------------------------------
		// LOGOUT
		// ----------------------------------------------------
		logoutUser: {
			type: GraphQLBoolean,
			async resolve(parent, args, { req, res, maxSessionAge }) {
				req.logout(req.user, (error) => (error ? error : user));
				let options = {
					maxAge: maxSessionAge - 10000,
					// signed: true, // Indicates if the cookie should be signed
				};
				res.cookie("isAuthenticated", "false", options);
				console.log("request.user: ---------------------------> ", req.user);
				return true;
			},
		},
		// ----------------------------------------------------
		// ADD CONTACT
		// ----------------------------------------------------
		addContact: {
			type: GraphQLString,
			args: {
				contactId: { type: new GraphQLNonNull(GraphQLInt) },
			},
			async resolve(parent, args, { req, res, maxSessionAge }) {
				if (!req.isAuthenticated()) {
					return { status: { code: 401, message: "Unauthorized" } };
				} else {
					const user = await User.findOne({ where: { id: req.user.id } });
					const userToAdd = await User.findOne({ where: { id: args.contactId } });

					await user.addContact(userToAdd);
					await userToAdd.addContact(user);

					return `User with Id ${req.user.id} added User Id ${args.contactId} as a contact`;
				}
			},
		},
		// ----------------------------------------------------
		// REMOVE CONTACT
		// ----------------------------------------------------
		removeContact: {
			type: GraphQLString,
			args: {
				contactId: { type: new GraphQLNonNull(GraphQLInt) },
			},
			async resolve(parent, args, { req, res, maxSessionAge }) {
				if (!req.isAuthenticated()) {
					return { status: { code: 401, message: "Unauthorized" } };
				} else {
					const user = await User.findOne({ where: { id: req.user.id } });
					const contactToDelete = await User.findOne({ where: { id: args.contactId } });

					await user.removeContact(contactToDelete);
					await contactToDelete.removeContact(user);

					return `User with Id ${req.user.id} removed User with Id ${args.contactId} as a contact`;
				}
			},
		},
		// ----------------------------------------------------
		// ADD APPOINTMENT
		// ----------------------------------------------------
		addAppointment: {
			type: AppointmentType,
			args: {
				dogs: { type: GraphQLList(GraphQLInt) },
				caretaker: { type: GraphQLInt },
				observers: { type: GraphQLList(GraphQLInt) },
				start_date: { type: GraphQLString },
				end_date: { type: GraphQLString },
				notes: { type: GraphQLString },
				color: { type: GraphQLString },
			},
			async resolve(parent, args, { req, res, maxSessionAge }) {
				if (!req.isAuthenticated()) {
					return { status: { code: 401, message: "Unauthorized" } };
				} else {
					const newAppointment = Appointment.build({
						start_date: args.start_date,
						end_date: args.end_date,
						notes: args.notes,
						color: args.color,
						accepted: false,
					});

					const t = await db.transaction();

					try {
						await newAppointment.save({ transaction: t });
						const dogs = await Dog.findAll({ where: { id: args.dogs } });
						await newAppointment.addDogs(dogs, { transaction: t });

						const creator = await User.findOne({ where: { id: req.user.id } });
						const caretaker = await User.findOne({ where: { id: args.caretaker } });
						const observers = await User.findAll({ where: { id: args.observers } });

						await newAppointment.setCreator(creator, { transaction: t });
						await newAppointment.setCaretaker(caretaker, { transaction: t });
						await newAppointment.addObservers(observers, { transaction: t });
						await t.commit();
						newAppointment.status = { code: 200, message: "OK" };
						console.log("Transaction successful (Appointmend Add)");
						return newAppointment;
					} catch (err) {
						console.log("Transaction failed (Appointmend Add)", err);
						await t.rollback();
					}
				}
			},
		},
		// ----------------------------------------------------
		// UPDATE APPOINTMENT
		// ----------------------------------------------------
		updateAppointment: {
			type: AppointmentType,
			args: {
				id: { type: GraphQLInt },
				dogs: { type: GraphQLList(GraphQLInt) },
				caretaker: { type: GraphQLInt },
				observers: { type: GraphQLList(GraphQLInt) },
				start_date: { type: GraphQLString },
				end_date: { type: GraphQLString },
				notes: { type: GraphQLString },
			},
			async resolve(parent, args, { req, res, maxSessionAge }) {
				if (!req.isAuthenticated()) {
					return { status: { code: 401, message: "Unauthorized" } };
				} else {
					const t = await db.transaction();

					const appointmentToUpdate = await Appointment.findOne({
						where: { id: args.id, creatorId: req.user.id },
						include: { association: "Observers" },
					});
					appointmentToUpdate.start_date = args.start_date;
					appointmentToUpdate.end_date = args.end_date;
					appointmentToUpdate.notes = args.notes;
					appointmentToUpdate.accepted = false;
					appointmentToUpdate.setCaretaker(null);
					appointmentToUpdate.setObservers(null);
					appointmentToUpdate.setDogs(null);
					await appointmentToUpdate.save();

					try {
						const caretaker = await User.findOne({ where: { id: args.caretaker }, transaction: t });
						const observers = await User.findAll({ where: { id: args.observers }, transaction: t });
						const dogs = await Dog.findAll({ where: { id: args.dogs }, transaction: t });
						await appointmentToUpdate.setCaretaker(caretaker, { transaction: t });
						await appointmentToUpdate.addObservers(observers, { transaction: t });
						await appointmentToUpdate.addDogs(dogs, { transaction: t });
						await t.commit();
						console.log("Transaction successful (Appointment Update)");
						appointmentToUpdate.status = { code: 200, message: "OK" };
						return appointmentToUpdate;
					} catch (err) {
						console.log("Transaction failed (Appointment Update)", err);
						await t.rollback();
					}
				}
			},
		},
		// ----------------------------------------------------
		// DELETE APPOINTMENT
		// ----------------------------------------------------
		deleteAppointment: {
			type: AppointmentType,
			args: {
				id: { type: GraphQLInt },
			},
			async resolve(parent, args, { req, res, maxSessionAge }) {
				if (!req.isAuthenticated()) {
					return { status: { code: 401, message: "Unauthorized" } };
				} else {
					const appointmentToDelete = await Appointment.findOne({ where: { id: args.id, creatorId: req.user.id } });
					return appointmentToDelete
						.destroy()
						.then((appointment) => {
							appointment.status = { code: 200, message: "OK" };
							return appointmentToDelete;
						})
						.catch((err) => {
							console.log("Error: couldn't delete Appointment from DB", err);
							return;
						});
				}
			},
		},
		changeAcceptStatus: {
			type: AppointmentType,
			args: {
				accepted: { type: GraphQLBoolean },
				caretakerId: { type: GraphQLInt },
				appointmentId: { type: GraphQLInt },
			},
			async resolve(parent, args, { req, res }) {
				if (!req.isAuthenticated()) {
					return { status: { code: 401, message: "Unauthorized" } };
				} else {
					const appointmentToUpdate = await Appointment.findOne({ where: { id: args.appointmentId, caretakerId: req.user.id } });
					appointmentToUpdate.accepted = args.accepted;
					await appointmentToUpdate.save();
					return appointmentToUpdate;
				}
			},
		},

		// ----------------------------------------------------
		// ADD DOG
		// ----------------------------------------------------
		addDog: {
			type: DogType,
			args: {
				name: { type: GraphQLString },
				image: { type: GraphQLString },
				birthday: { type: GraphQLString },
				race: { type: GraphQLString },
				gender: { type: GraphQLString },
				weight: { type: GraphQLInt },
				food_amount: { type: GraphQLInt },
				medications: { type: GraphQLList(GraphQLString) },
				walk_duration: { type: GraphQLInt },
				walktimes: { type: GraphQLList(GraphQLString) },
				feedtimes: { type: GraphQLList(GraphQLString) },
				notes: { type: GraphQLString },
			},
			async resolve(parent, args, { req, res, maxSessionAge }) {
				if (!req.isAuthenticated()) {
					return { status: { code: 401, message: "Unauthorized" } };
				} else {
					const checkIfExists = await Dog.findOne({ where: { name: args.name, userId: req.user.id } });
					if (checkIfExists) {
						return { status: { code: 409, message: "Already Exists" } };
					}
					console.log(args);
					const newDog = Dog.build({
						name: args.name,
						image: args.image,
						birthday: args.birthday,
						race: args.race,
						gender: args.gender,
						weight: args.weight,
						food_amount: args.food_amount,
						medications: args.medications,
						walk_duration: args.walk_duration,
						walktimes: args.walktimes,
						feedtimes: args.feedtimes,
						notes: args.notes,
						userId: req.user.id,
					});
					return newDog
						.save()
						.then((dog) => {
							dog.status = { code: 200, message: "OK" };
							return dog;
						})
						.catch((err) => {
							console.log("Error: couldn't save Dog to DB", err);
							return;
						});
				}
			},
		},
		updateDog: {
			type: DogType,
			args: {
				id: { type: GraphQLInt },
				name: { type: GraphQLString },
				image: { type: GraphQLString },
				birthday: { type: GraphQLString },
				race: { type: GraphQLString },
				gender: { type: GraphQLString },
				weight: { type: GraphQLInt },
				food_amount: { type: GraphQLInt },
				medications: { type: GraphQLList(GraphQLString) },
				walk_duration: { type: GraphQLInt },
				walktimes: { type: GraphQLList(GraphQLString) },
				feedtimes: { type: GraphQLList(GraphQLString) },
				notes: { type: GraphQLString },
			},
			async resolve(parent, args, { req, res, maxSessionAge }) {
				if (!req.isAuthenticated()) {
					return { status: { code: 401, message: "Unauthorized" } };
				} else {
					// const checkIfExists = await Dog.findOne({ where: { name: args.name, userId: req.user.id } });
					// if (checkIfExists) {
					// 	return { status: { code: 409, message: "Already Exists" } };
					// }
					const dogToUpdate = await Dog.findOne({ where: { id: args.id, userId: req.user.id } });

					dogToUpdate.name = args.name;
					dogToUpdate.image = args.image;
					dogToUpdate.birthday = args.birthday;
					dogToUpdate.race = args.race;
					dogToUpdate.gender = args.gender;
					dogToUpdate.weight = args.weight;
					dogToUpdate.food_amount = args.food_amount;
					dogToUpdate.medications = args.medications;
					dogToUpdate.walk_duration = args.walk_duration;
					dogToUpdate.walktimes = args.walktimes;
					dogToUpdate.feedtimes = args.feedtimes;
					dogToUpdate.notes = args.notes;

					return dogToUpdate
						.save()
						.then((dog) => {
							dog.status = { code: 200, message: "OK" };
							return dog;
						})
						.catch((err) => {
							console.log("Error: couldn't save Dog to DB", err);
							return;
						});
				}
			},
		},
		deleteDog: {
			type: DogType,
			args: {
				id: { type: GraphQLInt },
			},
			async resolve(parent, args, { req, res, maxSessionAge }) {
				if (!req.isAuthenticated()) {
					return { status: { code: 401, message: "Unauthorized" } };
				} else {
					const dogToDelete = await Dog.findOne({ where: { id: args.id, userId: req.user.id } });
					return dogToDelete
						.destroy()
						.then((dog) => {
							dog.status = { code: 200, message: "OK" };
							return dogToDelete;
						})
						.catch((err) => {
							console.log("Error: couldn't delete Dog from DB", err);
							return;
						});
				}
			},
		},
	},
});

module.exports = new GraphQLSchema({
	query: RootQuery,
	mutation: Mutation,
});
