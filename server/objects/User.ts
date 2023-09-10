import LatLng from "./LatLng";
import { RankingModes } from "../enums/RankingModes";
import Match from "./Match";
import DataStream from "./DataStream";
import StatusUpdate from "../packets/StatusUpdate";
import Shared from "../objects/Shared";
import Slot from "./Slot";

const rankingModes = [
	"pp_raw",
	"ranked_score",
	"avg_accuracy"
];

export default class User {
	private static readonly EMPTY_BUFFER = Buffer.alloc(0);

	public shared:Shared;

	public id:number;
	public username:string;
	public uuid:string;
	public readonly connectTime:number = Date.now();
	public timeoutTime:number = Date.now() + 30000;
	public queue:Buffer = User.EMPTY_BUFFER;
	
	// Binato data
	public rankingMode:RankingModes = RankingModes.PP;
	public spectatorStream?:DataStream;
	public spectatingUser?:User;

	// osu! data
	public playMode:number = 0;
	public countryID:number = 0;
	public location:LatLng = new LatLng(0, 0);
	public joinedChannels:Array<string> = new Array<string>();

	// Presence data
	public actionID:number = 0;
	public actionText:string = "";
	public actionMods:number = 0;
	public beatmapChecksum:string = "";
	public beatmapID:number = 0;
	public currentMods:number = 0;

	// Cached db data
	public rankedScore:number = 0;
	public accuracy:number = 0;
	public playCount:number = 0;
	public totalScore:number = 0;
	public rank:number = 0;
	public pp:number = 0;

	// Multiplayer data
	public match?:Match;
	public matchSlot?:Slot;
	public get inMatch() {
		return this.match instanceof Match;
	}

	// Tournament client flag
	public isTourneyUser:boolean = false;

	static Equals(user0:User, user1:User) {
		return user0.uuid === user1.uuid;
	}

	public constructor(id:number, username:string, uuid:string, shared:Shared) {
		this.id = id;
		this.username = username;
		this.uuid = uuid;

		this.shared = shared;
	}

	// Concats new actions to the user's queue
	public addActionToQueue(newData:Buffer) {
		this.queue = Buffer.concat([this.queue, newData], this.queue.length + newData.length);
	}

	clearQueue() {
		this.queue = User.EMPTY_BUFFER;
	}

	// Updates the user's current action
	updatePresence(action:any) {
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
	async updateUserInfo(forceUpdate:boolean = false) {
		const userScoreDB = await this.shared.database.query("SELECT * FROM users_modes_info WHERE user_id = ? AND mode_id = ? LIMIT 1", [this.id, this.playMode]);
		const mappedRankingMode = rankingModes[this.rankingMode];
		const userRankDB = await this.shared.database.query(`SELECT user_id, ${mappedRankingMode} FROM users_modes_info WHERE mode_id = ? ORDER BY ${mappedRankingMode} DESC`, [this.playMode]);

		if (userScoreDB == null || userRankDB == null) throw "fuck";

		// Handle "if we should update" checks for each rankingMode
		let userScoreUpdate = false;
		switch (this.rankingMode) {
			case RankingModes.PP:
				if (this.pp != userScoreDB.pp_raw)
					userScoreUpdate = true;
				break;

			case RankingModes.RANKED_SCORE:
				if (this.rankedScore != userScoreDB.ranked_score)
					userScoreUpdate = true;
				break;

			case RankingModes.AVG_ACCURACY:
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
}