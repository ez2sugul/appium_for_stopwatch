var wd = require('wd');
var fs = require('fs');
var path = require('path');
var util = require(path.join(__dirname, '../src', 'util.js'));
var asserters = wd.asserters;
var Watcher = require(path.join(__dirname, '../src', 'watcher.js'));

function AppiumClient() {
	/*
	this.desired = {
		device:'Android',
		version : '4.3',
		'app-package' : 'kr.co.ulike.tesports',
		'app-activity' : '.IntroActivity'
	};
	*/
	
	this.clientConf;
	this.autConf;
	this.readConfiguration();
	this.driver;
	this.timer;
	this.timeout = 0;
	this.scenarioIndex = 0;
	this.autIndex = 0;
	this.watcher = new Watcher();
	this.autLogFile = path.join(__dirname, '../var', this.clientConf.port);
	this.watcher.watchFile(this.autLogFile);
};

AppiumClient.prototype.readConfiguration = function () {
	var confFileName = path.join(__dirname, '../conf', 'server.json');
	var autFileName = path.join(__dirname, '../conf', 'aut.json');
	var clientConf = fs.readFileSync(confFileName, 'utf8');
	var autConf = fs.readFileSync(autFileName, 'utf8');
	var clientConfJson = JSON.parse(clientConf);
	var autConfJson = JSON.parse(autConf);

	this.clientConf = clientConfJson;
	this.autConf = autConfJson;

	return true;
};

AppiumClient.prototype.run = function () {
	var _this = this;

	_this.runSenario(_this.autIndex, function (err) {
			//console.log(err);
			_this.autIndex += 1;

			if (_this.autIndex >= _this.autConf.length) {
				_this.autIndex = 0;
			}

			// loop for another application to test
			setTimeout(function () {
				_this.run();
				}, 1000 * 10);
			});
}

AppiumClient.prototype.runSenario = function (index, callback) {
	var _this = this;

	if (!this.autConf.hasOwnProperty(index)) {
		callback({'error':'1','message':['aut']});
		return;
	}
	if (!this.validateMember(this.autConf[index], ['aut'])) {
		callback({'error':'1','message':['aut']});
		return;
	}
	if (!this.validateMember(this.autConf[index].aut, ['desired', 'scenario'])) {
		callback({'error':'1','message':['desired', 'scenario']});
		return;
	}

	var scenario = this.autConf[index].aut.scenario;

	if (!this.validateMember(scenario, ['begin'])) {
		callback({'error':'1','message':['begin']});
		return;
	}

	if (!scenario.begin instanceof Array) {
		callback({'error':'1', 'message':'not array'});
		return;
	}

	_this.driver = wd.promiseChainRemote('localhost', this.clientConf['port']);
	
	_this.driver.on('status', function(info) {
			//console.log('status ' + info);
			});
	
	_this.driver.on('command', function(meth, path, data) {
			//console.log('on command ' + meth + ' ' + path);
			});

	//console.log(_this.autConf[index]['aut']['desired']);

	_this.driver.init(_this.autConf[index]['aut']['desired']).then(function () {
			
			function callbackForReturn(result) {
				//console.timeEnd('scenarioLoop');
				clearInterval(_this.timer);
				callback(result);
				return;
			}
			
			_this.scenarioIndex = 0;
			clearInterval(_this.timer);
			
			_this.timer = setInterval(function () {
				_this.timeout += 1000;
				}, 1000);

			// a loop using recursive call
			// at first the loop start with begin
			//console.time('scenarioLoop');
			_this.scenarioLoop(scenario, 'begin', callbackForReturn);
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
		// if userEvent is undefined, do nothing
	}
}



AppiumClient.prototype.scenarioLoop = function (scenario, begin, callback) {
	var _this = this;
	var i = 0;
	var timeout = 100;
	var pollFreq = 100;
	var action = scenario[begin];

	function returnFunction(result) {
		_this.driver.quit();
		_this.watcher.print();
		_this.watcher.clearResult();
		callback(result);
		return;
	}

	if (begin == undefined || begin == '' || begin == 'end') {
		returnFunction({'error':'0', 'message':'success'});
		return;
	}

	if (action == undefined) {
		returnFunction({'error':'1', 'message':'action required for ' + begin});
		return;
	}
	
	
	if (_this.scenarioIndex >= action.length) {
		// set next index to 0
		_this.scenarioIndex = 0;

		if (_this.timeout >= (1000 * 30)) {
			returnFunction({'error':'1', 'message':'end of loop till timeout'});
			return;
		}
	}

	if (!this.validateMember(action[_this.scenarioIndex], ['method', 'value', 'next', 'view', 'event'])) {
		returnFunction({'error':'1','message':'invalid member'});
		return;
	}

	function clickElem(err, element) {
		if (err) {
			setTimeout(function () {
				_this.scenarioLoop(scenario, begin, callback);
					}, 100);
		} else {
			_this.timeout = 0;
			_this.scenarioIndex = 0;
			var finishTime = _this.watcher.finish(value);
			_this.watcher.storeResult({'key':value, 'milliseconds':finishTime.timediff});
			_this.performUserEvent(element, action[_this.scenarioIndex]['event']);
			_this.scenarioLoop(scenario, next, callback);
		}
		return;
	}

	var method = action[_this.scenarioIndex].method;
	var value = action[_this.scenarioIndex].value;
	var next = action[_this.scenarioIndex].next;
	var view = action[_this.scenarioIndex].view.toLowercase;

	if (view == 'webview') {
		view = 'WEBVIEW';
	} else if (view == 'native') {
		view = 'NATIVE_APP';
	} else {
		view = 'NATIVE_APP';
	}

	_this.scenarioIndex += 1;
	var startTime = _this.watcher.start(value);

	switch (method) {
		case  'name':
			_this.driver.window(view, function (err) {
				_this.driver.elementByName(value, asserters.isDisplayed, timeout, pollFreq, clickElem);
					});
			break;
		case 'xpath':
			_this.driver.window(view, function (err) {
				_this.driver.elementByXPath(value, asserters.isDisplayed, timeout, pollFreq, clickElem);
					});
			break;
		case 'tag' :
			_this.driver.window(view, function (err) {
				_this.driver.elementByTagName(value, asserters.isDisplayed, timeout, pollFreq, clickElem);
					});
			break;
		case 'id':
			_this.driver.window(view, function (err) {
				_this.driver.elementById(value, asserters.isDisplayed, timeout, pollFreq,  clickElem);
					});
			break;
		default:
			returnFunction({'error':'1', 'message':'invalid method'});
			return;
	}
}

module.exports = AppiumClient;
