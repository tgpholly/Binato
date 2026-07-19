import User from "../objects/User";
import osu from "../../osuTyping";

export default function LoginReply(user: User) {
	const osuPacketWriter = osu.Bancho.Writer();
	osuPacketWriter.LoginReply(user.id);

	user.addActionToQueue(osuPacketWriter.toBuffer);
}