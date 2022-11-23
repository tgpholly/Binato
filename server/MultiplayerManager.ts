import { Channel } from "./objects/Channel";
import { SharedContent } from "./interfaces/SharedContent";
import { SlotStatus } from "./enums/SlotStatus";
import { DataStream } from "./objects/DataStream";
import { Match } from "./objects/Match";
import { User } from "./objects/User";
import { StatusUpdate } from "./packets/StatusUpdate";
import { UserPresence } from "./packets/UserPresence";
import { UserPresenceBundle } from "./packets/UserPresenceBundle";
import { MatchArray } from "./objects/MatchArray";
import { MatchJoinData } from "./interfaces/MatchJoinData";
import { MatchData } from "./interfaces/MatchData";
const osu = require("osu-packet");

export class MultiplayerManager {
	private readonly sharedContent:SharedContent;
	private matches:MatchArray = new MatchArray();
	private readonly lobbyStream:DataStream;
	private readonly lobbyChat:Channel;

	public constructor(sharedContent:SharedContent) {
		this.sharedContent = sharedContent;
		this.lobbyStream = sharedContent.streams.CreateStream("multiplayer:lobby", false);
		const channel = this.sharedContent.chatManager.GetChannelByName("#lobby");
		if (channel === undefined) {
			throw "Something has gone horribly wrong, the lobby channel does not exist!";
		}
		this.lobbyChat = channel;
	}

	public JoinLobby(user:User) {
		if (user.inMatch) {
			user.match?.leaveMatch(user);
		}

		this.lobbyChat.Join(user);
		this.GenerateLobbyListing(user);
		this.lobbyStream.AddUser(user);
	}

	public LeaveLobby(user:User) {
		this.lobbyStream.RemoveUser(user);
	}

	public JoinMatch(user:User, matchData:number | MatchJoinData) {
		try {
			let match:Match | undefined;
			if (typeof(matchData) === "number") {
				match = this.matches.getById(matchData);
			} else {
				match = this.matches.getById(matchData.matchId);
			}
			if (!(match instanceof Match)) {
				throw "MatchIdInvalid";
			}

			if (match.gamePassword !== undefined && typeof(matchData) !== "number") {
				if (match.gamePassword !== matchData.gamePassword) {
					throw "IncorrectPassword";
				}
			}

			let matchFull = true;
			for (let slot of match.slots) {
				if (slot.player instanceof User || slot.status === SlotStatus.Locked) {
					continue;
				}

				slot.status = SlotStatus.NotReady
				slot.player = user;
				user.match = match;
				user.matchSlot = slot;
				matchFull = false;
				break;
			}

			if (matchFull) {
				throw "MatchFull";
			}

			// Inform users in the match that somebody has joined
			match.sendMatchUpdate();

			match.matchStream.AddUser(user);
			match.matchChatChannel.Join(user);

			const osuPacketWriter = new osu.Bancho.Writer;

			osuPacketWriter.MatchJoinSuccess(match.generateMatchJSON());

			user.addActionToQueue(osuPacketWriter.toBuffer);

			this.UpdateLobbyListing();
		} catch (e) {
			const osuPacketWriter = new osu.Bancho.Writer;

			osuPacketWriter.MatchJoinFail();

			user.addActionToQueue(osuPacketWriter.toBuffer);

			this.GenerateLobbyListing(user);
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
		this.JoinMatch(user, match.matchId);
	}
}