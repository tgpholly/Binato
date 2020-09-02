const getUserById = require("./util/getUserById.js");

module.exports = class {
    constructor() {
        this.avaliableStreams = {};
    }

    addStream(streamName, removeIfEmpty, spectatorHostId = null) {
        const streamNames = Object.keys(this.avaliableStreams);
        if (streamNames.includes(streamName)) return global.consoleHelper.printBancho(`Did not add stream [${streamName}] A stream with the same name already exists`);
        // Add new stream to the list of streams
        this.avaliableStreams[streamName] = {
            streamUsers: [], // An array containing a list of user IDs of the users in a given stream
            streamSpectatorHost: spectatorHostId, // null unless stream is for spectating
            removeIfEmpty: removeIfEmpty
        }
        global.consoleHelper.printBancho(`Added stream [${streamName}]`);
    }

    // Checks if a stream has no users in it
    streamChecker(interval) {
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
                    global.consoleHelper.printBancho(`Removed stream [${streams[i]}] There were no users in stream`);
                }
            }
        }, interval);
        global.consoleHelper.printBancho(`BinatoStream is running! Checks running at a ${interval}ms interval`);
    }

    sendToStream(streamName, streamData, initUser = null) {
        // Get the stream to send the data to
        const currentStream = this.avaliableStreams[streamName];

        try {
            // Loop through the users in this stream
            for (let i = 0; i < currentStream.streamUsers.length; i++) {
                // Get the user id of the user in the queue
                const currentUserId = currentStream.streamUsers[i];
                // Make sure we don't send this data back to the user requesting this data to be sent
                if (initUser != null && currentUserId == initUser && (streamName[0] == "#" || streamName.includes("mp_"))) continue;
                if (currentUserId == 3) continue; // Skip if user is bot

                // Get user object
                const currentUser = getUserById(currentUserId);
                // Skip if user is nonexistant
                if (currentUser == null) continue;

                // Send stream data to user's own queue
                currentUser.addActionToQueue(streamData);
            }
        } catch (e) {}
    }

    addUserToStream(streamName, userId) {
        // Add user's id to the stream's user list
        this.avaliableStreams[streamName].streamUsers.push(userId);
        global.consoleHelper.printBancho(`Added user [${userId}] to stream ${streamName}`);
    }

    removeUserFromStream(streamName, userId) {
        // Make sure this isn't an invalid user
        if (userId == -1 || userId == null) return;
        try {
            // Find index of user to remove
            let userCurrentIndex;
            for (let i = 0; i < this.avaliableStreams[streamName].streamUsers.length; i++) {
                if (userId == this.avaliableStreams[streamName].streamUsers[i]) {
                    userCurrentIndex = i;
                    break;
                }
            }

            // Remove user from stream's user list
            this.avaliableStreams[streamName].streamUsers.splice(userCurrentIndex, 1);
            global.consoleHelper.printBancho(`Removed user [${userId}] from stream ${streamName}`);
        } catch (e) { global.consoleHelper.printBancho(`Can't Remove user [${userId}] from stream ${streamName}`); }
    }

    doesStreamExist(streamName) {
        let exist = false;
        const streamList = Object.keys(this.avaliableStreams);
        for (let i = 0; i < streamList.length; i++) {
            if (streamList[i] == streamName) {
                exist = true;
                break;
            }
        }

        return exist;
    }

    getStreams() {
        // Return the names of all avaliable streams
        return Object.keys(this.avaliableStreams);
    }

    isUserInStream(streamName, userId) {
        if (this.avaliableStreams[streamName].streamUsers.includes(userId)) return true;
        else return false;
    }

    removeStream(streamName) {
        try {
            delete this.avaliableStreams[streamName];
        } catch (e) { global.consoleHelper.printError(`Was not able to remove stream [${streamName}]`) }
    }
}