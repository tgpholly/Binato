import MessageData from "../interfaces/packetTypes/MessageData";
import PrivateChannel from "../objects/PrivateChannel";
import User from "../objects/User";
import PrivateChatManager from "../PrivateChatManager";
import Users from "../Users";

export default function PrivateMessage(user:User, message:MessageData) {
	const sendingTo = Users.getByUsername(message.target);
	if (!(sendingTo instanceof User)) {
		return;
	}
	let channel = PrivateChatManager.GetChannelByName(`${user.username}${sendingTo.username}`);
	if (!(channel instanceof PrivateChannel)) {
		// Try it the other way around
		channel = PrivateChatManager.GetChannelByName(`${sendingTo.username}${user.username}`);
	}

	if (!(channel instanceof PrivateChannel)) {
		channel = PrivateChatManager.AddChannel(user, sendingTo);
	}

	channel.SendMessage(user, message.message);
}