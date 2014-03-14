var spawn = require('child_process').spawn;

function AppiumServer(port) {
		this.port = port;
		this.autConfig = {};
};

AppiumServer.prototype.run = function () {
	var appium = this;
	this.child = spawn('appium', [], {
			//detached : true,
			});

	this.child.on('close', function (code, signal) {
			console.log('child closed' + signal);
			});

	this.child.stdout.on('data', function (data) {
			console.log("stdout " + data);
			});

	this.child.stderr.on('data', function (data) {
			var message = data.toString();
			console.log('stderr ' + data);
			if (message.indexOf("Request received with params") >= 0) {
				appium.parseAutConfig(message);
			} else if (message.indexOf("am instrument -e main_activity") >= 0) {
				appium.setAutStartTime();
			}
			});
}

AppiumServer.prototype.parseAutConfig = function (data) {
	//{"desiredCapabilities":{"device":"selendroid","version":"4.3","app":"/Users/skplanet/Documents/Projects/Nodejs/appium_test_01/com.skmnc.gifticon-1.apk","app-package":"com.skmnc.gifticon","app-activity":".activity.MainActivity","browserName":"firefox","javascriptEnabled":true,"platform":"ANY"}}
	var pattern = /({.*})/i;
	var matchArr = data.match(pattern);
	var sJson = matchArr[matchArr.length - 1]
	var oJson = JSON.parse(sJson);
	this.autConfig = oJson['desiredCapabilities'];
}

AppiumServer.prototype.setAutStartTime = function () {
	//executing: "/Users/skplanet/adt-bundle-mac-x86_64-20131030/sdk/platform-tools/adb" -s 42f0d51eb3b44fd7 shell "am instrument -e main_activity 'com.skmnc.gifticon.activity.MainActivity' com.skmnc.gifticon.selendroid/io.selendroid.ServerInstrumentation"
	this.autStartTime = new Date();
}

module.exports = AppiumServer
