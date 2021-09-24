const osu = require("osu-packet"),
      botCommandHandler = require("../BotCommandHandler.js");

module.exports = function(CurrentUser, CurrentPacket) {
    let isSendingChannelLocked = false;
    for (let i = 0; i < global.channels.length; i++) {
        if (!CurrentPacket.target.includes("#")) break;
        if (global.channels[i].channelName == CurrentPacket.target) {
            isSendingChannelLocked = global.channels[i].locked;
            break;
        }
    }

    if (isSendingChannelLocked) {
        if (CurrentPacket.message.includes("!")) {
            botCommandHandler(CurrentUser, CurrentPacket.message, CurrentPacket.target);
        } else {
            const osuPacketWriter = new osu.Bancho.Writer;
            osuPacketWriter.SendMessage({
                sendingClient: global.users["bot"].username,
                message: "The channel you are currently trying to send to is locked, please check back later!",
                target: CurrentPacket.target,
                senderId: global.users["bot"].id
            });
            CurrentUser.addActionToQueue(osuPacketWriter.toBuffer);
        }
        return;
    }

    global.consoleHelper.printChat(`${CurrentUser.username} in ${CurrentPacket.target} sent: ${CurrentPacket.message}`);

    const osuPacketWriter = new osu.Bancho.Writer;
    osuPacketWriter.SendMessage({
        sendingClient: CurrentUser.username,
        message: CurrentPacket.message,
        target: CurrentPacket.target,
        senderId: CurrentUser.id
    });

    if (CurrentPacket.target == "#multiplayer") {
        global.StreamsHandler.sendToStream(CurrentUser.currentMatch.matchChatStreamName, osuPacketWriter.toBuffer, CurrentUser.uuid);
        botCommandHandler(CurrentUser, CurrentPacket.message, CurrentUser.currentMatch.matchChatStreamName, true);
        return;
    }

    // Check the stream that we're sending to even exists
    if (!global.StreamsHandler.doesStreamExist(CurrentPacket.target)) return;

    // Write chat message to stream asociated with chat channel
    global.StreamsHandler.sendToStream(CurrentPacket.target, osuPacketWriter.toBuffer, CurrentUser.uuid);
    if (CurrentPacket.target == "#osu")
        global.addChatMessage(`${CurrentUser.username}: ${CurrentPacket.message}`);
        
    botCommandHandler(CurrentUser, CurrentPacket.message, CurrentPacket.target);
    return;
}