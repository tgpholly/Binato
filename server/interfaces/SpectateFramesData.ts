import ReplayFrameData from "./ReplayFrameData";
import ScoreFrameData from "./ScoreFrameData";

export default interface SpectateFramesData {
	extra: number,
	replayFrames: Array<ReplayFrameData>,
	action: number,
	scoreFrame: ScoreFrameData
}