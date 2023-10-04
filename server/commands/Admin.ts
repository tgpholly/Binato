import { enumHasFlag } from "../Util";
import { Permissions } from "../enums/Permissions";
import Channel from "../objects/Channel";
import User from "../objects/User";
import BaseCommand from "./BaseCommand";

export default class AdminCommand extends BaseCommand {
	public readonly adminOnly:boolean = true;
	public readonly helpDescription:string = "Locks/Unlocks a channel and limits conversation to mods and above.";

	public exec(channel:Channel, sender:User, args:Array<string>) {
		if (!enumHasFlag(sender.permissions, Permissions.Admin) || !enumHasFlag(sender.permissions, Permissions.Peppy)) {
			channel.SendBotMessage("You don't have permission to execute that command.");
			return;
		}

		const subCommand = args[0].toLowerCase();
		args.shift();

		switch (subCommand) {
			case "lock":
				return adminLock(channel);
		}
	}
}

function adminLock(channel:Channel) {
	if (channel.isSpecial) {
		channel.SendBotMessage("Multiplayer channels cannot be locked");
		return;
	}
	
	channel.isLocked = !channel.isLocked;
	channel.SendBotMessage(`Channel is now ${channel.isLocked ? "locked" : "unlocked"}`);
}