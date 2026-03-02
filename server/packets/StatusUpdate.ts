import RankingMode from "../enums/RankingMode";
import User from "../objects/User";
import osu from "../../osuTyping";
import Users from "../Users";

export default function StatusUpdate(arg0:User | null, id:number) {
	// Ignore Bot
	if (id == 3) {
		return Buffer.alloc(0);
	}

	// Create new osu packet writer
	const osuPacketWriter = osu.Bancho.Writer();

	// Get user's class
	const userData = Users.getById(id);

	if (userData == null) {
		return Buffer.alloc(0);
	}

	osuPacketWriter.HandleOsuUpdate({
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
		performance: (userData.rankingMode == RankingMode.PP ? userData.pp : 0)
	});

	// Send data to user's queue
	if (arg0 instanceof User) {
		arg0.addActionToQueue(osuPacketWriter.toBuffer);
	}
	
	return osuPacketWriter.toBuffer;
}