module.exports = function(CurrentUser, Message) {
	global.DatabaseHelper.query("UPDATE users_info SET away_message = ? WHERE id = ?", [Message.message, CurrentUser.id]);
}