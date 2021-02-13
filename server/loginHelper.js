const osu = require("osu-packet");

module.exports = {
    checkLogin:async function(loginInfo) {
        // Queue up incorrect login response
        const incorrectDetailsResponse = incorrectLoginResponse();
        // Check if there is any login information provided
        if (loginInfo == null) return incorrectDetailsResponse;

        const userDBData = await global.DatabaseHelper.query(`SELECT * FROM users_info WHERE username = "${loginInfo.username}" LIMIT 1`);

        // Make sure a user was found in the database
        if (Object.keys(userDBData).length < 1) return incorrectDetailsResponse;
        // Make sure the username is the same as the login info
        if (userDBData.username !== loginInfo.username) return incorrectDetailsResponse;
        // Make sure the password is the same as the login info
        if (userDBData.password !== loginInfo.password) return incorrectDetailsResponse;
        
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