var path = require('path');
var util = require(path.join(__dirname, '../src' ,'util'));
var fs = require('fs');

function Watcher() {
	this.events = {}
	this.resultList = [];
	this.autStartTime = 0;
}

Watcher.prototype.watchFile = function (file) {
	var _this = this;
	fs.watch(file, function (curr, prev) {
			fs.readFile(file, function (err, data) {
				if (err) {
					console.log(err);
				} else {
					_this.autStartTime = data.toString();
				}
				});
			});
}

Watcher.prototype.loadingTime = function (finishTime) {
	if (this.autStartTime <= 0) {
		return 0;
	}
	var now = new Date();
	now.setTime(this.autStartTime);
	return util.dateDiff(finishTime.finish, now);
}

Watcher.prototype.start = function (watching) {
	var now = new Date();
	
	if (!this.events.watching) {
		this.events.watching = {'event':watching, 'start':now, 'finish':undefined, 'timediff':undefined};
	}

	return this.events.watching;
}

Watcher.prototype.finish = function (watching) {
	var now = new Date();
	var finishTime;

	if (this.events.watching == undefined) {
		return {'event':'unknown', 'start':'','finish':now,'timediff':0};
	}

	var timediff = util.dateDiff(now, this.events.watching.start);
	this.events.watching.finish = now;
	this.events.watching.timediff = timediff;
	
	finishTime = this.events.watching;
	this.clear(watching);

	return finishTime;
}

Watcher.prototype.clear = function (watching) {
	if (this.events.watching) {
		delete this.events.watching;
	}
}

Watcher.prototype.clearAll = function () {
	for (key in this.events) {
		delete this.events.key;
	}
}

Watcher.prototype.storeResult = function (resultPair) {
	this.resultList.push(resultPair);
}

Watcher.prototype.clearResult = function () {
	this.resultList = [];
}

Watcher.prototype.print = function () {
	for (var i = 0; i < this.resultList.length; i++) {
		process.stdout.write(this.resultList[i].milliseconds + "\t");
	}
	console.log('');
}

module.exports = Watcher;
