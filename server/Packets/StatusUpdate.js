const osu = require("osu-packet"),
	  getUserById = require("../util/getUserById.js");

module.exports = function(currentUser, id = 0, sendImmidiate = true) {
	if (id == 3) return; // Ignore Bot

	// Create new osu packet writer
	const osuPacketWriter = new osu.Bancho.Writer;

	// Get user's class
	const User = getUserById(id);

	if (User == null) return;

	let UserStatusObject = {
		userId: User.id,
		status: User.actionID,
		statusText: User.actionText,
		beatmapChecksum: User.beatmapChecksum,
		currentMods: User.currentMods,
		playMode: User.playMode,
		beatmapId: User.beatmapID,
		rankedScore: User.rankedScore,
		accuracy: User.accuracy / 100, // Scale of 0 to 1
		playCount: User.playCount,
		totalScore: User.totalScore,
		rank: User.rank, 
		performance: (User.rankingMode == 0 ? User.pp : 0)
	};

	osuPacketWriter.HandleOsuUpdate(UserStatusObject);

	// Send data to user's queue
	if (sendImmidiate) currentUser.addActionToQueue(osuPacketWriter.toBuffer);
	else return osuPacketWriter.toBuffer;
}