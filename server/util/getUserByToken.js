module.exports = function(token) {
	if (global.userKeys.includes(token)) return global.users[token];
	else return null;
}