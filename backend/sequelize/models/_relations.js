const Dog = require("./Dog");
const User = require("./User");
const Appointment = require("./Appointment");

User.belongsToMany(User, { as: { singular: "Contact", plural: "Contacts" }, foreignKey: "userId", through: "users_contacts" });
User.belongsToMany(User, { as: { singular: "User", plural: "Users" }, foreignKey: "contactId", through: "users_contacts" });

Dog.belongsToMany(Appointment, { as: { singular: "Appointment", plural: "Appointments" }, through: "dogs_appointments" });
Appointment.belongsToMany(Dog, { as: { singular: "Dog", plural: "Dogs" }, through: "dogs_appointments" });

User.hasMany(Appointment);
Appointment.belongsTo(User);

Appointment.belongsToMany(User, {
	as: { singular: "Caretaker", plural: "Caretakers" },
	through: "caretakers_appointments",
	// alloswNull: true,
});

User.belongsToMany(Appointment, {
	as: { singular: "Caredate", plural: "Caredates" },
	through: "caretakers_appointments",
});

User.hasMany(Dog);
Dog.belongsTo(User);
