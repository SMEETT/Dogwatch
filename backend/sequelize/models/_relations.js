const Dog = require("./Dog");
const User = require("./User");
const Appointment = require("./Appointment");
const Comment = require("./Comment");

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

// Appointment <-> Creator
User.hasMany(Appointment, {
	as: { singular: "CreatedAppointment", plural: "CreatedAppointments" },
	foreignKey: { name: "creatorId" },
});
Appointment.belongsTo(User, {
	as: "Creator",
	foreignKey: { name: "creatorId" },
});

// Appointment <-> Caretaker
User.hasMany(Appointment, {
	as: { singular: "CaretakerAppointment", plural: "CaretakerAppointments" },
	foreignKey: { name: "caretakerId" },
});
Appointment.belongsTo(User, {
	as: "Caretaker",
	foreignKey: { name: "caretakerId" },
});

// Appointment <=> Observer
Appointment.belongsToMany(User, {
	as: { singular: "Observer", plural: "Observers" },
	through: "appointments_observers",
	foreignKey: { name: "appointmentId" },
});
User.belongsToMany(Appointment, {
	as: { singular: "ObserverAppointment", plural: "ObserverAppointments" },
	through: "appointments_observers",
	foreignKey: { name: "observerId" },
});
