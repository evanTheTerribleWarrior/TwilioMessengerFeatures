'use strict';

var http = require('http');
var app = require('./config/express')(); // Notice the additional () here
http.createServer(app).listen(app.get('port'), function() {
    console.log("Express Server Runing on port "+ app.get('port'));
});
