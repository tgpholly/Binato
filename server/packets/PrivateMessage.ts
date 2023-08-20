import { MessageData } from "../interfaces/MessageData";
import { Shared } from "../objects/Shared";
import { PrivateChannel } from "../objects/PrivateChannel";
import { User } from "../objects/User";

export function PrivateMessage(user:User, message:MessageData) {
	const shared:Shared = user.shared;
	const sendingTo = shared.users.getByUsername(message.target);
	if (!(sendingTo instanceof User)) {
		console.log("Sending User invalid");
		return;
	}
	let channel = shared.privateChatManager.GetChannelByName(`${user.username}${sendingTo.username}`);
	if (!(channel instanceof PrivateChannel)) {
		console.log("First find failed");
		// Try it the other way around
		channel = shared.privateChatManager.GetChannelByName(`${sendingTo.username}${user.username}`);
	}

	if (!(channel instanceof PrivateChannel)) {
		console.log("Second find failed, creating");
		channel = shared.privateChatManager.AddChannel(user, sendingTo);
	}

	console.log("sending");
	channel.SendMessage(user, message.message);
}