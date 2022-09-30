const getUserByToken = require("./util/getUserByToken.js"),
	  consoleHelper = require("../consoleHelper.js");

module.exports = class {
	static init() {
		global.avaliableStreams = {};
		global.avaliableStreamKeys = [];
	}

	static addStream(streamName = "", removeIfEmpty = false, spectatorHostId = null) {
		// Make sure a stream with the same name doesn't exist already
		if (global.avaliableStreamKeys.includes(streamName))
			return consoleHelper.printBancho(`Did not add stream [${streamName}] A stream with the same name already exists`);
		// Add new stream to the list of streams
		global.avaliableStreams[streamName] = {
			streamUsers: [], // An array containing a list of user tokens of the users in a given stream
			streamSpectatorHost: spectatorHostId, // null unless stream is for spectating
			removeIfEmpty: removeIfEmpty
		}
		global.avaliableStreamKeys = Object.keys(global.avaliableStreams);
		consoleHelper.printBancho(`Added stream [${streamName}]`);
	}

	static removeStream(streamName) {
		try {
			delete global.avaliableStreams[streamName];
			global.avaliableStreamKeys = Object.keys(global.avaliableStreams);
		} catch (e) {
			consoleHelper.printError(`Was not able to remove stream [${streamName}]`);
			console.error(e);
		}
	}

	static addUserToStream(streamName, userToken) {
		// Make sure the stream we are attempting to add this user to even exists
		if (!this.exists(streamName))
			return consoleHelper.printBancho(`Did not add user to stream [${streamName}] because it does not exist!`);

		// Make sure the user isn't already in the stream
		if (global.avaliableStreams[streamName].streamUsers.includes(userToken))
			return consoleHelper.printBancho(`Did not add user to stream [${streamName}] because they are already in it!`);

		// Make sure this isn't an invalid user (userId can't be lower than 1)
		if (userToken == "" || userToken == null)
			return consoleHelper.printBancho(`Did not add user to stream [${streamName}] because their token is invalid!`);

		// Add user's token to the stream's user list
		global.avaliableStreams[streamName].streamUsers.push(userToken);
		consoleHelper.printBancho(`Added user [${userToken}] to stream ${streamName}`);
	}

	static removeUserFromStream(streamName, userToken) {
		// Make sure the stream we are attempting to add this user to even exists
		if (!this.exists(streamName))
			return consoleHelper.printBancho(`Did not remove user from stream [${streamName}] because it does not exist!`);

		const stream = global.avaliableStreams[streamName];

		// Make sure the user isn't already in the stream
		if (!stream.streamUsers.includes(userToken))
			return consoleHelper.printBancho(`Did not remove user from stream [${streamName}] because they are not in it!`);

		// Make sure this isn't an invalid user (userId can't be lower than 1)
		if (userToken == "" || userToken == null)
			return consoleHelper.printBancho(`Did not remove user from stream [${streamName}] because their userId is invalid!`);
		try {
			// Find index of user to remove
			let userCurrentIndex;
			for (let i = 0; i < stream.streamUsers.length; i++) {
				if (userToken == stream.streamUsers[i]) {
					userCurrentIndex = i;
					break;
				}
			}

			// Remove user from stream's user list
			stream.streamUsers.splice(userCurrentIndex, 1);
			consoleHelper.printBancho(`Removed user [${userToken}] from stream ${streamName}`);
		} catch (e) {
			consoleHelper.printBancho(`Can't Remove user [${userToken}] from stream ${streamName}`);
			console.error(e);
		}

		if (stream.removeIfEmpty && stream.streamUsers.length == 0) {
			this.removeStream(streamName);
			consoleHelper.printBancho(`Removed stream [${streamName}] There were no users in stream`);
		}
	}

	static sendToStream(streamName, streamData, initUser = null) {
		// Make sure the stream we are attempting to send to even exists
		if (!this.exists(streamName))
			return consoleHelper.printBancho(`Did not send to stream [${streamName}] because it does not exist!`);

		// Get the stream to send the data to
		const currentStream = global.avaliableStreams[streamName];

		// Loop through the users in this stream
		for (let i = 0; i < currentStream.streamUsers.length; i++) {
			// Get the user token of the user in the queue
			const currentUserToken = currentStream.streamUsers[i];
			// Make sure we don't send this data back to the user requesting this data to be sent
			if (initUser != null && currentUserToken == initUser && (streamName[0] == "#" || streamName.includes("mp_"))) continue;
			if (currentUserToken == 3) continue; // Skip if user is bot

			// Get user object
			const currentUser = getUserByToken(currentUserToken);
			// Skip if user is nonexistant
			if (currentUser == null) continue;

			// Send stream data to user's own queue
			currentUser.addActionToQueue(streamData);
		}
	}

	static exists(streamName) {
		return global.avaliableStreamKeys.includes(streamName);
	}

	static getStreams() {
		// Return the names of all avaliable streams
		return global.avaliableStreamKeys;
	}

	static isUserInStream(streamName, userToken) {
		if (global.avaliableStreams[streamName].streamUsers.includes(userToken)) return true;
		else return false;
	}
}