browser
.init(desired).then(function() {
		return browser
		// waiting for app initialization
		.waitForElementByXPath(tc('contacts'), 10*TIME_BASE_UNIT)

		//try to delete contact if it is there
		.then(function() {
			return deleteUser('John Smith', TIME_BASE_UNIT/10)
			.catch(function() {/* ignore */});
			})

		.waitForElementByXPath(bc('Create'), 2*TIME_BASE_UNIT).click()

		// There may be a confirmation stage
		.then(function() {
			return browser
			.waitForElementByXPath(bc('Keep'), TIME_BASE_UNIT)
			.click()
			.catch(function() {/* ignore */});
			})

// Adding user
.waitForElementByXPath(ec('Name'), 2*TIME_BASE_UNIT)
	.sendKeys("John Smith")
	.elementByXPath(ec('Phone'))
	.sendKeys("(555) 555-5555")
	.elementByXPath(ec('Email'))
	.sendKeys("john.smith@google.io")
	.elementByXPath(tc('Done')).click()

	// Editing user
	.waitForElementByName("Edit", TIME_BASE_UNIT*10) // superslow
	.click()
	.waitForElementByXPath(bc('Add another field'), 2*TIME_BASE_UNIT)
	.click()
	.waitForElementByXPath(tc('Address'), 2*TIME_BASE_UNIT)
	.click()
	.waitForElementByXPath(ec('Address'), 2*TIME_BASE_UNIT)
	.sendKeys("123 Appium Street")
	.elementByXPath(tc('Done')).click()

	// Deleting user
	.then( deleteUser.bind(null, 'John Smith', 2*TIME_BASE_UNIT) )

	.fin(function() {
			return browser
			.sleep(TIME_BASE_UNIT) // waiting a bit before quitting
			.quit();
			});
})
.catch(function(err) {
		console.log(err);
		throw err;
		})
.done();
