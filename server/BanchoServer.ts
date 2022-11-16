import * as osu from "osu-packet";
import { ConsoleHelper } from "../ConsoleHelper";
import { Packets } from "./enums/Packets";

const 
	  loginHandler = require("./loginHandler.js"),
	  parseUserData = require("./util/parseUserData.js"),
	  User = require("./User.js"),
	  getUserFromToken = require("./util/getUserByToken.js"),
	  getUserById = require("./util/getUserById.js"),
	  bakedResponses = require("./bakedResponses.js"),
	  Streams = require("./Streams.js"),
	  DatabaseHelperClass = require("./DatabaseHelper.js"),
	  funkyArray = require("./util/funkyArray.js"),
	  config = require("../config.json");

// Users funkyArray for session storage
global.users = new funkyArray();

// Add the bot user
global.botUser = global.users.add("bot", new User(3, "SillyBot", "bot"));
// Set the bot's position on the map
global.botUser.location[0] = 50;
global.botUser.location[1] = -32;

global.DatabaseHelper = new DatabaseHelperClass(config.database.address, config.database.port, config.database.username, config.database.password, config.database.name, async () => {
	// Close any unclosed db matches on startup
	global.DatabaseHelper.query("UPDATE mp_matches SET close_time = UNIX_TIMESTAMP() WHERE close_time IS NULL");
	global.DatabaseHelper.query("UPDATE osu_info SET value = 0 WHERE name = 'online_now'");
});

async function subscribeToChannel(channelName = "", callback = function(message = "") {})  {
	// Dup and connect new client for channel subscription (required)
	const subscriptionClient = global.promClient.duplicate();
	await subscriptionClient.connect();
	// Subscribe to channel
	await subscriptionClient.subscribe(channelName, callback);
	ConsoleHelper.printRedis(`Subscribed to ${channelName} channel`);
}

// Do redis if it's enabled
if (config.redis.enabled) {
	(async () => {
		const { createClient } = require("redis");
		global.promClient = createClient({
			url: `redis://${config.redis.password.replaceAll(" ", "") == "" ? "" : `${config.redis.password}@`}${config.redis.address}:${config.redis.port}/${config.redis.database}`
		});

		global.promClient.on('error', e => consoleHelper.printRedis(e));

		const connectionStartTime = Date.now();
		await global.promClient.connect();
		consoleHelper.printRedis(`Connected to redis server. Took ${Date.now() - connectionStartTime}ms`);

		// Score submit update channel
		subscribeToChannel("binato:update_user_stats", (message) => {
			const user = getUserById(parseInt(message));
			// Update user info
			user.updateUserInfo(true);

			consoleHelper.printRedis(`Score submission stats update request received for ${user.username}`);
		});
	})();
} else consoleHelper.printWarn("Redis is disabled!");

// User timeout interval
setInterval(() => {
	for (let User of global.users.getIterableItems()) {
		if (User.id == 3) continue; // Ignore the bot
									// Bot: :(

		// Logout this user, they're clearly gone.
		if (Date.now() >= User.timeoutTime)
			Logout(User);
	}
}, 10000);

// An array containing the last 15 messages in chat
global.chatHistory = [];
global.addChatMessage = function(msg) {
	if (global.chatHistory.length == 15) {
		global.chatHistory.splice(0, 1);
		global.chatHistory.push(msg);
	} else {
		global.chatHistory.push(msg);
	}
}

// Init stream class
Streams.init();

// An array containing all chat channels
global.channels = [
	{ channelName:"#osu", channelTopic:"The main channel", channelUserCount: 0, locked: false },
	{ channelName:"#userlog", channelTopic:"Log about stuff doing go on yes very", channelUserCount: 0, locked: false },
	{ channelName:"#lobby", channelTopic:"Talk about multiplayer stuff", channelUserCount: 0, locked: false },
	{ channelName:"#english", channelTopic:"Talk in exclusively English", channelUserCount: 0, locked: false },
	{ channelName:"#japanese", channelTopic:"Talk in exclusively Japanese", channelUserCount: 0, locked: false },
];

// Create a stream for each chat channel
for (let i = 0; i < global.channels.length; i++) {
	Streams.addStream(global.channels[i].channelName, false);
}

