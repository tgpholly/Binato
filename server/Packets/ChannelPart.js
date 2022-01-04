module.exports = function(CurrentUser, data) {
	if (data == "#multiplayer") return; // Ignore requests for multiplayer

	global.StreamsHandler.removeUserFromStream(data, CurrentUser.uuid);
}