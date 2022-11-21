import { SharedContent } from "../BanchoServer";
import { User } from "../objects/User";
const osu = require("osu-packet");

export function UserPresence(arg0:User | SharedContent, id:number) {
	const osuPacketWriter = new osu.Bancho.Writer;
	let sharedContent:SharedContent;
	if (arg0 instanceof User) {
		sharedContent = arg0.sharedContent;
	} else {
		sharedContent = arg0;
	}

	const userData = sharedContent.users.getById(id);

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

	if (arg0 instanceof User) {
		arg0.addActionToQueue(osuPacketWriter.toBuffer);
	}
	
	return osuPacketWriter.toBuffer;
}