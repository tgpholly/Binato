import { Channel } from "../objects/Channel";
import { User } from "../objects/User";
import { RankingModes } from "../enums/RankingModes";
import { BaseCommand } from "./BaseCommand";

const helpText = `Ranking Modes:
!ranking pp - Sets your ranking mode to pp
!ranking score - Sets your ranking mode to score
!ranking acc - Sets your ranking mode to accuracy`;

export class RankingCommand extends BaseCommand {
	public readonly helpText:string = helpText;
	public readonly helpDescription:string = "Sets your prefered ranking type";

	public exec(channel:Channel, sender:User, args:Array<string>) {
		if (args.length === 0) {
			channel.SendBotMessage("You must specify a ranking mode, use \"!help ranking\" to see the options.");
			return;
		}

		switch (args[0].toLowerCase()) {
			case "pp":
				sender.rankingMode = RankingModes.PP;
				channel.SendBotMessage("Set ranking mode to pp.");
				break;
			case "score":
				sender.rankingMode = RankingModes.RANKED_SCORE;
				channel.SendBotMessage("Set ranking mode to score.");
				break;
			case "acc":
				sender.rankingMode = RankingModes.AVG_ACCURACY;
				channel.SendBotMessage("Set ranking mode to accuracy.");
				break;
		}
		sender.updateUserInfo(true);
	}
}