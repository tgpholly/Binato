const osu = require("osu-packet"),
      getUserByUsername = require("../util/getUserByUsername.js");

module.exports = function(CurrentPacket, CurrentUser) {
    const osuPacketWriter = new osu.Bancho.Writer;

    osuPacketWriter.ChannelJoinSuccess(CurrentUser.username);

    osuPacketWriter.SendMessage({
        sendingClient: CurrentUser.username,
        message: CurrentPacket.data.message,
        target: CurrentPacket.data.target,
        senderId: CurrentUser.id
    });

    const userSentTo = getUserByUsername(CurrentPacket.data.target);

    // Write chat message to stream asociated with chat channel
    return userSentTo.addActionToQueue(osuPacketWriter.toBuffer);
}