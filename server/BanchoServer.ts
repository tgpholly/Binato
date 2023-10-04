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
shared.database.execute("UPDATE mp_matches SET close_time = UNIX_TIMESTAMP() WHERE close_time IS NULL");
shared.database.execute("UPDATE osu_info SET value = 0 WHERE name = 'online_now'");

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
import SendPublicMessage from "./packets/SendPublicMessage";

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

export default async function HandleRequest(req:IncomingMessage, res:ServerResponse, packet:Buffer) {
	// Get the client's token string and request data
	const requestTokenString = typeof(req.headers["osu-token"]) === "string" ? req.headers["osu-token"] : undefined;

	// Check if the user is logged in
	if (requestTokenString === undefined) {
		// Client doesn't have a token yet, let's auth them!
		
		await LoginProcess(req, res, packet, shared);
		shared.database.execute("UPDATE osu_info SET value = ? WHERE name = 'online_now'", [shared.users.getLength() - 1]);
	} else {
		let responseData = Buffer.allocUnsafe(0);

		// Client has a token, let's see what they want.
		try {
			// Get the current user
			const user = shared.users.getByToken(requestTokenString);

			// Make sure the client's token isn't invalid
			if (user != null) {
				// Update the session timeout time for each request
				user.timeoutTime = Date.now() + 60000;

				// Parse bancho packets
				const osuPacketReader = osu.Client.Reader(packet);
				const packets = osuPacketReader.Parse();

				// Go through each packet sent by the client
				for (const packet of packets) {
					switch (packet.id) {
						case Packets.Client_ChangeAction:
							ChangeAction(user, packet.data);
							break;

						case Packets.Client_SendPublicMessage:
							SendPublicMessage(user, packet.data);
							break;

						case Packets.Client_Logout:
							await Logout(user);
							break;

						case Packets.Client_RequestStatusUpdate:
							UserPresenceBundle(user);
							break;

						case Packets.Client_StartSpectating:
							spectatorManager.startSpectating(user, packet.data);
							break;

						case Packets.Client_SpectateFrames:
							spectatorManager.spectatorFrames(user, packet.data);
							break;

						case Packets.Client_StopSpectating:
							spectatorManager.stopSpectating(user);
							break;

						case Packets.Client_SendPrivateMessage:
							PrivateMessage(user, packet.data);
							break;

						case Packets.Client_JoinLobby:
							shared.multiplayerManager.JoinLobby(user);
							break;

						case Packets.Client_PartLobby:
							shared.multiplayerManager.LeaveLobby(user);
							break;

						case Packets.Client_CreateMatch:
							await shared.multiplayerManager.CreateMatch(user, packet.data);
							break;

						case Packets.Client_JoinMatch:
							shared.multiplayerManager.JoinMatch(user, packet.data);
							break;

						case Packets.Client_MatchChangeSlot:
							user.match?.moveToSlot(user, packet.data);
							break;

						case Packets.Client_MatchReady:
							user.match?.setStateReady(user);
							break;

						case Packets.Client_MatchChangeSettings:
							await user.match?.updateMatch(user, packet.data);
							break;

						case Packets.Client_MatchNotReady:
							user.match?.setStateNotReady(user);
							break;

						case Packets.Client_PartMatch:
							await shared.multiplayerManager.LeaveMatch(user);
							break;

						case Packets.Client_MatchLock:
							user.match?.lockOrKick(user, packet.data);
							break;

						case Packets.Client_MatchNoBeatmap:
							user.match?.missingBeatmap(user);
							break;

						case Packets.Client_MatchSkipRequest:
							user.match?.matchSkip(user);
							break;
						
						case Packets.Client_MatchHasBeatmap:
							user.match?.notMissingBeatmap(user);
							break;

						case Packets.Client_MatchTransferHost:
							user.match?.transferHost(user, packet.data);
							break;

						case Packets.Client_MatchChangeMods:
							user.match?.updateMods(user, packet.data);
							break;

						case Packets.Client_MatchStart:
							user.match?.startMatch();
							break;

						case Packets.Client_MatchLoadComplete:
							user.match?.matchPlayerLoaded(user);
							break;

						case Packets.Client_MatchComplete:
							await user.match?.onPlayerFinishMatch(user);
							break;

						case Packets.Client_MatchScoreUpdate:
							user.match?.updatePlayerScore(user, packet.data);
							break;

						case Packets.Client_MatchFailed:
							user.match?.matchFailed(user);
							break;

						case Packets.Client_MatchChangeTeam:
							user.match?.changeTeam(user);
							break;

						case Packets.Client_ChannelJoin:
							user.joinChannel(packet.data);
							break;

						case Packets.Client_ChannelPart:
							user.leaveChannel(packet.data);
							break;

						case Packets.Client_SetAwayMessage:
							//SetAwayMessage(PacketUser, CurrentPacket.data);
							break;

						case Packets.Client_FriendAdd:
							await AddFriend(user, packet.data);
							break;

						case Packets.Client_FriendRemove:
							await RemoveFriend(user, packet.data);
							break;

						case Packets.Client_UserStatsRequest:
							UserStatsRequest(user, packet.data);
							break;

						case Packets.Client_SpecialMatchInfoRequest:
							TourneyMatchSpecialInfo(user, packet.data);
							break;

						case Packets.Client_SpecialJoinMatchChannel:
							TourneyMatchJoinChannel(user, packet.data);
							break;

						case Packets.Client_SpecialLeaveMatchChannel:
							TourneyMatchLeaveChannel(user, packet.data);
							break;

						case Packets.Client_Invite:
							MultiplayerInvite(user, packet.data);
							break;

						case Packets.Client_UserPresenceRequest:
							UserPresence(user, user.id);
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

				responseData = user.queue;
				user.clearQueue();
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