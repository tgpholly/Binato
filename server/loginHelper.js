const osu = require("osu-packet"),
	  aes256 = require("aes256"),
	  crypto = require("crypto"),
	  config = require("../config.json");

module.exports = {
	checkLogin: function(loginInfo) {
		return new Promise(async (resolve, reject) => {
			// Check if there is any login information provided
			if (loginInfo == null) return resolve(incorrectLoginResponse());

			const userDBData = await global.DatabaseHelper.query("SELECT * FROM users_info WHERE username = ? LIMIT 1", [loginInfo.username]);

			// Make sure a user was found in the database
			if (userDBData == null) return resolve(incorrectLoginResponse());
			// Make sure the username is the same as the login info
			if (userDBData.username !== loginInfo.username) return resolve(incorrectLoginResponse());
			/*
				1: Old MD5 password
				2: Old AES password
			*/
			if (userDBData.has_old_password === 1) {
				if (userDBData.password_hash !== loginInfo.password)
					return resolve(incorrectLoginResponse());
				
				return resolve(requiredPWChangeResponse());
			} else if (userDBData.has_old_password === 2) {
				if (aes256.decrypt(config.database.key, userDBData.password_hash) !== loginInfo.password)
					return resolve(resolve(incorrectLoginResponse()));

				return resolve(requiredPWChangeResponse());
			} else {
				crypto.pbkdf2(loginInfo.password, userDBData.password_salt, config.database.pbkdf2.itterations, config.database.pbkdf2.keylength, "sha512", (err, derivedKey) => {
					if (err) {
						return reject(err);
					} else {
						if (derivedKey.toString("hex") !== userDBData.password_hash)
							return resolve(incorrectLoginResponse());

						return resolve(null); // We good
					}
				});
			}
		});
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