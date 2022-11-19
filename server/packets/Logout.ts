import { ConsoleHelper } from "../../ConsoleHelper";
import { Database } from "../objects/Database";
import { DataStreamArray } from "../objects/DataStreamArray";
import { User } from "../objects/User";

export async function Logout(user:User) {
	if (user.uuid === "bot") throw "Tried to log bot out, WTF???";

	const logoutStartTime = Date.now();

	user.streams.RemoveUserFromAllStreams(user);

	// Remove user from user list
	user.users.remove(user.uuid);

	await user.dbConnection.query("UPDATE osu_info SET value = ? WHERE name = 'online_now'", [user.users.getLength() - 1]);

	ConsoleHelper.printBancho(`User logged out, took ${Date.now() - logoutStartTime}ms. [User: ${user.username}]`);
}