module.exports = {
    getUserFromID:function(id) {
        let userToReturn;
        for (let i = 0; i < global.users.length; i++) {
            if (global.users[i].id == id) {
                userToReturn = global.users[i];
                i = global.users.length;
            } else {
                continue;
            }
        }
        return userToReturn;
    },

    getUserFromUsername:function(username) {
        let userToReturn;
        for (let i = 0; i < global.users.length; i++) {
            if (global.users[i].username == username) {
                userToReturn = global.users[i];
                break;
            } else {
                continue;
            }
        }
        return userToReturn;
    },

    getUserFromToken:function(token) {
        let userToReturn;
        for (let i = 0; i < global.users.length; i++) {
            if (global.users[i].uuid == token) {
                userToReturn = global.users[i];
                i = global.users.length;
            } else {
                continue;
            }
        }
        return userToReturn;
    },

    queueActionForAll:function(action) {
        for (let i = 0; i < global.users.length; i++) {
            global.users[i].addActionToQueue(action);
        }
    },

    queueActionForAllWithoutCallingUser:function(action, token) {
        for (let i = 0; i < global.users.length; i++) {
            if (global.users[i].uuid == token) {
                continue;
            }
            global.users[i].addActionToQueue(action);
        }
    }
}