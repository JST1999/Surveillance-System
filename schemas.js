var mongoose = require("mongoose");

var Session = mongoose.model("Session", {//sessions
	sessionID: String,
	userID: String
});
module.exports.Session = Session;

var Admin = mongoose.model("Admin", {//admins in database
	email: String,
	firstname: String,
	lastname: String,
	username: String,
	password: String,
	salt: String
});
module.exports.Admin = Admin;

var Image = mongoose.model("Image", {//images in database
	filename: String,
	username: String,
	year: Number,
	month: Number,
	day: Number,
	hour: Number
});
module.exports.Image = Image;

var NewPassSession = mongoose.model("NewPassSession", {//newpasssessions
	sessionID: String,
	userID: String
});
module.exports.NewPassSession = NewPassSession;