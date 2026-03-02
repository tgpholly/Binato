import PresenceData from "../interfaces/packetTypes/PresenceData";
import User from "../objects/User";
import StatusUpdate from "./StatusUpdate";

export default function ChangeAction(user:User, data:PresenceData) {
	user.updatePresence(data);

	if (user.spectatorStream != null) {
		const statusUpdate = StatusUpdate(null, user.id);
		user.spectatorStream.Send(statusUpdate);
	}
}