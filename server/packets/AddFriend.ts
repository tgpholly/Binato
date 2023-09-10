import User from "../objects/User";

export default function AddFriend(user:User, friendId:number) {
	user.shared.database.query("INSERT INTO friends (user, friendsWith) VALUES (?, ?)", [
		user.id, friendId
	]);
}