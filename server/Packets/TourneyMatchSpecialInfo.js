const osu = require("osu-packet"),
	  UserPresence = require("./UserPresence.js"),
	  StatusUpdate = require("./StatusUpdate.js");

module.exports = function(CurrentUser, MatchID) {
	const matchData = global.MultiplayerManager.getMatch(MatchID);

	if (matchData != null) {
		const osuPacketWriter = new osu.Bancho.Writer();

		osuPacketWriter.MatchUpdate(matchData.createOsuMatchJSON());

		// Queue info on all the users in the match to the client
		for (let slot in matchData.slots) {
			CurrentUser.addActionToQueue(UserPresence(CurrentUser, slot.playerId, false));
			CurrentUser.addActionToQueue(StatusUpdate(CurrentUser, slot.playerId, false));
		}

		// Queue data
		CurrentUser.addActionToQueue(osuPacketWriter.toBuffer);
	}
}