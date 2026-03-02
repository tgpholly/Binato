import User from "../objects/User";
import MultiplayerManager from "../MultiplayerManager";

export default function TourneyMatchLeaveChannel(user: User, matchId: number) {
	const match = MultiplayerManager.GetMatchById(matchId);
	if (match === undefined) {
		return;
	}

	match.matchChatChannel.Leave(user);
}