module.exports = function(id) {
    let user = null;
    for (let i = 0; i < global.users.length; i++) {
        if (global.users[i].id == id) {
            user = global.users[i];
            break;
        }
    }
    return user;
}