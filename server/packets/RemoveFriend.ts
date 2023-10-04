import User from "../objects/User";

export default async function RemoveFriend(user:User, friendId:number) {
	await user.shared.database.execute("DELETE FROM friends WHERE user = ? AND friendsWith = ? LIMIT 1", [
		user.id, friendId
	]);
}