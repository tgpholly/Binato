const osu = require("osu-packet");

module.exports = function(CurrentUser, MatchID) {
    const match = global.MultiplayerManager.getMatch(MatchID);

    if (match != null) {

        match.isTourneyMatch = true;
        for (let i = 0; i < global.users.length; i++) {
            if (global.users[i].id == CurrentUser.id) {
                match.tourneyClientUsers.push(global.users[i]);
            }
        }

        if (global.StreamsHandler.isUserInStream(match.matchChatStreamName, CurrentUser.uuid))
            return global.consoleHelper.printBancho(`Did not add user to channel ${match.matchChatStreamName} because they are already in it`);

        const osuPacketWriter = new osu.Bancho.Writer;

        osuPacketWriter.ChannelJoinSuccess("#multiplayer");
        if (!global.StreamsHandler.isUserInStream(match.matchChatStreamName, CurrentUser.uuid))
            global.StreamsHandler.addUserToStream(match.matchChatStreamName, CurrentUser.uuid);

        CurrentUser.addActionToQueue(osuPacketWriter.toBuffer);
    }
}