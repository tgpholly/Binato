import { Channel } from "diagnostics_channel";
import MessageData from "../interfaces/MessageData";
import User from "../objects/User";

export default function SendPublicMessage(user:User, message:MessageData) {
	const channel = user.shared.chatManager.GetChannelByName(message.target);
	if (channel instanceof Channel) {
		channel.SendMessage(user, message.message);
	}
}