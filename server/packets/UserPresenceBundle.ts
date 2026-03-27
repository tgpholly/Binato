import osu from "../../osuTyping";
import User from "../objects/User";
import Users from "../Users";

export default function UserPresenceBundle(user?: User) : Buffer {
	const osuPacketWriter = osu.Bancho.Writer();

	const userIds:Array<number> = [];

	for (const userData of Users.getIterableItems()) {
		userIds.push(userData.id);
	}

	osuPacketWriter.UserPresenceBundle(userIds);

	if (user) {
		user.addActionToQueue(osuPacketWriter.toBuffer);
	}

	return osuPacketWriter.toBuffer;
}