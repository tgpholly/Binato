import Channel from "../objects/Channel";
import User from "../objects/User";
import CommandBase from "./CommandBase";
import ICommand from "../interfaces/ICommand";

export default class HelpCommand extends CommandBase {
	public readonly helpDescription: string = "Shows this message! :)";

	private readonly commandList: { [id: string]: ICommand };
	private commandKeys: string[] = [];

	public constructor(commands: { [id: string]: ICommand }) {
		super();
		this.commandList = commands;
	}

	public exec(channel: Channel, _sender: User, args: Array<string>) {
		if (this.commandKeys.length === 0) {
			this.commandKeys = Object.keys(this.commandList);
		}

		// All commands
		if (args.length === 0) {
			let constructedHelp = "Help:\n";
			for (const key of this.commandKeys) {
				constructedHelp += ` !${key} - ${this.commandList[key].helpDescription}\n`;
			}
			channel.SendBotMessage(constructedHelp.slice(0, constructedHelp.length - 1));
			return;
		}

		// Command page
		const commandName = args[0].toLowerCase();
		if (commandName in this.commandList) {
			channel.SendBotMessage(this.commandList[commandName].helpText);
		} else {
			channel.SendBotMessage("No help page was found for that command");
		}
	}
}