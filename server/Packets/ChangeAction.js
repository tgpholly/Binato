const StatusUpdate = require("./StatusUpdate.js"),
	  Streams = require("../Streams.js");

module.exports = function(currentUser, data) {
	currentUser.updatePresence(data);

	if (Streams.exists(`sp_${currentUser.username}`)) {
		const statusUpdate = StatusUpdate(currentUser, currentUser.id, false);
		Streams.sendToStream(`sp_${currentUser.username}`, statusUpdate, null);
	}
}