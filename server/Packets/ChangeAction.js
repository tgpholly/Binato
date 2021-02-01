const StatusUpdate = require("./StatusUpdate.js");

module.exports = function(currentUser, data) {
    currentUser.updatePresence(data);

    if (global.StreamsHandler.doesStreamExist(`sp_${currentUser.username}`)) {
        const statusUpdate = StatusUpdate(currentUser, currentUser.id, false);
        global.StreamsHandler.sendToStream(`sp_${currentUser.username}`, statusUpdate, null);
    }
}