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
    it('should confirm login details of SINGLE User and return a session ID on /adminlogin POST', function(done) {
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
});

describe('Image', function() {
  it('should list ALL items on /getmostrecent GET', function(done) {
    this.timeout(20000);
    setTimeout(done, 20000);
    chai.request(server)
      .get('/getmostrecent')
      .end(function(err, res){
        res.should.have.status(200);
        res.should.be.json;
        res.body.should.be.a('array');
        res.body[0].should.have.property('_id');
        res.body[0].should.have.property('filename');
        res.body[0].should.have.property('year');
        res.body[0].should.have.property('month');
        res.body[0].should.have.property('day');
        res.body[0].should.have.property('hour');
        done();
      });
  });
  it('should list ALL items on /getImages/:date GET', function(done) {
    this.timeout(20000);
    setTimeout(done, 20000);
    chai.request(server)
      .get('/getImages/2020-02-22')
      .end(function(err, res){
        res.should.have.status(200);
        res.should.be.json;
        res.body.should.be.a('array');
        res.body[0].should.have.property('_id');
        res.body[0].should.have.property('filename');
        res.body[0].should.have.property('year');
        res.body[0].should.have.property('month');
        res.body[0].should.have.property('day');
        res.body[0].should.have.property('hour');
        done();
      });
  });
});