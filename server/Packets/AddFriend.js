module.exports = function(CurrentUser, FriendToAdd) {
    global.DatabaseHelper.query(`INSERT INTO friends (user, friendsWith) VALUES (${CurrentUser.id}, ${FriendToAdd});`);
}