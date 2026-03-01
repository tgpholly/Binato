import User from "../objects/User";
import Database from "../objects/Database";

export default async function RemoveFriend(user:User, friendId:number) {
	await Database.Instance.execute("DELETE FROM friends WHERE user = ? AND friendsWith = ? LIMIT 1", [
		user.id, friendId
	]);
}