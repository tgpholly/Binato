const osu = require("osu-packet"),
      getUserByUsername = require("../util/getUserByUsername.js");

module.exports = function(CurrentUser, CurrentPacket) {
    const osuPacketWriter = new osu.Bancho.Writer;

    osuPacketWriter.SendMessage({
        sendingClient: CurrentUser.username,
        message: CurrentPacket.data.message,
        target: CurrentUser.username,
        senderId: CurrentUser.id
    });

    const userSentTo = getUserByUsername(CurrentPacket.data.target);

    // Write chat message to stream asociated with chat channel
    return userSentTo.addActionToQueue(osuPacketWriter.toBuffer);
}