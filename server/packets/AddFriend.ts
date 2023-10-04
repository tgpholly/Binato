import User from "../objects/User";

export default async function AddFriend(user:User, friendId:number) {
	await user.shared.database.execute("INSERT INTO friends (user, friendsWith) VALUES (?, ?)", [
		user.id, friendId
	]);
}