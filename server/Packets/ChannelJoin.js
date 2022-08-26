const osu = require("osu-packet"),
	  consoleHelper = require("../../consoleHelper.js"),
	  Streams = require("../Streams.js");

module.exports = function(CurrentUser, channelName = "") {
	// Make sure the user is not already in the channel
	if (Streams.isUserInStream(channelName, CurrentUser.uuid))
		return consoleHelper.printBancho(`Did not add user to channel ${channelName} because they are already in it`);

	const osuPacketWriter = new osu.Bancho.Writer;

	osuPacketWriter.ChannelJoinSuccess(channelName);
	if (!Streams.isUserInStream(channelName, CurrentUser.uuid))
		Streams.addUserToStream(channelName, CurrentUser.uuid);

	CurrentUser.addActionToQueue(osuPacketWriter.toBuffer);
}