var chai = require('../node_modules/chai');
var chaiHttp = require('../node_modules/chai-http');
var server = require('../express-server.js');
var createHash = require('../express-server.js').createHash;
var createSalt = require('../express-server.js').createSalt;

chai.use(chaiHttp);

describe('Hashing', function() {
    it('should generate hashes correctly', function(done) {
      this.timeout(20000);
      setTimeout(done, 20000);
      var password = "password123";
      var salt = createSalt();
      var hash = createHash(password, salt);
      var password2 = "password123";
      var salt2 = salt
      var hash2 = createHash(password2, salt2);
  
      hash.should.equal(hash2);
      done();
    });
});

describe('User', function() {
    var adminSessID = 0;
    var itemID = 0;
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