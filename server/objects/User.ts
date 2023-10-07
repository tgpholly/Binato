import LatLng from "./LatLng";
import { RankingMode } from "../enums/RankingMode";
import Match from "./Match";
import DataStream from "./DataStream";
import StatusUpdate from "../packets/StatusUpdate";
import Shared from "../objects/Shared";
import Slot from "./Slot";
import Channel from "./Channel";
import PresenceData from "../interfaces/packetTypes/PresenceData";
import { Permissions } from "../enums/Permissions";

export default class User {
	public shared:Shared;

	public id:number;
	public username:string;
	public uuid:string;
	public readonly connectTime:number = Date.now();
	public timeoutTime:number = Date.now() + 30000;
	public queue:Buffer = Buffer.allocUnsafe(0);
	
	// Binato data
	public rankingMode:RankingMode = RankingMode.PP;
	public spectatorStream?:DataStream;
	public spectatingUser?:User;
	public permissions:Permissions;

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

	public constructor(id:number, username:string, uuid:string, permissions:Permissions, shared:Shared) {
		this.id = id;
		this.username = username;
		this.uuid = uuid;
		this.permissions = permissions;

		this.shared = shared;
	}

	// Concats new actions to the user's queue
	public addActionToQueue(newData:Buffer) {
		this.queue = Buffer.concat([this.queue, newData], this.queue.length + newData.length);
	}

	clearQueue() {
		this.queue = Buffer.allocUnsafe(0);
	}

	// Updates the user's current action
	updatePresence(action:PresenceData) {
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
		const userScoreDB = await this.shared.userModesInfoRepository.selectByUserIdModeId(this.id, this.playMode);
		const userRank = await this.shared.userModesInfoRepository.selectRankByIdModeIdRankingMode(this.id, this.playMode, this.rankingMode);

		if (userScoreDB == null || userRank == null) throw "fuck";

		this.rank = userRank;

		// Handle "if we should update" checks for each rankingMode
		let userScoreUpdate = false;
		switch (this.rankingMode) {
			case RankingMode.PP:
				if (this.pp != userScoreDB.pp_raw)
					userScoreUpdate = true;
				break;

			case RankingMode.RANKED_SCORE:
				if (this.rankedScore != userScoreDB.ranked_score)
					userScoreUpdate = true;
				break;

			case RankingMode.AVG_ACCURACY:
				if (this.accuracy != userScoreDB.avg_accuracy)
					userScoreUpdate = true;
				break;
		}

		this.rankedScore = userScoreDB.ranked_score;
		this.totalScore = userScoreDB.total_score;
		this.accuracy = userScoreDB.avg_accuracy;
		this.playCount = userScoreDB.playcount;

		// Set PP to none if ranking mode is not PP
		if (this.rankingMode == 0) this.pp = userScoreDB.pp_raw;
		else this.pp = 0;

		if (userScoreUpdate || forceUpdate) {
			StatusUpdate(this, this.id);
		}
	}

	joinChannel(channelName:string) {
		const channel = this.shared.chatManager.GetChannelByName(channelName);
		if (channel instanceof Channel) {
			channel.Join(this);
		}
	}

	leaveChannel(channelName:string) {
		const channel = this.shared.chatManager.GetChannelByName(channelName);
		if (channel instanceof Channel) {
			channel.Leave(this);
		}
	}
}