module.exports = function(id) {
	for (let i = 0; i < global.userKeys.length; i++) {
		if (global.users[global.userKeys[i]].id == id) 
			return global.users[userKeys[i]];
	}
}