import { Slot } from "../objects/Slot";
import { User } from "../objects/User";
import { MatchScoreData } from "./MatchScoreData";

export interface PlayerScore {
	player:User,
	slot:Slot,
	score:number,
	isCurrentlyFailed:boolean,
	hasFailed:boolean,
	_raw?:MatchScoreData
}