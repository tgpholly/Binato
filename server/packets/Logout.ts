import ConsoleHelper from "../../ConsoleHelper";
import Database from "../objects/Database";
import User from "../objects/User";
import StreamManager from "../StreamManager";
import Users from "../Users";

export default async function Logout(user: User) {
	if (user.uuid === "bot") {
		ConsoleHelper.printError("Tried to log bot out, WTF???");
		return;
	}

	const logoutStartTime = Date.now();

	StreamManager.RemoveUserFromAllStreams(user);
	Users.remove(user.uuid);
	await Database.Instance.execute("UPDATE osu_info SET value = ? WHERE name = 'online_now'", [Users.length - 1]);

	ConsoleHelper.printBancho(`User logged out, took ${Date.now() - logoutStartTime}ms. [User: ${user.username}]`);
}