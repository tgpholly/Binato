import { SharedContent } from "./BanchoServer";
import { SlotStatus } from "./enums/SlotStatus";
import { DataStream } from "./objects/DataStream";
import { DataStreamArray } from "./objects/DataStreamArray";
import { FunkyArray } from "./objects/FunkyArray";
import { Match, MatchData } from "./objects/Match";
import { User } from "./objects/User";
import { StatusUpdate } from "./packets/StatusUpdate";
import { UserPresence } from "./packets/UserPresence";
import { UserPresenceBundle } from "./packets/UserPresenceBundle";
const osu = require("osu-packet");

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

	public UpdateLobbyListing() {
		this.lobbyStream.Send(this.GenerateLobbyListing());
	}

	public GenerateLobbyListing(user?:User) : Buffer {
		const osuPacketWriter = new osu.Bancho.Writer;
		let bufferToSend = UserPresenceBundle(this.sharedContent);

		for (let match of this.matches.getIterableItems()) {
			for (let slot of match.slots) {
				if (!(slot.player instanceof User) || slot.status === SlotStatus.Locked) {
					continue;
				}

				const presenceBuffer = UserPresence(this.sharedContent, slot.player.id);
				const statusBuffer = StatusUpdate(this.sharedContent, slot.player.id);
				bufferToSend = Buffer.concat([bufferToSend, presenceBuffer, statusBuffer], bufferToSend.length + presenceBuffer.length + statusBuffer.length);
			}

			osuPacketWriter.MatchNew(match.generateMatchJSON());
		}

		const osuBuffer = osuPacketWriter.toBuffer;
		bufferToSend = Buffer.concat([bufferToSend, osuBuffer], bufferToSend.length + osuBuffer.length);

		if (user instanceof User) {
			user.addActionToQueue(bufferToSend);
		}

		return bufferToSend;
	}

	public async CreateMatch(user:User, matchData:MatchData) {
		const match = await Match.createMatch(user, matchData, this.sharedContent);
		this.matches.add(match.matchId.toString(), match);
	}
}