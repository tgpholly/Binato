import User from "../objects/User";
import osu from "../../osuTyping";

export default function Announce(user: User, message: string) {
	const osuPacketWriter = osu.Bancho.Writer();
	osuPacketWriter.Announce(message);

	user.addActionToQueue(osuPacketWriter.toBuffer);
}