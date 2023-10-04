import { ConsoleHelper } from "../ConsoleHelper";
import fetch from "node-fetch";
import { getCountryID } from "./Country";
import { generateSession } from "./Util";
import LatLng from "./objects/LatLng";
import LoginInfo from "./objects/LoginInfo";
import Logout from "./packets/Logout";
import { pbkdf2 } from "crypto";
import User from "./objects/User";
import UserPresenceBundle from "./packets/UserPresenceBundle";
import UserPresence from "./packets/UserPresence";
import StatusUpdate from "./packets/StatusUpdate";
import Shared from "./objects/Shared";
import osu from "../osuTyping";
import IpZxqResponse from "./interfaces/IpZxqResponse";
import { IncomingMessage, ServerResponse } from "http";
import UserInfo from "./objects/database/UserInfo";
const { decrypt: aesDecrypt } = require("aes256");

const incorrectLoginResponse:Buffer = osu.Bancho.Writer().LoginReply(-1).toBuffer;

const requiredPWChangeResponse:Buffer = osu.Bancho.Writer()
	.LoginReply(-1)
	.Announce("As part of migration to a new password system you are required to change your password. Please logon to the website and change your password.").toBuffer;

enum LoginTypes {
	CURRENT,
	OLD_MD5,
	OLD_AES
}

enum LoginResult {
	VALID,
	MIGRATION,
	INCORRECT,
}

function TestLogin(loginInfo:LoginInfo, shared:Shared) {
	return new Promise<LoginResult>(async (resolve, reject) => {
		const userDBData = await shared.userInfoRepository.getByUsername(loginInfo.username);

		// Make sure a user was found in the database
		if (userDBData == null) return resolve(LoginResult.INCORRECT);
		// Make sure the username is the same as the login info
		if (userDBData.username !== loginInfo.username) return resolve(LoginResult.INCORRECT);

		switch (userDBData.has_old_password) {
			case LoginTypes.CURRENT:
				pbkdf2(loginInfo.password, userDBData.password_salt, shared.config.database.pbkdf2.itterations, shared.config.database.pbkdf2.keylength, "sha512", (err, derivedKey) => {
					if (err) {
						return reject(err);
					} else {
						if (derivedKey.toString("hex") !== userDBData.password_hash)
							return resolve(LoginResult.INCORRECT);
	
						return resolve(LoginResult.VALID); // We good
					}
				});
				break;
			case LoginTypes.OLD_AES:
				if (aesDecrypt(shared.config.database.key, userDBData.password_hash) !== loginInfo.password) {
					return resolve(LoginResult.INCORRECT);
				}
				return resolve(LoginResult.MIGRATION);
			case LoginTypes.OLD_MD5:
				if (userDBData.password_hash !== loginInfo.password) {
					return resolve(LoginResult.INCORRECT);
				}
				return resolve(LoginResult.MIGRATION);
		}
	});
}

