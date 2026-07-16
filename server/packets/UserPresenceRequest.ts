import User from "../objects/User";
import UserPresence from "./UserPresence";

export default function UserPresenceRequest(user: User, data: Array<number>) {
	for (const id of data) {
		UserPresence(user, id);
	}
}
