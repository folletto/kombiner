
var assert = require('assert');
var k = require('../index').listen(null);

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
});