const osu = require("osu-packet");

module.exports = function(CurrentUser) {
    const logoutStartTime = new Date().getTime();

    const streamList = global.StreamsHandler.getStreams();

    for (let i = 0; i < streamList.length; i++) {
        if (global.StreamsHandler.isUserInStream(streamList[i], CurrentUser.uuid)) {
            global.StreamsHandler.removeUserFromStream(streamList[i], CurrentUser.uuid);
        }
    }

    // Remove user from user list
    global.removeUser(CurrentUser);

    const osuPacketWriter = new osu.Bancho.Writer();
    osuPacketWriter.SendMessage({
        sendingClient: global.users["bot"].username,
        message: `User ${CurrentUser.username} has logged out.`,
        target: "#userlog",
        senderId: global.users["bot"].id
    });
    global.StreamsHandler.sendToStream("#userlog", osuPacketWriter.toBuffer);

    global.consoleHelper.printBancho(`User logged out, took ${new Date().getTime() - logoutStartTime}ms. [User: ${CurrentUser.username}]`);
}