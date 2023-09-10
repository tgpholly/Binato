import User from "../objects/User";

export default function TourneyMatchLeaveChannel(user:User, matchId:number) {
	const match = user.shared.multiplayerManager.GetMatchById(matchId);
	if (match === undefined) {
		return;
	}

	match.matchChatChannel.Leave(user);
}