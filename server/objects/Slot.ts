import { SlotStatus } from "../enums/SlotStatus";
import { User } from "./User";

export class Slot {
	public status:SlotStatus;
	public team:number;
	public player?:User; // playerId
	public mods:number;

	public constructor(status:SlotStatus, team:number, player?:User, mods:number = 0) {
		this.status = status;
		this.team = team;
		this.player = player;
		this.mods = mods;
	}
}