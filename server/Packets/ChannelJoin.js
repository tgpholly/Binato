const osu = require("osu-packet"),
	  consoleHelper = require("../../consoleHelper.js");

module.exports = function(CurrentUser, channelName = "") {
	// Make sure the user is not already in the channel
	if (global.StreamsHandler.isUserInStream(channelName, CurrentUser.uuid))
		return consoleHelper.printBancho(`Did not add user to channel ${channelName} because they are already in it`);

	const osuPacketWriter = new osu.Bancho.Writer;

	osuPacketWriter.ChannelJoinSuccess(channelName);
	if (!global.StreamsHandler.isUserInStream(channelName, CurrentUser.uuid))
		global.StreamsHandler.addUserToStream(channelName, CurrentUser.uuid);

	CurrentUser.addActionToQueue(osuPacketWriter.toBuffer);
}