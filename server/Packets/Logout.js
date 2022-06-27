const osu = require("osu-packet"),
	  consoleHelper = require("../../consoleHelper.js");

module.exports = function(CurrentUser) {
	if (CurrentUser.uuid === "bot") throw "Tried to log bot out, WTF???";

	const logoutStartTime = Date.now();

	const streamList = global.StreamsHandler.getStreams();

	for (let i = 0; i < streamList.length; i++) {
		if (global.StreamsHandler.isUserInStream(streamList[i], CurrentUser.uuid)) {
			global.StreamsHandler.removeUserFromStream(streamList[i], CurrentUser.uuid);
		}
	}

	// Remove user from user list
	global.users.remove(CurrentUser.uuid);

	consoleHelper.printBancho(`User logged out, took ${Date.now() - logoutStartTime}ms. [User: ${CurrentUser.username}]`);
}