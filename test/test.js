var assert = require("assert");
var path = require("path");
var fs = require("fs");
var wd = require("wd");

require(path.join(__dirname, "..", "src", "appiumClient.js"));

describe('appium', function(){
		describe('waitForElement', function(){
			var desired = {"device":"Android",
				"version": "4.3",
				"app-package": "kr.co.ulike.tesports",
				"app-activity": ".IntroActivity"
				};
			it('should return -1 when the value is not present', function(){
				var browser = wd.promiseChainRemote("localhost", 4732);
				browser.init(desired).then(function () {

					});
				})
			})
		});
