module.exports = function(CurrentUser, FriendToRemove) {
	global.DatabaseHelper.query("DELETE FROM friends WHERE user = ? AND friendsWith = ? LIMIT 1", [CurrentUser.id, FriendToRemove]);
}