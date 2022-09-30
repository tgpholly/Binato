const StatusUpdate = require("./Packets/StatusUpdate.js");

const rankingModes = [
	"pp_raw",
	"ranked_score",
	"avg_accuracy"
];

module.exports = class {
	constructor(id, username, uuid) {
		this.id = id;
		this.username = username;
		this.uuid = uuid;
		this.connectTime = Date.now();
		this.timeoutTime = Date.now() + 30000;
		this.queue = Buffer.alloc(0);

		// Binato specific
		this.rankingMode = 0;

		this.playMode = 0;
		this.countryID = 0;
		this.spectators = [];
		this.spectating = 0;
		this.location = [0,0];
		this.joinedChannels = [];

		// Presence data
		this.actionID = 0;
		this.actionText = "";
		this.actionMods = 0;
		this.beatmapChecksum = "";
		this.beatmapID = 0;
		this.currentMods = 0;

		// Cached db data
		this.rankedScore = 0;
		this.accuracy = 0;
		this.playCount = 0;
		this.totalScore = 0;
		this.rank = 0;
		this.pp = 0;

		// Multiplayer data
		this.currentMatch = null;
		this.matchSlotId = -1;

		this.inMatch = false;

		this.isTourneyUser = false;
	}

	// Adds new actions to the user's queue
	addActionToQueue(newData) {
		this.queue = Buffer.concat([this.queue, newData], this.queue.length + newData.length);
	}

	// Updates the user's current action
	updatePresence(action) {
		this.actionID = action.status;
		this.actionText = action.statusText;
		this.beatmapChecksum = action.beatmapChecksum;
		this.currentMods = action.currentMods;
		this.actionMods = action.currentMods;
		if (action.playMode != this.playMode) {
			this.updateUserInfo(true);
			this.playMode = action.playMode;
		}
		this.beatmapID = action.beatmapId;
	}

	// Gets the user's score information from the database and caches it
	async updateUserInfo(forceUpdate = false) {
		const userScoreDB = await global.DatabaseHelper.query("SELECT * FROM users_modes_info WHERE user_id = ? AND mode_id = ? LIMIT 1", [this.id, this.playMode]);
		const mappedRankingMode = rankingModes[this.rankingMode];
		const userRankDB = await global.DatabaseHelper.query(`SELECT user_id, ${mappedRankingMode} FROM users_modes_info WHERE mode_id = ? ORDER BY ${mappedRankingMode} DESC`, [this.playMode]);

		if (userScoreDB == null || userRankDB == null) throw "fuck";

		// Handle "if we should update" checks for each rankingMode
		let userScoreUpdate = false;
		switch (this.rankingMode) {
			case 0:
				if (this.pp != userScoreDB.pp_raw)
					userScoreUpdate = true;
				break;

			case 1:
				if (this.rankedScore != userScoreDB.ranked_score)
					userScoreUpdate = true;
				break;

			case 2:
				if (this.accuracy != userScoreDB.avg_accuracy)
					userScoreUpdate = true;
				break;
		}

		this.rankedScore = userScoreDB.ranked_score;
		this.totalScore = userScoreDB.total_score;
		this.accuracy = userScoreDB.avg_accuracy;
		this.playCount = userScoreDB.playcount;

		// Fetch rank
		for (let i = 0; i < userRankDB.length; i++) {
			if (userRankDB[i]["user_id"] == this.id) {
				this.rank = i + 1;
				break;
			}
		}

		// Set PP to none if ranking mode is not PP
		if (this.rankingMode == 0) this.pp = userScoreDB.pp_raw;
		else this.pp = 0;

		if (userScoreUpdate || forceUpdate) {
			StatusUpdate(this, this.id);
		}
	}

	// Clears out the user's queue
	clearQueue() {
		this.queue = Buffer.alloc(0);
	}
}