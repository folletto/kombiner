Kombiner
========

**Node.js library to combine multiple JS/CSS files to a single endpoint, serving a single file.**


USAGE
-----

```
var k = require('kombiner').listen(server);
k.serve('allinone.js', [
  'mylibrary.js', 
  'otherstuff.js'
]);
```

This call combines the two js files into a single endpoint that can be called from the client 
at `/allinone.js`.


BENEFITS
--------

* Combine multiple JS or CSS files in one, thus having a single HTTP request.
* Caches the result in memory to be fast. The combination is done only once.
* Watches the files and updates the combined output if they change.
* Supports ETag for client-side caching.



LICENSE
-------

  _Copyright (C) 2013-2014, Davide Casali_  
  _Licensed under **MIT License**_


> _Alone we can do so little;   
  together we can do so much._  
  – Helen Keller
