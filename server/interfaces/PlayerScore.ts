import Slot from "../objects/Slot";
import User from "../objects/User";
import ScoreFrameData from "./packetTypes/ScoreFrameData";

export default interface PlayerScore {
	player: User,
	slot: Slot,
	score: number,
	isCurrentlyFailed: boolean,
	hasFailed: boolean,
	_raw?: ScoreFrameData
}