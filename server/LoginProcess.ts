import { ConsoleHelper } from "../ConsoleHelper";
import { Database } from "./objects/Database";
import fetch from "node-fetch";
import { getCountryID } from "./Country";
import { generateSession } from "./Util";
import { LatLng } from "./objects/LatLng";
import { LoginInfo } from "./objects/LoginInfo";
import { Logout } from "./packets/Logout";
import { pbkdf2 } from "crypto";
import { readFileSync } from "fs";
import { Request, Response } from "express";
import { UserArray } from "./objects/UserArray";
import { User } from "./objects/User";
import { DataStreamArray } from "./objects/DataStreamArray";
import { ChatManager } from "./ChatManager";
import { UserPresenceBundle } from "./packets/UserPresenceBundle";
import { UserPresence } from "./packets/UserPresence";
import { StatusUpdate } from "./packets/StatusUpdate";
const config:any = JSON.parse(readFileSync("./config.json").toString());
const { decrypt: aesDecrypt } = require("aes256");
const osu = require("osu-packet");

function incorrectLoginResponse() {
	const osuPacketWriter = new osu.Bancho.Writer;
	osuPacketWriter.LoginReply(-1);
	return [
		osuPacketWriter.toBuffer,
		{
			'cho-protocol': 19,
			'Connection': 'keep-alive',
			'Keep-Alive': 'timeout=5, max=100',
		}
	];
}

function requiredPWChangeResponse() {
	const osuPacketWriter = new osu.Bancho.Writer;
	osuPacketWriter.Announce("As part of migration to a new password system you are required to change your password. Please log in on the website and change your password.");
	osuPacketWriter.LoginReply(-1);
	return [
		osuPacketWriter.toBuffer,
		{
			'cho-protocol': 19,
			'Connection': 'keep-alive',
			'Keep-Alive': 'timeout=5, max=100',
		}
	];
}

enum LoginTypes {
	CURRENT,
	OLD_MD5,
	OLD_AES
}

function TestLogin(loginInfo:LoginInfo | undefined, database:Database) {
	return new Promise(async (resolve, reject) => {
		// Check if there is any login information provided
		if (loginInfo == null) return resolve(incorrectLoginResponse());

		const userDBData:any = await database.query("SELECT * FROM users_info WHERE username = ? LIMIT 1", [loginInfo.username]);

		// Make sure a user was found in the database
		if (userDBData == null) return resolve(incorrectLoginResponse());
		// Make sure the username is the same as the login info
		if (userDBData.username !== loginInfo.username) return resolve(incorrectLoginResponse());
		/*
			1: Old MD5 password
			2: Old AES password
		*/
		if (userDBData.has_old_password === LoginTypes.OLD_MD5) {
			if (userDBData.password_hash !== loginInfo.password)
				return resolve(incorrectLoginResponse());
			
			return resolve(requiredPWChangeResponse());
		} else if (userDBData.has_old_password === LoginTypes.OLD_AES) {
			if (aesDecrypt(config.database.key, userDBData.password_hash) !== loginInfo.password)
				return resolve(resolve(incorrectLoginResponse()));

			return resolve(requiredPWChangeResponse());
		} else {
			pbkdf2(loginInfo.password, userDBData.password_salt, config.database.pbkdf2.itterations, config.database.pbkdf2.keylength, "sha512", (err, derivedKey) => {
				if (err) {
					return reject(err);
				} else {
					if (derivedKey.toString("hex") !== userDBData.password_hash)
						return resolve(incorrectLoginResponse());

					return resolve(undefined); // We good
				}
			});
		}
	});
}

