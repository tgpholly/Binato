const osu = require("osu-packet"),
	  consoleHelper = require("../../consoleHelper.js"),
	  Streams = require("../Streams.js");

module.exports = function(CurrentUser, MatchID) {
	const match = global.MultiplayerManager.getMatch(MatchID);

	if (match != null) {

		match.isTourneyMatch = false;
		match.tourneyClientUsers = [];

		if (Streams.isUserInStream(match.matchChatStreamName, CurrentUser.uuid))
			return consoleHelper.printBancho(`Did not add user to channel ${match.matchChatStreamName} because they are already in it`);

		const osuPacketWriter = new osu.Bancho.Writer;

		osuPacketWriter.ChannelRevoked("#multiplayer");
		if (!Streams.isUserInStream(match.matchChatStreamName, CurrentUser.uuid))
			Streams.removeUserFromStream(match.matchChatStreamName, CurrentUser.uuid);

		CurrentUser.addActionToQueue(osuPacketWriter.toBuffer);
	} else {
		// Still provide feedback just in case
		// TODO: Check if this has any effect, if not then remove this.
		const osuPacketWriter = new osu.Bancho.Writer;

		osuPacketWriter.ChannelRevoked("#multiplayer");

		CurrentUser.addActionToQueue(osuPacketWriter.toBuffer);
	}
}