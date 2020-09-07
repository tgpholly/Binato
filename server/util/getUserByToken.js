module.exports = function(token) {
    let user = null;
    for (let i = 0; i < global.users.length; i++) {
        if (global.users[i].uuid == token) {
            user = global.users[i];
            break;
        }
    }
    return user;
}