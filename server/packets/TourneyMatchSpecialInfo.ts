import osu from "../../osuTyping";
import Match from "../objects/Match";
import User from "../objects/User";
import StatusUpdate from "./StatusUpdate";
import UserPresence from "./UserPresence";
import MultiplayerManager from "../MultiplayerManager";

export default function TourneyMatchSpecialInfo(user:User, matchId:number) {
	const match = MultiplayerManager.GetMatchById(matchId);
	if (!(match instanceof Match)) {
		return;
	}

	const osuPacketWriter = osu.Bancho.Writer();
	osuPacketWriter.MatchUpdate(match.serialiseMatch());

	for (const slot of match.slots) {
		if (slot.player === undefined) {
			continue;
		}

		const presenceBuffer = UserPresence(user, slot.player.id);
		const statusBuffer = StatusUpdate(user, slot.player.id);

		if (presenceBuffer && statusBuffer) {
			user.addActionToQueue(presenceBuffer);
			user.addActionToQueue(statusBuffer);
		}

		user.addActionToQueue(osuPacketWriter.toBuffer);
	}
}