const osu = require("osu-packet");

module.exports = function(currentUser) {
    const osuPacketWriter = new osu.Bancho.Writer;

    let userIds = [];

    for (let i = 0; i < global.users.length; i++) {
        userIds.push(global.users[i].id);
    }

    osuPacketWriter.UserPresenceBundle(userIds);

    currentUser.addActionToQueue(osuPacketWriter.toBuffer);
}