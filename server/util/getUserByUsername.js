module.exports = function(username) {
    let user = null;
    for (let i = 0; i < global.users.length; i++) {
        if (global.users[i].username == username) {
            user = global.users[i];
            break;
        }
    }
    return user;
}