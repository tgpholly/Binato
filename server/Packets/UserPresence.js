const osu = require("osu-packet"),
      getUserById = require("../util/getUserById.js");

module.exports = function(currentUser, id) {
    const osuPacketWriter = new osu.Bancho.Writer;

    const User = getUserById(id);

    if (User == null) return;

    let UserPresenceObject = {
        userId: id,
        username: User.username,
        timezone: 0,
        countryId: User.countryID,
        permissions: 4,
        longitude: User.location[1],
        latitude: User.location[0],
        rank: User.rank
    };

    osuPacketWriter.UserPresence(UserPresenceObject);

    currentUser.addActionToQueue(osuPacketWriter.toBuffer);
}