// Add a stream for the multiplayer lobby
Streams.addStream("multiplayer_lobby", false);

// Include packets
const ChangeAction = require("./Packets/ChangeAction.js"),
	  SendPublicMessage = require("./Packets/SendPublicMessage.js"),
	  Logout = require("./Packets/Logout.js"),
	  Spectator = require("./Spectator.js"),
	  SendPrivateMessage = require("./Packets/SendPrivateMessage.js"),
	  MultiplayerManager = require("./MultiplayerManager.js"),
	  SetAwayMessage = require("./Packets/SetAwayMessage.js"),
	  ChannelJoin = require("./Packets/ChannelJoin.js"),
	  ChannelPart = require("./Packets/ChannelPart.js"),
	  AddFriend = require("./Packets/AddFriend.js"),
	  RemoveFriend = require("./Packets/RemoveFriend.js"),
	  UserPresenceBundle = require("./Packets/UserPresenceBundle.js"),
	  UserPresence = require("./Packets/UserPresence.js"),
	  UserStatsRequest = require("./Packets/UserStatsRequest.js"),
	  MultiplayerInvite = require("./Packets/MultiplayerInvite.js"),
	  TourneyMatchSpecialInfo = require("./Packets/TourneyMatchSpecialInfo.js"),
	  TourneyMatchJoinChannel = require("./Packets/TourneyMatchSpecialInfo.js"),
	  TourneyMatchLeaveChannel = require("./Packets/TourneyLeaveMatchChannel.js");

// A class for managing everything multiplayer
global.MultiplayerManager = new MultiplayerManager();

