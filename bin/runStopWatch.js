var Client = require('./appiumClient.js');
var Server = require('./appiumServer.js');

var client = new Client();
var server = new Server(4723);

server.run();
client.run();
