const osu = require("osu-packet"),
      packetIDs = require("./packetIDs.json"),
      loginHandler = require("./loginHandler.js"),
      parseUserData = require("./util/parseUserData.js"),
      userManager = require("./userManager.js"),
      User = require("./User.js"),
      bakedResponses = require("./bakedResponses.js"),
      Streams = require("./Streams.js");

global.users = [
    new User(3, "BeanchoBot", "BeanchoBot", new Date().getTime())
];

// Start a loop that gets new data for users from the database for use on the user panel
setInterval(() => {
    for (let i = 0; i < global.users.length; i++) {
        const User = global.users[i];
        if (User.id == 3) continue; // Ignore the bot
                                    // Bot: :(

        User.getNewUserInformationFromDatabase();
    }
}, 10000);

// Set the bot's position on the map
global.users[0].location[0] = 50;
global.users[0].location[1] = -32;

// An array containing all currently active multiplayer matches
global.matches = [];
// An array containing the last 15 messages in chat
// TODO: Bother making this
global.chatHistory = [];
global.StreamsHandler = new Streams();

// An array containing all chat channels
// TODO: Send user chat channels and not have osu! crash
global.channels = [
    { channelName:"#osu", channelTopic:"The main channel", channelUserCount: 0 },
    { channelName:"#userlog", channelTopic:"Log about stuff doing go on yes very", channelUserCount: 0 },
    { channelName:"#lobby", channelTopic:"Talk about multiplayer stuff", channelUserCount: 0 },
    { channelName:"#english", channelTopic:"Talk in exclusively English", channelUserCount: 0 },
    { channelName:"#japanese", channelTopic:"Talk in exclusively Japanese", channelUserCount: 0 },
];

// Create a stream for each chat channel
for (let i = 0; i < global.channels.length; i++) {
    global.StreamsHandler.addStream(global.channels[i].channelName, false);
}

// Add a stream for the multiplayer lobby
global.StreamsHandler.addStream("multiplayer_lobby", false);

// Start stream checking interval
global.StreamsHandler.streamChecker(5000);

// Include packets
const ChangeAction = require("./Packets/ChangeAction.js"),
      SendPublicMessage = require("./Packets/SendPublicMessage.js"),
      Logout = require("./Packets/Logout.js"),
      Spectator = require("./Spectator.js"),
      Multiplayer = require("./Multiplayer.js"),
      ChannelPart = require("./Packets/ChannelPart.js"),
      UserPresenceBundle = require("./Packets/UserPresenceBundle.js"),
      UserPresence = require("./Packets/UserPresence.js"),
      UserStatsRequest = require("./Packets/UserStatsRequest.js");

