const osu = require("osu-packet"),
      User = require("./User.js"),
      { v4: uuid } = require('uuid'),
      request = require("sync-request"),
      
      DatabaseHelper = require("./DatabaseHelper.js"),
      getUserByUsername = require("./util/getUserByUsername.js"),
      getUserByToken = require("./util/getUserByToken.js"),
      countryHelper = require("./countryHelper.js"),
      loginHelper = require("./loginHelper.js");

module.exports = function(req, res, loginInfo) {
    // Get time at the start of login
    const loginStartTime = new Date().getTime();

    // Check login
    const loginCheck = loginHelper.checkLogin(loginInfo);
    if (loginCheck != null) {
        res.writeHead(200, loginCheck[1]);
        return res.end(loginCheck[0]);
    }

    // Get users IP for getting location
    let requestIP = req.get('X-Real-IP');
    if (requestIP == null) {
        requestIP = req.remote_addr;
    }
    
    let userLocationData = [], userLocation;
    // Check if it is a local IP
    if (`${requestIP}`.includes("192.168.")) {
        userLocationData.country = "GB"; // My country
        userLocation = [53, -2]; // My rough location lol
    } else {
        // Get user's location from zxq
        userLocationData = JSON.parse(request("GET", `http://ip.zxq.co/${requestIP}`).getBody());
        userLocation = userLocationData.loc.split(",");
    }

    // Get information about the user from the database
    const userDB = DatabaseHelper.getFromDB(`SELECT id FROM users_info WHERE username = "${loginInfo.username}" LIMIT 1`);

    // Create a token for the client
    const newClientToken = uuid();

    // Make sure user is not already connected, kick off if so.
    const checkForPreexistingUser = getUserByUsername(loginInfo.username);
    if (checkForPreexistingUser != null) {
        if (checkForPreexistingUser.uuid != newClientToken) {
            let userCurrentIndex;
            // Find the index that the user's class is at
            for (let i = 0; i < global.users.length; i++) {
                if (checkForPreexistingUser.uuid == global.users[i].uuid) {
                    userCurrentIndex = i;
                    break;
                }
            }

            global.users.splice(userCurrentIndex, 1);
        }
    }

    // Create user object
    global.users.push(new User(userDB.id, loginInfo.username, newClientToken, new Date().getTime()));

    // Retreive the newly created user
    const userClass = getUserByToken(newClientToken);

    // Get user's data from the database
    userClass.getNewUserInformationFromDatabase();

    try {
        // Save the user's location to their class for later use
        userClass.location[0] = parseFloat(userLocation[0]);
        userClass.location[1] = parseFloat(userLocation[1]);

        // Save the country id for the same reason as above
        userClass.countryID = countryHelper.getCountryID(userLocationData.country);

        // We're ready to start putting together a login packet
        // Create an osu! Packet writer
        let osuPacketWriter = new osu.Bancho.Writer;

        // The reply id is the user's id in any other case than an error in which case negative numbers are used
        osuPacketWriter.LoginReply(userClass.id);
        // Current bancho protocol version is 19
        osuPacketWriter.ProtocolNegotiation(19);
        // Permission level 4 is osu!supporter
        osuPacketWriter.LoginPermissions(4);
        // Construct user's friends list
        const userFriends = DatabaseHelper.getListFromDB(`SELECT friendsWith FROM friends WHERE user = ${userClass.id}`);
        let friendsArray = [];
        for (let i = 0; i < userFriends.length; i++) {
            friendsArray.push(userFriends[i].friendsWith);
        }
        // Send user's friends list
        osuPacketWriter.FriendsList(friendsArray);
        // Set title screen image
        osuPacketWriter.TitleUpdate("http://puu.sh/jh7t7/20c04029ad.png|https://osu.ppy.sh/news/123912240253");

        // Construct user panel data
        const presenceObject = {
            userId: userClass.id,
            username: userClass.username,
            timezone: 0,
            countryId: userClass.countryID,
            permissions: 4,
            longitude: userClass.location[1],
            latitude: userClass.location[0],
            rank: userClass.rank
        };

        const statusObject = {
            userId: userClass.id,
            status: userClass.actionID,
            statusText: userClass.actionText,
            beatmapChecksum: userClass.beatmapChecksum,
            currentMods: userClass.currentMods,
            playMode: userClass.playMode,
            beatmapId: userClass.beatmapID,
            rankedScore: userClass.rankedScore,
            accuracy: userClass.accuracy / 100, // Scale of 0 to 1
            playCount: userClass.playCount,
            totalScore: userClass.totalScore,
            rank: userClass.rank, 
            performance: userClass.pp
        };

        // Add user panel data packets
        osuPacketWriter.UserPresence(presenceObject);
        osuPacketWriter.HandleOsuUpdate(statusObject);

        // peppy pls, why
        osuPacketWriter.ChannelListingComplete();

        // Add user to chat channels
        osuPacketWriter.ChannelJoinSuccess("#osu");
        if (!global.StreamsHandler.isUserInStream("#osu", userClass.id))
            global.StreamsHandler.addUserToStream("#osu", userClass.id);

        osuPacketWriter.ChannelJoinSuccess("#userlog");
        if (!global.StreamsHandler.isUserInStream("#userlog", userClass.id))
            global.StreamsHandler.addUserToStream("#userlog", userClass.id);

        // List all channels out to the client
        //for (let i = 0; i < global.channels.length; i++) {
        //    osuPacketWriter.ChannelAvailable(global.channels[i]);
        //}

        osuPacketWriter.Announce(`Welcome back ${loginInfo.username}!`);

        // Complete login
        res.writeHead(200, {
            "cho-token": userClass.uuid,
            "cho-protocol": 19,
            "Connection": "keep-alive",
            "Keep-Alive": "timeout=5, max=100",
            "Content-Type": "text/html; charset=UTF-8"
        });
        res.end(osuPacketWriter.toBuffer, () => {
            global.consoleHelper.printBancho(`User login finished, took ${new Date().getTime() - loginStartTime}ms. [User: ${loginInfo.username}]`);
        });
    } catch (err) {
        console.error(err);
    }
}