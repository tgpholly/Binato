import { SharedContent } from "../interfaces/SharedContent";
import { User } from "../objects/User";
const osu = require("osu-packet");

export function UserPresenceBundle(arg0:User | SharedContent) : Buffer {
	const osuPacketWriter = new osu.Bancho.Writer;
	let sharedContent:SharedContent;
	if (arg0 instanceof User) {
		sharedContent = arg0.sharedContent;
	} else {
		sharedContent = arg0;
	}

	let userIds:Array<number> = new Array<number>();

	for (let userData of sharedContent.users.getIterableItems()) {
		userIds.push(userData.id);
	}

	osuPacketWriter.UserPresenceBundle(userIds);

	if (arg0 instanceof User) {
		arg0.addActionToQueue(osuPacketWriter.toBuffer);
	}

	return osuPacketWriter.toBuffer;
}