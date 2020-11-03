module.exports = function(id) {
    for (let i = 0; i < global.users.length; i++) {
        if (global.users[i].id == id) 
            return global.users[i];
    }
}