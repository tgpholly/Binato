import Channel from "../objects/Channel";
import Shared from "../objects/Shared";
import User from "../objects/User";

export default interface ICommand {
	shared:Shared,
	helpText:string,
	helpDescription:string,
	exec: (channel:Channel, sender:User, args:Array<string>) => void
}