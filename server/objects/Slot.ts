export class Slot {
	public status:number;
	public team:number;
	public player:number; // playerId
	public mods:number;

	public constructor() {
		this.status = 0;
		this.team = 0;
		this.player = 0;
		this.mods = 0;
	}
}