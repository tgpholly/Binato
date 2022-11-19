import { User } from "../objects/User";
import { StatusUpdate } from "./StatusUpdate";

export function ChangeAction(user:User, data:any) {
	user.updatePresence(data);

	if (user.spectatorStream != null) {
		const statusUpdate = StatusUpdate(user, user.id, false);
		user.spectatorStream.Send(statusUpdate);
	}
}