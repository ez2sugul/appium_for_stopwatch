var assert = require("assert");
var path = require("path");
var fs = require("fs");
var wd = require("wd");
var Watcher = require("stopwatch_watcher");
var Client = require('stopwatch_client');

describe('appium client', function(){
		
		describe('runSenario', function(){
			it('should return true when the value is not present', function(){
				var client = new Client();
				client.runSenario(0, function (err) {
					assert.equal(0, err.error);
						});
			});
		});
		

		describe('readConfiguration', function () {
			var client = new Client();
			it("asd", function () {
				assert.equal(true, client.readConfiguration());
				});
			});

		describe('validateMember', function () {
			it("", function () {
				var client = new Client();
				assert.equal(true, client.validateMember({"a":"value", "b":"value"},["b","a"]));
				});
			});
		/*
		describe('init', function () {
				it("", function () {
					var desired = {
					"device": "Android",
					"version": "4.3",
					"app-package": "kr.co.ulike.tesports",
					"app-activity": ".IntroActivity"
					}

					browser = wd.promiseChainRemote("localhost", 4723);

					browser.on("status", function(info) {
						//console.log("status " + info);
						});

					browser.on("command", function(meth, path, data) {
						//console.log("on command " + meth + " " + path + " " + data);
						});

					browser.init(desired).then(function () {
						console.log("init function");
						});

				});
		});
		*/

		});

describe('watcher', function () {
		describe("finish", function () {
			it("", function () {
				var watcher = new Watcher();
				var resultStart = watcher.start("new");
				for (var i = 0; i < 100000; i++) {
					console.log(i);
				}
				var resultFinish = watcher.finish("new");
				console.log(resultFinish);
				});
			});
		});
