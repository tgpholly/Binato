const UserPresenceBundle = require("./UserPresenceBundle.js"),
      UserPresence = require("./UserPresence.js"),
      StatusUpdate = require("./StatusUpdate.js");

module.exports = function (currentUser, data = [0]) {
    UserPresenceBundle(currentUser);

    for (let i1 = 0; i1 < data.length; i1++) {
        const CurrentUserID = data[i1];

        UserPresence(currentUser, CurrentUserID);
        StatusUpdate(currentUser, CurrentUserID);
    }
}