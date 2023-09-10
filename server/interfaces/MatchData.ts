import MatchDataSlot from "./MatchDataSlot";

export default interface MatchData {
	matchId:number,
	matchType:number,
	activeMods:number,
	gameName:string,
	gamePassword:string,
	inProgress:boolean,
	beatmapName:string,
	beatmapId:number,
	beatmapChecksum:string,
	slots:Array<MatchDataSlot>,
	host:number,
	playMode:number,
	matchScoringType:number,
	matchTeamType:number,
	specialModes:number,
	seed:number
}