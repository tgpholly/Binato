const osu = require("osu-packet"),
	  getUserByUsername = require("../util/getUserByUsername.js");

module.exports = function(CurrentUser, CurrentPacket) {
	const osuPacketWriter = new osu.Bancho.Writer;
	const userSentTo = getUserByUsername(CurrentPacket.target);

	if (userSentTo == null) return;

	osuPacketWriter.SendMessage({
		sendingClient: CurrentUser.username,
		message: CurrentPacket.message,
		target: CurrentUser.username,
		senderId: CurrentUser.id
	});

	// Write chat message to stream asociated with chat channel
	return userSentTo.addActionToQueue(osuPacketWriter.toBuffer);
}