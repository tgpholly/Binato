module.exports = function(username) {
	for (let i = 0; i < global.userKeys.length; i++) {
		if (global.users[global.userKeys[i]].username == username)
			return global.users[global.userKeys[i]];
	}
}