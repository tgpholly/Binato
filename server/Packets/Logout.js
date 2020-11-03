const osu = require("osu-packet");

module.exports = function(CurrentUser) {
    const logoutStartTime = new Date().getTime();

    const streamList = global.StreamsHandler.getStreams();

    for (let i = 0; i < streamList.length; i++) {
        if (global.StreamsHandler.isUserInStream(streamList[i], CurrentUser.id)) {
            global.StreamsHandler.removeUserFromStream(streamList[i], CurrentUser.id);
        }
    }

    // Find the index that the user's class is at and remove the object
    for (let i = 0; i < global.users.length; i++) {
        if (CurrentUser.uuid == global.users[i].uuid) {
            // Remove that user from the list of users
            global.users.splice(i, 1);
            break;
        }
    }

    const osuPacketWriter = new osu.Bancho.Writer;
    osuPacketWriter.SendMessage({
        sendingClient: global.users[0].username,
        message: `User ${CurrentUser.username} has logged out.`,
        target: "#userlog",
        senderId: 3
    });
    global.StreamsHandler.sendToStream("#userlog", osuPacketWriter.toBuffer);

    global.consoleHelper.printBancho(`User logged out, took ${new Date().getTime() - logoutStartTime}ms. [User: ${CurrentUser.username}]`);
}