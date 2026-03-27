import PrivateChannel from "../objects/PrivateChannel";
import User from "../objects/User";
import PrivateChatManager from "../managers/PrivateChatManager";
import Users from "../Users";

export default function MultiplayerInvite(user: User, invitedUserId: number) {
	const invitedUser = Users.getById(invitedUserId);
	if (invitedUser instanceof User) {
		let channel = PrivateChatManager.GetChannelByName(`${user.username}${invitedUser.username}`);
		if (!(channel instanceof PrivateChannel)) {
			// Try it the other way around
			channel = PrivateChatManager.GetChannelByName(`${invitedUser.username}${user.username}`);
		}

		if (!(channel instanceof PrivateChannel)) {
			channel = PrivateChatManager.AddChannel(user, invitedUser);
		}

		channel.SendMessage(user, `Come join my multiplayer match: [osump://${user.match?.matchId}/ ${user.match?.gameName}]`);
	}
}