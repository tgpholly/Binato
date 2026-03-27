import Channel from "../objects/Channel";
import SlotStatus from "../enums/SlotStatus";
import DataStream from "../objects/DataStream";
import Match from "../objects/Match";
import User from "../objects/User";
import StatusUpdate from "../packets/StatusUpdate";
import UserPresence from "../packets/UserPresence";
import UserPresenceBundle from "../packets/UserPresenceBundle";
import MatchArray from "../objects/MatchArray";
import MatchJoinData from "../interfaces/packetTypes/MatchJoinData";
import MatchData from "../interfaces/packetTypes/MatchData";
import osu from "../../osuTyping";
import StreamManager from "./StreamManager";
import ChatManager from "./ChatManager";
import ConsoleHelper from "../../ConsoleHelper";

export default abstract class MultiplayerManager {
	private static matches: MatchArray = new MatchArray();
	private static readonly lobbyStream: DataStream = StreamManager.CreateStream("multiplayer:lobby", false);
	private static readonly lobbyChat: Channel = ChatManager.AddChatChannel("lobby", "Talk about multiplayer stuff");

	public static JoinLobby(user: User) {
		if (user.inMatch) {
			user.match?.leaveMatch(user);
		}

		this.lobbyChat.Join(user);
		this.GenerateLobbyListing(user);
		this.lobbyStream.AddUser(user);
	}

	public static LeaveLobby(user: User) {
		this.lobbyStream.RemoveUser(user);
	}

	private static MatchJoinFail(user: User) {
		const osuPacketWriter = osu.Bancho.Writer();

		osuPacketWriter.MatchJoinFail();

		user.addActionToQueue(osuPacketWriter.toBuffer);

		this.GenerateLobbyListing(user);
	}

	public static JoinMatch(user: User, matchData: number | MatchJoinData) {
		try {
			let match:Match | undefined;
			if (typeof(matchData) === "number") {
				match = this.matches.getById(matchData);
			} else {
				match = this.matches.getById(matchData.matchId);
			}
			if (!(match instanceof Match)) {
				this.MatchJoinFail(user);
				return;
			}

			if (match.gamePassword !== undefined && typeof(matchData) !== "number") {
				if (match.gamePassword !== matchData.gamePassword) {
					this.MatchJoinFail(user);
					return;
				}
			}

			let matchFull = true;
			for (const slot of match.slots) {
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
				this.MatchJoinFail(user);
				return;
			}

			// Inform users in the match that somebody has joined
			match.sendMatchUpdate();

			match.matchStream.AddUser(user);
			match.matchChatChannel.Join(user);

			const osuPacketWriter = osu.Bancho.Writer();

			osuPacketWriter.MatchJoinSuccess(match.serialiseMatch());

			user.addActionToQueue(osuPacketWriter.toBuffer);

			this.UpdateLobbyListing();
		} catch (e) {
			this.MatchJoinFail(user);
			ConsoleHelper.printError(`Something went horribly wrong while joining a match:`);
			console.error(e);
		}
	}

	public static UpdateLobbyListing() {
		this.lobbyStream.Send(this.GenerateLobbyListing());
	}

	public static GenerateLobbyListing(user?: User): Buffer {
		const osuPacketWriter = osu.Bancho.Writer();
		let bufferToSend = UserPresenceBundle();

		for (const match of this.matches.getIterableItems()) {
			for (const slot of match.slots) {
				if (!(slot.player instanceof User) || slot.status === SlotStatus.Locked) {
					continue;
				}

				const presenceBuffer = UserPresence(null, slot.player.id);
				const statusBuffer = StatusUpdate(null, slot.player.id);

				if (presenceBuffer === undefined || statusBuffer === undefined) {
					continue;
				}

				bufferToSend = Buffer.concat([bufferToSend, presenceBuffer, statusBuffer], bufferToSend.length + presenceBuffer.length + statusBuffer.length);
			}

			osuPacketWriter.MatchNew(match.serialiseMatch());
		}

		const osuBuffer = osuPacketWriter.toBuffer;
		bufferToSend = Buffer.concat([bufferToSend, osuBuffer], bufferToSend.length + osuBuffer.length);

		if (user instanceof User) {
			user.addActionToQueue(bufferToSend);
		}

		return bufferToSend;
	}

	public static GetMatchById(id: number): Match | undefined {
		return this.matches.getById(id);
	}

	public static async CreateMatch(user: User, matchData: MatchData) {
		const match = await Match.createMatch(user, matchData);
		this.matches.add(match.matchId.toString(), match);
		this.JoinMatch(user, match.matchId);
	}

	public static async LeaveMatch(user: User) {
		if (user.match instanceof Match) {
			user.match.leaveMatch(user);
			let usersInMatch = false;
			for (const slot of user.match.slots) {
				if (slot.player !== undefined) {
					usersInMatch = true;
					break;
				}
			}
			if (!usersInMatch) {
				this.matches.remove(user.match.matchId.toString());
			}
			this.UpdateLobbyListing();
		}
	}
}