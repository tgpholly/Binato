import { User } from "../objects/User";
import { StatusUpdate } from "./StatusUpdate";

export function ChangeAction(user:User, data:any) {
	user.updatePresence(data);

	if (user.spectatorStream != null) {
		const statusUpdate = StatusUpdate(user.sharedContent, user.id);
		user.spectatorStream.Send(statusUpdate);
	}
}