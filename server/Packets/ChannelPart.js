module.exports = function(userClass, data) {
    global.StreamsHandler.removeUserFromStream(data, userClass.id);
}