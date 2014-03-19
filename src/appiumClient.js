var wd = require("wd");
var fs = require("fs");
var path = require('path');
var util = require("stopwatch_util");
var asserters = wd.asserters;

function AppiumClient(port) {
	/*
	this.desired = {
		device:"Android",
		version : "4.3",
		"app-package" : "kr.co.ulike.tesports",
		"app-activity" : ".IntroActivity"
	};
	*/
	
	this.clientConf;
	this.autConf;
	this.readConfiguration();

};

AppiumClient.prototype.readConfiguration = function () {
	var confFileName = path.join(__dirname, "../conf", "conf.json");
	var autFileName = path.join(__dirname, "../conf", "aut.json");
	var clientConf = fs.readFileSync(confFileName, 'utf8');
	var autConf = fs.readFileSync(autFileName, 'utf8');
	var clientConfJson = JSON.parse(clientConf);
	var autConfJson = JSON.parse(autConf);

	this.clientConf = clientConfJson;
	this.autConf = autConfJson;
};

AppiumClient.prototype.run = function() {
	var appiumClient = this;
	var index = 0;
	var isDone = true;
	browser = wd.promiseChainRemote("localhost", this.clientConf["port"]);
	
	browser.on("status", function(info) {
			//console.log("status " + info);
			});
	
	browser.on("command", function(meth, path, data) {
			//console.log("on command " + meth + " " + path + " " + data);
			});
	
	console.log("start");
	(function loopMain(index) {
		// loop for senario 
		
	 	if (index >= appiumClient.autConf.length) {
			console.log("main loop done");
			browser.quit();
			return;
		}

		console.log(appiumClient.autConf[index]["aut"]["desired"]);

	 	browser.init(appiumClient.autConf[index]["aut"]["desired"]).then(function () {
				//var assert = asserter.isVisible;
				var timeout = 1000 * 1;
				var pollFreq = 10;
				var senario = appiumClient.autConf[index]["aut"]["senario"];
				var i = 0;

				(function loopSenario(i) {
				 	if (i >= senario.length) {
						console.log("all senario done");
						browser.quit();
						console.log("after a few seconds next itertation will start");
						setTimeout(function (arg) {
							loopMain(arg);
							}, 1000 * 5, ++index);
						
						return;
					}
				 	console.log(i + " " + senario[i]["action"]);
					var method = senario[i]["method"];
					var value = senario[i]["value"];
					console.log(method + " " + value);
					switch (method) {
					case  "name":
					browser.waitForElementByName(value, asserters.isDisplayed, timeout, pollFreq, function (err, element) {
						if (err) {
							console.log(err);
						} else {
							element.click();
						}
						loopSenario(++i);
						})
					break;
					case "xpath":
					browser.waitForElementByXPath(value, asserters.isDisplayed, timeout, pollFreq, function (err, element) {
						if (err) {
							console.log(err);
						} else {
							element.click();
						}
						loopSenario(++i);
						})
					break;
					case "tag" :
					browser.waitForElementByTagName(value, asserters.isDisplayed, timeout, pollFreq, function (err, element) {
						if (err) {
							console.log(err);
						} else {
							element.click();
						}
						loopSenario(++i);
						});
					break;
					case "id":
					browser.waitForElementById(value, asserters.isDisplayed, timeout, pollFreq, function (err, element) {
						if (err) {
							console.log("ERROR " + err);
						} else {
							element.click();
						}
						loopSenario(++i);
						});
					break;
					default:

					}
				 }(i));
			
		});

	 }(index));

}

AppiumClient.prototype.loopSenario = function (browser, index, callback, arg) {
}

module.exports = AppiumClient;
