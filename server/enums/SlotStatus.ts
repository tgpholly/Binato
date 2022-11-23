export enum SlotStatus {
	Empty = 1,
	Locked = 2,
	NotReady = 4,
	Ready = 8,
	MissingBeatmap = 16,
	Playing = 32,
	Quit = 128
}