module.exports = function(username) {
	for (let user of global.users.getIterableItems()) {
		if (user.username === username)
			return user;
	}
}