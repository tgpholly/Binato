import { SharedContent } from "../BanchoServer";
import { RankingModes } from "../enums/RankingModes";
import { User } from "../objects/User";
const osu = require("osu-packet");

export function StatusUpdate(arg0:User | SharedContent, id:number) {
	if (id == 3) return; // Ignore Bot

	// Create new osu packet writer
	const osuPacketWriter = new osu.Bancho.Writer;
	let sharedContent:SharedContent;
	if (arg0 instanceof User) {
		sharedContent = arg0.sharedContent;
	} else {
		sharedContent = arg0;
	}

	// Get user's class
	const userData = sharedContent.users.getById(id);

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
	if (arg0 instanceof User) {
		arg0.addActionToQueue(osuPacketWriter.toBuffer);
	}
	
	return osuPacketWriter.toBuffer;
}