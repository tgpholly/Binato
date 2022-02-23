const osu = require("osu-packet"),
	  fs = require("fs"),
	  consoleHelper = require("../consoleHelper.js"),
	  packetIDs = require("./packetIDs.js"),
	  loginHandler = require("./loginHandler.js"),
	  parseUserData = require("./util/parseUserData.js"),
	  User = require("./User.js"),
	  getUserFromToken = require("./util/getUserByToken.js"),
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

global.DatabaseHelper = new DatabaseHelperClass(config.databaseAddress, config.databasePort, config.databaseUsername, config.databasePassword, config.databaseName);

// Start a loop that gets new data for users from the database for use on the user panel
// TODO: Some way of informing bancho that a user has set a score so details can be pulled down quickly
//       Possible solution, TCP socket between the score submit server and bancho? redis? (score submit is on a different server, redis probably wouldn't work)
setInterval(() => {
	for (let User of global.users.getIterableItems()) {
		if (User.id == 3) continue; // Ignore the bot
									// Bot: :(

		// Logout this user, they're clearly gone.
		if (Date.now() >= User.timeoutTime)
			Logout(User);
		
		// The user is still here
		else
			User.getNewUserInformationFromDatabase();
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

global.StreamsHandler = new Streams();

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
	global.StreamsHandler.addStream(global.channels[i].channelName, false);
}

// Add a stream for the multiplayer lobby
global.StreamsHandler.addStream("multiplayer_lobby", false);

if (!fs.existsSync("tHMM.ds")) fs.writeFileSync("tHMM.ds", "0");
global.totalHistoricalMultiplayerMatches = parseInt(fs.readFileSync("tHMM.ds").toString());
global.getAndAddToHistoricalMultiplayerMatches = function() {
	global.totalHistoricalMultiplayerMatches++;
	fs.writeFile("tHMM.ds", `${global.totalHistoricalMultiplayerMatches}`, () => {});
	return global.totalHistoricalMultiplayerMatches;
}

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

module.exports = async function(req, res) {
	// Get the client's token string and request data
	const requestTokenString = req.header("osu-token"),
		  requestData = req.packet;
	
	// Server's response
	let responseData;

	// Check if the user is logged in
	if (requestTokenString == null) {
		// Client doesn't have a token yet, let's auth them!
		const userData = parseUserData(requestData);
		consoleHelper.printBancho(`New client connection. [User: ${userData.username}]`);
		await loginHandler(req, res, userData);
	} else {
		// Client has a token, let's see what they want.
		try {
			// Get the current user
			const PacketUser = getUserFromToken(requestTokenString);

			// Make sure the client's token isn't invalid
			if (PacketUser != null) {
				// Update the session timeout time
				PacketUser.timeoutTime = Date.now() + 60000;

				// Create a new osu! packet reader
				const osuPacketReader = new osu.Client.Reader(requestData);
				// Parse current bancho packet
				const PacketData = osuPacketReader.Parse();

				// Go through each packet sent by the client
				PacketData.forEach(CurrentPacket => {
					switch (CurrentPacket.id) {
						case packetIDs.client_changeAction:
							ChangeAction(PacketUser, CurrentPacket.data);
						break;

						case packetIDs.client_sendPublicMessage:
							SendPublicMessage(PacketUser, CurrentPacket.data);
						break;

						case packetIDs.client_logout:
							Logout(PacketUser);
						break;

						case packetIDs.client_requestStatusUpdate:
							UserPresenceBundle(PacketUser);
						break;

						case packetIDs.client_pong: // Pretty sure this is just a client ping
													// so we probably don't do anything here
						break;                      // It's probably just the client wanting to pull data down. (That's exactly what it is)

						case packetIDs.client_startSpectating:
							Spectator.startSpectatingUser(PacketUser, CurrentPacket.data);
						break;

						case packetIDs.client_spectateFrames:
							Spectator.sendSpectatorFrames(PacketUser, CurrentPacket.data);
						break;

						case packetIDs.client_stopSpectating:
							Spectator.stopSpectatingUser(PacketUser);
						break;

						case packetIDs.client_sendPrivateMessage:
							SendPrivateMessage(PacketUser, CurrentPacket.data);
						break;

						case packetIDs.client_joinLobby:
							global.MultiplayerManager.userEnterLobby(PacketUser);
						break;

						case packetIDs.client_partLobby:
							global.MultiplayerManager.userLeaveLobby(PacketUser);
						break;

						case packetIDs.client_createMatch:
							global.MultiplayerManager.createMultiplayerMatch(PacketUser, CurrentPacket.data);
						break;

						case packetIDs.client_joinMatch:
							global.MultiplayerManager.joinMultiplayerMatch(PacketUser, CurrentPacket.data);
						break;

						case packetIDs.client_matchChangeSlot:
							PacketUser.currentMatch.moveToSlot(PacketUser, CurrentPacket.data);
						break;

						case packetIDs.client_matchReady:
							PacketUser.currentMatch.setStateReady(PacketUser);
						break;

						case packetIDs.client_matchChangeSettings:
							PacketUser.currentMatch.updateMatch(PacketUser, CurrentPacket.data);
						break;

						case packetIDs.client_matchNotReady:
							PacketUser.currentMatch.setStateNotReady(PacketUser);
						break;

						case packetIDs.client_partMatch:
							global.MultiplayerManager.leaveMultiplayerMatch(PacketUser);
						break;

						// Also handles user kick if the slot has a user
						case packetIDs.client_matchLock:
							PacketUser.currentMatch.lockMatchSlot(PacketUser, CurrentPacket.data);
						break;

						case packetIDs.client_matchNoBeatmap:
							PacketUser.currentMatch.missingBeatmap(PacketUser);
						break;

						case packetIDs.client_matchSkipRequest:
							PacketUser.currentMatch.matchSkip(PacketUser);
						break;
						
						case packetIDs.client_matchHasBeatmap:
							PacketUser.currentMatch.notMissingBeatmap(PacketUser);
						break;

						case packetIDs.client_matchTransferHost:
							PacketUser.currentMatch.transferHost(PacketUser, CurrentPacket.data);
						break;

						case packetIDs.client_matchChangeMods:
							PacketUser.currentMatch.updateMods(PacketUser, CurrentPacket.data);
						break;

						case packetIDs.client_matchStart:
							PacketUser.currentMatch.startMatch();
						break;

						case packetIDs.client_matchLoadComplete:
							PacketUser.currentMatch.matchPlayerLoaded(PacketUser);
						break;

						case packetIDs.client_matchComplete:
							PacketUser.currentMatch.onPlayerFinishMatch(PacketUser);
						break;

						case packetIDs.client_matchScoreUpdate:
							PacketUser.currentMatch.updatePlayerScore(PacketUser, CurrentPacket.data);
						break;

						case packetIDs.client_matchFailed:
							PacketUser.currentMatch.matchFailed(PacketUser);
						break;

						case packetIDs.client_matchChangeTeam:
							PacketUser.currentMatch.changeTeam(PacketUser);
						break;

						case packetIDs.client_channelJoin:
							ChannelJoin(PacketUser, CurrentPacket.data);
						break;

						case packetIDs.client_channelPart:
							ChannelPart(PacketUser, CurrentPacket.data);
						break;

						case packetIDs.client_setAwayMessage:
							SetAwayMessage(PacketUser, CurrentPacket.data);
						break;

						case packetIDs.client_friendAdd:
							AddFriend(PacketUser, CurrentPacket.data);
						break;

						case packetIDs.client_friendRemove:
							RemoveFriend(PacketUser, CurrentPacket.data);
						break;

						case packetIDs.client_userStatsRequest:
							UserStatsRequest(PacketUser, CurrentPacket.data);
						break;

						case packetIDs.client_specialMatchInfoRequest:
							TourneyMatchSpecialInfo(PacketUser, CurrentPacket.data);
						break;

						case packetIDs.client_specialJoinMatchChannel:
							TourneyMatchJoinChannel(PacketUser, CurrentPacket.data);
						break;

						case packetIDs.client_specialLeaveMatchChannel:
							TourneyMatchLeaveChannel(PacketUser, CurrentPacket.data);
						break;

						case packetIDs.client_invite:
							MultiplayerInvite(PacketUser, CurrentPacket.data);
						break;

						case packetIDs.client_userPresenceRequest:
							UserPresence(PacketUser, PacketUser.id); // Can't really think of a way to generalize this?
						break;

						default:
							// Ignore client_beatmapInfoRequest and client_receiveUpdates
							if (CurrentPacket.id == 68 || CurrentPacket.id == 79) break;
							// Print out unimplemented packet
							console.dir(CurrentPacket);
						break;
					}
				});

				responseData = PacketUser.queue
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
				"cho-protocol": global.protocolVersion,
				// Nice to have :)
				"Connection": "keep-alive",
				"Keep-Alive": "timeout=5, max=100",
			});
			// Send the prepared packet(s) to the client
			res.end(responseData);
		}
	}
};
