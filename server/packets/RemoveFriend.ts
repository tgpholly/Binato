import User from "../objects/User";

export default function RemoveFriend(user:User, friendId:number) {
	user.shared.database.query("DELETE FROM friends WHERE user = ? AND friendsWith = ? LIMIT 1", [
		user.id, friendId
	]);
}