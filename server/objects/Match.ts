import { Channel } from "./Channel";
import { SharedContent } from "../interfaces/SharedContent";
import { DataStream } from "./DataStream";
import { Slot } from "./Slot";
import { User } from "./User";
import { StatusUpdate } from "../packets/StatusUpdate";
import { SlotStatus } from "../enums/SlotStatus";
import { MatchData } from "../interfaces/MatchData";
import { Team } from "../enums/Team";
import { MatchStartSkipData } from "../interfaces/MatchStartSkipData";
import { Mods } from "../enums/Mods";
import { PlayerScore } from "../interfaces/PlayerScore";
import { MatchScoreData } from "../interfaces/MatchScoreData";

const osu = require("osu-packet");

export class Match {
	// osu! Data
	public matchId:number = -1;
	public inProgress:boolean = false;
	public matchType:number = 0;
	public activeMods:number = 0;
	public gameName:string = "";
	public gamePassword?:string;
	public beatmapName:string = '';
	public beatmapId:number = 0;
	public beatmapChecksum:string = '';
	public slots:Array<Slot> = new Array<Slot>();
	public host:User;
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

	public matchLoadSlots?:Array<MatchStartSkipData>;
	public matchSkippedSlots?:Array<MatchStartSkipData>;

	public playerScores?:Array<PlayerScore>;

	private cachedMatchJSON:MatchData;
	private readonly sharedContent:SharedContent;