export default async function LoginProcess(req:IncomingMessage, res:ServerResponse, packet:Buffer, shared:Shared) {
	const loginStartTime = Date.now();
	const loginInfo = LoginInfo.From(packet);

	// Send back no data if there's no loginInfo
	// Somebody is doing something funky
	if (loginInfo === undefined) {
		return res.end("");
	}

	const loginResult:LoginResult = await TestLogin(loginInfo, shared);
	const osuPacketWriter = osu.Bancho.Writer();
	let newUser:User | undefined;
	let friendsPresence:Buffer = Buffer.alloc(0);

	if (loginResult === LoginResult.VALID && loginInfo !== undefined) {
		ConsoleHelper.printBancho(`New client connection. [User: ${loginInfo.username}]`);

		// Get users IP for getting location
		// Get cloudflare requestee IP first
		let requestIP = req.headers["cf-connecting-ip"];

		// Get IP of requestee since we are probably behind a reverse proxy
		if (requestIP === undefined) {
			requestIP = req.headers["X-Real-IP"];
		}

		// Just get the requestee IP (we are not behind a reverse proxy)
		// if (requestIP == null)
		// 	requestIP = req.remote_addr;

		// Make sure requestIP is never undefined
		if (requestIP === undefined) {
			requestIP = "";
		}
		
		let userCountryCode:string, userLocation:LatLng;
		// Check if it is a local or null IP
		if (requestIP.includes("192.168.") || requestIP.includes("127.0.") || requestIP === "") {
			// Set location to null island
			userCountryCode = "XX";
			userLocation = new LatLng(0, 0);
		} else {
			// Get user's location using zxq
			const userLocationRequest = await fetch(`https://ip.zxq.co/${requestIP}`);
			const userLocationData:IpZxqResponse = await userLocationRequest.json();
			const userLatLng = userLocationData.loc.split(",");
			userCountryCode = userLocationData.country;
			userLocation = new LatLng(parseFloat(userLatLng[0]), parseFloat(userLatLng[1]));
		}

		// Get information about the user from the database
		const userInfo = await shared.userInfoRepository.getByUsername(loginInfo.username);
		if (userInfo == null) {
			return;
		}

		// Create a token for the client
		const newClientToken:string = await generateSession();
		const isTourneyClient = loginInfo.version.includes("tourney");

		// Make sure user is not already connected, kick off if so.
		const connectedUser = shared.users.getByUsername(loginInfo.username);
		if (connectedUser != null && !isTourneyClient && !connectedUser.isTourneyUser) {
			Logout(connectedUser);
		}

		// Retreive the newly created user
		newUser = shared.users.add(newClientToken, new User(userInfo.id, loginInfo.username, newClientToken, shared));
		// Set tourney client flag
		newUser.isTourneyUser = isTourneyClient;
		newUser.location = userLocation;

		// Get user's data from the database
		newUser.updateUserInfo();

		try {
			newUser.countryID = getCountryID(userCountryCode);

			// We're ready to start putting together a login response

			// The reply id is the user's id in any other case than an error in which case negative numbers are used
			osuPacketWriter.LoginReply(newUser.id);
			osuPacketWriter.ProtocolNegotiation(19);
			// Permission level 4 is osu!supporter
			osuPacketWriter.LoginPermissions(4);

			// Set title screen image
			//osuPacketWriter.TitleUpdate("http://puu.sh/jh7t7/20c04029ad.png|https://osu.ppy.sh/news/123912240253");

			// Add user panel data packets
			UserPresence(newUser, newUser.id);
			StatusUpdate(newUser, newUser.id);

			// peppy pls, why
			osuPacketWriter.ChannelListingComplete();

			// Setup chat
			shared.chatManager.ForceJoinChannels(newUser);
			shared.chatManager.SendChannelListing(newUser);

			// Construct & send user's friends list
			const friends = await shared.database.query("SELECT friendsWith FROM friends WHERE user = ?", [newUser.id]);
			const friendsArray:Array<number> = new Array<number>();
			for (const friend of friends) {
				const friendId:number = friend.friendsWith;
				friendsArray.push(friendId);

				// Also fetch presence for friend if they are online
				if (shared.users.getById(friendId) === undefined) { continue; }

				const friendPresence = UserPresence(shared, friendId);
				if (friendPresence === undefined) { continue; }

				friendsPresence = Buffer.concat([
					friendsPresence,
					friendPresence
				], friendsPresence.length + friendPresence.length);
			}
			osuPacketWriter.FriendsList(friendsArray);

			// After sending the user their friends list send them the online users
			UserPresenceBundle(newUser);

			osuPacketWriter.Announce(`Welcome back ${loginInfo.username}!`);
		} catch (err) {
			console.error(err);
		}
	}

	res.removeHeader('X-Powered-By');
	res.removeHeader('Date');
	// Complete / Fail login
	const writerBuffer:Buffer = osuPacketWriter.toBuffer;
	if (newUser === undefined) {
		res.writeHead(200, {
			"cho-token": "no", // NOTE: You have to specify a token even if it's an incorrect login for some reason.
			"Connection": "keep-alive",
			"Keep-Alive": "timeout=5, max=100"
		});
		switch (loginResult) {
			case LoginResult.INCORRECT:
				res.end(incorrectLoginResponse, () => {
					ConsoleHelper.printBancho(`User login failed (Incorrect Password) took ${Date.now() - loginStartTime}ms. [User: ${loginInfo.username}]`);
				});
				break;
			case LoginResult.MIGRATION:
				res.end(requiredPWChangeResponse, () => {
					ConsoleHelper.printBancho(`User login failed (Migration Required) took ${Date.now() - loginStartTime}ms. [User: ${loginInfo.username}]`);
				});
				break;
		}
	} else {
		res.writeHead(200, {
			"cho-token": newUser.uuid,
			"Connection": "keep-alive",
			"Keep-Alive": "timeout=5, max=100",
		});
		res.end(writerBuffer, () => {
			ConsoleHelper.printBancho(`User login finished, took ${Date.now() - loginStartTime}ms. [User: ${loginInfo.username}]`);
		});
	}
}