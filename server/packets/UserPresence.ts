import osu from "../../osuTyping";
import User from "../objects/User";
import Users from "../Users";

export default function UserPresence(arg0: User | null, id: number) {
	const osuPacketWriter = osu.Bancho.Writer();

	const userData = Users.getById(id);

	if (!userData) {
		return;
	}

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