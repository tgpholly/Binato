import { User } from "../objects/User";
const osu = require("osu-packet");

export function UserPresenceBundle(user:User, sendImmidiate:boolean = true) {
	const osuPacketWriter = new osu.Bancho.Writer;

	let userIds:Array<number> = new Array<number>();

	for (let userData of user.users.getIterableItems()) {
		userIds.push(userData.id);
	}

	osuPacketWriter.UserPresenceBundle(userIds);

	if (sendImmidiate) user.addActionToQueue(osuPacketWriter.toBuffer);
	else return osuPacketWriter.toBuffer;
}