const osu = require("osu-packet"),
	  aes256 = require("aes256"),
	  config = require("../config.json");

module.exports = {
	checkLogin:async function(loginInfo) {
		// Check if there is any login information provided
		if (loginInfo == null) return incorrectLoginResponse();

		const userDBData = await global.DatabaseHelper.query("SELECT * FROM users_info WHERE username = ? LIMIT 1", [loginInfo.username]);

		// Make sure a user was found in the database
		if (Object.keys(userDBData).length < 1) return incorrectLoginResponse();
		// Make sure the username is the same as the login info
		if (userDBData.username !== loginInfo.username) return incorrectLoginResponse();
		// If the user has an old md5 password
		if (userDBData.has_old_password == 1) {
			// Make sure the password is the same as the login info
			if (userDBData.password !== loginInfo.password) return incorrectLoginResponse();
			
			return requiredPWChangeResponse();
		} else {
			if (aes256.decrypt(config.database.key, userDBData.password) !== loginInfo.password) return incorrectLoginResponse();
		}

		return null;
	},
	incorrectLoginResponse: incorrectLoginResponse
}

function incorrectLoginResponse() {
	const osuPacketWriter = new osu.Bancho.Writer;
	osuPacketWriter.LoginReply(-1);
	return [
		osuPacketWriter.toBuffer,
		{
			'cho-protocol': global.protocolVersion,
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
			'cho-protocol': global.protocolVersion,
			'Connection': 'keep-alive',
			'Keep-Alive': 'timeout=5, max=100',
		}
	];
}