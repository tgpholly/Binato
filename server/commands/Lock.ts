import Channel from "../objects/Channel";
import User from "../objects/User";
import BaseCommand from "./BaseCommand";

export default class LockCommand extends BaseCommand {
	public readonly helpDescription:string = "Locks/Unlocks a channel and limits conversation to mods and above.";

	public exec(channel:Channel, sender:User, args:Array<string>) {
		if (channel.isSpecial) {
			channel.SendBotMessage("Multiplayer channels cannot be locked");
			return;
		}

		channel.isLocked = !channel.isLocked;
		channel.SendBotMessage(`Channel is now ${channel.isLocked ? "locked" : "unlocked"}`);
	}
}