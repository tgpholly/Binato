const consoleHelper = require("../../consoleHelper.js"),
	  Streams = require("../Streams.js");

module.exports = function(CurrentUser) {
	if (CurrentUser.uuid === "bot") throw "Tried to log bot out, WTF???";

	const logoutStartTime = Date.now();

	const streamList = Streams.getStreams();

	for (let i = 0; i < streamList.length; i++) {
		if (Streams.isUserInStream(streamList[i], CurrentUser.uuid)) {
			Streams.removeUserFromStream(streamList[i], CurrentUser.uuid);
		}
	}

	// Remove user from user list
	global.users.remove(CurrentUser.uuid);

	global.DatabaseHelper.query("UPDATE osu_info SET value = ? WHERE name = 'online_now'", [global.users.getLength() - 1]);

	consoleHelper.printBancho(`User logged out, took ${Date.now() - logoutStartTime}ms. [User: ${CurrentUser.username}]`);
}