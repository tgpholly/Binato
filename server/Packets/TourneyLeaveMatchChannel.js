const osu = require("osu-packet");

module.exports = function(CurrentUser, MatchID) {
    const match = global.MultiplayerManager.getMatch(MatchID);

    if (match != null) {

        match.isTourneyMatch = false;
        match.tourneyClientUsers = [];

        if (global.StreamsHandler.isUserInStream(match.matchStreamName, CurrentUser.uuid))
            return global.consoleHelper.printBancho(`Did not add user to channel ${match.matchStreamName} because they are already in it`);

        const osuPacketWriter = new osu.Bancho.Writer;

        osuPacketWriter.ChannelRevoked("#multiplayer");
        if (!global.StreamsHandler.isUserInStream(match.matchStreamName, CurrentUser.uuid))
            global.StreamsHandler.removeUserFromStream(match.matchStreamName, CurrentUser.uuid);

        CurrentUser.addActionToQueue(osuPacketWriter.toBuffer);
    } else {
        // Still provide feedback just in case
        // TODO: Check if this has any effect, if not then remove this.
        const osuPacketWriter = new osu.Bancho.Writer;

        osuPacketWriter.ChannelRevoked("#multiplayer");

        CurrentUser.addActionToQueue(osuPacketWriter.toBuffer);
    }
}