module.exports = async function(req, res, packet:Buffer) {
	// Get the client's token string and request data
	const requestTokenString:string = req.header("osu-token"),
		  requestData:Buffer = packet;
	
	// Server's response
	let responseData:Buffer;

	// Check if the user is logged in
	if (requestTokenString == null) {
		// Client doesn't have a token yet, let's auth them!
		const userData = parseUserData(requestData);
		ConsoleHelper.printBancho(`New client connection. [User: ${userData.username}]`);
		await loginHandler(req, res, userData);
	} else {
		// Client has a token, let's see what they want.
		try {
			// Get the current user
			const PacketUser:User = getUserFromToken(requestTokenString);

			// Make sure the client's token isn't invalid
			if (PacketUser != null) {
				// Update the session timeout time
				PacketUser.timeoutTime = Date.now() + 60000;

				// Create a new osu! packet reader
				const osuPacketReader = new osu.Client.Reader(requestData);
				// Parse current bancho packet
				const PacketData = osuPacketReader.Parse();

				// Go through each packet sent by the client
				for (CurrentPacket of PacketData) {
					switch (CurrentPacket.id) {
						case Packets.Client_ChangeAction:
							ChangeAction(PacketUser, CurrentPacket.data);
						break;

						case Packets.Client_SendPublicMessage:
							SendPublicMessage(PacketUser, CurrentPacket.data);
						break;

						case Packets.Client_Logout:
							await Logout(PacketUser);
						break;

						case Packets.Client_RequestStatusUpdate:
							UserPresenceBundle(PacketUser);
						break;

						case Packets.Client_StartSpectating:
							Spectator.startSpectatingUser(PacketUser, CurrentPacket.data);
						break;

						case Packets.Client_SpectateFrames:
							Spectator.sendSpectatorFrames(PacketUser, CurrentPacket.data);
						break;

						case Packets.Client_StopSpectating:
							Spectator.stopSpectatingUser(PacketUser);
						break;

						case Packets.client_sendPrivateMessage:
							SendPrivateMessage(PacketUser, CurrentPacket.data);
						break;

						case Packets.client_joinLobby:
							global.MultiplayerManager.userEnterLobby(PacketUser);
						break;

						case Packets.client_partLobby:
							global.MultiplayerManager.userLeaveLobby(PacketUser);
						break;

						case Packets.client_createMatch:
							await global.MultiplayerManager.createMultiplayerMatch(PacketUser, CurrentPacket.data);
						break;

						case Packets.client_joinMatch:
							global.MultiplayerManager.joinMultiplayerMatch(PacketUser, CurrentPacket.data);
						break;

						case Packets.client_matchChangeSlot:
							PacketUser.currentMatch.moveToSlot(PacketUser, CurrentPacket.data);
						break;

						case Packets.client_matchReady:
							PacketUser.currentMatch.setStateReady(PacketUser);
						break;

						case Packets.client_matchChangeSettings:
							await PacketUser.currentMatch.updateMatch(PacketUser, CurrentPacket.data);
						break;

						case Packets.client_matchNotReady:
							PacketUser.currentMatch.setStateNotReady(PacketUser);
						break;

						case Packets.client_partMatch:
							await global.MultiplayerManager.leaveMultiplayerMatch(PacketUser);
						break;

						// Also handles user kick if the slot has a user
						case Packets.client_matchLock:
							PacketUser.currentMatch.lockMatchSlot(PacketUser, CurrentPacket.data);
						break;

						case Packets.client_matchNoBeatmap:
							PacketUser.currentMatch.missingBeatmap(PacketUser);
						break;

						case Packets.client_matchSkipRequest:
							PacketUser.currentMatch.matchSkip(PacketUser);
						break;
						
						case Packets.client_matchHasBeatmap:
							PacketUser.currentMatch.notMissingBeatmap(PacketUser);
						break;

						case Packets.client_matchTransferHost:
							PacketUser.currentMatch.transferHost(PacketUser, CurrentPacket.data);
						break;

						case Packets.client_matchChangeMods:
							PacketUser.currentMatch.updateMods(PacketUser, CurrentPacket.data);
						break;

						case Packets.client_matchStart:
							PacketUser.currentMatch.startMatch();
						break;

						case Packets.client_matchLoadComplete:
							PacketUser.currentMatch.matchPlayerLoaded(PacketUser);
						break;

						case Packets.client_matchComplete:
							await PacketUser.currentMatch.onPlayerFinishMatch(PacketUser);
						break;

						case Packets.client_matchScoreUpdate:
							PacketUser.currentMatch.updatePlayerScore(PacketUser, CurrentPacket.data);
						break;

						case Packets.client_matchFailed:
							PacketUser.currentMatch.matchFailed(PacketUser);
						break;

						case Packets.client_matchChangeTeam:
							PacketUser.currentMatch.changeTeam(PacketUser);
						break;

						case Packets.client_channelJoin:
							ChannelJoin(PacketUser, CurrentPacket.data);
						break;

						case Packets.client_channelPart:
							ChannelPart(PacketUser, CurrentPacket.data);
						break;

						case Packets.client_setAwayMessage:
							SetAwayMessage(PacketUser, CurrentPacket.data);
						break;

						case Packets.client_friendAdd:
							AddFriend(PacketUser, CurrentPacket.data);
						break;

						case Packets.client_friendRemove:
							RemoveFriend(PacketUser, CurrentPacket.data);
						break;

						case Packets.client_userStatsRequest:
							UserStatsRequest(PacketUser, CurrentPacket.data);
						break;

						case Packets.client_specialMatchInfoRequest:
							TourneyMatchSpecialInfo(PacketUser, CurrentPacket.data);
						break;

						case Packets.client_specialJoinMatchChannel:
							TourneyMatchJoinChannel(PacketUser, CurrentPacket.data);
						break;

						case Packets.client_specialLeaveMatchChannel:
							TourneyMatchLeaveChannel(PacketUser, CurrentPacket.data);
						break;

						case Packets.client_invite:
							MultiplayerInvite(PacketUser, CurrentPacket.data);
						break;

						case Packets.client_userPresenceRequest:
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
				// User's token is invlid, force a reconnect
				consoleHelper.printBancho(`Forced client re-login (Token is invalid)`);
				responseData = bakedResponses("reconnect");
			}
		} catch (e) {
			console.error(e);
		} finally {
			// Only send the headers that we absolutely have to
			res.removeHeader('X-Powered-By');
			res.removeHeader('Date');
			res.writeHead(200, {
				"Connection": "keep-alive",
				"Keep-Alive": "timeout=5, max=100",
			});
			// Send the prepared packet(s) to the client
			res.end(responseData);
		}
	}
};