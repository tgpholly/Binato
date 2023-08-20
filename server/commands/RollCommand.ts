import { Channel } from "../objects/Channel";
import { User } from "../objects/User";
import { BaseCommand } from "./BaseCommand";

export class RollCommand extends BaseCommand {
	public readonly helpDescription:string = "Roll some dice and get a random number between 1 and a number (default 100)";
	public readonly helpArguments:Array<string> = ["number"];

	public exec(channel:Channel, sender:User, args:Array<string>) {
		let limit = 99;
		if (args.length === 1) {
			const userLimit = parseInt(args[0]);
			if (!isNaN(userLimit)) {
				limit = userLimit;
			}
		}

		const number = Math.round(Math.random() * limit) + 1;
		channel.SendBotMessage(`${sender.username} rolls ${number} point(s)`);
	}
}