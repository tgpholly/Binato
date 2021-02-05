const osu = require("osu-packet"),
      UserPresence = require("./UserPresence.js"),
      StatusUpdate = require("./StatusUpdate.js"),
      ActionBuffer = require("../ActionBuffer.js");

module.exports = function(CurrentUser, MatchID) {
    const matchData = global.MultiplayerManager.getMatchInfoForTourneyClient(MatchID);

    if (matchData != null) {
        const osuPacketWriter = new osu.Bancho.Writer();

        osuPacketWriter.MatchUpdate(matchData);

        let actions = new ActionBuffer(osuPacketWriter.toBuffer);

        for (let slot in matchData.slots) {
            actions.bufferAction(UserPresence(CurrentUser, slot.playerId, false));
            actions.bufferAction(StatusUpdate(CurrentUser, slot.playerId, false));
        }

        CurrentUser.addActionToQueue(actions.toBuffer());
    }
}