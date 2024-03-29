import User from "../objects/User";
import StatusUpdate from "./StatusUpdate";
import UserPresence from "./UserPresence";
import UserPresenceBundle from "./UserPresenceBundle";

export default function UserStatsRequest(user:User, data:Array<number>) {
	UserPresenceBundle(user);

	for (const id of data) {
		UserPresence(user, id);
		StatusUpdate(user, id);
	}
}