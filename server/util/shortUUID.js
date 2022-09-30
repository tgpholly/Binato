const uuid = require("uuid").v4;

module.exports = function() {
	return uuid().split("-").slice(0, 2).join("");
}