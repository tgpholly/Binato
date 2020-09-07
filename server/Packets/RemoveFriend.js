module.exports = function(CurrentUser, FriendToRemove) {
    global.DatabaseHelper.executeInDB(`DELETE FROM friends WHERE user = ${CurrentUser.id} AND friendsWith = ${FriendToRemove} LIMIT 1`);
} 