const osu = require("osu-packet");

module.exports = function(CurrentUser) {
    const loginStartTime = new Date().getTime();
    let userCurrentIndex;
    // Find the index that the user's class is at
    for (let i = 0; i < global.users.length; i++) {
        if (CurrentUser.uuid == global.users[i].uuid) {
            userCurrentIndex = i;
            break;
        }
    }

    const streamList = global.StreamsHandler.getStreams();

    for (let i = 0; i < streamList.length; i++) {
        if (global.StreamsHandler.isUserInStream(streamList[i], CurrentUser.id)) {
            global.StreamsHandler.removeUserFromStream(streamList[i], CurrentUser.id);
        }
    }

    // Remove that user from the list of users
    global.users.splice(userCurrentIndex, 1);

    const osuPacketWriter = new osu.Bancho.Writer;
    osuPacketWriter.SendMessage({
        sendingClient: "BanchoBot",
        message: `User ${CurrentUser.username} has logged out.`,
        target: "#userlog",
        senderId: 3
    });
    global.StreamsHandler.sendToStream("#userlog", osuPacketWriter.toBuffer);

    global.consoleHelper.printBancho(`User logged out, took ${new Date().getTime() - loginStartTime}ms. [User: ${CurrentUser.username}]`);
}