const DatabaseHelper = require("../DatabaseHelper.js");

module.exports = function(CurrentUser, FriendToAdd) {
    DatabaseHelper.getFromDB(`INSERT INTO friends (user, friendsWith) VALUES (${CurrentUser.id}, ${FriendToAdd});`);
}