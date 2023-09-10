import PrivateChannel from "../objects/PrivateChannel";
import User from "../objects/User";

export default function MultiplayerInvite(user:User, invitedUserId:number) {
	const invitedUser = user.shared.users.getById(invitedUserId);
	if (invitedUser instanceof User) {
		let channel = user.shared.privateChatManager.GetChannelByName(`${user.username}${invitedUser.username}`);
		if (!(channel instanceof PrivateChannel)) {
			// Try it the other way around
			channel = user.shared.privateChatManager.GetChannelByName(`${invitedUser.username}${user.username}`);
		}

		if (!(channel instanceof PrivateChannel)) {
			channel = user.shared.privateChatManager.AddChannel(user, invitedUser);
		}

		channel.SendMessage(user, `Come join my multiplayer match: [osump://${user.match?.matchId}/ ${user.match?.gameName}]`);
	}
}