/*
 * Kombiner
 * Combines multiple files in one single output.
 *
 * Copyright (c) 2013-2014, Davide 'Folletto' Casali <folletto AT gmail DOT com>
 * All rights reserved.
 *
 * Redistribution and use in source and binary forms, with or without modification, are
 * permitted provided that the following conditions are met:
 *
 * Redistributions of source code must retain the above copyright notice, this list of
 * conditions and the following disclaimer.
 * Redistributions in binary form must reproduce the above copyright notice, this list of
 * conditions and the following disclaimer in the documentation and/or other materials
 * provided with the distribution.
 * Neither the name of the Baker Framework nor the names of its contributors may be used to
 * endorse or promote products derived from this software without specific prior written
 * permission.
 * THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS" AND ANY
 * EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED WARRANTIES
 * OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE DISCLAIMED. IN NO EVENT
 * SHALL THE COPYRIGHT HOLDER OR CONTRIBUTORS BE LIABLE FOR ANY DIRECT, INDIRECT,
 * INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT LIMITED TO,
 * PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES; LOSS OF USE, DATA, OR PROFITS; OR BUSINESS
 * INTERRUPTION) HOWEVER CAUSED AND ON ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT
 * LIABILITY, OR TORT (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE
 * OF THIS SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
 *
 ******************************************************************************************
 *
 * This library combines multiple text files (i.e. CSS, JS) into one to serve them in a
 * single HTTP request. Does in-memory caching and watches the file for changes.
 * 
 * USAGE:
 *
 *   var k = require('kombiner').listen(server);
 *   k.serve('allinone.js', ['mylibrary.js', 'otherstuff.js']);
 *
 * The library will aggregate the files in that order, and serve them at that URL.
 *
 * You can also attach filters that will pre-process the files before combining.
 * Add them to the filters dictionary as functions before calling any serve().
 *
 *   k.filters.minify = function(original) { ...; return processed; };
 *
 */

var fs = require('fs');


// ****** Prepare the listen server
var KombinerExport = module.exports = {
  listen: function(httpServer) {
    /*
     * Initialize and return the library.
     */
    Kombiner.server = httpServer;
    return Kombiner;
  }
}


// ****** The library
var Kombiner = { // Use as a static library.
  
  server: null,
  endpoints: {},
  filters: {}, // no default filters, attach them here if needed
  
  serve: function(endpoint, filesArray) {
    /* 
     * Main function. Creates the endpoints.
     */
    
    // Store the endpoint
    this.endpoints[endpoint] = {
      files: filesArray,
      cache: '',
      timestamp: ''
    };
    
    // Do an initial combine
    this.endpoints[endpoint].cache = this.combine(this.endpoints[endpoint].files);
    this.endpoints[endpoint].timestamp = Date.now();
    
    // Watch for changes
    this.watchAll(this.endpoints[endpoint].files, this.onWatchChange.bind(this));
    
    // Listen for requests
    this.listen(this.server, endpoint);
  },
  
  /************************************************************************ Support */
  combine: function(filesArray) {
    /*
     * Combines all the files into one string output.
     */
    var out = '';
    
    for (var i in filesArray) {
      // Read
      var pre = fs.readFileSync(filesArray[i], 'utf8');
      
      // Process filters, if any
      for (var filter in Kombiner.filters) {
        pre = Kombiner.filters[filter](pre);
      }
      
      // Concatenate
      out += pre;
    }
    
    return out;
  },
  
  /************************************************************************ Server */
  listen: function(srv, endpoint) {
    /*
     * Creates the serve listener.
     * Inspired by Socket.io.
     */
    
    var url = '/' + endpoint;
    var evs = srv.listeners('request').slice(0);
    var self = this;
    
    srv.removeAllListeners('request');
    
    srv.on('request', function(req, res) {
      if (0 == req.url.indexOf(url)) {
        // ****** URL found.
        self.serveEndpoint(req, res, endpoint);
      } else {
        // ****** Not the right URL. Go on with the rest.
        for (var i = 0; i < evs.length; i++) {
          evs[i].call(srv, req, res);
        }
      }
    });
  },
  serveEndpoint: function(req, res, endpoint) {
    /*
     * Output function.
     * Inspired by Socket.io.
     */
    
    // Support caching using internal cache generation timestamp
    if (req.headers.etag) {
      if (this.endpoints[endpoint].timestamp == req.headers.etag) {
        res.writeHead(304);
        res.end();
        return;
      }
    }
    
    // Headers
    var ext = endpoint.split(".").pop();
    if (ext == 'js') {
      res.setHeader('Content-Type', 'application/javascript');
    } else if (ext == 'css') {
      res.setHeader('Content-Type', 'text/css');
    }
    res.setHeader('ETag', this.endpoints[endpoint].timestamp);
    res.writeHead(200);
    
    // Output
    res.end(this.endpoints[endpoint].cache);
  },
  
  /************************************************************************ Watch */
  watchAll: function(filesArray, fx) {
    /*
     * Watches a set of files.
     */
    for (var i in filesArray) {
      this.watch(filesArray[i], fx);
    }
  },
  watch: function(file, fx) {
    /*
     * Waches a single file for changes.
     */
    fs.watch(file, function(event) {
      if (event == 'change') {
        fx(file);
      }
    });
  },
  onWatchChange: function(file) {
    /*
     * Event: triggered on watch change.
     */
    
    for (var endpoint in this.endpoints) {
      for (var i in this.endpoints[endpoint].files) {
        //console.log('Checking: ' + file + ' == ' + this.endpoints[endpoint].files[i]);
        
        if (this.endpoints[endpoint].files[i] == file) {
          // Match. Combine a new one.
          console.log('>>> Refreshing endpoint "' + endpoint + '" [' + file + ']');
          
          // Combine
          this.endpoints[endpoint].cache = this.combine(this.endpoints[endpoint].files);
          this.endpoints[endpoint].timestamp = Date.now();
        }
      }
    }
  }
}