	private constructor(matchData:MatchData, sharedContent:SharedContent) {
		this.sharedContent = sharedContent;
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

		for (let i = 0; i < matchData.slots.length; i++) {
			const slot = matchData.slots[i];
			if (slot.playerId === -1) {
				this.slots.push(new Slot(i, slot.status, slot.team, undefined, slot.mods));
			} else {
				this.slots.push(new Slot(i, slot.status, slot.team, sharedContent.users.getById(slot.playerId), slot.mods));
			}
		}

		const hostUser = sharedContent.users.getById(matchData.host);
		if (hostUser === undefined) {
			// NOTE: This should never be possible to hit
			//       since this user JUST made the match.
			throw "Host User of match was undefined";
		}
		this.host = hostUser;

		this.playMode = matchData.playMode;

		this.matchScoringType = matchData.matchScoringType;
		this.matchTeamType = matchData.matchTeamType;
		this.specialModes = matchData.specialModes;

		this.seed = matchData.seed;

		this.matchStream = sharedContent.streams.CreateStream(`multiplayer:match_${this.matchId}`, false);
		this.matchChatChannel = sharedContent.chatManager.AddSpecialChatChannel("multiplayer", `mp_${this.matchId}`);

		this.cachedMatchJSON = matchData;

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
	
				// Update the status of the current user
				StatusUpdate(matchHost, matchHost.id);
	
				const osuPacketWriter = new osu.Bancho.Writer;
	
				osuPacketWriter.MatchNew(matchInstance.generateMatchJSON());
	
				matchHost.addActionToQueue(osuPacketWriter.toBuffer);
	
				sharedContent.mutiplayerManager.UpdateLobbyListing();
	
				resolve(matchInstance);
			} catch (e) {
				reject(e);
			}
		});
	}

	// Convert class data back to a format that osu-packet can understand
	public generateMatchJSON() : MatchData {
		for (let i = 0; i < this.slots.length; i++) {
			const slot = this.slots[i];
			const osuSlot = this.cachedMatchJSON.slots[i];

			osuSlot.status = slot.status;
			osuSlot.team = slot.team;
			osuSlot.mods = slot.mods;
			if (slot.player instanceof User) {
				osuSlot.playerId = slot.player.id;
			} else {
				osuSlot.playerId = -1;
			}
		}

		return this.cachedMatchJSON;
	}

	public leaveMatch(user:User) {
		// Make sure this leave call is valid
		if (!user.inMatch || user.matchSlot === undefined) {
			return;
		}

		// Set the slot's status to avaliable
		user.matchSlot.status = SlotStatus.Empty;
		user.matchSlot.team = 0;
		user.matchSlot.player = undefined;
		user.matchSlot.mods = 0;

		// Remove the leaving user from the match's stream
		this.matchStream.RemoveUser(user);
		this.matchChatChannel.Leave(user);

		// Send this after removing the user from match streams to avoid a leave notification for self
		this.sendMatchUpdate();
	}

	public async updateMatch(user:User, matchData:MatchData) {
		// Update match with new data
		this.inProgress = matchData.inProgress;

		this.matchType = matchData.matchType;

		this.activeMods = matchData.activeMods;

		const gameNameChanged = this.gameName !== matchData.gameName;
		this.gameName = matchData.gameName;

		if (matchData.gamePassword === "") {
			this.gamePassword = undefined;
		} else {
			this.gamePassword = this.cachedMatchJSON.gamePassword = matchData.gamePassword;
		}

		this.beatmapName = this.cachedMatchJSON.beatmapName = matchData.beatmapName;
		this.beatmapId = this.cachedMatchJSON.beatmapId = matchData.beatmapId;
		this.beatmapChecksum = this.cachedMatchJSON.beatmapChecksum = matchData.beatmapChecksum;

		if (matchData.host !== this.host.id) {
			const hostUser = this.sharedContent.users.getById(matchData.host);
			if (hostUser === undefined) {
				// NOTE: This should never be possible to hit
				throw "Host User of match was undefined";
			}
			this.host = hostUser;
			this.cachedMatchJSON.host = this.host.id;
		}

		this.playMode = this.cachedMatchJSON.playMode = matchData.playMode;

		this.matchScoringType = this.cachedMatchJSON.matchScoringType = matchData.matchScoringType;
		this.matchTeamType = this.cachedMatchJSON.matchTeamType = matchData.matchTeamType;
		this.specialModes = this.cachedMatchJSON.specialModes = matchData.specialModes;

		const gameSeedChanged = this.seed !== matchData.seed;
		this.seed = this.cachedMatchJSON.seed = matchData.seed;

		if (gameNameChanged || gameSeedChanged) {
			const queryData = [];
			if (gameNameChanged) {
				queryData.push(matchData.gameName);
			}
			if (gameSeedChanged) {
				queryData.push(matchData.seed);
			}
			queryData.push(this.matchId);

			await this.sharedContent.database.query(`UPDATE mp_matches SET ${gameNameChanged ? `name = ?${gameSeedChanged ? ", " : ""}` : ""}${gameSeedChanged ? `seed = ?` : ""} WHERE id = ?`, queryData);
		}

		this.sendMatchUpdate();

		// Update the match listing in the lobby to reflect these changes
		this.sharedContent.mutiplayerManager.UpdateLobbyListing();
	}

	public sendMatchUpdate() {
		const osuPacketWriter = new osu.Bancho.Writer;

		osuPacketWriter.MatchUpdate(this.generateMatchJSON());

		// Update all users in the match with new match information
		this.matchStream.Send(osuPacketWriter.toBuffer);
	}

	public moveToSlot(user:User, slotToMoveTo:number) {
		if (slotToMoveTo < 0 || slotToMoveTo >= this.slots.length) {
			return;
		}

		const newSlot = this.slots[slotToMoveTo];
		if (newSlot.status === SlotStatus.Locked || !(user.matchSlot instanceof Slot)) {
			return;
		}

		user.matchSlot = newSlot.transferFrom(user.matchSlot);

		this.sendMatchUpdate();

		this.sharedContent.mutiplayerManager.UpdateLobbyListing();
	}

	public changeTeam(user:User) {
		if (!(user.matchSlot instanceof Slot)) {
			return;
		}

		user.matchSlot.team = user.matchSlot.team === Team.Red ? Team.Blue : Team.Red;

		this.sendMatchUpdate();
	}

	public setStateReady(user:User) {
		if (!(user.matchSlot instanceof Slot)) {
			return; 
		}

		user.matchSlot.status = SlotStatus.Ready;

		this.sendMatchUpdate();
	}

	public setStateNotReady(user:User) {
		if (!(user.matchSlot instanceof Slot)) {
			return;
		}

		user.matchSlot.status = SlotStatus.NotReady;

		this.sendMatchUpdate();
	}

	public lockOrKick(user:User, slotToActionOn:number) {
		if (slotToActionOn < 0 || slotToActionOn >= 16) {
			return;
		}

		// Make sure the user attempting to kick / lock is the host of the match
		if (User.Equals(user, this.host)) {
			return;
		}

		const slot = this.slots[slotToActionOn];
		if (slot.player instanceof Slot) {
			// Kick
			if (User.Equals(user, slot.player)) {
				return;
			}

			const kickedPlayer = slot.player;

			// Remove player's refs to the match & slot
			kickedPlayer.match = undefined;
			kickedPlayer.matchSlot = undefined;

			// Nuke all slot properties
			slot.reset();

			// Send update before removing the user from the stream so they know
			// they got kicked
			this.sendMatchUpdate();

			// Remove player from stream and chat
			this.matchStream.RemoveUser(kickedPlayer);
			this.matchChatChannel.Leave(kickedPlayer);
		} else {
			// Lock / Unlock
			slot.status = slot.status === SlotStatus.Empty ? SlotStatus.Locked : SlotStatus.Empty;

			this.sendMatchUpdate();
		}

		this.sharedContent.mutiplayerManager.UpdateLobbyListing();
	}

	public missingBeatmap(user:User) {
		const slot = user.matchSlot;
		if (!(slot instanceof Slot)) {
			return;
		}

		slot.status = SlotStatus.MissingBeatmap;

		this.sendMatchUpdate();
	}

	public notMissingBeatmap(user:User) {
		const slot = user.matchSlot;
		if (!(slot instanceof Slot)) {
			return;
		}

		slot.status = SlotStatus.NotReady;

		this.sendMatchUpdate();
	}

	public matchSkip(user:User) {
		if (this.matchSkippedSlots === undefined) {
			this.matchSkippedSlots = new Array<MatchStartSkipData>();

			for (let slot of this.slots) {
				// Make sure the slot has a user in it
				if (slot.player === undefined || slot.status === SlotStatus.Empty || slot.status === SlotStatus.Locked) {
					continue;
				}
	
				// Add the slot's user to the loaded checking array
				this.matchSkippedSlots.push({
					playerId: slot.player?.id,
					flag: false
				}); 
			}
		}

		let allSkipped = true;
		for (let skippedSlot of this.matchSkippedSlots) {
			// If loadslot belongs to this user then set loaded to true
			if (skippedSlot.playerId === user.id) {
				skippedSlot.flag = true;
			}

			if (skippedSlot.flag) continue;

			// A user hasn't skipped
			allSkipped = false;
		}

		// All players have finished playing, finish the match
		if (allSkipped) {
			const osuPacketWriter = new osu.Bancho.Writer;

			osuPacketWriter.MatchPlayerSkipped(user.id);
			osuPacketWriter.MatchSkip();

			this.matchStream.Send(osuPacketWriter.toBuffer);

			this.matchSkippedSlots = undefined;
		} else {
			const osuPacketWriter = new osu.Bancho.Writer;
			
			osuPacketWriter.MatchPlayerSkipped(user.id);

			this.matchStream.Send(osuPacketWriter.toBuffer);
		}
	}

	public transferHost(user:User, slotIDToTransferTo:number) {
		// Set the lobby's host to the new user
		const newHost = this.slots[slotIDToTransferTo].player;
		if (newHost instanceof Slot) {
			this.host = newHost;
			this.cachedMatchJSON.host = this.host.id;

			this.sendMatchUpdate();
		}
	}

	// TODO: Fix not being able to add DT when freemod is active
	public updateMods(user:User, mods:Mods) {
		const slot = user.matchSlot;
		if (!(slot instanceof Slot)) {
			return;
		}

		// Check if freemod is enabled or not
		if (this.specialModes === 1) {
			slot.mods = mods;

			this.sendMatchUpdate();
		} else {
			if (!User.Equals(this.host, user)) {
				return;
			} 

			this.activeMods = mods;

			this.sendMatchUpdate();
		}

		this.sharedContent.mutiplayerManager.UpdateLobbyListing();
	}

	startMatch() {
		// Make sure the match is not already in progress
		// The client sometimes double fires the start packet
		if (this.inProgress) {
			return;
		}
		this.inProgress = true;
		
		this.matchLoadSlots = new Array<MatchStartSkipData>();
		// Loop through all slots in the match
		for (let slot of this.slots) {
			// Make sure the slot has a user in it
			if (slot.player === undefined || slot.status === SlotStatus.Empty || slot.status === SlotStatus.Locked) {
				continue;
			}

			// Add the slot's user to the loaded checking array
			this.matchLoadSlots.push({
				playerId: slot.player?.id,
				flag: false
			});

			// Set the user's status to playing
			slot.status = 32;
		}

		const osuPacketWriter = new osu.Bancho.Writer;

		osuPacketWriter.MatchStart(this.generateMatchJSON());

		// Inform all users in the match that it has started
		this.matchStream.Send(osuPacketWriter.toBuffer);

		// Update all users in the match with new info
		this.sendMatchUpdate();

		// Update match listing in lobby to show the game is in progress
		this.sharedContent.mutiplayerManager.UpdateLobbyListing();
	}

	public matchPlayerLoaded(user:User) {
		if (this.matchLoadSlots === undefined) {
			return;
		}

		let allLoaded = true;
		for (let loadedSlot of this.matchLoadSlots) {
			if (loadedSlot.playerId === user.id) {
				loadedSlot.flag = true;
			}

			if (loadedSlot.flag) continue;

			allLoaded = false;
		}

		// All players have loaded the beatmap, start playing.
		if (allLoaded) {
			let osuPacketWriter = new osu.Bancho.Writer;
			osuPacketWriter.MatchAllPlayersLoaded();
			this.matchStream.Send(osuPacketWriter.toBuffer);

			// Blank out user loading array
			this.matchLoadSlots = undefined;

			this.playerScores = new Array<PlayerScore>();
			for (let slot of this.slots) {
				if (slot.player === undefined || slot.status === SlotStatus.Empty || slot.status === SlotStatus.Locked) {
					continue;
				}

				this.playerScores.push({
					player: slot.player,
					slot: slot,
					score: 0,
					isCurrentlyFailed: false,
					hasFailed: false,
					_raw: undefined,
				});
			}
		}
	}

	public async onPlayerFinishMatch(user:User) {
		if (this.matchLoadSlots === undefined) {
			// Repopulate user loading slots again
			this.matchLoadSlots = [];
			for (let slot of this.slots) {
				// Make sure the slot has a user
				if (slot.player === undefined || slot.status === SlotStatus.Empty || slot.status === SlotStatus.Locked) {
					continue;
				}
	
				// Populate user loading slots with this user's id and load status
				this.matchLoadSlots.push({
					playerId: slot.player?.id,
					flag: false
				}); 
			}
		}

		let allLoaded = true;
		for (let loadedSlot of this.matchLoadSlots) {
			if (loadedSlot.playerId == user.id) {
				loadedSlot.flag = true;
			}

			if (loadedSlot.flag) continue;

			// A user hasn't finished playing
			allLoaded = false;
		}

		// All players have finished playing, finish the match
		if (allLoaded) {
			await this.finishMatch();
		}
	}

	public async finishMatch() {
		if (!this.inProgress) {
			return;
		}

		this.matchLoadSlots = undefined;
		this.inProgress = false;

		let osuPacketWriter = new osu.Bancho.Writer;

		let queryData:Array<any> = [
			this.matchId,
			this.roundId++,
			this.playMode,
			this.matchType,
			this.matchScoringType,
			this.matchTeamType,
			this.activeMods,
			this.beatmapChecksum,
			(this.specialModes === 1) ? 1 : 0
		];

		if (this.playerScores === undefined) {
			throw "playerScores was null in a place it really shouldn't have been!";
		}

		for (let slot of this.slots) {
			// For every empty / locked slot push a null to the data array
			if (slot.player === undefined || slot.status === SlotStatus.Empty || slot.status === SlotStatus.Locked) {
				queryData.push(null);
				continue;
			}

			for (let _playerScore of this.playerScores) {
				if (_playerScore.player?.id === slot.player?.id && _playerScore._raw !== undefined) {
					const score = _playerScore._raw;
					queryData.push(`${slot.player?.id}|${score.totalScore}|${score.maxCombo}|${score.count300}|${score.count100}|${score.count50}|${score.countGeki}|${score.countKatu}|${score.countMiss}|${(score.currentHp == 254) ? 1 : 0}${(this.specialModes === 1) ? `|${slot.mods}` : ""}|${score.usingScoreV2 ? 1 : 0}${score.usingScoreV2 ? `|${score.comboPortion}|${score.bonusPortion}` : ""}`);
					break;
				}
			}

			slot.status = SlotStatus.NotReady;
		}

		await this.sharedContent.database.query("INSERT INTO mp_match_rounds (id, match_id, round_id, round_mode, match_type, round_scoring_type, round_team_type, round_mods, beatmap_md5, freemod, player0, player1, player2, player3, player4, player5, player6, player7, player8, player9, player10, player11, player12, player13, player14, player15) VALUES (NULL, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)", queryData);

		osuPacketWriter.MatchComplete();

		// Inform all users in the match that it is complete
		this.matchStream.Send(osuPacketWriter.toBuffer);
		// Update all users in the match with new info
		this.sendMatchUpdate();

		this.sharedContent.mutiplayerManager.UpdateLobbyListing();

		// TODO: Re-implement multiplayer extras
		//if (this.multiplayerExtras != null) this.multiplayerExtras.onMatchFinished(JSON.parse(JSON.stringify(this.playerScores)));

		this.playerScores = undefined;
	}

	updatePlayerScore(user:User, matchScoreData:MatchScoreData) {
		const osuPacketWriter = new osu.Bancho.Writer;

		if (user.matchSlot === undefined || user.matchSlot.player === undefined || this.playerScores === undefined) {
			return;
		}

		matchScoreData.id = user.matchSlot.player.id;

		// Update playerScores
		for (let playerScore of this.playerScores) {
			if (playerScore.player?.id == user.id) {
				playerScore.score = matchScoreData.totalScore;
				const isCurrentlyFailed = matchScoreData.currentHp == 254;
				playerScore.isCurrentlyFailed = isCurrentlyFailed;
				if (!playerScore.hasFailed && isCurrentlyFailed) {
					playerScore.hasFailed = true;
				}
				playerScore._raw = matchScoreData;

				break;
			}
		}
		
		osuPacketWriter.MatchScoreUpdate(matchScoreData);

		// Send the newly updated score to all users in the match
		this.matchStream.Send(osuPacketWriter.toBuffer);
	}

	matchFailed(user:User) {
		const osuPacketWriter = new osu.Bancho.Writer;

		// Make sure the user is in the match in a valid slot
		if (user.matchSlot === undefined) {
			return;
		}

		osuPacketWriter.MatchPlayerFailed(user.id);

		this.matchStream.Send(osuPacketWriter.toBuffer);
	}
}