export async function LoginProcess(req:Request, res:Response, packet:Buffer, database:Database, users:UserArray, streams:DataStreamArray, chatManager:ChatManager) {
	const loginInfo = LoginInfo.From(packet);
	const loginStartTime = Date.now();

	const loginCheck:any = await TestLogin(loginInfo, database);
	if (loginCheck != null) {
		res.writeHead(200, loginCheck[1]);
		return res.end(loginCheck[0]);
	}

	if (loginInfo == null)
		return;

	ConsoleHelper.printBancho(`New client connection. [User: ${loginInfo.username}]`);

	// Get users IP for getting location
	// Get cloudflare requestee IP first
	let requestIP = req.get("cf-connecting-ip");

	// Get IP of requestee since we are probably behind a reverse proxy
	if (requestIP == null)
		requestIP = req.get("X-Real-IP");

	// Just get the requestee IP (we are not behind a reverse proxy)
	// if (requestIP == null)
	// 	requestIP = req.remote_addr;

	// Make sure requestIP is never null
	if (requestIP == null)
		requestIP = "";

	
	let userCountryCode:string, userLocation:LatLng;
	// Check if it is a local or null IP
	if (!requestIP.includes("192.168.") && !requestIP.includes("127.0.") && requestIP != "") {
		// Set location to null island
		userCountryCode = "XX";
		userLocation = new LatLng(0, 0);
	} else {
		// Get user's location using zxq
		const userLocationRequest = await fetch(`https://ip.zxq.co/${requestIP}`);
		const userLocationData:any = await userLocationRequest.json();
		const userLatLng:Array<string> = userLocationData.loc.split(",");
		userCountryCode = userLocationData.country;
		userLocation = new LatLng(parseFloat(userLatLng[0]), parseFloat(userLatLng[1]));
	}

	// Get information about the user from the database
	const userDB = await database.query("SELECT id FROM users_info WHERE username = ? LIMIT 1", [loginInfo.username]);

	// Create a token for the client
	const newClientToken:string = await generateSession();
	const isTourneyClient = loginInfo.version.includes("tourney");

	// Make sure user is not already connected, kick off if so.
	const connectedUser = users.getByUsername(loginInfo.username);
	if (connectedUser != null && !isTourneyClient && !connectedUser.isTourneyUser) {
		Logout(connectedUser);
	}

	// Retreive the newly created user
	const newUser:User = users.add(newClientToken, new User(userDB.id, loginInfo.username, newClientToken, database, users, streams, chatManager));
	// Set tourney client flag
	newUser.isTourneyUser = isTourneyClient;
	newUser.location = userLocation;

	// Get user's data from the database
	newUser.updateUserInfo();

	try {
		// Save the country id for the same reason as above
		newUser.countryID = getCountryID(userCountryCode);

		// We're ready to start putting together a login packet
		// Create an osu! Packet writer
		let osuPacketWriter = new osu.Bancho.Writer;

		// The reply id is the user's id in any other case than an error in which case negative numbers are used
		osuPacketWriter.LoginReply(newUser.id);
		// Current bancho protocol version. Defined in Binato.js
		osuPacketWriter.ProtocolNegotiation(19);
		// Permission level 4 is osu!supporter
		osuPacketWriter.LoginPermissions(4);

		// After sending the user their friends list send them the online users
		UserPresenceBundle(newUser);

		// Set title screen image
		//osuPacketWriter.TitleUpdate("http://puu.sh/jh7t7/20c04029ad.png|https://osu.ppy.sh/news/123912240253");

		// Add user panel data packets
		UserPresence(newUser, newUser.id);
		StatusUpdate(newUser, newUser.id);

		// peppy pls, why
		osuPacketWriter.ChannelListingComplete();

		// Add user to #osu
		osuPacketWriter.ChannelJoinSuccess("#osu");
		//if (!Streams.isUserInStream("#osu", newUser.uuid))
		//	Streams.addUserToStream("#osu", newUser.uuid);

		// List all channels out to the client
		/*for (let i = 0; i < global.channels.length; i++) {
			osuPacketWriter.ChannelAvailable({
				channelName: global.channels[i].channelName,
				channelTopic: global.channels[i].channelTopic,
				channelUserCount: global.channels[i].channelUserCount
			});
		}*/

		// Construct user's friends list
		const userFriends = await database.query("SELECT friendsWith FROM friends WHERE user = ?", [newUser.id]);
		let friendsArray = new Array<number>;
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
			"cho-token": newUser.uuid,
			"Connection": "keep-alive",
			"Keep-Alive": "timeout=5, max=100",
		});
		res.end(osuPacketWriter.toBuffer, () => {
			ConsoleHelper.printBancho(`User login finished, took ${Date.now() - loginStartTime}ms. [User: ${loginInfo.username}]`);
		});
	} catch (err) {
		console.error(err);
	}
}