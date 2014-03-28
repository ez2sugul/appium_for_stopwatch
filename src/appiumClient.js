var wd = require("wd");
var fs = require("fs");
var path = require('path');
var util = require("stopwatch_util");
var asserters = wd.asserters;

function AppiumClient() {
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
	this.driver;
	this.timer;
	this.timeout = 0;
	this.senarioIndex = 0;
	this.autIndex = 0;
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

	return true;
};

AppiumClient.prototype.run2 = function() {
	var client = this;
	var index = 0;
	var isDone = true;
	client.driver = wd.promiseChainRemote("localhost", this.clientConf["port"]);
	
	client.driver.on("status", function(info) {
			//console.log("status " + info);
			});
	
	client.driver.on("command", function(meth, path, data) {
			//console.log("on command " + meth + " " + path + " " + data);
			});
	
	console.log("start");
	(function loopMain(index) {
		// loop for senario 
		
	 	if (index >= appiumClient.autConf.length) {
			console.log("main loop done");
			client.driver.quit();
			return;
		}

		console.log(appiumClient.autConf[index]["aut"]["desired"]);

	 	client.driver.init(appiumClient.autConf[index]["aut"]["desired"]).then(function () {
				//var assert = asserter.isVisible;
				var timeout = 1000 * 1;
				var pollFreq = 10;
				var senario = appiumClient.autConf[index]["aut"]["senario"];
				var i = 0;

				(function loopSenario(i) {
				 	if (i >= senario.length) {
						console.log("all senario done");
						client.driver.quit();
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
					client.driver.waitForElementByName(value, asserters.isDisplayed, timeout, pollFreq, function (err, element) {
						if (err) {
							console.log(err);
						} else {
							element.click();
						}
						loopSenario(++i);
						})
					break;
					case "xpath":
					client.driver.waitForElementByXPath(value, asserters.isDisplayed, timeout, pollFreq, function (err, element) {
						if (err) {
							console.log(err);
						} else {
							element.click();
						}
						loopSenario(++i);
						})
					break;
					case "tag" :
					client.driver.waitForElementByTagName(value, asserters.isDisplayed, timeout, pollFreq, function (err, element) {
						if (err) {
							console.log(err);
						} else {
							element.click();
						}
						loopSenario(++i);
						});
					break;
					case "id":
					client.driver.waitForElementById(value, asserters.isDisplayed, timeout, pollFreq, function (err, element) {
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

AppiumClient.prototype.run = function () {
	var client = this;

	client.runSenario(client.autIndex, function (err) {
			console.log(err);
			client.autIndex += 1;

			if (client.autIndex >= client.autConf.length) {
				client.autIndex = 0;
			}

			// loop for another application to test
			setTimeout(function () {
				client.run();
				}, 5000);
			});
}

AppiumClient.prototype.runSenario = function (index, callback) {
	var client = this;

	if (!this.autConf.hasOwnProperty(index)) {
		callback({"error":"1","message":["aut"]});
	}
	if (!this.validateMember(this.autConf[index], ["aut"])) {
		callback({"error":"1","message":["aut"]});
	}
	if (!this.validateMember(this.autConf[index].aut, ["desired", "senario"])) {
		callback({"error":"1","message":["desired", "senario"]});
	}

	var senario = this.autConf[index].aut.senario;

	if (!this.validateMember(senario, ["begin"])) {
		callback({"error":"1","message":["begin"]});
	}

	if (!senario.begin instanceof Array) {
		callback({"error":"1", "message":"not array"});
	}

	client.driver = wd.promiseChainRemote("localhost", this.clientConf["port"]);
	
	client.driver.on("status", function(info) {
			//console.log("status " + info);
			});
	
	client.driver.on("command", function(meth, path, data) {
			console.log("on command " + meth + " " + path);
			});

	console.log(client.autConf[index]["aut"]["desired"]);

	client.driver.init(client.autConf[index]["aut"]["desired"]).then(function () {
			function callbackForReturn(err) {
				clearInterval(client.timer);
				callback({"error":"0","message":"success"});
			}
			
			client.senarioIndex = 0;
			clearInterval(client.timer);
			
			client.timer = setInterval(function () {
				client.timeout += 1000;
				}, 1000);

			// a loop using recursive call
			// when loop is done, callback will be called.
			client.senarioLoop(senario, "begin", callbackForReturn);
			});
}

AppiumClient.prototype.validateMember = function (oJson, fields) {
	for (var i = 0; i < fields.length; i++) {
		if (!oJson.hasOwnProperty(fields[i])) {
			return false;
		}
	}

	return true;
}

AppiumClient.prototype.waitByTimeout = function (callback) {
}

AppiumClient.prototype.performUserEvent = function (element, userEvent) {
	if (userEvent.key) {
		var key = userEvent.key;
		element.sendKeys(key);
	} else if (userEvent.click) {
		element.click();
	} else {
	}
}



AppiumClient.prototype.senarioLoop = function (senario, begin, callback) {
	var client = this;
	var i = 0;
	var timeout = 1000 * 10;
	var pollFreq = 10;
	var action = senario[begin];

	console.time("senarioLoop");

	function returnFunction(result) {
		client.driver.quit();
		console.timeEnd("senarioLoop");
		callback(result);
		return;
	}

	if (action == undefined) {
		returnFunction({"error":"1", "message":"action required"});
		return;
	}

	if (begin == undefined || begin == "" || begin == "end") {
		returnFunction({"error":"0", "message":"success"});
		return;
	}
	
	if (client.senarioIndex >= action.length) {
		// set next index to 0
		console.log("set to 0");
		client.senarioIndex = 0;

		if (client.timeout >= (1000 * 60)) {
			returnFunction({"error":"1", "message":"end of loop till timeout"});
			return;
		}
	}

	if (!this.validateMember(action[client.senarioIndex], ["method", "value", "next", "view", "event"])) {
		returnFunction({"error":"1","message":"invalid member"});
		return;
	}

	var method = action[client.senarioIndex].method;
	var value = action[client.senarioIndex].value;
	var next = action[client.senarioIndex].next;
	var view = action[client.senarioIndex].view.toLowercase;

	if (view == "webview") {
		view = "WEBVIEW";
	} else if (view == "native") {
		view = "NATIVE_APP";
	} else {
		view = "NATIVE_APP";
	}

	console.log("client.senarioIndex " + client.senarioIndex);
	console.log(action[client.senarioIndex]);
	
	client.senarioIndex += 1;


	function clickElem(err, element) {
		if (err) {
			console.log(err);
			client.senarioLoop(senario, begin, callback);
		} else {
			console.log("kicked");
			client.timeout = 0;
			console.log("click " + new Date());
			client.senarioIndex = 0;
			client.performUserEvent(element, action[client.senarioIndex]["event"]);
			//element.click();
			console.log("call senarioLoop method with " + next);
			client.senarioLoop(senario, next, callback);
		}
		return;
	}

	switch (method) {
		case  "name":
			client.driver.window(view, function (err) {
				client.driver.elementByName(value, clickElem);
					});
			break;
		case "xpath":
			client.driver.window(view, function (err) {
				client.driver.elementByXPath(value, asserters.isDisplayed, timeout, pollFreq, clickElem);
					});
			break;
		case "tag" :
			client.driver.window(view, function (err) {
				client.driver.elementByTagName(value, asserters.isDisplayed, timeout, pollFreq, clickElem);
					});
			break;
		case "id":
			client.driver.window(view, function (err) {
				client.driver.elementById(value, clickElem);
					});
			break;
		default:
			returnFunction({"error":"1", "message":"invalid method for finding"});
			return;
	}
}

module.exports = AppiumClient;
