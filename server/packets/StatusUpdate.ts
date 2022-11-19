import { RankingModes } from "../enums/RankingModes";
import { User } from "../objects/User";
const osu = require("osu-packet");

export function StatusUpdate(user:User, id:number, sendImmidiate:boolean = false) {
	if (id == 3) return; // Ignore Bot

	// Create new osu packet writer
	const osuPacketWriter = new osu.Bancho.Writer;

	// Get user's class
	const userData = user.sharedContent.users.getById(id);

	if (userData == null) return;

	let UserStatusObject = {
		userId: userData.id,
		status: userData.actionID,
		statusText: userData.actionText,
		beatmapChecksum: userData.beatmapChecksum,
		currentMods: userData.currentMods,
		playMode: userData.playMode,
		beatmapId: userData.beatmapID,
		rankedScore: userData.rankedScore,
		accuracy: userData.accuracy * 0.01, // Scale from 0:100 to 0:1
		playCount: userData.playCount,
		totalScore: userData.totalScore,
		rank: userData.rank, 
		performance: (userData.rankingMode == RankingModes.PP ? userData.pp : 0)
	};

	osuPacketWriter.HandleOsuUpdate(UserStatusObject);

	// Send data to user's queue
	if (sendImmidiate) user.addActionToQueue(osuPacketWriter.toBuffer);
	else return osuPacketWriter.toBuffer;
}