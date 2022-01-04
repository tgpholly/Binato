module.exports = function(CurrentUser, FriendToRemove) {
	global.DatabaseHelper.query(`DELETE FROM friends WHERE user = ${CurrentUser.id} AND friendsWith = ${FriendToRemove} LIMIT 1`);
}