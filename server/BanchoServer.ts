import Channel from "./objects/Channel";
import { ConsoleHelper } from "../ConsoleHelper";
import Constants from "../Constants";
import LoginProcess from "./LoginProcess";
import { IncomingMessage, ServerResponse } from "http";
import { Packets } from "./enums/Packets";
import { RedisClientType, createClient } from "redis";
import MessageData from "./interfaces/MessageData";
import PrivateMessage from "./packets/PrivateMessage";
import Shared from "./objects/Shared";
import SpectatorManager from "./SpectatorManager";
import osu from "../osuTyping";

const shared:Shared = new Shared();
shared.database.query("UPDATE mp_matches SET close_time = UNIX_TIMESTAMP() WHERE close_time IS NULL");
shared.database.query("UPDATE osu_info SET value = 0 WHERE name = 'online_now'");

// Server Setup
const spectatorManager:SpectatorManager = new SpectatorManager(shared);

let redisClient:RedisClientType;

async function subscribeToChannel(channelName:string, callback:(message:string) => void) {
	// Dup and connect new client for channel subscription (required)
	const subscriptionClient:RedisClientType = redisClient.duplicate();
	await subscriptionClient.connect();
	// Subscribe to channel
	await subscriptionClient.subscribe(channelName, callback);
	ConsoleHelper.printRedis(`Subscribed to ${channelName} channel`);
}

if (shared.config.redis.enabled) {
	(async () => {
		redisClient = createClient({
			url: `redis://${shared.config.redis.password.replaceAll(" ", "") == "" ? "" : `${shared.config.redis.password}@`}${shared.config.redis.address}:${shared.config.redis.port}/${shared.config.redis.database}`
		});

		redisClient.on('error', e => ConsoleHelper.printRedis(e));

		const connectionStartTime = Date.now();
		await redisClient.connect();
		ConsoleHelper.printRedis(`Connected to redis server. Took ${Date.now() - connectionStartTime}ms`);

		// Score submit update channel
		subscribeToChannel("binato:update_user_stats", (message) => {
			const user = shared.users.getById(parseInt(message));
			if (user != null) {
				// Update user info
				user.updateUserInfo(true);

				ConsoleHelper.printRedis(`Score submission stats update request received for ${user.username}`);
			}
		});
	})();
} else ConsoleHelper.printWarn("Redis is disabled!");

// Import packets
import ChangeAction from "./packets/ChangeAction";
import Logout from "./packets/Logout";
import UserPresence from "./packets/UserPresence";
import UserStatsRequest from "./packets/UserStatsRequest";
import UserPresenceBundle from "./packets/UserPresenceBundle";
import TourneyMatchSpecialInfo from "./packets/TourneyMatchSpecialInfo";
import TourneyMatchJoinChannel from "./packets/TourneyJoinMatchChannel";
import TourneyMatchLeaveChannel from "./packets/TourneyMatchLeaveChannel";
import AddFriend from "./packets/AddFriend";
import RemoveFriend from "./packets/RemoveFriend";
import PrivateChannel from "./objects/PrivateChannel";
import MultiplayerInvite from "./packets/MultiplayerInvite";

// User timeout interval
setInterval(() => {
	for (const User of shared.users.getIterableItems()) {
		if (User.uuid == "bot") continue; // Ignore the bot

		// Logout this user, they're clearly gone.
		if (Date.now() >= User.timeoutTime) {
			Logout(User);
		}
	}
}, 10000);

const EMPTY_BUFFER = Buffer.alloc(0);

