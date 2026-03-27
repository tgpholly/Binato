import osu from "../../osuTyping";
import User from "../objects/User";
import Users from "../Users";

export default function UserPresence(user: User | null, id: number) {
	const osuPacketWriter = osu.Bancho.Writer();

	const targetUser = Users.getById(id);
	if (!targetUser) {
		return;
	}

	osuPacketWriter.UserPresence({
		userId: id,
		username: targetUser.username,
		timezone: 0,
		countryId: targetUser.countryID,
		permissions: 4,
		longitude: targetUser.location.longitude,
		latitude: targetUser.location.latitude,
		rank: targetUser.rank
	});

	if (user) {
		user.addActionToQueue(osuPacketWriter.toBuffer);
	}
	
	return osuPacketWriter.toBuffer;
}