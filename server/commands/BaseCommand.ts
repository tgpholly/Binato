import ICommand from "../interfaces/ICommand";
import Channel from "../objects/Channel";
import Shared from "../objects/Shared";
import User from "../objects/User";

export default class BaseCommand implements ICommand {
	public shared:Shared;
	public readonly helpText:string = "No help page was found for that command";
	public readonly helpDescription:string = "Command has no description set";
	public readonly helpArguments:Array<string> = new Array<string>();

	public constructor(shared:Shared) {
		this.shared = shared;
	}

	public exec(channel:Channel, sender:User, args:Array<string>) {
		channel.SendBotMessage(`Sorry ${sender.username}! This command has no functionality yet. Args: ["${args.join('", "')}"]`);
	}
}