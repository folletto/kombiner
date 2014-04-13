
var assert = require('assert');
var fs = require('fs');

var k = require('../index').listen(null);

var FILE_WATCHED_1 = './test/raw-file-watch-1.txt';
var FILE_WATCHED_2 = './test/raw-file-watch-2.txt';
var FILE_WATCHED_3 = './test/raw-file-watch-3.txt';


describe('Kombiner', function() {
  describe('#combine', function() {
    it('should concatenate in order A-B', function() {
      var out = k.combine([
        './test/raw-file-a.txt',
        './test/raw-file-b.txt'
      ]);
      
      assert.equal(out, 'A\nA\nA\nAB\nB\nB\nB');
    });
    
    it('should concatenate in order B-A', function() {
      var out = k.combine([
        './test/raw-file-b.txt',
        './test/raw-file-a.txt'
      ]);
      
      assert.equal(out, 'B\nB\nB\nBA\nA\nA\nA');
    });
  });
  
  describe('#watch', function() {
    it('should watch one file changing', function(done) {
      this.timeout(6000);
       
      fs.writeFileSync(FILE_WATCHED_1, "Test", 'utf8');
      k.watch(FILE_WATCHED_1, function(file) {
        fs.unlink(FILE_WATCHED_1);
        done();
      });
      fs.writeFileSync(FILE_WATCHED_1, Date.now(), 'utf8');
    });
    
    it('should watch 2 files changing', function(done) {
      this.timeout(6000);
      var counter = 1;
      
      fs.writeFileSync(FILE_WATCHED_2, "Test", 'utf8');
      fs.writeFileSync(FILE_WATCHED_3, "Test", 'utf8');
      k.watchAll([FILE_WATCHED_2, FILE_WATCHED_3], function() {
        counter--;
        if (counter == 0) {
          fs.unlink(FILE_WATCHED_2);
          fs.unlink(FILE_WATCHED_3);
          done();
        }
      })
      fs.writeFileSync(FILE_WATCHED_2, Date.now(), 'utf8');
      fs.writeFileSync(FILE_WATCHED_3, Date.now(), 'utf8');
    });
  });
  
  after(function() {
    if (fs.exists(FILE_WATCHED_1)) fs.unlink(FILE_WATCHED_1);
    if (fs.exists(FILE_WATCHED_2)) fs.unlink(FILE_WATCHED_2);
    if (fs.exists(FILE_WATCHED_3)) fs.unlink(FILE_WATCHED_3);
  });
});