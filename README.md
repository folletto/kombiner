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

> _No sensible decision can be made any longer without taking into account   
  not only the world as it is, but the world as it will be_  
  – Isaac Asimov
