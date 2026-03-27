import User from "../objects/User";
import MultiplayerManager from "../managers/MultiplayerManager";

export default function TourneyMatchJoinChannel(user: User, matchId: number) {
	const match = MultiplayerManager.GetMatchById(matchId);
	if (match) {
		match.matchChatChannel.Join(user);
	}
}