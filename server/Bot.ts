import ICommand from "./interfaces/ICommand";
import Channel from "./objects/Channel";
import Shared from "./objects/Shared";
import User from "./objects/User";

// Commands
import RankingCommand from "./commands/Ranking";
import LockCommand from "./commands/Lock";
import MultiplayerCommands from "./commands/Multiplayer";
import HelpCommand from "./commands/Help";
import RollCommand from "./commands/Roll";

export default class Bot {
	public user:User;
	private commands:{ [id: string]: ICommand } = {};

	public constructor(shared:Shared, botUser:User) {
		this.user = botUser;
		
		this.commands["help"] = new HelpCommand(shared, this.commands);
		this.commands["ranking"] = new RankingCommand(shared);
		this.commands["lock"] = new LockCommand(shared);
		this.commands["mp"] = new MultiplayerCommands(shared);
		this.commands["roll"] = new RollCommand(shared);
	}

	public OnMessage(channel:Channel, sender:User, text:string) {
		const args = text.split(" ");
		const command = this.commands[`${args.shift()?.replace("!", "").toLowerCase()}`];
		if (command) {
			command.exec(channel, sender, args);
		}
	}
}