module.exports = function(req, res) {
    // Get the client's token string and request data
    const requestTokenString = req.header("osu-token"),
          requestData = req.packet;
    
    // Server's response & new client token
    let responseTokenString = "",
        responseData = new Buffer.alloc(0);

    // Check if the user is logged in
    if (requestTokenString == null) {
        // Client doesn't have a token yet, let's auth them!
        const userData = parseUserData(requestData);
        global.consoleHelper.printBancho(`New client connection. [User: ${userData.username}]`);
        loginHandler(req, res, userData);
    } else {
        // Client has a token, let's see what they want.
        try {
            // Get the current user
            const userClass = userManager.getUserFromToken(requestTokenString);

            // Make sure the client's token isn't invalid
            if (userClass != null) {
                // Create a new osu! packet reader
                const osuPacketReader = new osu.Client.Reader(requestData);
                // Parse current bancho packet
                const PacketData = osuPacketReader.Parse();
                // Loop through parsed packet data
                for (let i = 0; i < PacketData.length; i++) {
                    // Get current packet
                    let CurrentPacket = PacketData[i];
                    
                    // Create a new bancho packet writer per packet
                    const osuPacketWriter = new osu.Bancho.Writer;

                    switch (CurrentPacket.id) {
                        case packetIDs.client_changeAction:
                            ChangeAction(userClass, CurrentPacket.data);
                        break;

                        case packetIDs.client_sendPublicMessage:
                            SendPublicMessage(CurrentPacket, userClass);
                        break;

                        case packetIDs.client_logout:
                            Logout(userClass);
                        break;

                        case packetIDs.client_requestStatusUpdate:
                            UserPresenceBundle(userClass);
                        break;

                        case packetIDs.client_pong:
                        break;

                        case packetIDs.client_startSpectating:
                            Spectator.startSpectatingUser(CurrentPacket.data, userClass);
                        break;

                        case packetIDs.client_spectateFrames:
                            Spectator.sendSpectatorFrames(userClass, CurrentPacket.data);
                        break;

                        case packetIDs.client_stopSpectating:
                            Spectator.stopSpectatingUser(userClass);
                        break;

                        case packetIDs.client_joinLobby:
                            Multiplayer.userEnterLobby(userClass);
                        break;

                        case packetIDs.client_createMatch:
                            Multiplayer.createMultiplayerMatch(userClass, CurrentPacket.data);
                        break;

                        case packetIDs.client_joinMatch:
                            Multiplayer.joinMultiplayerMatch(userClass, CurrentPacket.data);
                        break;

                        case packetIDs.client_matchChangeSlot:
                            Multiplayer.moveToSlot(userClass, CurrentPacket.data);
                        break;

                        case packetIDs.client_matchReady:
                            Multiplayer.setReadyState(userClass, true);
                        break;

                        case packetIDs.client_matchChangeSettings:
                            Multiplayer.updateMatch(userClass, CurrentPacket.data);
                        break;

                        case packetIDs.client_matchNotReady:
                            Multiplayer.setReadyState(userClass, false);
                        break;

                        case packetIDs.client_partMatch:
                            Multiplayer.leaveMatch(userClass);
                        break;

                        case packetIDs.client_matchLock: // Also handles user kick
                            Multiplayer.kickPlayer(userClass, CurrentPacket.data);
                        break;

                        case packetIDs.client_matchNoBeatmap:
                            Multiplayer.missingBeatmap(userClass, true);
                        break;

                        case packetIDs.client_matchHasBeatmap:
                            Multiplayer.missingBeatmap(userClass, false);
                        break;

                        case packetIDs.client_matchTransferHost:
                            Multiplayer.transferHost(userClass, CurrentPacket.data);
                        break;

                        case packetIDs.client_matchChangeMods:
                            Multiplayer.updateMods(userClass, CurrentPacket.data);
                        break;

                        case packetIDs.client_matchStart:
                            Multiplayer.startMatch(userClass);
                        break;

                        case packetIDs.client_matchLoadComplete:
                            Multiplayer.setPlayerLoaded(userClass);
                        break;

                        case packetIDs.client_matchComplete:
                            Multiplayer.onPlayerFinishMatch(userClass);
                        break;

                        case packetIDs.client_matchScoreUpdate:
                            Multiplayer.updatePlayerScore(userClass, CurrentPacket.data);
                        break;

                        case packetIDs.client_matchFailed:
                        break;

                        case packetIDs.client_channelJoin:
                            // TODO: Implement user channel joining
                            //       Auto channel joining is already complete
                        break;

                        case packetIDs.client_channelPart:
                            ChannelPart(userClass, CurrentPacket.data);
                        break;

                        case packetIDs.client_userStatsRequest:
                            UserStatsRequest(userClass, CurrentPacket.data);
                        break;

                        case packetIDs.client_userPresenceRequest:
                            UserPresence(userClass, userClass.id);
                        break;

                        default:
                            // Ignore client_beatmapInfoRequest and client_receiveUpdates
                            if (CurrentPacket.id == 68 || CurrentPacket.id == 79) break;
                            // Print out unimplemented packet
                            console.dir(CurrentPacket);
                        break;
                    }

                    // Put current user queue into response data
                    responseData = Buffer.concat([responseData, userClass.queue], responseData.length + userClass.queue.length);
                    userClass.clearQueue();
                }
            } else {
                // User's token is invlid, force a reconnect
                global.consoleHelper.printBancho(`Forced client re-login (Token is invalid)`);
                responseData = bakedResponses("reconnect");
            }
        } catch (e) {
            console.error(e);
        } finally {
            // Send the prepared packet to the client
            res.writeHead(200, {
                "cho-protocol": 19,
                "Connection": "keep-alive",
                "Keep-Alive": "timeout=5, max=100",
                "Content-Type": "text/html; charset=UTF-8"
            });
            res.end(responseData);
        }
    }
};