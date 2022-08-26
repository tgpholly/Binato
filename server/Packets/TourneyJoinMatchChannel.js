const osu = require("osu-packet"),
	  consoleHelper = require("./consoleHelper.js"),
	  Streams = require("../Streams.js");

module.exports = function(CurrentUser, MatchID) {
	const match = global.MultiplayerManager.getMatch(MatchID);

	if (match != null) {

		match.isTourneyMatch = true;
		for (let user of global.users.getIterableItems()) {
			if (user.id == CurrentUser.id) {
				match.tourneyClientUsers.push(user);
			}
		}

		if (Streams.isUserInStream(match.matchChatStreamName, CurrentUser.uuid))
			return consoleHelper.printBancho(`Did not add user to channel ${match.matchChatStreamName} because they are already in it`);

		const osuPacketWriter = new osu.Bancho.Writer;

		osuPacketWriter.ChannelJoinSuccess("#multiplayer");
		if (!Streams.isUserInStream(match.matchChatStreamName, CurrentUser.uuid))
			Streams.addUserToStream(match.matchChatStreamName, CurrentUser.uuid);

		CurrentUser.addActionToQueue(osuPacketWriter.toBuffer);
	}
}