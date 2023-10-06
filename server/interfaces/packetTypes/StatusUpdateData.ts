export default interface StatusUpdateData {
	userId: number,
	status: number,
	statusText: string,
	beatmapChecksum: string,
	currentMods: number,
	playMode: number,
	beatmapId: number,
	rankedScore: number,
	accuracy: number,
	playCount: number,
	totalScore: number,
	rank: number,
	performance: number
}