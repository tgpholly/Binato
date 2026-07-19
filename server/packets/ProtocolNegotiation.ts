import User from "../objects/User";
import osu from "../../osuTyping";

export default function ProtocolNegotiation(user: User, protocolVersion: number) {
	const osuPacketWriter = osu.Bancho.Writer();
	osuPacketWriter.ProtocolNegotiation(protocolVersion);

	user.addActionToQueue(osuPacketWriter.toBuffer);
}