module.exports = function(CurrentUser, Message) {
	if (/[^0-9A-Za-z]/.test(Message.message)) return;
	global.DatabaseHelper.query(`UPDATE users_info SET away_message = '${Message.message}' WHERE id = ${CurrentUser.id}`);
}