import { User } from "../objects/User";
const osu = require("osu-packet");

export function UserPresence(user:User, id:number, sendImmidiate:boolean = true) {
	const osuPacketWriter = new osu.Bancho.Writer;

	const userData = user.sharedContent.users.getById(id);

	if (userData == null) return;

	osuPacketWriter.UserPresence({
		userId: id,
		username: userData.username,
		timezone: 0,
		countryId: userData.countryID,
		permissions: 4,
		longitude: userData.location.longitude,
		latitude: userData.location.latitude,
		rank: userData.rank
	});

	if (sendImmidiate) userData.addActionToQueue(osuPacketWriter.toBuffer);
	else return osuPacketWriter.toBuffer;
}