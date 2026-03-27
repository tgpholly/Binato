import ICommand from "./interfaces/ICommand";
import Channel from "./objects/Channel";
import User from "./objects/User";

// Commands
import RankingCommand from "./commands/Ranking";
import AdminCommand from "./commands/Admin";
import MultiplayerCommands from "./commands/Multiplayer";
import HelpCommand from "./commands/Help";
import RollCommand from "./commands/Roll";

export default class Bot {
	public user: User;
	private commands: { [id: string]: ICommand } = {};

	public constructor(botUser: User) {
		this.user = botUser;
		
		this.commands["help"] = new HelpCommand(this.commands);
		this.commands["ranking"] = new RankingCommand();
		this.commands["admin"] = new AdminCommand();
		this.commands["mp"] = new MultiplayerCommands();
		this.commands["roll"] = new RollCommand();
	}

	public OnMessage(channel: Channel, sender: User, text: string) {
		const args = text.split(" ");
		const command = this.commands[`${args.shift()?.replace("!", "").toLowerCase()}`];
		if (command) {
			command.exec(channel, sender, args);
		}
	}
}