const Streams = require("../Streams.js");

module.exports = function(CurrentUser, data) {
	if (data == "#multiplayer") return; // Ignore requests for multiplayer

	Streams.removeUserFromStream(data, CurrentUser.uuid);
}