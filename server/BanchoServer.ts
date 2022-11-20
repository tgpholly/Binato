import { ConsoleHelper } from "../ConsoleHelper";
import { Channel } from "./objects/Channel";
import { ChatManager } from "./ChatManager";
import { Database } from "./objects/Database";
import { LatLng } from "./objects/LatLng";
import { LoginProcess } from "./LoginProcess";
import { Packets } from "./enums/Packets";
import { replaceAll } from "./Util";
import { readFileSync } from "fs";
import { RedisClientType, createClient } from "redis";
import { Request, Response } from "express";
import { UserArray } from "./objects/UserArray";
import { User } from "./objects/User";
import { DataStreamArray } from "./objects/DataStreamArray";
import { MultiplayerManager } from "./MultiplayerManager";
const config:any = JSON.parse(readFileSync("./config.json").toString());
// TODO: Port osu-packet to TypeScript
const osu = require("osu-packet");

export interface SharedContent {
	chatManager:ChatManager,
	database:Database,
	mutiplayerManager:MultiplayerManager,
	streams:DataStreamArray,
	users:UserArray,
}

const sharedContent:any = {};
// NOTE: This function should only be used externaly in Binato.ts and in this file.
export function GetSharedContent() : SharedContent {
	return sharedContent;
}

const DB:Database = sharedContent.database = new Database(config.database.address, config.database.port, config.database.username, config.database.password, config.database.name, async () => {
	// Close any unclosed db matches on startup
	DB.query("UPDATE mp_matches SET close_time = UNIX_TIMESTAMP() WHERE close_time IS NULL");
	DB.query("UPDATE osu_info SET value = 0 WHERE name = 'online_now'");
});

// User session storage
const users:UserArray = sharedContent.users = new UserArray();

// DataStream storage
const streams:DataStreamArray = sharedContent.streams = new DataStreamArray();

// ChatManager
const chatManager:ChatManager = sharedContent.chatManager = new ChatManager(streams);
chatManager.AddChatChannel("osu", "The main channel", true);
chatManager.AddChatChannel("lobby", "Talk about multiplayer stuff");
chatManager.AddChatChannel("english", "Talk in exclusively English");
chatManager.AddChatChannel("japanese", "Talk in exclusively Japanese");

const multiplayerManager:MultiplayerManager = sharedContent.mutiplayerManager = new MultiplayerManager(GetSharedContent());

// Add the bot user
const botUser:User = users.add("bot", new User(3, "SillyBot", "bot", GetSharedContent()));
// Set the bot's position on the map
botUser.location = new LatLng(50, -32);

let redisClient:RedisClientType;

async function subscribeToChannel(channelName:string, callback:(message:string) => void) {
	// Dup and connect new client for channel subscription (required)
	const subscriptionClient:RedisClientType = redisClient.duplicate();
	await subscriptionClient.connect();
	// Subscribe to channel
	await subscriptionClient.subscribe(channelName, callback);
	ConsoleHelper.printRedis(`Subscribed to ${channelName} channel`);
}

if (config.redis.enabled) {
	(async () => {
		redisClient = createClient({
			url: `redis://${replaceAll(config.redis.password, " ", "") == "" ? "" : `${config.redis.password}@`}${config.redis.address}:${config.redis.port}/${config.redis.database}`
		});

		redisClient.on('error', e => ConsoleHelper.printRedis(e));

		const connectionStartTime = Date.now();
		await redisClient.connect();
		ConsoleHelper.printRedis(`Connected to redis server. Took ${Date.now() - connectionStartTime}ms`);

		// Score submit update channel
		subscribeToChannel("binato:update_user_stats", (message) => {
			if (typeof(message) === "string") {
				const user = users.getById(parseInt(message));
				if (user != null) {
					// Update user info
					user.updateUserInfo(true);

					ConsoleHelper.printRedis(`Score submission stats update request received for ${user.username}`);
				}
			}
		});
	})();
} else ConsoleHelper.printWarn("Redis is disabled!");

