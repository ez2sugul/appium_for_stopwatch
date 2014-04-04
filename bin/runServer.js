var path = require('path');
var server = require(path.join(__dirname, '../src/', 'appiumServer'));

var server = new server(4723);
server.run();


