module.exports = function(dateArg) {
	let date = new Date(dateArg);
	let dateStr = date.toISOString().replace(/[T]/, " ").replace(/Z/, "");
	return dateStr;
};