// Import packets
import { ChangeAction } from "./packets/ChangeAction";
import { Logout } from "./packets/Logout";
import { UserPresence } from "./packets/UserPresence";
import { UserStatsRequest } from "./packets/UserStatsRequest";
import { UserPresenceBundle } from "./packets/UserPresenceBundle";

// User timeout interval
setInterval(() => {
	for (let User of users.getIterableItems()) {
		if (User.uuid == "bot") continue; // Ignore the bot

		// Logout this user, they're clearly gone.
		if (Date.now() >= User.timeoutTime) {
			Logout(User);
		}
	}
}, 10000);

const EMPTY_BUFFER = Buffer.alloc(0);

export async function HandleRequest(req:Request, res:Response, packet:Buffer) {
	// Remove headers we don't need for Bancho
	res.removeHeader('X-Powered-By');
	res.removeHeader('Date');

	// Get the client's token string and request data
	const requestTokenString:string | undefined = req.header("osu-token");

	// Check if the user is logged in
	if (requestTokenString == null) {
		// Only do this if we're absolutely sure that we're connected to the DB
		if (DB.connected) {
			// Client doesn't have a token yet, let's auth them!
			
			await LoginProcess(req, res, packet, GetSharedContent());
			DB.query("UPDATE osu_info SET value = ? WHERE name = 'online_now'", [users.getLength() - 1]);
		}
	} else {
		let responseData:Buffer | string = EMPTY_BUFFER;

		// Client has a token, let's see what they want.
		try {
			// Get the current user
			const PacketUser:User | undefined = users.getByToken(requestTokenString);

			// Make sure the client's token isn't invalid
			if (PacketUser != null) {
				// Update the session timeout time
				PacketUser.timeoutTime = Date.now() + 60000;

				// Create a new osu! packet reader
				const osuPacketReader = new osu.Client.Reader(packet);
				// Parse current bancho packet
				const PacketData = osuPacketReader.Parse();

				// Go through each packet sent by the client
				for (let CurrentPacket of PacketData) {
					switch (CurrentPacket.id) {
						case Packets.Client_ChangeAction:
							ChangeAction(PacketUser, CurrentPacket.data);
						break;

						case Packets.Client_SendPublicMessage:
							let channel = chatManager.GetChannelByName(CurrentPacket.data.target);
							if (channel instanceof Channel) {
								channel.SendMessage(PacketUser, CurrentPacket.data.message);
							}
						break;

						case Packets.Client_Logout:
							await Logout(PacketUser);
						break;

						case Packets.Client_RequestStatusUpdate:
							UserPresenceBundle(PacketUser);
						break;

						case Packets.Client_StartSpectating:
							//Spectator.startSpectatingUser(PacketUser, CurrentPacket.data);
						break;

						case Packets.Client_SpectateFrames:
							//Spectator.sendSpectatorFrames(PacketUser, CurrentPacket.data);
						break;

						case Packets.Client_StopSpectating:
							//Spectator.stopSpectatingUser(PacketUser);
						break;

						case Packets.Client_SendPrivateMessage:
							//SendPrivateMessage(PacketUser, CurrentPacket.data);
						break;

						case Packets.Client_JoinLobby:
							//multiplayerManager.userEnterLobby(PacketUser);
						break;

						case Packets.Client_PartLobby:
							//multiplayerManager.userLeaveLobby(PacketUser);
						break;

						case Packets.Client_CreateMatch:
							await multiplayerManager.CreateMatch(PacketUser, CurrentPacket.data);
						break;

						case Packets.Client_JoinMatch:
							//multiplayerManager.joinMultiplayerMatch(PacketUser, CurrentPacket.data);
						break;

						case Packets.Client_MatchChangeSlot:
							//PacketUser.currentMatch.moveToSlot(PacketUser, CurrentPacket.data);
						break;

						case Packets.Client_MatchReady:
							//PacketUser.currentMatch.setStateReady(PacketUser);
						break;

						case Packets.Client_MatchChangeSettings:
							//await PacketUser.currentMatch.updateMatch(PacketUser, CurrentPacket.data);
						break;

						case Packets.Client_MatchNotReady:
							//PacketUser.currentMatch.setStateNotReady(PacketUser);
						break;

						case Packets.Client_PartMatch:
							//await multiplayerManager.leaveMultiplayerMatch(PacketUser);
						break;

						// Also handles user kick if the slot has a user
						case Packets.Client_MatchLock:
							//PacketUser.currentMatch.lockMatchSlot(PacketUser, CurrentPacket.data);
						break;

						case Packets.Client_MatchNoBeatmap:
							//PacketUser.currentMatch.missingBeatmap(PacketUser);
						break;

						case Packets.Client_MatchSkipRequest:
							//PacketUser.currentMatch.matchSkip(PacketUser);
						break;
						
						case Packets.Client_MatchHasBeatmap:
							//PacketUser.currentMatch.notMissingBeatmap(PacketUser);
						break;

						case Packets.Client_MatchTransferHost:
							//PacketUser.currentMatch.transferHost(PacketUser, CurrentPacket.data);
						break;

						case Packets.Client_MatchChangeMods:
							//PacketUser.currentMatch.updateMods(PacketUser, CurrentPacket.data);
						break;

						case Packets.Client_MatchStart:
							//PacketUser.currentMatch.startMatch();
						break;

						case Packets.Client_MatchLoadComplete:
							//PacketUser.currentMatch.matchPlayerLoaded(PacketUser);
						break;

						case Packets.Client_MatchComplete:
							//await PacketUser.currentMatch.onPlayerFinishMatch(PacketUser);
						break;

						case Packets.Client_MatchScoreUpdate:
							//PacketUser.currentMatch.updatePlayerScore(PacketUser, CurrentPacket.data);
						break;

						case Packets.Client_MatchFailed:
							//PacketUser.currentMatch.matchFailed(PacketUser);
						break;

						case Packets.Client_MatchChangeTeam:
							//PacketUser.currentMatch.changeTeam(PacketUser);
						break;

						case Packets.Client_ChannelJoin:
							//ChannelJoin(PacketUser, CurrentPacket.data);
						break;

						case Packets.Client_ChannelPart:
							//ChannelPart(PacketUser, CurrentPacket.data);
						break;

						case Packets.Client_SetAwayMessage:
							//SetAwayMessage(PacketUser, CurrentPacket.data);
						break;

						case Packets.Client_FriendAdd:
							//AddFriend(PacketUser, CurrentPacket.data);
						break;

						case Packets.Client_FriendRemove:
							//RemoveFriend(PacketUser, CurrentPacket.data);
						break;

						case Packets.Client_UserStatsRequest:
							UserStatsRequest(PacketUser, CurrentPacket.data);
						break;

						case Packets.Client_SpecialMatchInfoRequest:
							//TourneyMatchSpecialInfo(PacketUser, CurrentPacket.data);
						break;

						case Packets.Client_SpecialJoinMatchChannel:
							//TourneyMatchJoinChannel(PacketUser, CurrentPacket.data);
						break;

						case Packets.Client_SpecialLeaveMatchChannel:
							//TourneyMatchLeaveChannel(PacketUser, CurrentPacket.data);
						break;

						case Packets.Client_Invite:
							//MultiplayerInvite(PacketUser, CurrentPacket.data);
						break;

						case Packets.Client_UserPresenceRequest:
							UserPresence(PacketUser, PacketUser.id); // Can't really think of a way to generalize this?
						break;

						default:
							// Ignore client_beatmapInfoRequest and client_receiveUpdates
							if (CurrentPacket.id == 68 || CurrentPacket.id == 79 || CurrentPacket.id == 4) break;
							// Print out unimplemented packet
							console.dir(CurrentPacket);
						break;
					}
				}

				responseData = PacketUser.queue;
				PacketUser.clearQueue();
			} else {
				// Only do this if we're absolutely sure that we're connected to the DB
				if (DB.connected) {
					// User's token is invlid, force a reconnect
					ConsoleHelper.printBancho(`Forced client re-login (Token is invalid)`);
					responseData = "\u0005\u0000\u0000\u0004\u0000\u0000\u0000����\u0018\u0000\u0000\u0011\u0000\u0000\u0000\u000b\u000fReconnecting...";
				}
			}
		} catch (e) {
			console.error(e);
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