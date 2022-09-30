const osu = require("osu-packet"),
	  getUserById = require("./util/getUserById.js"),
	  Streams = require("./Streams.js");

module.exports = {
	startSpectatingUser:function(currentUser, spectatedId) {
		// Get the user this user is trying to spectate
		const User = getUserById(spectatedId);
		if (Streams.exists(`sp_${User.id}`)) {
			// Just add user to stream since it already exists
			Streams.addUserToStream(`sp_${User.id}`, currentUser.uuid);
		} else {
			// Stream doesn't exist, create it and add the spectator
			Streams.addStream(`sp_${User.id}`, true, spectatedId);
			Streams.addUserToStream(`sp_${User.id}`, currentUser.uuid);
		}

		// We want to do this stuff regardless
		// Create a new osu packet writer
		let osuPacketWriter = new osu.Bancho.Writer;

		// Set the user requesting to be spectating this user
		currentUser.spectating = spectatedId;
		
		// Tell the client of the user being spectated that they are being spectated
		osuPacketWriter.SpectatorJoined(currentUser.id);

		// Send the packet to the spectated user's queue
		User.addActionToQueue(osuPacketWriter.toBuffer);

		// Make a new clear osu packet writer
		osuPacketWriter = new osu.Bancho.Writer;

		// Tell everyone spectating this user that another user has started spectating
		osuPacketWriter.FellowSpectatorJoined(currentUser.id);

		// Send this packet to all the spectators
		Streams.sendToStream(`sp_${User.id}`, osuPacketWriter.toBuffer);
	},

	sendSpectatorFrames(currentUser, data) {
		// Create new osu packet writer
		const osuPacketWriter = new osu.Bancho.Writer;

		// Data containing the user's actions
		osuPacketWriter.SpectateFrames(data);

		// Send the frames to all the spectators
		Streams.sendToStream(`sp_${currentUser.id}`, osuPacketWriter.toBuffer, null);
	},

	stopSpectatingUser(currentUser) {
		// Get the user this user is spectating
		const spectatedUser = getUserById(currentUser.spectating);
		// Create new osu packet writer
		let osuPacketWriter = new osu.Bancho.Writer;

		// Inform the client being spectated that this user has stopped spectating
		osuPacketWriter.SpectatorLeft(currentUser.id);

		// Add this packet to the spectated user's queue
		spectatedUser.addActionToQueue(osuPacketWriter.toBuffer);

		// Remove this user from the spectator stream
		Streams.removeUserFromStream(`sp_${spectatedUser.id}`, currentUser.uuid);

		// Make a new clear osu packet writer
		osuPacketWriter = new osu.Bancho.Writer;

		// Inform other users spectating that this spectator has left
		osuPacketWriter.FellowSpectatorLeft(currentUser.id);

		// Send this packet to all spectators
		Streams.sendToStream(`sp_${spectatedUser.id}`, osuPacketWriter.toBuffer);
	}
}