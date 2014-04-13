
var assert = require('assert');
var k = require('../index').listen(null);

describe('Kombiner', function() {
  describe('#combine', function() {
    var out = k.combine([
      './test/raw-file-a.txt',
      './test/raw-file-b.txt'
    ]);
    
    it('should concatenate in order A-B', function() {
      assert.equal(out, 'A\nA\nA\nAB\nB\nB\nB', 'Concatenation failed.');
    });
  });
});