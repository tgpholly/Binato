import FunkyArray from "./FunkyArray";
import Match from "./Match";

export default class MatchArray extends FunkyArray<Match> {
    public getById(id:number) : Match | undefined {
		for (const match of this.getIterableItems()) {
			if (match.matchId === id) {
                return match;
            }
		}

		return undefined;
	}
}