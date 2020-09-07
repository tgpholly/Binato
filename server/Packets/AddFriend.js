module.exports = function(CurrentUser, FriendToAdd) {
    global.DatabaseHelper.executeInDB(`INSERT INTO friends (user, friendsWith) VALUES (${CurrentUser.id}, ${FriendToAdd});`);
}