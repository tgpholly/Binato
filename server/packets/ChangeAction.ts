import User from "../objects/User";
import StatusUpdate from "./StatusUpdate";

export default function ChangeAction(user:User, data:any) {
	user.updatePresence(data);

	if (user.spectatorStream != null) {
		const statusUpdate = StatusUpdate(user.shared, user.id);
		if (statusUpdate instanceof Buffer) {
			user.spectatorStream.Send(statusUpdate);
		}
	}
}