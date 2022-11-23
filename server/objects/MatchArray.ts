import { FunkyArray } from "./FunkyArray";
import { Match } from "./Match";

export class MatchArray extends FunkyArray<Match> {
    public getById(id:number) : Match | undefined {
		for (let match of this.getIterableItems()) {
			if (match.matchId == id) {
                return match;
            }
		}

		return undefined;
	}
}