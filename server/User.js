const StatusUpdate = require("./Packets/StatusUpdate.js");

module.exports = class {
	constructor(id, username, uuid, connectTime, isTourneyUser = false) {
		this.id = id;
		this.username = username;
		this.uuid = uuid;
		this.connectTime = connectTime;
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

		this.isTourneyUser = isTourneyUser;
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
		this.playMode = action.playMode;
		this.beatmapID = action.beatmapId;
	}

	// Gets the user's score information from the database and caches it
	async getNewUserInformationFromDatabase(forceUpdate = false) {
		const userScoreDB = await global.DatabaseHelper.query(`SELECT * FROM users_modes_info WHERE user_id = ${this.id} AND mode_id = ${this.playMode} LIMIT 1`);
		let userRankDB = null;
		switch (this.rankingMode) {
			case 0:
				userRankDB = await global.DatabaseHelper.query(`SELECT user_id, pp_raw FROM users_modes_info WHERE mode_id = ${this.playMode} ORDER BY pp_raw DESC`);
			break;

			case 1:
				userRankDB = await global.DatabaseHelper.query(`SELECT user_id, ranked_score FROM users_modes_info WHERE mode_id = ${this.playMode} ORDER BY ranked_score DESC`);
			break;

			case 2:
				userRankDB = await global.DatabaseHelper.query(`SELECT user_id, avg_accuracy FROM users_modes_info WHERE mode_id = ${this.playMode} ORDER BY avg_accuracy DESC`);
			break;
		}

		if (userScoreDB == null || userRankDB == null) throw "fuck";

		let userScoreUpdate = false;
		if (forceUpdate) {
			userScoreUpdate = true;
		} else {
			switch (this.rankingMode) {
				case 0:
					if (this.pp != userScoreDB.pp_raw) {
						userScoreUpdate = true;
					}
				break;
	
				case 1:
					if (this.rankedScore != userScoreDB.ranked_score) {
						userScoreUpdate = true;
					}
				break;
	
				case 2:
					if (this.accuracy != userScoreDB.avg_accuracy) {
						userScoreUpdate = true;
					}
				break;
			}
		}

		this.rankedScore = userScoreDB.ranked_score;
		this.totalScore = userScoreDB.total_score;
		this.accuracy = userScoreDB.avg_accuracy;
		this.playCount = userScoreDB.playcount;
		for (let i = 0; i < userRankDB.length; i++) {
			if (userRankDB[i]["user_id"] == this.id) this.rank = i + 1;
		}
		switch (this.rankingMode) {
			case 0:
				this.pp = userScoreDB.pp_raw;
			break;

			case 1:
				this.pp = 0;
			break;

			case 2:
				this.pp = 0;
			break;
		}

		if (userScoreUpdate) {
			StatusUpdate(this, this.id);
		}
	}

	// Clears out the user's queue
	clearQueue() {
		this.queue = Buffer.alloc(0);
	}
}