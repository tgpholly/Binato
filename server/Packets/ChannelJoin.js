const osu = require("osu-packet");

module.exports = function(CurrentUser, channelName = "") {
    // Make sure the user is not already in the channel
    if (global.StreamsHandler.isUserInStream(channelName, CurrentUser.id))
        return global.consoleHelper.printBancho(`Did not add user to channel ${channelName} because they are already in it`);

    const osuPacketWriter = new osu.Bancho.Writer;

    osuPacketWriter.ChannelJoinSuccess(channelName);
    if (!global.StreamsHandler.isUserInStream(channelName, CurrentUser.id))
        global.StreamsHandler.addUserToStream(channelName, CurrentUser.id);

    CurrentUser.addActionToQueue(osuPacketWriter.toBuffer);
}