import User from "../objects/User";
import Database from "../objects/Database";

export default async function AddFriend(user: User, friendId: number) {
	await Database.Instance.execute("INSERT INTO friends (user, friendsWith) VALUES (?, ?)", [
		user.id, friendId
	]);
}