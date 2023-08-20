import { osu } from "../../osuTyping";
import { Shared } from "../objects/Shared";
import { User } from "../objects/User";

export function UserPresenceBundle(arg0:User | Shared) : Buffer {
	const osuPacketWriter = osu.Bancho.Writer();
	let shared:Shared;
	if (arg0 instanceof User) {
		shared = arg0.shared;
	} else {
		shared = arg0;
	}

	let userIds:Array<number> = new Array<number>();

	for (let userData of shared.users.getIterableItems()) {
		userIds.push(userData.id);
	}

	osuPacketWriter.UserPresenceBundle(userIds);

	if (arg0 instanceof User) {
		arg0.addActionToQueue(osuPacketWriter.toBuffer);
	}

	return osuPacketWriter.toBuffer;
}