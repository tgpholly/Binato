import { DataStream } from "./objects/DataStream";
import { DataStreamArray } from "./objects/DataStreamArray";
import { FunkyArray } from "./objects/FunkyArray";
import { Match } from "./objects/Match";
import { User } from "./objects/User";

export class MultiplayerManager {
	private matches:FunkyArray<Match> = new FunkyArray<Match>();
	private readonly lobbyStream:DataStream;

	public constructor(streams:DataStreamArray) {
		this.lobbyStream = streams.CreateStream("multiplayer:lobby", false);
	}

	public JoinLobby(user:User) {
		if (user.currentMatch != null) {
			
		}
	}
}