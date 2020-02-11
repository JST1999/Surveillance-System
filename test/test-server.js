var chai = require('../node_modules/chai');
var chaiHttp = require('../node_modules/chai-http');
var server = require('../express-server.js');
var createHash = require('../express-server.js').createHash;
var createSalt = require('../express-server.js').createSalt;

var sessID = "";

chai.use(chaiHttp);

// describe('[THING]', function() {
//   it('should list ALL [INSERT THING HERE] on /listitems GET', function(done) {
//     this.timeout(20000);
//     setTimeout(done, 20000);//my parents internet and my laptop does this test at around 5000-9000ms
//     chai.request(server)
//       .get('/[THING]')
//       .end(function(err, res){
//         res.should.have.status(200);
//         res.should.be.json;
//         res.body.should.be.a('array');
//         res.body[0].should.have.property('_id');
//         done();
//       });
//   });
// });