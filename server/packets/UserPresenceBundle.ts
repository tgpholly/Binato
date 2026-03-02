import osu from "../../osuTyping";
import User from "../objects/User";
import Users from "../Users";

export default function UserPresenceBundle(arg0?: User) : Buffer {
	const osuPacketWriter = osu.Bancho.Writer();

	const userIds:Array<number> = new Array<number>();

	for (const userData of Users.getIterableItems()) {
		userIds.push(userData.id);
	}

	osuPacketWriter.UserPresenceBundle(userIds);

	if (arg0 instanceof User) {
		arg0.addActionToQueue(osuPacketWriter.toBuffer);
	}

	return osuPacketWriter.toBuffer;
}