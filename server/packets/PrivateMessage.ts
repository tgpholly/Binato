import MessageData from "../interfaces/packetTypes/MessageData";
import User from "../objects/User";
import PrivateChatManager from "../managers/PrivateChatManager";
import Users from "../Users";

export default function PrivateMessage(user: User, message: MessageData) {
	const sendingTo = Users.getByUsername(message.target);
	if (!sendingTo) {
		return;
	}

	let channel = PrivateChatManager.GetChannelByName(`${user.username}${sendingTo.username}`);
	if (!channel) {
		// Try it the other way around
		channel = PrivateChatManager.GetChannelByName(`${sendingTo.username}${user.username}`);
	}
	if (!channel) {
		channel = PrivateChatManager.AddChannel(user, sendingTo);
	}

	channel.SendMessage(user, message.message);
}