import { Channel } from "./Channel";
import { SharedContent } from "../BanchoServer";
import { DataStream } from "./DataStream";
import { Slot } from "./Slot";
import { User } from "./User";
import { StatusUpdate } from "../packets/StatusUpdate";

const osu = require("osu-packet");

export interface MatchData {
	matchId:number,
	matchType:number,
	activeMods:number,
	gameName:string,
	gamePassword:string,
	inProgress:boolean,
	beatmapName:string,
	beatmapId:number,
	beatmapChecksum:string,
	slots:Array<any>,
	host:number,
	playMode:number,
	matchScoringType:number,
	matchTeamType:number,
	specialModes:number,
	seed:number
}

export class Match {
	// osu! Data
	public matchId:number = -1;
	public inProgress:boolean = false;
	public matchType:number = 0;
	public activeMods:number = 0;
	public gameName:string = "";
	public gamePassword:string | undefined = '';
	public beatmapName:string = '';
	public beatmapId:number = 0;
	public beatmapChecksum:string = '';
	public slots:Array<Slot> = new Array<Slot>();
	public host:number = 0;
	public playMode:number = 0;
	public matchScoringType:number = 0;
	public matchTeamType:number = 0;
	public specialModes:number = 0;
	public seed:number = 0;

	// Binato data
	public roundId:number = 0;
	public matchStartCountdownActive:boolean = false;
	public matchStream:DataStream;
	public matchChatChannel:Channel;

	private constructor(matchData:MatchData, sharedContent:SharedContent) {
		console.log(matchData);
		this.matchId = matchData.matchId;

		this.inProgress = matchData.inProgress;

		this.matchType = matchData.matchType;

		this.activeMods = matchData.activeMods;

		this.gameName = matchData.gameName;
		if (matchData.gamePassword == '') matchData.gamePassword == null;
		this.gamePassword = matchData.gamePassword;

		this.beatmapName = matchData.beatmapName;
		this.beatmapId = matchData.beatmapId;
		this.beatmapChecksum = matchData.beatmapChecksum;

		this.slots = matchData.slots;
		for (let i = 0; i < this.slots.length; i++) {
			//this.slots[i].mods = 0;
		}

		this.host = matchData.host;

		this.playMode = matchData.playMode;

		this.matchScoringType = matchData.matchScoringType;
		this.matchTeamType = matchData.matchTeamType;
		this.specialModes = matchData.specialModes;

		this.seed = matchData.seed;

		this.matchStream = sharedContent.streams.CreateStream(`multiplayer:match_${this.matchId}`);
		this.matchChatChannel = sharedContent.chatManager.AddSpecialChatChannel("multiplayer", `mp_${this.matchId}`);

		//this.matchLoadSlots = null;
		//this.matchSkippedSlots = null;

		//this.playerScores = null;

		//this.multiplayerExtras = null;

		//this.isTourneyMatch = false;
		//this.tourneyClientUsers = [];
	}

	public static createMatch(matchHost:User, matchData:MatchData, sharedContent:SharedContent) : Promise<Match> {
		return new Promise<Match>(async (resolve, reject) => {
			try {
				matchData.matchId = (await sharedContent.database.query(
					"INSERT INTO mp_matches (id, name, open_time, close_time, seed) VALUES (NULL, ?, UNIX_TIMESTAMP(), NULL, ?) RETURNING id;",
					[matchData.gameName, matchData.seed]
				))[0]["id"];
	
				const matchInstance = new Match(matchData, sharedContent);
	
				console.log(matchInstance.matchId);
	
				// Update the status of the current user
				StatusUpdate(matchHost, matchHost.id);
	
				const osuPacketWriter = new osu.Bancho.Writer;
	
				//osuPacketWriter.MatchNew(matchInstance.createOsuMatchJSON());
	
				matchHost.addActionToQueue(osuPacketWriter.toBuffer);
	
				// Update the match listing for users in the multiplayer lobby
				//global.MultiplayerManager.updateMatchListing();
	
				resolve(matchInstance);
			} catch (e) {
				reject(e);
			}
		});
	}

