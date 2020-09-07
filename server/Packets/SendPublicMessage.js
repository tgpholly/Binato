const osu = require("osu-packet");

module.exports = function(CurrentPacket, CurrentUser) {
    const osuPacketWriter = new osu.Bancho.Writer;
    osuPacketWriter.SendMessage({
        sendingClient: CurrentUser.username,
        message: CurrentPacket.data.message,
        target: CurrentPacket.data.target,
        senderId: CurrentUser.id
    });

    if (CurrentPacket.data.target == "#multiplayer")
        return global.StreamsHandler.sendToStream(global.matches[CurrentUser.currentMatch][0], osuPacketWriter.toBuffer, CurrentUser.id);

    // Check the stream that we're sending to even exists
    if (!global.StreamsHandler.doesStreamExist(CurrentPacket.data.target)) return;

    // Write chat message to stream asociated with chat channel
    return global.StreamsHandler.sendToStream(CurrentPacket.data.target, osuPacketWriter.toBuffer, CurrentUser.id);
}