import MessageData from "../interfaces/packetTypes/MessageData";
import User from "../objects/User";
import Channel from "../objects/Channel";

export default function SendPublicMessage(user:User, message:MessageData) {
	const channel = user.shared.chatManager.GetChannelByName(message.target);
	if (channel instanceof Channel) {
		channel.SendMessage(user, message.message);
	}
}