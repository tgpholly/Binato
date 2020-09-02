module.exports = function(userClass, data) {
    if (data == "#multiplayer") return; // Ignore requests for multiplayer

    global.StreamsHandler.removeUserFromStream(data, userClass.id);
}