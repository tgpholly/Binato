import { SharedContent } from "./BanchoServer";
import { DataStream } from "./objects/DataStream";
import { DataStreamArray } from "./objects/DataStreamArray";
import { FunkyArray } from "./objects/FunkyArray";
import { Match, MatchData } from "./objects/Match";
import { User } from "./objects/User";

export class MultiplayerManager {
	private readonly sharedContent:SharedContent;
	private matches:FunkyArray<Match> = new FunkyArray<Match>();
	private readonly lobbyStream:DataStream;

	public constructor(sharedContent:SharedContent) {
		this.sharedContent = sharedContent;
		this.lobbyStream = sharedContent.streams.CreateStream("multiplayer:lobby", false);
	}

	public JoinLobby(user:User) {
		if (user.currentMatch != null) {
			
		}
	}

	public async CreateMatch(user:User, matchData:MatchData) {
		const match = await Match.createMatch(user, matchData, this.sharedContent);
		this.matches.add(match.matchId.toString(), match);
	}
}