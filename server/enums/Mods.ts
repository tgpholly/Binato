// TODO: Complete mods enum.
export enum Mods {
	None,
	NoFail = 1 << 0,
	Easy = 1 << 1,
	// 2 was used for the "No Video" mod but that's gone now.
	Hidden = 1 << 3,
	HardRock = 1 << 4,
	SuddenDeath = 1 << 5,
	DoubleTime = 1 << 6,
	Relax = 1 << 7,
	HalfTime = 1 << 8,
	Nightcore = 1 << 9,
	Flashlight = 1 << 10,
	Autoplay = 1 << 11,
	SpunOut = 1 << 12,
	Autopilot = 1 << 13, // I think this is autopilot???
	Perfect = 1 << 14,
	Mania4K = 1 << 15,
	Mania5K = 1 << 16,
	Mania6K = 1 << 17,
	Mania7K = 1 << 18,
	Mania8K = 1 << 19,
	FadeIn = 1 << 20,
	Random = 1 << 21,
	Cinema = 1 << 22,
	Target = 1 << 23,
	Mania9K = 1 << 24,
	ManiaCoop = 1 << 25,
	Mania1K = 1 << 26,
	Mania3K = 1 << 27,
	Mania2K = 1 << 28
}