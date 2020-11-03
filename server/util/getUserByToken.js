module.exports = function(token) {
    for (let i = 0; i < global.users.length; i++) {
        if (global.users[i].uuid == token)
            return global.users[i];
    }
}