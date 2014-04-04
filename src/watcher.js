var util = require('stopwatch_util');

function Watcher() {
	this.events = {}
}

Watcher.prototype.start = function (watching) {
	var now = new Date();
	
	this.clear(watching);

	this.events.watching = {"event":watching, "start":now, "finish":undefined, "timediff":undefined};

	return this.events.watching;
}

Watcher.prototype.finish = function (watching) {
	var now = new Date();

	if (this.events.watching == undefined) {
		return {"event":"unknown", "start":"","finish":"","timediff":0};
	}

	var timediff = util.dateDiff(now, this.events.watching.start);
	this.events.watching.finish = now;
	this.events.watching.timediff = timediff;

	return this.events.watching;
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

module.exports = Watcher;
