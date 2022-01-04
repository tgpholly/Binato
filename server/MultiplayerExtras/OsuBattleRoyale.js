const osu = require("osu-packet"),
	  MultiplayerMatch = require("../MultiplayerMatch.js"),
	  getUserById = require("../util/getUserById.js");

module.exports = class {
	constructor(MultiplayerMatchClass = new MultiplayerMatch()) {
		this.name = "osu! Battle Royale";
		this.MultiplayerMatch = MultiplayerMatchClass;
	}

	onMatchFinished(playerScores = [{playerId:0,slotId:0,score:0,isCurrentlyFailed:false}]) {
		let lowestScore = 9999999999999999;
		for (let i = 0; i < playerScores.length; i++) {
			const playerScore = playerScores[i];
			if (playerScore.score < lowestScore) lowestScore = playerScore.score;
		}

		let everyoneHasTheSameScore = true;
		for (let i = 0; i < playerScores.length; i++) {
			if (playerScores[i].score != lowestScore) {
				everyoneHasTheSameScore = false;
				break;
			}
		}

		// Everyone has the same score, we don't need to kick anyone
		if (everyoneHasTheSameScore) return;

		// Kick everyone with the lowest score
		for (let i = 0; i < playerScores.length; i++) {
			// Kick players if they have the lowest score or they are in a failed state
			if (playerScores[i].score == lowestScore || playerScores[i].isCurrentlyFailed) {
				let osuPacketWriter = new osu.Bancho.Writer;
				// Get the slot this player is in
				const slot = this.MultiplayerMatch.slots[playerScores[i].slotId];
				// Get the kicked player's user class
				const kickedPlayer = getUserById(slot.playerId);
				// Remove the kicked player's referance to the slot they were in
				kickedPlayer.matchSlotId = -1;
				// Lock the slot the kicked player was in
				slot.playerId = -1;
				slot.status = 2;
				// Remove the kicked player from the match's stream
				global.StreamsHandler.removeUserFromStream(this.MultiplayerMatch.matchStreamName, kickedPlayer.uuid);
				global.StreamsHandler.removeUserFromStream(this.MultiplayerMatch.matchChatStreamName, kickedPlayer.uuid);
				// Remove the kicked player's referance this this match
				kickedPlayer.currentMatch = null;

				// Inform the kicked user's client that they were kicked
				osuPacketWriter.MatchUpdate(this.MultiplayerMatch.createOsuMatchJSON());
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

				global.StreamsHandler.sendToStream(this.MultiplayerMatch.matchChatStreamName, osuPacketWriter.toBuffer, null);
			}
		}

		let numberOfPlayersRemaining = 0;
		for (let i = 0; i < playerScores.length; i++) {
			const slot = this.MultiplayerMatch.slots[playerScores[i].slotId];

			if (slot.playerId !== -1 && slot.status !== 2) {
				numberOfPlayersRemaining++;
			}
		}

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

			default:
				break;
		}

		this.MultiplayerMatch.sendMatchUpdate();
		// Update the match listing for users in the multiplayer lobby
		global.MultiplayerManager.updateMatchListing();
	}
}