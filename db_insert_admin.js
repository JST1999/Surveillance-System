var mongoose = require("mongoose");
var schemas = require("./schemas");
var createHash = require('./express-server.js').createHash;//to create hashes
var createSalt = require('./express-server.js').createSalt;//to create salts

var uri = "mongodb+srv://JTungay:Sekiro2019@cluster0-qr9xf.mongodb.net/test?retryWrites=true&w=majority";
mongoose.connect(uri, {useNewUrlParser: true});

var password = "password";
var salt = createSalt();
var hash = createHash(password, salt);

var Admin = new schemas.Admin({
	"email": "jtungay@gmail.com",
	"firstname": "Jason",
	"lastname": "Tungay",
	"username": "jstungay",
	"password": hash,
	"salt": salt
});
Admin.save().then((test) => {
	console.log("Added to DB");
});