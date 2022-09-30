const osu = require("osu-packet");

module.exports = function(currentUser, sendImmidiate = true) {
	const osuPacketWriter = new osu.Bancho.Writer;

	let userIds = [];

	for (let user of global.users.getIterableItems()) {
		userIds.push(user.id);
	}

	osuPacketWriter.UserPresenceBundle(userIds);

	if (sendImmidiate) currentUser.addActionToQueue(osuPacketWriter.toBuffer);
	else return osuPacketWriter.toBuffer;
}