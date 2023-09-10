import Shared from "../objects/Shared";
import { RankingModes } from "../enums/RankingModes";
import User from "../objects/User";
import osu from "../../osuTyping";

export default function StatusUpdate(arg0:User | Shared, id:number) {
	if (id == 3) return; // Ignore Bot

	// Create new osu packet writer
	const osuPacketWriter = osu.Bancho.Writer();
	let shared:Shared;
	if (arg0 instanceof User) {
		shared = arg0.shared;
	} else {
		shared = arg0;
	}

	// Get user's class
	const userData = shared.users.getById(id);

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