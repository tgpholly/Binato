import osu from "../../osuTyping";
import Shared from "../objects/Shared";
import User from "../objects/User";

export default function UserPresence(arg0:User | Shared, id:number) {
	const osuPacketWriter = osu.Bancho.Writer();
	let shared:Shared;
	if (arg0 instanceof User) {
		shared = arg0.shared;
	} else {
		shared = arg0;
	}

	const userData = shared.users.getById(id);

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