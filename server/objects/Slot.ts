import { Mods } from "../enums/Mods";
import { SlotStatus } from "../enums/SlotStatus";
import { User } from "./User";

export class Slot {
	public readonly slotId:number;
	public status:SlotStatus;
	public team:number;
	public player?:User;
	public mods:Mods;

	public constructor(slotId:number, status:SlotStatus, team:number, player?:User, mods:Mods = Mods.None) {
		this.slotId = slotId;
		this.status = status;
		this.team = team;
		this.player = player;
		this.mods = mods;
	}

	public transferFrom(slot:Slot) : Slot {
		this.status = slot.status;
		this.team = slot.team;
		this.player = slot.player;
		this.mods = slot.mods;
		slot.reset();

		return this;
	}

	public transferTo(slot:Slot) : Slot {
		slot.status = this.status;
		slot.team = this.team;
		slot.player = this.player;
		slot.mods = this.mods;
		this.reset();

		return slot;
	}

	public reset() : Slot {
		this.status = SlotStatus.Empty;
		this.team = 0;
		this.player = undefined;
		this.mods = Mods.None;

		return this;
	}
}