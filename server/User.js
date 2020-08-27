const DatabaseHelper = require("./DatabaseHelper.js");

module.exports = class {
    constructor(id, username, uuid, connectTime) {
        this.id = id;
        this.username = username;
        this.uuid = uuid;
        this.connectTime = connectTime;
        this.queue = new Buffer.alloc(0);

        this.playMode = 0;
        this.countryID = 0;
        this.spectators = [];
        this.spectating = 0;
        this.location = [0,0];
        this.joinedChannels = [];
        this.currentMatch = null;
        this.matchSlotId = -1;

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
    getNewUserInformationFromDatabase() {
        const userScoreDB = DatabaseHelper.getFromDB(`SELECT * FROM users_modes_info WHERE user_id = ${this.id} AND mode_id = ${this.playMode} LIMIT 1`);
        const userRankDB = DatabaseHelper.getFromDB(`SELECT user_id, pp_raw, FIND_IN_SET( pp_raw, ( SELECT GROUP_CONCAT( pp_raw ORDER BY pp_raw DESC ) FROM users_modes_info WHERE mode_id = ${this.playMode} ) ) AS rank FROM users_modes_info WHERE user_id = ${this.id} AND mode_id = ${this.playMode}`);

        if (userScoreDB == null || userRankDB == null) throw "fuck";

        this.rankedScore = userScoreDB.ranked_score;
        this.totalScore = userScoreDB.total_score;
        this.accuracy = userScoreDB.avg_accuracy;
        this.playCount = userScoreDB.playcount;
        this.rank = userRankDB.rank;
        this.pp = userScoreDB.pp_raw;
    }

    // Clears out the user's queue
    clearQueue() {
        this.queue = new Buffer.alloc(0);
    }
}