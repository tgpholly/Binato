const osu = require("osu-packet"),
      botCommandHandler = require("../BotCommandHandler.js");

module.exports = function(CurrentPacket, CurrentUser) {
    let isSendingChannelLocked = false;
    for (let i = 0; i < global.channels.length; i++) {
        if (!CurrentPacket.data.target.includes("#")) break;
        if (global.channels[i].channelName == CurrentPacket.data.target) {
            isSendingChannelLocked = global.channels[i].locked;
            break;
        }
    }

    if (isSendingChannelLocked) {
        if (CurrentPacket.data.message.includes("!")) {
            botCommandHandler(CurrentUser, CurrentPacket.data.message, CurrentPacket.data.target);
        } else {
            const osuPacketWriter = new osu.Bancho.Writer;
            osuPacketWriter.SendMessage({
                sendingClient: global.users[0].username,
                message: "The channel you are currently trying to send to is locked, please come back later!",
                target: CurrentPacket.data.target,
                senderId: global.users[0].id
            });
            CurrentUser.addActionToQueue(osuPacketWriter.toBuffer);
        }
        return;
    }

    const osuPacketWriter = new osu.Bancho.Writer;
    osuPacketWriter.SendMessage({
        sendingClient: CurrentUser.username,
        message: CurrentPacket.data.message,
        target: CurrentPacket.data.target,
        senderId: CurrentUser.id
    });

    if (CurrentPacket.data.target == "#multiplayer") {
        global.StreamsHandler.sendToStream(global.matches[CurrentUser.currentMatch][0], osuPacketWriter.toBuffer, CurrentUser.id);
        botCommandHandler(CurrentUser, CurrentPacket.data.message, global.matches[CurrentUser.currentMatch][0], true);
        return;
    }

    // Check the stream that we're sending to even exists
    if (!global.StreamsHandler.doesStreamExist(CurrentPacket.data.target)) return;

    // Write chat message to stream asociated with chat channel
    global.StreamsHandler.sendToStream(CurrentPacket.data.target, osuPacketWriter.toBuffer, CurrentUser.id);
    botCommandHandler(CurrentUser, CurrentPacket.data.message, CurrentPacket.data.target);
    return;
}