const osu = require("osu-packet"),
	  getUserById = require("../util/getUserById.js");

module.exports = function(CurrentUser, InvitedUser) {
	let osuPacketWriter = new osu.Bancho.Writer;

	const InvitedUserClass = getUserById(InvitedUser);

	osuPacketWriter.SendMessage({
		sendingClient: CurrentUser.username,
		message: `Come join my multiplayer match: [osump://${CurrentUser.currentMatch.matchId}/ ${CurrentUser.currentMatch.gameName}]`,
		target: CurrentUser.username,
		senderId: CurrentUser.id
	});

	InvitedUserClass.addActionToQueue(osuPacketWriter.toBuffer);
}