export default async function HandleRequest(req:IncomingMessage, res:ServerResponse, packet:Buffer) {
	// Get the client's token string and request data
	const requestTokenString = typeof(req.headers["osu-token"]) === "string" ? req.headers["osu-token"] : undefined;

	// Check if the user is logged in
	if (requestTokenString === undefined) {
		// Client doesn't have a token yet, let's auth them!
		
		await LoginProcess(req, res, packet, shared);
		shared.database.query("UPDATE osu_info SET value = ? WHERE name = 'online_now'", [shared.users.getLength() - 1]);
	} else {
		let responseData = EMPTY_BUFFER;

		// Client has a token, let's see what they want.
		try {
			// Get the current user
			const PacketUser = shared.users.getByToken(requestTokenString);

			// Make sure the client's token isn't invalid
			if (PacketUser != null) {
				// Update the session timeout time for each request
				PacketUser.timeoutTime = Date.now() + 60000;

				// Parse bancho packets
				const osuPacketReader = osu.Client.Reader(packet);
				const packets = osuPacketReader.Parse();

				// Go through each packet sent by the client
				for (const packet of packets) {
					switch (packet.id) {
						case Packets.Client_ChangeAction:
							ChangeAction(PacketUser, packet.data);
							break;

						case Packets.Client_SendPublicMessage:
							const message:MessageData = packet.data;
							let channel = shared.chatManager.GetChannelByName(message.target);
							if (channel instanceof Channel) {
								channel.SendMessage(PacketUser, packet.data.message);
							}
							break;

						case Packets.Client_Logout:
							await Logout(PacketUser);
							break;

						case Packets.Client_RequestStatusUpdate:
							UserPresenceBundle(PacketUser);
							break;

						case Packets.Client_StartSpectating:
							spectatorManager.startSpectating(PacketUser, packet.data);
							break;

						case Packets.Client_SpectateFrames:
							spectatorManager.spectatorFrames(PacketUser, packet.data);
							break;

						case Packets.Client_StopSpectating:
							spectatorManager.stopSpectating(PacketUser);
							break;

						case Packets.Client_SendPrivateMessage:
							PrivateMessage(PacketUser, packet.data);
							break;

						case Packets.Client_JoinLobby:
							shared.multiplayerManager.JoinLobby(PacketUser);
							break;

						case Packets.Client_PartLobby:
							shared.multiplayerManager.LeaveLobby(PacketUser);
							break;

						case Packets.Client_CreateMatch:
							await shared.multiplayerManager.CreateMatch(PacketUser, packet.data);
							break;

						case Packets.Client_JoinMatch:
							shared.multiplayerManager.JoinMatch(PacketUser, packet.data);
							break;

						case Packets.Client_MatchChangeSlot:
							PacketUser.match?.moveToSlot(PacketUser, packet.data);
							break;

						case Packets.Client_MatchReady:
							PacketUser.match?.setStateReady(PacketUser);
							break;

						case Packets.Client_MatchChangeSettings:
							await PacketUser.match?.updateMatch(PacketUser, packet.data);
							break;

						case Packets.Client_MatchNotReady:
							PacketUser.match?.setStateNotReady(PacketUser);
							break;

						case Packets.Client_PartMatch:
							await shared.multiplayerManager.LeaveMatch(PacketUser);
							break;

						case Packets.Client_MatchLock:
							PacketUser.match?.lockOrKick(PacketUser, packet.data);
							break;

						case Packets.Client_MatchNoBeatmap:
							PacketUser.match?.missingBeatmap(PacketUser);
							break;

						case Packets.Client_MatchSkipRequest:
							PacketUser.match?.matchSkip(PacketUser);
							break;
						
						case Packets.Client_MatchHasBeatmap:
							PacketUser.match?.notMissingBeatmap(PacketUser);
							break;

						case Packets.Client_MatchTransferHost:
							PacketUser.match?.transferHost(PacketUser, packet.data);
							break;

						case Packets.Client_MatchChangeMods:
							PacketUser.match?.updateMods(PacketUser, packet.data);
							break;

						case Packets.Client_MatchStart:
							PacketUser.match?.startMatch();
							break;

						case Packets.Client_MatchLoadComplete:
							PacketUser.match?.matchPlayerLoaded(PacketUser);
							break;

						case Packets.Client_MatchComplete:
							await PacketUser.match?.onPlayerFinishMatch(PacketUser);
							break;

						case Packets.Client_MatchScoreUpdate:
							PacketUser.match?.updatePlayerScore(PacketUser, packet.data);
							break;

						case Packets.Client_MatchFailed:
							PacketUser.match?.matchFailed(PacketUser);
							break;

						case Packets.Client_MatchChangeTeam:
							PacketUser.match?.changeTeam(PacketUser);
							break;

						case Packets.Client_ChannelJoin:
							PacketUser.joinChannel(packet.data);
							break;

						case Packets.Client_ChannelPart:
							PacketUser.leaveChannel(packet.data);
							break;

						case Packets.Client_SetAwayMessage:
							//SetAwayMessage(PacketUser, CurrentPacket.data);
							break;

						case Packets.Client_FriendAdd:
							AddFriend(PacketUser, packet.data);
							break;

						case Packets.Client_FriendRemove:
							RemoveFriend(PacketUser, packet.data);
							break;

						case Packets.Client_UserStatsRequest:
							UserStatsRequest(PacketUser, packet.data);
							break;

						case Packets.Client_SpecialMatchInfoRequest:
							TourneyMatchSpecialInfo(PacketUser, packet.data);
							break;

						case Packets.Client_SpecialJoinMatchChannel:
							TourneyMatchJoinChannel(PacketUser, packet.data);
							break;

						case Packets.Client_SpecialLeaveMatchChannel:
							TourneyMatchLeaveChannel(PacketUser, packet.data);
							break;

						case Packets.Client_Invite:
							MultiplayerInvite(PacketUser, packet.data);
							break;

						case Packets.Client_UserPresenceRequest:
							UserPresence(PacketUser, PacketUser.id);
							break;

						// Ignored packets

						case Packets.Client_Pong:
						case Packets.Client_BeatmapInfoRequest:
						case Packets.Client_ReceiveUpdates:
							break;

						default:
							// Print out unimplemented packet
							console.dir(packet);
							break;
					}
				}

				responseData = PacketUser.queue;
				PacketUser.clearQueue();
			} else {
				// User's token is invlid, force a reconnect
				ConsoleHelper.printBancho(`Forced client re-connect (Token is invalid)`);
				const osuPacketWriter = osu.Bancho.Writer();
				osuPacketWriter.Announce("Reconnecting...");
				osuPacketWriter.Restart(0);
				responseData = osuPacketWriter.toBuffer;
			}
		} catch (e) {
			if (Constants.DEBUG) {
				throw e;
			}

			ConsoleHelper.printError(`${e}`);
		} finally {
			res.writeHead(200, {
				"Connection": "keep-alive",
				"Keep-Alive": "timeout=5, max=100",
			});
			// Send the prepared packet(s) to the client
			res.end(responseData);
		}
	}
}