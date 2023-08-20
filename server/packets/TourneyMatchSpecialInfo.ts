import { osu } from "../../osuTyping";
import { Match } from "../objects/Match";
import { User } from "../objects/User";
import { StatusUpdate } from "./StatusUpdate";
import { UserPresence } from "./UserPresence";

export function TourneyMatchSpecialInfo(user:User, matchId:number) {
	const match = user.shared.multiplayerManager.GetMatchById(matchId);
	if (!(match instanceof Match)) {
		return;
	}

	const osuPacketWriter = osu.Bancho.Writer();
	osuPacketWriter.MatchUpdate(match.generateMatchJSON());

	for (const slot of match.slots) {
		if (slot.player === undefined) {
			continue;
		}

		const presenceBuffer = UserPresence(user, slot.player.id);
		const statusBuffer = StatusUpdate(user, slot.player.id);

		if (presenceBuffer instanceof Buffer && statusBuffer instanceof Buffer) {
			user.addActionToQueue(presenceBuffer);
			user.addActionToQueue(statusBuffer);
		}

		user.addActionToQueue(osuPacketWriter.toBuffer);
	}
}