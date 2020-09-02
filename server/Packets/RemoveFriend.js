const DatabaseHelper = require("../DatabaseHelper.js");

module.exports = function(CurrentUser, FriendToRemove) {
    DatabaseHelper.getFromDB(`DELETE FROM friends WHERE user = ${CurrentUser.id} AND friendsWith = ${FriendToRemove} LIMIT 1`);
} 