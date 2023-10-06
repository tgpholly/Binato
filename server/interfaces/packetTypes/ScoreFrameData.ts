export default interface ScoreFrameData {
	time: number,
	id: number,
	count300: number,
	count100: number,
	count50: number,
	countGeki: number,
	countKatu: number,
	countMiss: number,
	totalScore: number,
	maxCombo: number,
	currentCombo: number,
	perfect: boolean,
	currentHp: number,
	tagByte: number,
	usingScoreV2: boolean,
	// Only exists if usingScoreV2 = true
	comboPortion?: number,
	bonusPortion?: number
}