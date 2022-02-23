module.exports = function(id) {
	for (let user of global.users.getIterableItems()) {
		if (user.id == id) 
			return user;
	}
}