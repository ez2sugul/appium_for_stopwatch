
function dateDiff(newDate, oldDate) {
	var datediff = newDate.getTime() - oldDate.getTime(); //store the getTime diff - or +
	return datediff; //Convert values to -/+ days and return value      
}

function swLog(message) {
	console.log(new Date().toString());
}

module.exports.dateDiff = dateDiff;
module.exports.swLog = swLog;
