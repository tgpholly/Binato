import ICommand from "../interfaces/ICommand";
import Channel from "../objects/Channel";
import User from "../objects/User";

export default class CommandBase implements ICommand {
	public readonly adminOnly:boolean = false;
	public readonly helpText:string = "No help page was found for that command";
	public readonly helpDescription:string = "Command has no description set";
	public readonly helpArguments:Array<string> = new Array<string>();

	public exec(channel:Channel, sender:User, args:Array<string>) {
		channel.SendBotMessage(`Sorry ${sender.username}! This command has no functionality yet. Args: ["${args.join('", "')}"]`);
	}
}