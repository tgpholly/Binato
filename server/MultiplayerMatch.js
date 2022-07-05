const osu = require("osu-packet"),
	  getUserById = require("./util/getUserById.js"),
	  StatusUpdate = require("./Packets/StatusUpdate.js"),
	  User = require("./User.js");

// TODO: Cache the player's slot position in their user class for a small optimisation

module.exports = class {
	constructor(MatchHost = new User, MatchData = {matchId: -1,inProgress: false,matchType: 0,activeMods: 0,gameName: "",gamePassword: '',beatmapName: '',beatmapId: 1250198,beatmapChecksum: '',slots: [],host: 0,playMode: 0,matchScoringType: 0,matchTeamType: 0,specialModes: 0,seed: 0}) {
		this.matchId = global.getAndAddToHistoricalMultiplayerMatches();

		this.inProgress = MatchData.inProgress;
		this.matchStartCountdownActive = false;

		this.matchType = MatchData.matchType;

		this.activeMods = MatchData.activeMods;

		this.gameName = MatchData.gameName;
		if (MatchData.gamePassword == '') MatchData.gamePassword == null;
		this.gamePassword = MatchData.gamePassword;

		this.beatmapName = MatchData.beatmapName;
		this.beatmapId = MatchData.beatmapId;
		this.beatmapChecksum = MatchData.beatmapChecksum;

		this.slots = MatchData.slots;
		for (let i = 0; i < this.slots.length; i++) {
			this.slots[i].mods = 0;
		}

		this.host = MatchData.host;

		this.playMode = MatchData.playMode;

		this.matchScoringType = MatchData.matchScoringType;
		this.matchTeamType = MatchData.matchTeamType;
		this.specialModes = MatchData.specialModes;

		this.seed = MatchData.seed;

		this.matchStreamName = `mp_${this.matchId}`;
		this.matchChatStreamName = `mp_chat_${this.matchId}`;

		this.matchLoadSlots = null;
		this.matchSkippedSlots = null;

		this.playerScores = null;

		this.multiplayerExtras = null;

		this.isTourneyMatch = false;
		this.tourneyClientUsers = [];

		const osuPacketWriter = new osu.Bancho.Writer;

		// Update the status of the current user
		StatusUpdate(MatchHost, MatchHost.id);
		osuPacketWriter.MatchNew(this.createOsuMatchJSON());

		// Queue match creation for user
		MatchHost.addActionToQueue(osuPacketWriter.toBuffer);

		global.StreamsHandler.addStream(this.matchStreamName, true, this.matchId);
		global.StreamsHandler.addStream(this.matchChatStreamName, true, this.matchId);

		// Update the match listing for users in the multiplayer lobby
		global.MultiplayerManager.updateMatchListing();
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
		global.StreamsHandler.removeUserFromStream(this.matchStreamName, MatchUser.uuid);
		global.StreamsHandler.removeUserFromStream(this.matchChatStreamName, MatchUser.uuid);

		// Send this after removing the user from match streams to avoid a leave notification for self
		this.sendMatchUpdate();

		const osuPacketWriter = new osu.Bancho.Writer;

		// Remove user from the multiplayer channel for the match
		osuPacketWriter.ChannelRevoked("#multiplayer");

		MatchUser.addActionToQueue(osuPacketWriter.toBuffer);
	}

	updateMatch(MatchUser = new User, MatchData) {
		// Update match with new data
		this.inProgress = MatchData.inProgress;

		this.matchType = MatchData.matchType;

		this.activeMods = MatchData.activeMods;

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

		this.seed = MatchData.seed;

		this.sendMatchUpdate();

		// Update the match listing in the lobby to reflect these changes
		global.MultiplayerManager.updateMatchListing();
	}

	sendMatchUpdate() {
		const osuPacketWriter = new osu.Bancho.Writer;

		osuPacketWriter.MatchUpdate(this.createOsuMatchJSON());

		// Update all users in the match with new match information
		global.StreamsHandler.sendToStream(this.matchStreamName, osuPacketWriter.toBuffer, null);
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
				global.StreamsHandler.removeUserFromStream(this.matchStreamName, cachedPlayerToken);
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

			global.StreamsHandler.sendToStream(this.matchStreamName, osuPacketWriter.toBuffer, null);

			this.matchSkippedSlots = null;
		} else {
			const osuPacketWriter = new osu.Bancho.Writer;
			
			osuPacketWriter.MatchPlayerSkipped(MatchUser.id);

			global.StreamsHandler.sendToStream(this.matchStreamName, osuPacketWriter.toBuffer, null);
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
		global.StreamsHandler.sendToStream(this.matchStreamName, osuPacketWriter.toBuffer, null);

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
			global.StreamsHandler.sendToStream(this.matchStreamName, osuPacketWriter.toBuffer, null);

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

	onPlayerFinishMatch(MatchUser = new User) {
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
		if (allLoaded) this.finishMatch();
	}

	finishMatch() {
		if (!this.inProgress) return;
		this.matchLoadSlots = null;
		this.inProgress = false;
		let osuPacketWriter = new osu.Bancho.Writer;

		// Loop through all slots in the match
		for (let slot of this.slots) {
			// Make sure the slot has a user
			if (slot.playerId === -1 || slot.status === 1 || slot.status === 2) continue;

			// Set the user's status back to normal from playing
			slot.status = 4;
		}

		osuPacketWriter.MatchComplete();

		// Inform all users in the match that it is complete
		global.StreamsHandler.sendToStream(this.matchStreamName, osuPacketWriter.toBuffer, null);

		// Update all users in the match with new info
		this.sendMatchUpdate();

		// Update match info in the lobby to reflect that the match has finished
		global.MultiplayerManager.updateMatchListing();

		if (this.multiplayerExtras != null) this.multiplayerExtras.onMatchFinished(JSON.parse(JSON.stringify(this.playerScores)));

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
				break;
			}
		}
		
		osuPacketWriter.MatchScoreUpdate(MatchScoreData);

		// Send the newly updated score to all users in the match
		global.StreamsHandler.sendToStream(this.matchStreamName, osuPacketWriter.toBuffer, null);
	}

	matchFailed(MatchUser = new User) {
		const osuPacketWriter = new osu.Bancho.Writer;

		// Make sure the user's slot ID is not invalid
		if (MatchUser.matchSlotId == -1) return;

		osuPacketWriter.MatchPlayerFailed(MatchUser.id);

		global.StreamsHandler.sendToStream(this.matchStreamName, osuPacketWriter.toBuffer, null);
	}
}