import { Slot } from "../objects/Slot";
import { User } from "../objects/User";

export interface PlayerScore {
	player:User,
	slot:Slot,
	score:number,
	isCurrentlyFailed:boolean,
	hasFailed:boolean,
	_raw:any
}