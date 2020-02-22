var mongoose = require("mongoose");

var uri = "mongodb+srv://JTungay:Sekiro2019@cluster0-qr9xf.mongodb.net/test?retryWrites=true&w=majority";
var port = process.env.PORT || 8080	//process.env.PORT is for heroku

// Schemas.js, so we can get the card and game models from there
var schemas = require("./schemas");

// Import Express and initialise the application.
express = require("express");
var app = express();
app.use(function(req, res, next) {
	res.header("Access-Control-Allow-Origin", "*");
	next();
});

var bodyParser = require('body-parser');
var multer = require('multer');
var upload = multer();
//var cookieParser = require('cookie-parser');
var sha256 = require('sha256');

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
//app.use(cookieParser());

app.use(express.static(__dirname));

//one of my fav parts, this is a part for sending emails
// var nodemailer = require('nodemailer');
// var transporter = nodemailer.createTransport({
//   service: 'gmail',
//   auth: {
//     user: 'saywatt0@gmail.com',
//     pass: 'What are you looking at1'
//   }
// });

var Storage = multer.diskStorage({//used to help add images https://dzone.com/articles/upload-files-or-images-to-server-using-nodejs
	destination: function(req, file, callback) {
		callback(null, "./images");
	},
	filename: function(req, file, callback) {
		var name = file.originalname;

		var d = new Date();
		var year = d.getFullYear();
		var month = d.getMonth() + 1;//jan is month 0
		var day = d.getDate();
		var hour = d.getHours();

		var Image = new schemas.Image({
			"filename": name,
			"year": year,
			"month": month,
			"day": day,
			"hour": hour,
		});
		Image.save().then((test) => {
			res.status("200");
			res.json({
				message: "Added successfully"
			});
		});

		callback(null, name);
	}
});//also, another one of my fav features
var upload = multer({
	storage: Storage
}).array("imgUploader", 3); //Field name and max count

app.post("/addimage", function(req, res) {
	upload(req, res, function(err) {
		if (err) {
			return res.end("Something went wrong!");
		}
		return res.end("File uploaded sucessfully!");
	});
});

function createHash(password, salt){//as a function so i can run tests - also so signup and login can use it - also sessionID uses it to make itself longer and unique and 'random'
	return sha256.x2(password+salt);//one of my fav parts - x2 means that it is double hashed
}
function createSalt(){//seperate function for tests
	var salt = '';
	var characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789$';
	var charactersLength = characters.length;
	for ( var i = 0; i < 29; i++ ) {
		salt += characters.charAt(Math.floor(Math.random() * charactersLength));
	}
	return salt;
}

app.post('/adminlogin', function(req, res){
	var username = req.body.username;
	var password = req.body.password;

	schemas.Admin.find({"username": username}, function(err, user) {//search for admin
		if (user.length === 0){// admin not found
			res.status("401");
			res.json({
				message: "Invalid Email or Password"
			});
		} else{//admin is found
			var salt = user[0].salt;
			var hash = createHash(password, salt);
			if(hash != user[0].password){//password not correct
				res.status("401");
				res.json({
					message: "Invalid Email or Password"
				});
			} else{//password is correct
				var Session = new schemas.Session({//create new session
					sessionID: createHash(user[0]._id, ''),
					userID: user[0]._id
				});
				schemas.Session.insertMany(Session, function(err){
					if (err) throw err;
					res.status("200");
					res.json({
						message: Session.sessionID
					});
				});
			}
		}
	});
});

app.post("/logout", function(req, res){
	schemas.Session.deleteOne({"sessionID": req.body.sessionID}, function(err, sess) {
		if (err){
			res.status("500");
			throw err;
		}
		res.status("200");
		res.json({
			message: "Session logged out successfully"
		});
	});
});

app.post("/getadmindetails", function(req, res){
	schemas.Session.findOne({"sessionID": req.body.sessionID}, function(err, sess) {
		if (sess){// session found
			schemas.Admin.findOne({"_id": sess.userID}, function(err, user) {//get user
				res.setHeader("Content-Type", "application/json");
				user.password = "";//security flaw if I send passwords back
				user.salt = "";
				res.status("200");
				res.send(user);
			});
		} else{
			res.status("401");
			res.json({
				message: "Invalid Session ID"
			});
		}
	});
});

app.get("/getmostrecent", function (request, response) {//gets most recent 50 images
	schemas.Image.find(function(err, images) {
		response.setHeader("Content-Type", "application/json");
		response.send(images);
	}).sort({_id:-1}).limit(50);//-1 is decending (newest to oldest)
});

app.get("/getImages/:date", function (request, response) {//gets images from a certain date
	var str = request.params.date
	var arr = str.split('-');
	var year = arr[0];
	var month = arr[1];
	var day = arr[2];

	schemas.Image.find({"year": year, "month": month, "day": day}, function(err, images) {
		response.setHeader("Content-Type", "application/json");
		response.send(images);
	});
});

//sends index.html
app.get("/", function(request, response) {
	response.render("index");//if the html file is callled index, you dont need a view engine. will move to one soon
});

// Run the server.
app.listen(port, function() {
	mongoose.connect(uri, {useNewUrlParser: true, useUnifiedTopology: true}).then((test) => {
		console.log("Connected to DB");
	});
	console.log("Listening...");
})

//for testing
module.exports = app;
module.exports.createHash = createHash;
module.exports.createSalt = createSalt;