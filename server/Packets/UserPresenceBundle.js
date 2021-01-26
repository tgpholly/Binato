const osu = require("osu-packet");

module.exports = function(currentUser, sendImmidiate = true) {
    const osuPacketWriter = new osu.Bancho.Writer;

    let userIds = [];

    for (let i = 0; i < global.users.length; i++) {
        userIds.push(global.users[i].id);
    }

    osuPacketWriter.UserPresenceBundle(userIds);

    if (sendImmidiate) currentUser.addActionToQueue(osuPacketWriter.toBuffer);
    else return osuPacketWriter.toBuffer;
}