import MessageData from "../interfaces/packetTypes/MessageData";
import User from "../objects/User";
import Channel from "../objects/Channel";
import ChatManager from "../ChatManager";

export default function SendPublicMessage(user:User, message:MessageData) {
	const channel = ChatManager.GetChannelByName(message.target);
	if (channel instanceof Channel) {
		channel.SendMessage(user, message.message);
	}
}