	/*getSlotIdByPlayerId(playerId = 0) {
		const player = getUserById(playerId);

		if (player != null) return player.matchSlotId;
		else return null;
	}

	createOsuMatchJSON() {
		return {
			matchId: this.matchId,
			inProgress: this.inProgress,
			matchType: this.matchType,
			activeMods: this.activeMods,
			gameName: this.gameName,
			gamePassword: this.gamePassword,
			beatmapName: this.beatmapName,
			beatmapId: this.beatmapId,
			beatmapChecksum: this.beatmapChecksum,
			slots: this.slots,
			host: this.host,
			playMode: this.playMode,
			matchScoringType: this.matchScoringType,
			matchTeamType: this.matchTeamType,
			specialModes: this.specialModes,
			seed: this.seed
		};
	}

	leaveMatch(MatchUser = new User) {
		// Make sure this leave call is valid
		if (!MatchUser.inMatch) return;
		
		// Get the user's slot
		const slot = this.slots[MatchUser.matchSlotId];

		// Set the slot's status to avaliable
		slot.playerId = -1;
		slot.status = 1;

		// Remove the leaving user from the match's stream
		Streams.removeUserFromStream(this.matchStreamName, MatchUser.uuid);
		Streams.removeUserFromStream(this.matchChatStreamName, MatchUser.uuid);

		// Send this after removing the user from match streams to avoid a leave notification for self
		this.sendMatchUpdate();

		const osuPacketWriter = new osu.Bancho.Writer;

		// Remove user from the multiplayer channel for the match
		osuPacketWriter.ChannelRevoked("#multiplayer");

		MatchUser.addActionToQueue(osuPacketWriter.toBuffer);
	}

	async updateMatch(MatchUser = new User, MatchData) {
		// Update match with new data
		this.inProgress = MatchData.inProgress;

		this.matchType = MatchData.matchType;

		this.activeMods = MatchData.activeMods;

		const gameNameChanged = this.gameName !== MatchData.gameName;
		this.gameName = MatchData.gameName;

		if (MatchData.gamePassword == '') MatchData.gamePassword == null;
		this.gamePassword = MatchData.gamePassword;

		this.beatmapName = MatchData.beatmapName;
		this.beatmapId = MatchData.beatmapId;
		this.beatmapChecksum = MatchData.beatmapChecksum;

		this.host = MatchData.host;

		this.playMode = MatchData.playMode;

		this.matchScoringType = MatchData.matchScoringType;
		this.matchTeamType = MatchData.matchTeamType;
		this.specialModes = MatchData.specialModes;

		const gameSeedChanged = this.seed !== MatchData.seed;
		this.seed = MatchData.seed;

		if (gameNameChanged || gameSeedChanged) {
			const queryData = [];
			if (gameNameChanged) {
				queryData.push(MatchData.gameName);
			}
			if (gameSeedChanged) {
				queryData.push(MatchData.seed);
			}
			queryData.push(this.matchId);

			await global.DatabaseHelper.query(`UPDATE mp_matches SET ${gameNameChanged ? `name = ?${gameSeedChanged ? ", " : ""}` : ""}${gameSeedChanged ? `seed = ?` : ""} WHERE id = ?`, queryData);
		}

		this.sendMatchUpdate();

		// Update the match listing in the lobby to reflect these changes
		global.MultiplayerManager.updateMatchListing();
	}

	sendMatchUpdate() {
		const osuPacketWriter = new osu.Bancho.Writer;

		osuPacketWriter.MatchUpdate(this.createOsuMatchJSON());

		// Update all users in the match with new match information
		if (Streams.exists(this.matchStreamName))
			Streams.sendToStream(this.matchStreamName, osuPacketWriter.toBuffer, null);
	}

	moveToSlot(MatchUser = new User, SlotToMoveTo) {
		const oldSlot = this.slots[MatchUser.matchSlotId];

		// Set the new slot's data to the user's old slot data
		this.slots[SlotToMoveTo].playerId = MatchUser.id;
		MatchUser.matchSlotId = SlotToMoveTo;
		this.slots[SlotToMoveTo].status = 4;

		// Set the old slot's data to open
		oldSlot.playerId = -1;
		oldSlot.status = 1;

		this.sendMatchUpdate();

		// Update the match listing in the lobby to reflect this change
		global.MultiplayerManager.updateMatchListing();
	}

	changeTeam(MatchUser = new User) {
		const slot = this.slots[MatchUser.matchSlotId];
		slot.team = slot.team == 0 ? 1 : 0;

		this.sendMatchUpdate();
	}

	setStateReady(MatchUser = new User) {
		if (!MatchUser.inMatch) return;
			
		// Set the user's ready state to ready
		this.slots[MatchUser.matchSlotId].status = 8;

		this.sendMatchUpdate();
	}

	setStateNotReady(MatchUser = new User) {
		if (!MatchUser.inMatch) return;
			
		// Set the user's ready state to not ready
		this.slots[MatchUser.matchSlotId].status = 4;

		this.sendMatchUpdate();
	}

	lockMatchSlot(MatchUser = new User, MatchUserToKick) {
		// Make sure the user attempting to kick / lock is the host of the match
		if (this.host != MatchUser.id) return;

		// Make sure the user that is attempting to be kicked is not the host
		if (this.slots[MatchUserToKick].playerId === this.host) return;

		// Get the data of the slot at the index sent by the client
		const slot = this.slots[MatchUserToKick];

		let isSlotEmpty = true;

		// If the slot is empty lock/unlock instead of kicking
		if (slot.playerId === -1)
			slot.status = slot.status === 1 ? 2 : 1;
			
		// The slot isn't empty, kick the player
		else {
			const kickedPlayer = getUserById(slot.playerId);
			kickedPlayer.matchSlotId = -1;
			slot.playerId = -1;
			slot.status = 1;
			isSlotEmpty = false;
		}

		this.sendMatchUpdate();

		// Update the match listing in the lobby listing to reflect this change
		global.MultiplayerManager.updateMatchListing();

		if (!isSlotEmpty) {
			let cachedPlayerToken = getUserById(slot.playerId).uuid;

			if (cachedPlayerToken !== null && cachedPlayerToken !== "") {
				// Remove the kicked user from the match stream
				Streams.removeUserFromStream(this.matchStreamName, cachedPlayerToken);
			}
		}
	}

	missingBeatmap(MatchUser = new User) {
		// User is missing the beatmap set the status to reflect it
		this.slots[MatchUser.matchSlotId].status = 16;

		this.sendMatchUpdate();
	}

	notMissingBeatmap(MatchUser = new User) {
		// The user is not missing the beatmap, set the status to normal
		this.slots[MatchUser.matchSlotId].status = 4;

		this.sendMatchUpdate();
	}

	matchSkip(MatchUser = new User) {
		if (this.matchSkippedSlots == null) {
			this.matchSkippedSlots = [];

			const skippedSlots = this.matchSkippedSlots;

			for (let slot of this.slots) {
				// Make sure the slot has a user in it
				if (slot.playerId === -1 || slot.status === 1 || slot.status === 2) continue;
	
				// Add the slot's user to the loaded checking array
				skippedSlots.push({playerId: slot.playerId, skipped: false}); 
			}
		}

		let allSkipped = true;
		for (let skippedSlot of this.matchSkippedSlots) {
			// If loadslot belongs to this user then set loaded to true
			if (skippedSlot.playerId == MatchUser.id) {
				skippedSlot.skipped = true;
			}

			if (skippedSlot.skipped) continue;

			// A user hasn't skipped
			allSkipped = false;
		}

		// All players have finished playing, finish the match
		if (allSkipped) {
			const osuPacketWriter = new osu.Bancho.Writer;

			osuPacketWriter.MatchPlayerSkipped(MatchUser.id);
			osuPacketWriter.MatchSkip();

			Streams.sendToStream(this.matchStreamName, osuPacketWriter.toBuffer, null);

			this.matchSkippedSlots = null;
		} else {
			const osuPacketWriter = new osu.Bancho.Writer;
			
			osuPacketWriter.MatchPlayerSkipped(MatchUser.id);

			Streams.sendToStream(this.matchStreamName, osuPacketWriter.toBuffer, null);
		}
	}

	transferHost(MatchUser = new User, SlotIDToTransferTo) {
		// Set the lobby's host to the new user
		this.host = this.slots[SlotIDToTransferTo].playerId;

		this.sendMatchUpdate();
	}

	// TODO: Fix not being able to add DT when freemod is active
	updateMods(MatchUser = new User, MatchMods) {
		// Check if freemod is enabled
		if (this.specialModes === 1) {
			this.slots[MatchUser.matchSlotId].mods = MatchMods;

			this.sendMatchUpdate();
		} else {
			// Make sure the person updating mods is the host of the match
			if (this.host !== MatchUser.id) return;

			// Change the matches mods to these new mods
			// TODO: Do this per user if freemod is enabled
			this.activeMods = MatchMods;

			this.sendMatchUpdate();
		}

		// Update match listing in the lobby to reflect this change
		global.MultiplayerManager.updateMatchListing();
	}

	startMatch() {
		// Make sure the match is not already in progress
		// The client sometimes double fires the start packet
		if (this.inProgress) return;
		this.inProgress = true;
		// Create array for monitoring users until they are ready to play
		this.matchLoadSlots = [];
		// Loop through all slots in the match
		for (let slot of this.slots) {
			// Make sure the slot has a user in it
			if (slot.playerId === -1 || slot.status === 1 || slot.status === 2) continue;

			// Add the slot's user to the loaded checking array
			this.matchLoadSlots.push({
				playerId: slot.playerId,
				loaded: false
			});

			// Set the user's status to playing
			slot.status = 32;
		}

		const osuPacketWriter = new osu.Bancho.Writer;

		osuPacketWriter.MatchStart(this.createOsuMatchJSON());

		// Inform all users in the match that it has started
		Streams.sendToStream(this.matchStreamName, osuPacketWriter.toBuffer, null);

		// Update all users in the match with new info
		this.sendMatchUpdate();

		// Update match listing in lobby to show the game is in progress
		global.MultiplayerManager.updateMatchListing();
	}

	matchPlayerLoaded(MatchUser = new User) {
		// Loop through all user load check items and check if all users are loaded
		let allLoaded = true;
		for (let loadedSlot of this.matchLoadSlots) {
			// If loadslot belongs to this user then set loaded to true
			if (loadedSlot.playerId == MatchUser.id) {
				loadedSlot.loaded = true;
			}

			if (loadedSlot.loaded) continue;

			allLoaded = false;
		}

		// All players have loaded the beatmap, start playing.
		if (allLoaded) {
			let osuPacketWriter = new osu.Bancho.Writer;
			osuPacketWriter.MatchAllPlayersLoaded();
			Streams.sendToStream(this.matchStreamName, osuPacketWriter.toBuffer, null);

			// Blank out user loading array
			this.matchLoadSlots = null;

			this.playerScores = [];
			for (let i = 0; i < this.slots.length; i++) {
				const slot = this.slots[i];
				if (slot.playerId === -1 || slot.status === 1 || slot.status === 2) continue;

				this.playerScores.push({playerId: slot.playerId, slotId: i, score: 0, isCurrentlyFailed: false});
			}
		}
	}

	async onPlayerFinishMatch(MatchUser = new User) {
		if (this.matchLoadSlots == null) {
			// Repopulate user loading slots again
			this.matchLoadSlots = [];
			for (let slot of this.slots) {
				// Make sure the slot has a user
				if (slot.playerId === -1 || slot.status === 1 || slot.status === 2) continue;
	
				// Populate user loading slots with this user's id and load status
				this.matchLoadSlots.push({
					playerId: slot.playerId,
					loaded: false
				}); 
			}
		}

		let allLoaded = true;

		// Loop through all loaded slots to make sure all users have finished playing
		for (let loadedSlot of this.matchLoadSlots) {
			if (loadedSlot.playerId == MatchUser.id) {
				loadedSlot.loaded = true;
			}

			if (loadedSlot.loaded) continue;

			// A user hasn't finished playing
			allLoaded = false;
		}

		// All players have finished playing, finish the match
		if (allLoaded) await this.finishMatch();
	}

	async finishMatch() {
		if (!this.inProgress) return;
		this.matchLoadSlots = null;
		this.inProgress = false;
		let osuPacketWriter = new osu.Bancho.Writer;

		let queryData = [this.matchId, this.roundId++, this.playMode, this.matchType, this.matchScoringType, this.matchTeamType, this.activeMods, this.beatmapChecksum, (this.specialModes === 1) ? 1 : 0];

		// Loop through all slots in the match
		for (let slot of this.slots) {
			// Make sure the slot has a user
			if (slot.playerId === -1 || slot.status === 1 || slot.status === 2) {
				queryData.push(null);
				continue;
			}

			let score = null;
			for (let _playerScore of this.playerScores) {
				if (_playerScore.playerId === slot.playerId) {
					score = _playerScore._raw;
					break;
				}
			}

			queryData.push(`${slot.playerId}|${score.totalScore}|${score.maxCombo}|${score.count300}|${score.count100}|${score.count50}|${score.countGeki}|${score.countKatu}|${score.countMiss}|${(score.currentHp == 254) ? 1 : 0}${(this.specialModes === 1) ? `|${slot.mods}` : ""}|${score.usingScoreV2 ? 1 : 0}${score.usingScoreV2 ? `|${score.comboPortion}|${score.bonusPortion}` : ""}`);

			// Set the user's status back to normal from playing
			slot.status = 4;
		}

		console.log(queryData);

		osuPacketWriter.MatchComplete();

		// Inform all users in the match that it is complete
		Streams.sendToStream(this.matchStreamName, osuPacketWriter.toBuffer, null);

		// Update all users in the match with new info
		this.sendMatchUpdate();

		// Update match info in the lobby to reflect that the match has finished
		global.MultiplayerManager.updateMatchListing();

		if (this.multiplayerExtras != null) this.multiplayerExtras.onMatchFinished(JSON.parse(JSON.stringify(this.playerScores)));

		await global.DatabaseHelper.query("INSERT INTO mp_match_rounds (id, match_id, round_id, round_mode, match_type, round_scoring_type, round_team_type, round_mods, beatmap_md5, freemod, player0, player1, player2, player3, player4, player5, player6, player7, player8, player9, player10, player11, player12, player13, player14, player15) VALUES (NULL, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)", queryData);

		this.playerScores = null;
	}

	updatePlayerScore(MatchPlayer = new User, MatchScoreData) {
		const osuPacketWriter = new osu.Bancho.Writer;

		// Make sure the user's slot ID is not invalid
		if (this.matchSlotId == -1) return;

		// Get the user's current slotID and append it to the givien data, just incase.
		MatchScoreData.id = MatchPlayer.matchSlotId;

		// Update the playerScores array accordingly
		for (let playerScore of this.playerScores) {
			if (playerScore.playerId == MatchPlayer.id) {
				playerScore.score = MatchScoreData.totalScore;
				playerScore.isCurrentlyFailed = MatchScoreData.currentHp == 254;
				playerScore._raw = MatchScoreData;
				break;
			}
		}
		
		osuPacketWriter.MatchScoreUpdate(MatchScoreData);

		// Send the newly updated score to all users in the match
		Streams.sendToStream(this.matchStreamName, osuPacketWriter.toBuffer, null);
	}

	matchFailed(MatchUser = new User) {
		const osuPacketWriter = new osu.Bancho.Writer;

		// Make sure the user's slot ID is not invalid
		if (MatchUser.matchSlotId == -1) return;

		osuPacketWriter.MatchPlayerFailed(MatchUser.id);

		Streams.sendToStream(this.matchStreamName, osuPacketWriter.toBuffer, null);
	}*/
}