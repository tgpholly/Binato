import Channel from "../objects/Channel";
import User from "../objects/User";

export default interface ICommand {
	adminOnly: boolean,
	helpText: string,
	helpDescription: string,
	exec: (channel: Channel, sender: User, args: string[]) => void
}