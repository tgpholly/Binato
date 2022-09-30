module.exports = function(token) {
	return global.users.getByKey(token);
}