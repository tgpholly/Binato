import Channel from "../objects/Channel";
import User from "../objects/User";
import Match from "../objects/Match";
import BaseCommand from "./BaseCommand";

export default class MultiplayerCommands extends BaseCommand {
	public readonly helpText:string = `Multiplayer Subcommands:
!mp start - Starts a multiplayer match with a delay (optional)
!mp abort - Aborts the currently running round / countdown`;
	public readonly helpDescription:string = "Command for use in multiplayer matches.";
	public readonly helpArguments:Array<string> = ["subCommand"];

	public exec(channel:Channel, sender:User, args:Array<string>) {
		// TODO: Determine if this check is correct
		if (sender.match == undefined || channel.name != "#multiplayer") {
			channel.SendBotMessage("You must be in a multiplayer match to use this command");
			return;
		}
		// Check if sender is match host
		if (!User.Equals(sender, sender.match.host)) {
			channel.SendBotMessage("You must be the match host to use multiplayer commands");
			return;
		}
		if (args.length === 0) {
			channel.SendBotMessage("You must specify a sub command, use \"!help mp\" to see a list of them.");
			return;
		}

		const subCommand = args[0].toLowerCase();
		args.shift();

		switch (subCommand) {
			case "start":
				return mpStart(channel, sender.match, args);

			case "abort":
				return mpAbort(channel, sender.match);
		}
	}
}

function mpStart(channel:Channel, match:Match, args:Array<string>) {
	// If no time is specified start instantly
	if (args.length === 0) {
		channel.SendBotMessage("Good luck, have fun!");
		setTimeout(() => match.startMatch(), 1000);
		return;
	}

	const countdownTime = parseInt(args[0]);
	if (isNaN(countdownTime)) {
		channel.SendBotMessage("Countdown time must be a valid number");
		return;
	}

	let countdownUpdates = 0;
	match.countdownTime = countdownTime;
	match.countdownTimer = setInterval(() => {
		if (match.countdownTime <= 0) {
			clearInterval(match.countdownTimer);
			match.countdownTimer = undefined;
			channel.SendBotMessage("Good luck, have fun!");
			setTimeout(() => match.startMatch(), 1000);
			return;
		}

		if (match.countdownTime <= 5 && match.countdownTime > 0) {
			channel.SendBotMessage(`Starting in ${match.countdownTime} seconds`);
		} else if (match.countdownTime <= 30 ? countdownUpdates % 10 === 0 : countdownUpdates % 30 === 0) {
			channel.SendBotMessage(`Starting in ${match.countdownTime} seconds`);
		}

		match.countdownTime--;
		countdownUpdates++;
	}, 1000);
}

function mpAbort(channel:Channel, match:Match) {
	if (match.countdownTimer && match.countdownTime > 0) {
		clearInterval(match.countdownTimer);
		match.countdownTimer = undefined;
		channel.SendBotMessage("Aborted countdown");
	} else {
		// TODO: Determine the correct way to abort a round
		match.finishMatch();
		channel.SendBotMessage("Aborted current round");
	}
}