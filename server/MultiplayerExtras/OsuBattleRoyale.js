const osu = require("osu-packet"),
	  MultiplayerMatch = require("../MultiplayerMatch.js"),
	  getUserById = require("../util/getUserById.js");

function sameScoreCheck(playerScores = [{playerId:0,slotId:0,score:0,isCurrentlyFailed:false}], lowestScore = 0) {
	for (let playerScore of playerScores) {
		// All players don't have the same score
		if (playerScore.score != lowestScore || playerScore.isCurrentlyFailed)
			return false;
	}

	return true;
}

function kickLowScorers(playerScores = [{playerId:0,slotId:0,score:0,isCurrentlyFailed:false}], MultiplayerMatch) {
	for (let playerScore of playerScores) {
		// Kick players if they have the lowest score or they are in a failed state
		if (playerScore.score == lowestScore || playerScore.isCurrentlyFailed) {
			let osuPacketWriter = new osu.Bancho.Writer;
			// Get the slot this player is in
			const slot = MultiplayerMatch.slots[playerScore.slotId];
			// Get the kicked player's user class
			const kickedPlayer = getUserById(slot.playerId);
			// Remove the kicked player's referance to the slot they were in
			kickedPlayer.matchSlotId = -1;
			// Lock the slot the kicked player was in
			slot.playerId = -1;
			slot.status = 2;
			// Remove the kicked player from the match's stream
			global.StreamsHandler.removeUserFromStream(MultiplayerMatch.matchStreamName, kickedPlayer.uuid);
			global.StreamsHandler.removeUserFromStream(MultiplayerMatch.matchChatStreamName, kickedPlayer.uuid);
			// Remove the kicked player's referance this this match
			kickedPlayer.currentMatch = null;

			// Inform the kicked user's client that they were kicked
			osuPacketWriter.MatchUpdate(MultiplayerMatch.createOsuMatchJSON());
			osuPacketWriter.SendMessage({
				sendingClient: global.users["bot"].username,
				message: "You were eliminated from the match!",
				target: global.users["bot"].username,
				senderId: global.users["bot"].id
			});

			kickedPlayer.addActionToQueue(osuPacketWriter.toBuffer);

			osuPacketWriter = new osu.Bancho.Writer;
			
			osuPacketWriter.SendMessage({
				sendingClient: global.users["bot"].username,
				message: `${kickedPlayer.username} was eliminated from the match!`,
				target: "#multiplayer",
				senderId: global.users["bot"].id
			});

			global.StreamsHandler.sendToStream(MultiplayerMatch.matchChatStreamName, osuPacketWriter.toBuffer, null);
		}
	}
}

function getRemainingPlayerCount(playerScores = [{playerId:0,slotId:0,score:0,isCurrentlyFailed:false}], MultiplayerMatch) {
	let numberOfPlayersRemaining = 0;
	for (let playerScore of playerScores) {
		const slot = MultiplayerMatch.slots[playerScore.slotId];

		if (slot.playerId !== -1 && slot.status !== 2) {
			numberOfPlayersRemaining++;
		}
	}

	return numberOfPlayersRemaining;
}

module.exports = class {
	constructor(MultiplayerMatchClass = new MultiplayerMatch) {
		this.name = "osu! Battle Royale";
		this.MultiplayerMatch = MultiplayerMatchClass;
	}

	onMatchFinished(playerScores = [{playerId:0,slotId:0,score:0,isCurrentlyFailed:false}]) {
		let lowestScore = 8589934588;
		// Find the lowest score
		for (let i = 0; i < playerScores.length; i++) {
			const playerScore = playerScores[i];
			if (playerScore.score < lowestScore) lowestScore = playerScore.score;
		}

		// Check if everyone has the same score, we don't need to kick anyone if they do.
		if (sameScoreCheck(playerScores)) return;

		// Kick everyone with the lowest score
		kickLowScorers(playerScores, this.MultiplayerMatch);

		// Get number of players remaining
		let numberOfPlayersRemaining = numberOfPlayersRemaining(playerScores, this.MultiplayerMatch);

		let playerClassContainer = null;
		let remainingWriterContainer = null;
		let i = 0;

		if (numberOfPlayersRemaining == 1) {
			for (let i1 = 0; i1 < playerScores.length; i++) {
				const slot = this.MultiplayerMatch.slots[playerScores[i].slotId];
				if (slot.playerId !== -1 && slot.status !== 2) {
					playerClassContainer = getUserById(slot.playerId);
					break;
				}
			}
		}

		switch (numberOfPlayersRemaining) {
			case 0:
				remainingWriterContainer = new osu.Bancho.Writer;
				remainingWriterContainer.SendMessage({
					sendingClient: global.users["bot"].username,
					message: "Everyone was eliminated from the match! Nobody wins.",
					target: global.users["bot"].username,
					senderId: global.users["bot"].id
				});
				for (i = 0; i < playerScores.length; i++) {
					playerClassContainer = getUserById(playerScores[i].playerId);
					playerClassContainer.addActionToQueue(remainingWriterContainer.toBuffer);
				}
			break;

			case 1:
				remainingWriterContainer = new osu.Bancho.Writer;
				remainingWriterContainer.SendMessage({
					sendingClient: global.users["bot"].username,
					message: "You are the last one remaining, you win!",
					target: global.users["bot"].username,
					senderId: global.users["bot"].id
				});
				playerClassContainer.addActionToQueue(remainingWriterContainer.toBuffer);
			break;
		}

		// Update match for players in the match
		this.MultiplayerMatch.sendMatchUpdate();
		// Update the match listing for users in the multiplayer lobby
		global.MultiplayerManager.updateMatchListing();
	}
}