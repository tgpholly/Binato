import { osu } from "../../osuTyping";
import { User } from "../objects/User";

export function TourneyMatchJoinChannel(user:User, matchId:number) {
	const match = user.shared.multiplayerManager.GetMatchById(matchId);
	if (match === undefined) {
		return;
	}

	match.matchChatChannel.Join(user);
}