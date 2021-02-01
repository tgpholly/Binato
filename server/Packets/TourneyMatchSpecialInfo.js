const osu = require("osu-packet"),
      ActionBuffer = require("../ActionBuffer.js");
const UserPresence = require("./UserPresence.js"),
      StatusUpdate = require("./StatusUpdate.js");

module.exports = function(CurrentUser, MatchID) {
    const matchData = global.MultiplayerManager.getMatchInfoForTourneyClient(MatchID);

    if (matchData != null) {
        const osuPacketWriter = new osu.Bancho.Writer();

        osuPacketWriter.MatchUpdate(matchData);

        let actions = new ActionBuffer(osuPacketWriter.toBuffer);

        for (let i = 0; i < matchData.slots.length; i++) {
            const slot = matchData.slots[i];
            actions.bufferAction(UserPresence(CurrentUser, slot.playerId, false));
            actions.bufferAction(StatusUpdate(CurrentUser, slot.playerId, false));
        }

        CurrentUser.addActionToQueue(actions.toBuffer());
    }
}