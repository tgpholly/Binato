const osu = require("osu-packet"),
	  UserPresenceBundle = require("./Packets/UserPresenceBundle.js"),
	  UserPresence = require("./Packets/UserPresence.js"),
	  StatusUpdate = require("./Packets/StatusUpdate.js"),
	  MultiplayerMatch = require("./MultiplayerMatch.js"),
	  Streams = require("./Streams.js"),
	  User = require("./User.js");

module.exports = class {
	constructor() {
		this.matches = [];
	}

	userEnterLobby(currentUser) {
		// If the user is currently already in a match force them to leave
		if (currentUser.currentMatch != null)
			currentUser.currentMatch.leaveMatch(currentUser);

		// Add user to the stream for the lobby
		Streams.addUserToStream("multiplayer_lobby", currentUser.uuid);

		// Send user ids of all online users to all users in the lobby
		Streams.sendToStream("multiplayer_lobby", UserPresenceBundle(currentUser, false), null);

		// Loop through all matches
		for (let i = 0; i < this.matches.length; i++) {
			// Loop through all the users in this match
			for (let i1 = 0; i1 < this.matches[i].slots.length; i1++) {
				const slot = this.matches[i].slots[i1];
				// Make sure there is a player / the slot is not locked
				if (slot.playerId == -1 || slot.status == 2) continue;

				// Send information for this user to all users in the lobby
				Streams.sendToStream("multiplayer_lobby", UserPresence(currentUser, slot.playerId, false), null);
				Streams.sendToStream("multiplayer_lobby", StatusUpdate(currentUser, slot.playerId, false), null);
			}
			const osuPacketWriter = new osu.Bancho.Writer;

			// List the match on the client
			osuPacketWriter.MatchNew(this.matches[i].createOsuMatchJSON());

			currentUser.addActionToQueue(osuPacketWriter.toBuffer);
		}
		
		const osuPacketWriter = new osu.Bancho.Writer;

		// Add the user to the #lobby channel
		if (!Streams.isUserInStream("#lobby", currentUser.uuid)) {
			Streams.addUserToStream("#lobby", currentUser.uuid);
			osuPacketWriter.ChannelJoinSuccess("#lobby");
		}
		
		currentUser.addActionToQueue(osuPacketWriter.toBuffer);
	}

	userLeaveLobby(currentUser) {
		// Remove user from the stream for the multiplayer lobby if they are a part of it
		if (Streams.isUserInStream("multiplayer_lobby", currentUser.uuid))
			Streams.removeUserFromStream("multiplayer_lobby", currentUser.uuid);
	}
	
	updateMatchListing() {
		// Send user ids of all online users to all users in the lobby
		Streams.sendToStream("multiplayer_lobby", UserPresenceBundle(null, false), null);

		// List through all matches
		for (let i = 0; i < this.matches.length; i++) {
			// List through all users in the match
			for (let i1 = 0; i1 < this.matches[i].slots.length; i1++) {
				const slot = this.matches[i].slots[i1];
				// Make sure the slot has a user in it / isn't locked
				if (slot.playerId == -1 || slot.status == 2) continue;

				// Send information for this user to all users in the lobby
				Streams.sendToStream("multiplayer_lobby", UserPresence(null, slot.playerId, false), null);
				Streams.sendToStream("multiplayer_lobby", StatusUpdate(null, slot.playerId, false), null);
			}
			const osuPacketWriter = new osu.Bancho.Writer;

			// List the match on the client
			osuPacketWriter.MatchNew(this.matches[i].createOsuMatchJSON());

			// Send this data back to every user in the lobby
			Streams.sendToStream("multiplayer_lobby", osuPacketWriter.toBuffer, null);
		}
	}

	async createMultiplayerMatch(MatchHost, MatchData) {
		let matchClass = null;
		this.matches.push(matchClass = await MultiplayerMatch.createMatch(MatchHost, MatchData));

		// Join the user to the newly created match
		this.joinMultiplayerMatch(MatchHost, {
			matchId: matchClass.matchId,
			gamePassword: matchClass.gamePassword
		});
	}

	joinMultiplayerMatch(JoiningUser, JoinInfo) {
		try {
			let osuPacketWriter = new osu.Bancho.Writer;
			const osuPacketWriter1 = new osu.Bancho.Writer;

			let matchIndex = 0;
			for (let i = 0; i < this.matches.length; i++) {
				if (this.matches[i].matchId == JoinInfo.matchId) {
					matchIndex = i;
					break;
				}
			}

			const streamName = this.matches[matchIndex].matchStreamName;
			const chatStreamName = this.matches[matchIndex].matchChatStreamName;
			const match = this.matches[matchIndex];

			let full = true;
			// Loop through all slots to find an empty one
			for (let i = 0; i < match.slots.length; i++) {
				const slot = match.slots[i];
				// Make sure the slot doesn't have a player in it / the slot is locked
				if (slot.playerId !== -1 || slot.status === 2) continue;

				// Slot is empty and not locked, we can join the match!
				full = false;
				slot.playerId = JoiningUser.id;
				JoiningUser.matchSlotId = i;
				slot.status = 4;
				break;
			}

			const matchJSON = match.createOsuMatchJSON();
			osuPacketWriter1.MatchUpdate(matchJSON);
			osuPacketWriter.MatchJoinSuccess(matchJSON);

			if (full) {
				throw "MatchFullException";
			}

			// Set the user's current match to this match
			JoiningUser.currentMatch = match;
			JoiningUser.inMatch = true;

			// Add user to the stream for the match
			Streams.addUserToStream(streamName, JoiningUser.uuid);
			Streams.addUserToStream(chatStreamName, JoiningUser.uuid);

			// Inform all users in the match that a new user has joined
			Streams.sendToStream(streamName, osuPacketWriter1.toBuffer, null);

			osuPacketWriter.ChannelJoinSuccess("#multiplayer");

			// Inform joining client they they have joined the match
			JoiningUser.addActionToQueue(osuPacketWriter.toBuffer);

			// Update the match listing for all users in the lobby since
			// A user has joined a match
			this.updateMatchListing();
		} catch (e) {
			// Inform the client that there was an issue joining the match
			const osuPacketWriter = new osu.Bancho.Writer;

			osuPacketWriter.MatchJoinFail();

			JoiningUser.addActionToQueue(osuPacketWriter.toBuffer);

			this.updateMatchListing();
		}
	}

	async leaveMultiplayerMatch(MatchUser = new User) {
		// Make sure the user is in a match
		if (MatchUser.currentMatch == null) return;

		const mpMatch = MatchUser.currentMatch;
		
		mpMatch.leaveMatch(MatchUser);

		let empty = true;
		// Check if the match is empty
		for (let i = 0; i < mpMatch.slots.length; i++) {
			const slot = mpMatch.slots[i];
			// Check if the slot is avaliable
			if (slot.playerId === -1) continue;
			
			// There is a user in the match
			empty = false;
			break;
		}

		// The match is empty, proceed to remove it.
		if (empty) {
			let matchIndex;
			// Loop through all matches
			for (let i = 0; i < this.matches.length; i++) {
				// If the match matches the match the user has left
				if (this.matches[i].matchStreamName == MatchUser.currentMatch.matchStreamName) {
					matchIndex = i;
					break;
				}
			}

			// Make sure we got a match index
			if (matchIndex == null) return;

			// Remove this match from the list of active matches
			this.matches.splice(matchIndex, 1);

			// Close the db match
			global.DatabaseHelper.query("UPDATE mp_matches SET close_time = UNIX_TIMESTAMP() WHERE id = ?", [mpMatch.matchId]);
		}

		MatchUser.currentMatch = null;
		MatchUser.matchSlotId = -1;

		MatchUser.inMatch = false;

		// Update the match listing to reflect this change (either removal or user leaving)
		this.updateMatchListing();
	}

	getMatch(MatchID) {
		for (let match in this.matches) {
			if (match.matchId == MatchID) return match;
		}
		return null;
	}
}