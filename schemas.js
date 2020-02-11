var mongoose = require("mongoose");

var Session = mongoose.model("Session", {//sessions
	sessionID: String,
	userID: String
});
module.exports.Session = Session;

var Admin = mongoose.model("Admin", {//admins in database
	firstname: String,
	lastname: String,
	username: String,
	password: String,
	salt: String
});
module.exports.Admin = Admin;