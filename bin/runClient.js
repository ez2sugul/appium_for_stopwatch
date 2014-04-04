var path = require('path');
var client = require(path.join(__dirname, '../src/', 'appiumClient'));
var client = new client(4723);

client.run();
