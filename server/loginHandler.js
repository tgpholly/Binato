const osu = require("osu-packet"),
	  User = require("./User.js"),
	  uuid = require("./util/shortUUID.js"),
	  ahttp = require("./util/AsyncHttpRequest.js"),
	  consoleHelper = require("../consoleHelper.js"),
	  // Packets
	  getUserByUsername = require("./util/getUserByUsername.js"),
	  getUserByToken = require("./util/getUserByToken.js"),
	  countryHelper = require("./countryHelper.js"),
	  loginHelper = require("./loginHelper.js"),
	  Logout = require("./Packets/Logout.js"),
	  UserPresenceBundle = require("./Packets/UserPresenceBundle.js"),
	  UserPresence = require("./Packets/UserPresence.js"),
	  StatusUpdate = require("./Packets/StatusUpdate.js");

module.exports = async function(req, res, loginInfo) {
	// Get time at the start of login
	const loginStartTime = Date.now(),
		  isTourneyClient = loginInfo.osuversion.includes("tourney");

	// Check login
	const loginCheck = await loginHelper.checkLogin(loginInfo);
	if (loginCheck != null) {
		res.removeHeader('X-Powered-By');
		res.removeHeader('Date');
		res.writeHead(200, loginCheck[1]);
		return res.end(loginCheck[0]);
	}

	// Get users IP for getting location
	// Get cloudflare requestee IP first
	let requestIP = req.get("cf-connecting-ip");

	// Get IP of requestee since we are probably behind a reverse proxy
	if (requestIP == null)
		requestIP = req.get("X-Real-IP");

	// Just get the requestee IP (we are not behind a reverse proxy)
	if (requestIP == null)
		requestIP = req.remote_addr;

	// Make sure requestIP is never null
	if (requestIP == null)
		requestIP = "";

	
	let userLocationData = [], userLocation;
	// Check if it is a local or null IP
	if (requestIP.includes("192.168.") || requestIP.includes("127.0.") || requestIP == "") {
		// Set location to null island
		userLocationData.country = "XX";
		userLocation = [0, 0];
	} else {
		// Get user's location using zxq
		userLocationData = await ahttp(`http://ip.zxq.co/${requestIP}`, "json");
		userLocation = userLocationData.loc.split(",");
	}

	// Get information about the user from the database
	const userDB = await global.DatabaseHelper.query("SELECT id FROM users_info WHERE username = ? LIMIT 1", [loginInfo.username]);

	// Create a token for the client
	const newClientToken = uuid();

	// Make sure user is not already connected, kick off if so.
	const checkForPreexistingUser = getUserByUsername(loginInfo.username);
	if (checkForPreexistingUser != null && !isTourneyClient) {
		for (let user of global.users.getIterableItems()) {
			// Log them out if they are not a tourney user
			if (!user.isTourneyUser && user.uuid != newClientToken)
				Logout(user);
		}
	}

	// Retreive the newly created user
	const NewUser = global.users.add(newClientToken, new User(userDB.id, loginInfo.username, newClientToken));
	// Set tourney client flag
	NewUser.isTourneyUser = isTourneyClient;

	// Get user's data from the database
	NewUser.updateUserInfo();

	try {
		// Save the user's location to their class for later use
		NewUser.location[0] = parseFloat(userLocation[0]);
		NewUser.location[1] = parseFloat(userLocation[1]);

		// Save the country id for the same reason as above
		NewUser.countryID = countryHelper.getCountryID(userLocationData.country);

		// We're ready to start putting together a login packet
		// Create an osu! Packet writer
		let osuPacketWriter = new osu.Bancho.Writer;

		// The reply id is the user's id in any other case than an error in which case negative numbers are used
		osuPacketWriter.LoginReply(NewUser.id);
		// Current bancho protocol version. Defined in Binato.js
		osuPacketWriter.ProtocolNegotiation(global.protocolVersion);
		// Permission level 4 is osu!supporter
		osuPacketWriter.LoginPermissions(4);

		// After sending the user their friends list send them the online users
		UserPresenceBundle(NewUser);

		// Set title screen image
		//osuPacketWriter.TitleUpdate("http://puu.sh/jh7t7/20c04029ad.png|https://osu.ppy.sh/news/123912240253");

		// Add user panel data packets
		UserPresence(NewUser, NewUser.id);
		StatusUpdate(NewUser, NewUser.id);

		// peppy pls, why
		osuPacketWriter.ChannelListingComplete();

		// Add user to #osu
		osuPacketWriter.ChannelJoinSuccess("#osu");
		if (!global.StreamsHandler.isUserInStream("#osu", NewUser.uuid))
			global.StreamsHandler.addUserToStream("#osu", NewUser.uuid);

		// List all channels out to the client
		for (let i = 0; i < global.channels.length; i++) {
			osuPacketWriter.ChannelAvailable({
				channelName: global.channels[i].channelName,
				channelTopic: global.channels[i].channelTopic,
				channelUserCount: global.channels[i].channelUserCount
			});
		}

		// Construct user's friends list
		const userFriends = await global.DatabaseHelper.query("SELECT friendsWith FROM friends WHERE user = ?", [NewUser.id]);
		let friendsArray = [];
		for (let i = 0; i < userFriends.length; i++) {
			friendsArray.push(userFriends[i].friendsWith);
		}
		// Send user's friends list
		osuPacketWriter.FriendsList(friendsArray);

		osuPacketWriter.Announce(`Welcome back ${loginInfo.username}!`);

		res.removeHeader('X-Powered-By');
		res.removeHeader('Date');
		// Complete login
		res.writeHead(200, {
			"cho-token": NewUser.uuid,
			"Connection": "keep-alive",
			"Keep-Alive": "timeout=5, max=100",
		});
		res.end(osuPacketWriter.toBuffer, () => {
			consoleHelper.printBancho(`User login finished, took ${Date.now() - loginStartTime}ms. [User: ${loginInfo.username}]`);
		});
	} catch (err) {
		console.error(err);
	}
}