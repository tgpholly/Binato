const osu = require("osu-packet");

module.exports = function(currentUser, sendImmidiate = true) {
	const osuPacketWriter = new osu.Bancho.Writer;

	let userIds = [];

	for (let i = 0; i < global.userKeys.length; i++) {
		userIds.push(global.users[global.userKeys[i]].id);
	}

	osuPacketWriter.UserPresenceBundle(userIds);

	if (sendImmidiate) currentUser.addActionToQueue(osuPacketWriter.toBuffer);
	else return osuPacketWriter.toBuffer;
}