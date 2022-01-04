const getUserByToken = require("./util/getUserByToken.js"),
	  consoleHelper = require("../consoleHelper.js");

module.exports = class {
	constructor() {
		this.avaliableStreams = {};
		this.avaliableStreamKeys = [];
	}

	addStream(streamName = "", removeIfEmpty = false, spectatorHostId = null) {
		// Make sure a stream with the same name doesn't exist already
		if (this.avaliableStreamKeys.includes(streamName))
			return consoleHelper.printBancho(`Did not add stream [${streamName}] A stream with the same name already exists`);
		// Add new stream to the list of streams
		this.avaliableStreams[streamName] = {
			streamUsers: [], // An array containing a list of user tokens of the users in a given stream
			streamSpectatorHost: spectatorHostId, // null unless stream is for spectating
			removeIfEmpty: removeIfEmpty
		}
		this.avaliableStreamKeys = Object.keys(this.avaliableStreams);
		consoleHelper.printBancho(`Added stream [${streamName}]`);
	}

	// Checks if a stream has no users in it
	streamChecker(interval = 5000) {
		setInterval(() => {
			// Get the names of all currently avaliable streams
			const streams = global.StreamsHandler.getStreams();
			// Loop through all streams
			for (let i = 0; i < streams.length; i++) {
				// Get the current stream
				const currentStream = global.StreamsHandler.avaliableStreams[streams[i]];
				// Check if the stream should be removed if there are no users in it
				// And if the stream has no users in it
				if (currentStream.removeIfEmpty && currentStream.streamUsers.length == 0) {
					global.StreamsHandler.removeStream(streams[i]);
					consoleHelper.printBancho(`Removed stream [${streams[i]}] There were no users in stream`);
				}
			}
		}, interval);
		consoleHelper.printBancho(`BinatoStream is running! Checks running at a ${interval}ms interval`);
	}

	sendToStream(streamName, streamData, initUser = null) {
		// Make sure the stream we are attempting to send to even exists
		if (!this.doesStreamExist(streamName))
			return consoleHelper.printBancho(`Did not send to stream [${streamName}] because it does not exist!`);

		// Get the stream to send the data to
		const currentStream = this.avaliableStreams[streamName];

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

	addUserToStream(streamName, userToken) {
		// Make sure the stream we are attempting to add this user to even exists
		if (!this.doesStreamExist(streamName))
			return consoleHelper.printBancho(`Did not add user to stream [${streamName}] because it does not exist!`);

		// Make sure the user isn't already in the stream
		if (this.avaliableStreams[streamName].streamUsers.includes(userToken))
			return consoleHelper.printBancho(`Did not add user to stream [${streamName}] because they are already in it!`);

		// Make sure this isn't an invalid user (userId can't be lower than 1)
		if (userToken == "" || userToken == null)
			return consoleHelper.printBancho(`Did not add user to stream [${streamName}] because their token is invalid!`);

		// Add user's token to the stream's user list
		this.avaliableStreams[streamName].streamUsers.push(userToken);
		consoleHelper.printBancho(`Added user [${userToken}] to stream ${streamName}`);
	}

	removeUserFromStream(streamName, userToken) {
		// Make sure the stream we are attempting to add this user to even exists
		if (!this.doesStreamExist(streamName))
			return consoleHelper.printBancho(`Did not remove user from stream [${streamName}] because it does not exist!`);

		// Make sure the user isn't already in the stream
		if (!this.avaliableStreams[streamName].streamUsers.includes(userToken))
			return consoleHelper.printBancho(`Did not remove user from stream [${streamName}] because they are not in it!`);

		// Make sure this isn't an invalid user (userId can't be lower than 1)
		if (userToken == "" || userToken == null)
			return consoleHelper.printBancho(`Did not remove user from stream [${streamName}] because their userId is invalid!`);
		try {
			// Find index of user to remove
			let userCurrentIndex;
			for (let i = 0; i < this.avaliableStreams[streamName].streamUsers.length; i++) {
				if (userToken == this.avaliableStreams[streamName].streamUsers[i]) {
					userCurrentIndex = i;
					break;
				}
			}

			// Remove user from stream's user list
			this.avaliableStreams[streamName].streamUsers.splice(userCurrentIndex, 1);
			consoleHelper.printBancho(`Removed user [${userToken}] from stream ${streamName}`);
		} catch (e) { consoleHelper.printBancho(`Can't Remove user [${userToken}] from stream ${streamName}`); }
	}

	doesStreamExist(streamName) {
		return this.avaliableStreamKeys.includes(streamName);
	}

	getStreams() {
		// Return the names of all avaliable streams
		return this.avaliableStreamKeys;
	}

	isUserInStream(streamName, userToken) {
		if (this.avaliableStreams[streamName].streamUsers.includes(userToken)) return true;
		else return false;
	}

	removeStream(streamName) {
		try {
			delete this.avaliableStreams[streamName];
			this.avaliableStreamKeys = Object.keys(this.avaliableStreams);
		} catch (e) { consoleHelper.printError(`Was not able to remove stream [${streamName}]`) }
	}
}