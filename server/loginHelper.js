const osu = require("osu-packet"),
	  aes256 = require("aes256"),
	  config = require("../config.json");

module.exports = {
	checkLogin:async function(loginInfo) {
		// Check if there is any login information provided
		if (loginInfo == null) return incorrectLoginResponse();

		const userDBData = await global.DatabaseHelper.query(`SELECT * FROM users_info WHERE username = "${loginInfo.username}" LIMIT 1`);

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
			if (aes256.decrypt(config.databaseKey, userDBData.password) !== loginInfo.password) return incorrectLoginResponse();
		}

		return null;
	}
}

function incorrectLoginResponse() {
	const osuPacketWriter = new osu.Bancho.Writer;
	osuPacketWriter.LoginReply(-1);
	return [
		osuPacketWriter.toBuffer,
		{
			'cho-token': 'No',
			'cho-protocol': global.protocolVersion,
			'Connection': 'keep-alive',
			'Keep-Alive': 'timeout=5, max=100',
			'Content-Type': 'text/html; charset=UTF-8'
		}
	];
}

function requiredPWChangeResponse() {
	const osuPacketWriter = new osu.Bancho.Writer;
	osuPacketWriter.Announce("As part of migration to a new password system you are required to change your password. Please login on the website and change your password.");
	osuPacketWriter.LoginReply(-1);
	return [
		osuPacketWriter.toBuffer,
		{
			'cho-token': 'No',
			'cho-protocol': global.protocolVersion,
			'Connection': 'keep-alive',
			'Keep-Alive': 'timeout=5, max=100',
			'Content-Type': 'text/html; charset=UTF-8'
		}
	];
}