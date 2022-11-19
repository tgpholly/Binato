import { User } from "../objects/User";
import { StatusUpdate } from "./StatusUpdate";
import { UserPresence } from "./UserPresence";
import { UserPresenceBundle } from "./UserPresenceBundle";

export function UserStatsRequest(user:User, data:Array<number>) {
	UserPresenceBundle(user);

	for (let id of data) {
		UserPresence(user, id);
		StatusUpdate(user, id);
	}
}