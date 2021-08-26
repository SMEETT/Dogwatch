const Dog = require("./Dog");
const User = require("./User");
const Appointment = require("./Appointment");
const Comment = require("./Comment");
const users_appointments = require("./users_appointments");

User.belongsToMany(User, { as: { singular: "Contact", plural: "Contacts" }, foreignKey: "userId", through: "users_contacts" });
User.belongsToMany(User, { as: { singular: "User", plural: "Users" }, foreignKey: "contactId", through: "users_contacts" });

Dog.belongsToMany(Appointment, { as: { singular: "Appointment", plural: "Appointments" }, through: "dogs_appointments" });
Appointment.belongsToMany(Dog, { as: { singular: "Dog", plural: "Dogs" }, through: "dogs_appointments" });

User.hasMany(Dog);
Dog.belongsTo(User);

Appointment.hasMany(Comment);
Comment.belongsTo(Appointment);

User.hasMany(Comment);
Comment.belongsTo(User);

Appointment.belongsToMany(User, {
	as: { singular: "User", plural: "Users" },
	through: users_appointments,
	// alloswNull: true,
});

User.belongsToMany(Appointment, {
	as: { singular: "Appointment", plural: "Appointments" },
	through: users_appointments,
});
