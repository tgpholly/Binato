module.exports = function(packet) {
	try {
		const p = packet.toString(); // Convert our buffer to a String
		const s = p.split('\n'); // Split our Login Data to Username Password Osuversion|blabla|bla
		const n = s[2].split('|'); // Split osuversion|blablabla|blablabla to a object.
		const username = s[0]; // Username ofc
		const password = s[1]; // Password ofc
		const osuversion = n[0]; // OsuVersion ofc.
		const TimeOffset = Number(n[1]); // Comeon, i dont realy have to tell you what this is.
		const clientData = n[3].split(':')[2]; // Some system information. such as MacAdress or DiskID
	
		// If some data is not set OR is invailed throw errors
		if (username == undefined) throw 'UserName';
		if (password == undefined) throw 'password';
		if (osuversion == undefined) throw 'osuversion';
		if (TimeOffset == undefined) throw 'offset';
		if (clientData == undefined) throw 'clientData';
	
		// Everything alright? return parsed data.
		const obj = {
			username: String(username),
			password: String(password),
			osuversion: String(osuversion),
			timeoffset: Number(TimeOffset),
			clientdata: String(clientData)
		};
		// Here is the return.
		return obj;
	} catch (ex) {
		// Else return undefined, that the login request got broke.
		return undefined;
	}
}