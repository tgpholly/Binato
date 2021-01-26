const osu = require("osu-packet"),
      getUserById = require("../util/getUserById.js");

module.exports = function(currentUser, id = 0, sendImmidiate = true) {
    const osuPacketWriter = new osu.Bancho.Writer;

    const User = getUserById(id);

    if (User == null) return;

    osuPacketWriter.UserPresence({
        userId: id,
        username: User.username,
        timezone: 0,
        countryId: User.countryID,
        permissions: 4,
        longitude: User.location[1],
        latitude: User.location[0],
        rank: User.rank
    });

    if (sendImmidiate) currentUser.addActionToQueue(osuPacketWriter.toBuffer);
    else return osuPacketWriter.toBuffer;
}