var chai = require('../node_modules/chai');
var chaiHttp = require('../node_modules/chai-http');
var server = require('../express-server.js');
var createHash = require('../express-server.js').createHash;
var createSalt = require('../express-server.js').createSalt;

chai.use(chaiHttp);

// const { assert } = require('chai');
// const { expect } = require('chai');
var should = chai.should();//vs code says it isnt used, but it is

describe('Hashing', function() {
    it('should generate hashes correctly', function(done) {
      this.timeout(20000);
      setTimeout(done, 20000);//my parents internet on my laptop does this test at around 5000-9000ms
      var password = "password123";
      var salt = createSalt();
      var hash = createHash(password, salt);
      var password2 = "password123";
      var salt2 = salt
      var hash2 = createHash(password2, salt2);
      
      hash.should.equal(hash2);//assert.equal(hash, hash2);
      done();
    });
});

describe('User', function() {
    var adminSessID = 0;

    it('should confirm login details of SINGLE User and return a session ID on /adminlogin POST', function(done) {
      this.timeout(20000);
      setTimeout(done, 20000);
      chai.request(server)
        .post('/adminlogin')
        .send({username: "jstungay",
              password: "password"})
        .end(function(err, res){
          res.should.have.status(200);
          res.should.be.json;
          res.body.message.should.have.length(64);
          adminSessID = res.body.message;
          done();
        });
    });
    it('should confirm session ID of SINGLE User and return a session ID on /adminlogin POST', function(done) {
      this.timeout(20000);
      setTimeout(done, 20000);
      chai.request(server)
        .post('/getadmindetails')
        .send({sessionID: adminSessID})
        .end(function(err, res){
          res.should.have.status(200);
          res.should.be.json;
          res.body.should.have.property("firstname");
          res.body.should.have.property("lastname");
          res.body.should.have.property("username");
          res.body.password.should.have.length(0);//a way of saying is empty, theres other ways of doing this
          res.body.salt.should.have.length(0);
          done();
        });
    });
    it('should confirm a password change of a SINGLE User on /resetpassword POST', function(done) {
      this.timeout(20000);
      setTimeout(done, 20000);
      chai.request(server)
        .post('/resetpassword')
        .send({sessionID: adminSessID,
              oldPass: "password",
              newPass: "password"})
        .end(function(err, res){
          res.should.have.status(200);
          res.should.be.json;
          done();
        });
    });
    it('should confirm a logout of SINGLE User on /logout POST', function(done) {
      this.timeout(20000);
      setTimeout(done, 20000);
      chai.request(server)
        .post('/logout')
        .send({sessionID: adminSessID})
        .end(function(err, res){
          res.should.have.status(200);
          res.should.be.json;
          done();
        });
    });
    // it('should confirm an ACCOUNT CREATION of SINGLE User on /signup POST', function(done) {
    //   this.timeout(20000);
    //   setTimeout(done, 20000);
    //   chai.request(server)
    //     .post('/signup')
    //     .send({email: "jason.tungay@students.plymouth.ac.uk",
    //       firstname: "Jason",
    //       lastname: "Tungay",
    //       username: "jst99",
    //       password: "String"})
    //     .end(function(err, res){
    //       res.should.have.status(200);
    //       res.should.be.json;
    //       done();
    //     });
    // });
});

// describe('Image', function() {
//   //var haloInfiniteID;
//   it('should list ALL images on /getmostrecent GET', function(done) {
//     this.timeout(20000);
//     setTimeout(done, 20000);
//     chai.request(server)
//       .get('/getmostrecent')
//       .end(function(err, res){
//         res.should.have.status(200);
//         res.should.be.json;
//         res.body.should.be.a('array');//dont have the should.have.property incase there are no records in the collection
//         //haloInfiniteID = res.body[0]._id;
//         done();
//       });
//   });
//   it('should list ALL images on /getImages/:date GET', function(done) {
//     this.timeout(20000);
//     setTimeout(done, 20000);
//     chai.request(server)
//       .get('/getImages/2020-02-22')
//       .end(function(err, res){
//         res.should.have.status(200);
//         res.should.be.json;
//         res.body.should.be.a('array');
//         done();
//       });
//   });
//   // it('should DELETE SINGLE image on /deleteimagerecord POST', function(done) {//commented out in case halo infinite or any image records are in the collection
//   //   this.timeout(20000);
//   //   setTimeout(done, 20000);
//   //   chai.request(server)
//   //     .post('/deleteimagerecord')
//   //     .send({ID: haloInfiniteID})
//   //     .end(function(err, res){
//   //       res.should.have.status(200);
//   //       res.should.be.json;
//   //       done();
//   //     });
//   // });
// });

// describe('Videos', function() {
//   it('should list ALL videos on /getmostrecentvideos GET', function(done) {
//     this.timeout(20000);
//     setTimeout(done, 20000);
//     chai.request(server)
//       .get('/getmostrecentvideos')
//       .end(function(err, res){
//         res.should.have.status(200);
//         res.should.be.json;
//         res.body.should.be.a('array');
//         done();
//       });
//   });
//   it('should list ALL videos on /getvideos/:date GET', function(done) {
//     this.timeout(20000);
//     setTimeout(done, 20000);
//     chai.request(server)
//       .get('/getvideos/2020-02-22')
//       .end(function(err, res){
//         res.should.have.status(200);
//         res.should.be.json;
//         res.body.should.be.a('array');
//         done();
//       });
//   });
//   // it('should DELETE SINGLE video on /deletevideorecord POST', function(done) {
//   //   this.timeout(20000);
//   //   setTimeout(done, 20000);
//   //   chai.request(server)
//   //     .post('/deletevideorecord')
//   //     .send({ID: haloInfiniteID})
//   //     .end(function(err, res){
//   //       res.should.have.status(200);
//   //       res.should.be.json;
//   //       done();
//   //     });
//   // });
// });