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
			console.log("[SERVER] " + new Date() + data);
			});

	this.child.stderr.on('data', function (data) {
			var message = data.toString();
			console.log('[SERVER] ' + new Date() + data);

			if (message.indexOf("desiredCapabilities") >= 0) {
				console.log(message);
				appium.parseAutConfig(message);
			} else if (message.indexOf("am ") >= 0) {
				console.log(message);
				if (appium.autConfig['device'] == "selendroid") {
					if (message.indexOf("am instrument -e main_activity") >= 0) {
						var startTime = new Date();
						appium.setAutStartTime(startTime);
						console.log(startTime.toString() + " " + startTime.getMilliseconds());
					}
				} else {
					if (message.indexOf("am start -S") >= 0) {
						var startTime = new Date();
						appium.setAutStartTime(startTime);
						console.log(startTime.toString() + " " + startTime.getMilliseconds());
					}
				}
			}
		
			});
}

AppiumServer.prototype.parseAutConfig = function (data) {
	//{"desiredCapabilities":{"device":"selendroid","version":"4.3","app":"/Users/skplanet/Documents/Projects/Nodejs/appium_test_01/com.skmnc.gifticon-1.apk","app-package":"com.skmnc.gifticon","app-activity":".activity.MainActivity","browserName":"firefox","javascriptEnabled":true,"platform":"ANY"}}
	//{"desiredCapabilities":{"device":"Android","version":"4.3","app-package":"kr.co.ulike.tesports","app-activity":".IntroActivity","browserName":"firefox","javascriptEnabled":true,"platform":"ANY"}}
	var pattern = /({.*})/i;
	var matchArr = data.match(pattern);
	var sJson = matchArr[matchArr.length - 1];
	console.log("JSON " + sJson);
	var oJson = JSON.parse(sJson);
	this.autConfig = oJson['desiredCapabilities'];
	console.log(this.autConfig['device']);
}

AppiumServer.prototype.setAutStartTime = function (time) {
	//executing: "/Users/skplanet/adt-bundle-mac-x86_64-20131030/sdk/platform-tools/adb" -s 42f0d51eb3b44fd7 shell "am instrument -e main_activity 'com.skmnc.gifticon.activity.MainActivity' com.skmnc.gifticon.selendroid/io.selendroid.ServerInstrumentation"
	this.autStartTime = time;
}

module.exports = AppiumServer
