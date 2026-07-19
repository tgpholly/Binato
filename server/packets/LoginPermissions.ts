import User from "../objects/User";
import osu from "../../osuTyping";
import Permissions from "../enums/Permissions";

export default function LoginPermissions(user: User, permissions: Permissions) {
	const osuPacketWriter = osu.Bancho.Writer();
	osuPacketWriter.LoginPermissions(permissions);

	user.addActionToQueue(osuPacketWriter.toBuffer);
}