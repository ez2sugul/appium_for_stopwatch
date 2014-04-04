var wd = require('wd');
var fs = require('fs');
var path = require('path');
var util = require('util');
var asserters = wd.asserters;

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
	this.senarioIndex = 0;
	this.autIndex = 0;
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
			console.log(err);
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
	if (!this.validateMember(this.autConf[index].aut, ['desired', 'senario'])) {
		callback({'error':'1','message':['desired', 'senario']});
		return;
	}

	var senario = this.autConf[index].aut.senario;

	if (!this.validateMember(senario, ['begin'])) {
		callback({'error':'1','message':['begin']});
		return;
	}

	if (!senario.begin instanceof Array) {
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

	console.log(_this.autConf[index]['aut']['desired']);

	_this.driver.init(_this.autConf[index]['aut']['desired']).then(function () {
			
			function callbackForReturn(err) {
				console.timeEnd('senarioLoop');
				clearInterval(_this.timer);
				callback({'error':'0','message':'success'});
				return;
			}
			
			_this.senarioIndex = 0;
			clearInterval(_this.timer);
			
			_this.timer = setInterval(function () {
				_this.timeout += 1000;
				}, 1000);

			// a loop using recursive call
			// at first the loop start with begin
			console.time('senarioLoop');
			_this.senarioLoop(senario, 'begin', callbackForReturn);
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



AppiumClient.prototype.senarioLoop = function (senario, begin, callback) {
	var _this = this;
	var i = 0;
	var timeout = 100;
	var pollFreq = 100;
	var action = senario[begin];


	function returnFunction(result) {
		_this.driver.quit();
		callback(result);
		return;
	}

	if (action == undefined) {
		returnFunction({'error':'1', 'message':'action required'});
		return;
	}

	if (begin == undefined || begin == '' || begin == 'end') {
		returnFunction({'error':'0', 'message':'success'});
		return;
	}
	
	if (_this.senarioIndex >= action.length) {
		// set next index to 0
		console.log('set to 0');
		_this.senarioIndex = 0;

		if (_this.timeout >= (1000 * 60)) {
			returnFunction({'error':'1', 'message':'end of loop till timeout'});
			return;
		}
	}

	if (!this.validateMember(action[_this.senarioIndex], ['method', 'value', 'next', 'view', 'event'])) {
		returnFunction({'error':'1','message':'invalid member'});
		return;
	}

	var method = action[_this.senarioIndex].method;
	var value = action[_this.senarioIndex].value;
	var next = action[_this.senarioIndex].next;
	var view = action[_this.senarioIndex].view.toLowercase;

	if (view == 'webview') {
		view = 'WEBVIEW';
	} else if (view == 'native') {
		view = 'NATIVE_APP';
	} else {
		view = 'NATIVE_APP';
	}

	console.log('_this.senarioIndex ' + _this.senarioIndex);
	console.log(action[_this.senarioIndex]);
	
	_this.senarioIndex += 1;


	function clickElem(err, element) {
		if (err) {
			console.log(err);
			_this.senarioLoop(senario, begin, callback);
		} else {
			console.log('kicked');
			_this.timeout = 0;
			console.log('click ' + new Date());
			_this.senarioIndex = 0;
			_this.performUserEvent(element, action[_this.senarioIndex]['event']);
			//element.click();
			console.log('call senarioLoop method with ' + next);
			_this.senarioLoop(senario, next, callback);
		}
		return;
	}

	switch (method) {
		case  'name':
			_this.driver.window(view, function (err) {
				_this.driver.waitForElementByName(value, asserters.isDisplayed, timeout, pollFreq, clickElem);
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
				_this.driver.waitForElementById(value, asserters.isDisplayed, timeout, pollFreq,  clickElem);
					});
			break;
		default:
			returnFunction({'error':'1', 'message':'invalid method'});
			return;
	}
}

module.exports = AppiumClient;
