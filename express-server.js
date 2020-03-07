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
var nodemailer = require('nodemailer');
var transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: 'surveilsystem@gmail.com',
    pass: 'What are you looking at 1'
  }
});

var Storage = multer.diskStorage({//used to help add images https://dzone.com/articles/upload-files-or-images-to-server-using-nodejs
	destination: function(req, file, callback) {
		callback(null, "./images");
	},
	filename: function(req, file, callback) {
		var name = file.originalname;
		var sessionID = name.substring(0, 64);

		var d = new Date();
		var year = d.getFullYear();
		var month = d.getMonth() + 1;//jan is month 0
		var day = d.getDate();
		var hour = d.getHours();

		schemas.Session.findOne({"sessionID": sessionID}, function(err, sess) {
			if (sess){// session found
				schemas.Admin.findOne({"_id": sess.userID}, function(err, user) {//get user
					var Image = new schemas.Image({
						"filename": name,
						"username": user.username,
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
				});
			} else{
				res.status("401");
				res.json({
					message: "Invalid Session ID"
				});
			}
		});

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

app.post('/signup', function(req, res){
	var firstname = req.body.firstname;
	var lastname = req.body.lastname;
	var email = req.body.email;
	var password = req.body.password;
	var username = req.body.username;

	if(/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/.test(email) === true){
		schemas.Admin.find({"email": email}, function(err, user) {
			if (user.length != 0){
				res.status("401");
				res.json({
					message: "User Already Exists with that email!"
				});
			} else{
				schemas.Admin.find({"username": username}, function(err, user) {
					if (user.length != 0){
						res.status("401");
						res.json({
							message: "User Already Exists with that username!"
						});
					} else{
						var salt = createSalt();
						var hash = createHash(password, salt);
						
						var Admin = new schemas.Admin({
							"email": email,
							"firstname": firstname,
							"lastname": lastname,
							"username": username,
							"password": hash,
							"salt": salt
						});
						Admin.save().then((test) => {
							//setup email
							var mailOptions = {
								from: 'surveilsystem@gmail.com',
								to: email,
								subject: 'Welcome!',
								text: 'Welcome '+firstname+'. This is a confirmation that you have created an account.'
							};
							//send email
							transporter.sendMail(mailOptions, function(error, info){
								if (error) {
								console.log(error);
								} else {
								console.log('Email sent: ' + info.response);
								}
							});

							res.status("200");
							res.json({
								message: "Added successfully"
							});
						});
					}
				});
			}
		});
	}
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

// app.get("/getmostrecent", function (request, response) {//gets most recent 50 images
// 	schemas.Image.find(function(err, images) {
// 		response.setHeader("Content-Type", "application/json");
// 		response.send(images);
// 	}).sort({_id:-1}).limit(50);//-1 is decending (newest to oldest)
// });
app.post("/getmostrecent", function (req, res) {//gets most recent 50 images
	schemas.Session.findOne({"sessionID": req.body.sessionID}, function(err, sess) {
		if (sess){// session found
			schemas.Admin.findOne({"_id": sess.userID}, function(err, user) {//get user
				var username = user.username;
				schemas.Image.find({"username": username}, function(err, images) {
					res.setHeader("Content-Type", "application/json");
					res.send(images);
				}).sort({_id:-1}).limit(50);//-1 is decending (newest to oldest)
			});
		} else{
			res.status("401");
			res.json({
				message: "Invalid Session ID"
			});
		}
	});
});

// app.get("/getImages/:date", function (request, response) {//gets images from a certain date
// 	var str = request.params.date
// 	var arr = str.split('-');
// 	var year = arr[0];
// 	var month = arr[1];
// 	var day = arr[2];

// 	schemas.Image.find({"year": year, "month": month, "day": day}, function(err, images) {
// 		response.setHeader("Content-Type", "application/json");
// 		response.send(images);
// 	});
// });
app.post("/getImages/:date", function (req, res) {//gets images from a certain date
	schemas.Session.findOne({"sessionID": req.body.sessionID}, function(err, sess) {
		if (sess){// session found
			schemas.Admin.findOne({"_id": sess.userID}, function(err, user) {//get user
				var username = user.username;
				var str = req.params.date
				var arr = str.split('-');
				var year = arr[0];
				var month = arr[1];
				var day = arr[2];
				
				schemas.Image.find({"username": username, "year": year, "month": month, "day": day}, function(err, images) {
					res.setHeader("Content-Type", "application/json");
					res.send(images);
				});
			});
		} else{
			res.status("401");
			res.json({
				message: "Invalid Session ID"
			});
		}
	});
});


app.post('/resetpassword', function(req, res){
	var sessionID = req.body.sessionID
	var oldPass = req.body.oldPass;
	var newPass = req.body.newPass;

	schemas.Session.findOne({"sessionID": sessionID}, function(err, sess) {//get session
		if (sess){// session found
			schemas.Admin.findOne({"_id": sess.userID}, function(err, user) {//get user
				var salt = user.salt;
				var hash = createHash(oldPass, salt);
				if(hash === user.password){
					var newUser = user;
					var newSalt = createSalt();
					var newHash = createHash(newPass, newSalt);

					newUser.salt = newSalt;
					newUser.password = newHash;
					newUser.save().then((test) => {
						res.status("200");
						res.json({
							message: "Changed Successfully"
						});
					});
				} else{
					res.status("401");
					res.json({
						message: "Invalid Old Password"
					});
				}
			});
		} else{
			res.status("401");
			res.json({
				message: "Invalid Session ID"
			});
		}
	});
});

app.post("/requestusername", function (req, res) {	//unneeded and a security flaw - it was used to test something - hanging on to it just in case
	var email = req.body.email;
	
	schemas.Admin.findOne({"email": email}, function(err, user) {//get the account with the email
		if(user){
			//setup email
			var mailOptions = {
				from: 'surveilsystem@gmail.com',
				to: email,
				subject: 'Username',
				text: 'Hello '+user.firstname+'. Your username is - '+user.username
			};
			//send email
			transporter.sendMail(mailOptions, function(error, info){
				if (error) {
					console.log(error);
				} else {
					console.log('Email sent: ' + info.response);
				}
				res.status("200");
				res.json({
					message: "All good"
				});
			});
		}
	});
});

app.post("/requestnewpass", function (req, res) {	//unneeded and a security flaw - it was used to test something - hanging on to it just in case
	var email = req.body.email;
	var username = req.body.username;
	
	schemas.Admin.findOne({"email": email}, function(err, user) {//get the account with the email
		if(user){
			if(user.username === username){
				var sessID = createHash(user._id, 'NewPass');
				var NewPassSession = new schemas.NewPassSession({//create new session
					sessionID: sessID,
					userID: user._id
				});
				NewPassSession.save().then((test) => {
					var url = "surv-system.herokuapp.com/forgotpass.html?id="+sessID;
					//setup email
					var mailOptions = {
						from: 'surveilsystem@gmail.com',
						to: email,
						subject: 'New Password',
						text: 'Hello '+user.firstname+'. Click on this link to create a new password '+url
					};
					//send email
					transporter.sendMail(mailOptions, function(error, info){
						if (error) {
							console.log(error);
						} else {
							console.log('Email sent: ' + info.response);
						}
					});

					res.status("200");
					res.json({
						message: "Request Done"
					});
				});
			} else{
				res.status("401");
				res.json({
					message: "Invalid credentials"
				});
			}
		} else{
			res.status("401");
			res.json({
				message: "Invalid credentials"
			});
		}
	});
});

//298650ddd18ad3dccdbfccbd1778028b9cc6d5b0a5a4039dcf876737c0d69d7c
app.post("/checknewpassid", function(req, res){
	schemas.NewPassSession.findOne({"sessionID": req.body.sessionID}, function(err, sess) {
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

app.post('/fpnewpass', function(req, res){
	var sessionID = req.body.sessionID
	var newPass = req.body.newPass;

	schemas.NewPassSession.findOne({"sessionID": sessionID}, function(err, sess) {//get session
		if (sess){// session found
			schemas.Admin.findOne({"_id": sess.userID}, function(err, user) {//get user
				schemas.NewPassSession.deleteOne({"sessionID": req.body.sessionID}, function(err, sess) {
					if (err){
						res.status("500");
						throw err;
					}
				});
				
				var newUser = user;
				var newSalt = createSalt();
				var newHash = createHash(newPass, newSalt);

				newUser.salt = newSalt;
				newUser.password = newHash;
				newUser.save().then((test) => {
					res.status("200");
					res.json({
						message: "Changed Successfully"
					});
				});
			});
		} else{
			res.status("401");
			res.json({
				message: "Invalid Session ID"
			});
		}
	});
});

app.post("/deleteimagerecord", function(req, res){
	schemas.Image.deleteOne({"_id": req.body.ID}, function(err, img) {
		if (err){
			res.status("500");
			throw err;
		}
		res.status("200");
		res.json({
			message: "Deleted successfully"
		});
	});
});


var WebSocketServer = require('websocket').server;
var http = require('http');
var server = http.createServer(function(request, response) {
    console.log((new Date()) + ' Received request for ' + request.url);
    response.writeHead(404);
    response.end();
});
server.listen(9000, function() {
    console.log((new Date()) + 'Server is listening on port 9000');
});
wsServer = new WebSocketServer({
    httpServer: server,
    // You should not use autoAcceptConnections for production
    // applications, as it defeats all standard cross-origin protection
    // facilities built into the protocol and the browser.  You should
    // *always* verify the connection's origin and decide whether or not
    // to accept it.
    autoAcceptConnections: false
});
function originIsAllowed(origin) {
  // put logic here to detect whether the specified origin is allowed.
  return true;
}
wsServer.on('request', function(request) {
    if (!originIsAllowed(request.origin)) {
      // Make sure we only accept requests from an allowed origin
      request.reject();
      console.log((new Date()) + ' Connection from origin ' + request.origin + ' rejected.');
      return;
    }
    
    var connection = request.accept(null, request.origin);
    console.log((new Date()) + ' Connection accepted.');
	const changeStream = schemas.Image.watch();
	changeStream.on('change', next => {
		console.log("New change in image collection")
		connection.sendUTF("change");
	});
    connection.on('close', function(reasonCode, description) {
        console.log((new Date()) + ' Peer ' + connection.remoteAddress + ' disconnected.');
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