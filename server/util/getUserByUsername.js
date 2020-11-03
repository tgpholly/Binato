module.exports = function(username) {
    for (let i = 0; i < global.users.length; i++) {
        if (global.users[i].username == username)
            return global.users[i];
    }
}