const osu = require("osu-packet"),
      getUserById = require("./util/getUserById.js"),
      StatusUpdate = require("./Packets/StatusUpdate.js");

module.exports = {
    userEnterLobby:function(currentUser) {
        // If the user is currently already in a match force them to leave
        if (currentUser.currentMatch != null) {
            this.leaveMatch(currentUser);
            currentUser.currentMatch = null;
        }

        // Add user to the stream for the lobby
        global.StreamsHandler.addUserToStream("multiplayer_lobby", currentUser.id);

        const osuPacketWriter1 = new osu.Bancho.Writer;
        let userIds = [];

        // Add the ID of every user connected to the server to an array
        for (let i = 0; i < global.users.length; i++) {
            userIds.push(global.users[i].id);
        }

        // Send all user ids back to the client
        osuPacketWriter1.UserPresenceBundle(userIds);

        // Send user ids to all users in the lobby
        global.StreamsHandler.sendToStream("multiplayer_lobby", osuPacketWriter1.toBuffer, null);

        // Loop through all matches
        for (let i = 0; i < global.matches.length; i++) {
            // Loop through all the users in this match
            for (let i1 = 0; i1 < global.matches[i][1].slots.length; i1++) {
                const slot = global.matches[i][1].slots[i1];
                // Make sure there is a player / the slot is not locked
                if (slot.playerId == -1 || slot.status == 2) continue;
                const osuPacketWriter = new osu.Bancho.Writer;

                // Get user in this slot
                const User = getUserById(slot.playerId);

                // Get user score info from the database
                const userScoreDB = global.DatabaseHelper.getFromDB(`SELECT * FROM users_modes_info WHERE user_id = ${User.id} AND mode_id = ${User.playMode} LIMIT 1`);

                let UserStatusObject = {
                    userId: User.id,
                    status: User.actionID,
                    statusText: User.actionText,
                    beatmapChecksum: User.beatmapChecksum,
                    currentMods: User.currentMods,
                    playMode: User.playMode,
                    beatmapId: User.beatmapID,
                    rankedScore: userScoreDB.ranked_score,
                    accuracy: userScoreDB.avg_accuracy / 100, // Scale of 0 to 1
                    playCount: userScoreDB.playcount,
                    totalScore: userScoreDB.total_score,
                    rank: User.rank, 
                    performance: userScoreDB.pp_raw
                };

                // Send user status back for client display
                osuPacketWriter.HandleOsuUpdate(UserStatusObject);

                // Send this data back to every user in the lobby
                global.StreamsHandler.sendToStream("multiplayer_lobby", osuPacketWriter.toBuffer, null);
            }
            const osuPacketWriter = new osu.Bancho.Writer;

            // List the match on the client
            osuPacketWriter.MatchNew(global.matches[i][1]);

            currentUser.addActionToQueue(osuPacketWriter.toBuffer);
        }
        const osuPacketWriter = new osu.Bancho.Writer;

        // Add the user to the #lobby channel
        osuPacketWriter.ChannelJoinSuccess("#lobby");
        if (!global.StreamsHandler.isUserInStream("#lobby", currentUser.id))
            global.StreamsHandler.addUserToStream("#lobby", currentUser.id);
        
        currentUser.addActionToQueue(osuPacketWriter.toBuffer);
    },

    userLeaveLobby:function(currentUser) {
        // Remove user from the stream for the multiplayer lobby if they are a part of it
        if (global.StreamsHandler.isUserInStream("multiplayer_lobby", currentUser.id))
            global.StreamsHandler.removeUserFromStream("multiplayer_lobby", currentUser.id);
    },

    updateMatchListing:function() {
        const osuPacketWriter1 = new osu.Bancho.Writer;
        let userIds = [];

        // Add the ID of every user connected to the server to an array
        for (let i = 0; i < global.users.length; i++) {
            userIds.push(global.users[i].id);
        }

        // Send all user ids back to the client
        osuPacketWriter1.UserPresenceBundle(userIds);

        // Send user ids to all users in the lobby
        global.StreamsHandler.sendToStream("multiplayer_lobby", osuPacketWriter1.toBuffer, null);
        // List through all matches
        for (let i = 0; i < global.matches.length; i++) {
            // List through all users in the match
            for (let i1 = 0; i1 < global.matches[i][1].slots.length; i1++) {
                const slot = global.matches[i][1].slots[i1];
                // Make sure the slot has a user in it / isn't locked
                if (slot.playerId == -1 || slot.status == 2) continue;
                const osuPacketWriter = new osu.Bancho.Writer;

                // Get the user in this slot
                const User = getUserById(slot.playerId);

                // Get user score info from the database
                const userScoreDB = global.DatabaseHelper.getFromDB(`SELECT * FROM users_modes_info WHERE user_id = ${User.id} AND mode_id = ${User.playMode} LIMIT 1`);

                let UserStatusObject = {
                    userId: User.id,
                    status: User.actionID,
                    statusText: User.actionText,
                    beatmapChecksum: User.beatmapChecksum,
                    currentMods: User.currentMods,
                    playMode: User.playMode,
                    beatmapId: User.beatmapID,
                    rankedScore: userScoreDB.ranked_score,
                    accuracy: userScoreDB.avg_accuracy / 100, // Scale of 0 to 1
                    playCount: userScoreDB.playcount,
                    totalScore: userScoreDB.total_score,
                    rank: User.rank, 
                    performance: userScoreDB.pp_raw
                };

                // Send user status back for client display
                osuPacketWriter.HandleOsuUpdate(UserStatusObject);

                // Send this data back to every user in the lobby
                global.StreamsHandler.sendToStream("multiplayer_lobby", osuPacketWriter.toBuffer, null);
            }
            const osuPacketWriter = new osu.Bancho.Writer;

            // List the match on the client
            osuPacketWriter.MatchNew(global.matches[i][1]);

            // Send this data back to every user in the lobby
            global.StreamsHandler.sendToStream("multiplayer_lobby", osuPacketWriter.toBuffer, null);
        }
    },

    createMultiplayerMatch:function(currentUser, data) {
        const osuPacketWriter = new osu.Bancho.Writer;

        // If there is no password instead set the password param to null
        if (data.gamePassword == '') data.gamePassword == null;

        // Create a match with the data given by the creating client
        let NewMatchObject = {
            matchId: global.matches.length,
            inProgress: false,
            matchType: 0,
            activeMods: 0,
            gameName: data.gameName,
            gamePassword: data.gamePassword,
            beatmapName: data.beatmapName,
            beatmapId: data.beatmapId,
            beatmapChecksum: data.beatmapChecksum,
            slots: data.slots,
            host: currentUser.id,
            playMode: 0,
            matchScoringType: 0,
            matchTeamType: 0,
            specialModes: 0,
            hidden: false,
            seed: data.seed
        }

        for (let i = 0; i < NewMatchObject.slots.length; i++) {
            let s = NewMatchObject.slots[i];
            s.mods = 0;
        }

        // Update the status of the current user
        StatusUpdate(currentUser, currentUser.id);
        osuPacketWriter.MatchNew(NewMatchObject);

        // Queue match creation for user
        currentUser.addActionToQueue(osuPacketWriter.toBuffer);

        global.StreamsHandler.addStream(`mp_${data.gameName.split(" ").join("-")}`, true, NewMatchObject.matchId);

        global.matches.push([`mp_${data.gameName.split(" ").join("-")}`, NewMatchObject]);

        this.updateMatchListing();

        // Join the user to the newly created match
        this.joinMultiplayerMatch(currentUser, {
            matchId: NewMatchObject.matchId,
            gamePassword: NewMatchObject.gamePassword
        });
    },

    joinMultiplayerMatch:function(currentUser, data) {
        try {
            let osuPacketWriter = new osu.Bancho.Writer;
            const osuPacketWriter1 = new osu.Bancho.Writer;

            const streamName = global.matches[data.matchId][0];
            const mpLobby = global.matches[data.matchId][1];

            let full = true;
            // Loop through all slots to find an empty one
            for (let i = 0; i < mpLobby.slots.length; i++) {
                const slot = mpLobby.slots[i];
                // Make sure the slot doesn't have a player in it / the slot is locked
                if (slot.playerId !== -1 || slot.status === 2) continue;

                // Slot is empty and not locked, we can join the match!
                full = false;
                slot.playerId = currentUser.id;
                currentUser.matchSlotId = i;
                slot.status = 4;
                break;
            }

            osuPacketWriter1.MatchUpdate(mpLobby);
            osuPacketWriter.MatchJoinSuccess(mpLobby);

            if (full) {
                // Inform the client that they can't join the match
                osuPacketWriter = new osu.Bancho.Writer;
                osuPacketWriter.MatchJoinFail();
            }

            // Set the user's current match to this match
            currentUser.currentMatch = data.matchId;

            // Add user to the stream for the match
            global.StreamsHandler.addUserToStream(streamName, currentUser.id);

            // Inform all users in the match that a new user has joined
            global.StreamsHandler.sendToStream(streamName, osuPacketWriter1.toBuffer, null);

            osuPacketWriter.ChannelJoinSuccess("#multiplayer");

            // Inform joining client they they have joined the match
            currentUser.addActionToQueue(osuPacketWriter.toBuffer);

            // Update the match listing for all users in the lobby since
            // A user has joined a match
            this.updateMatchListing();
        } catch (e) {
            const osuPacketWriter = new osu.Bancho.Writer;

            osuPacketWriter.MatchJoinFail();

            currentUser.addActionToQueue(osuPacketWriter.toBuffer);

            this.updateMatchListing();
        }
    },

    setReadyState:function(currentUser, state) {
        // Get the match the user is in
        const mpLobby = global.matches[currentUser.currentMatch][1];
        const osuPacketWriter = new osu.Bancho.Writer;

        // Loop though all slots in the match
        for (let i = 0; i < mpLobby.slots.length; i++) {
            const slot = mpLobby.slots[i];
            // Check if the player in this slot is this user
            if (slot.playerId == currentUser.id) {
                // Turn on or off the user's ready state
                if (state) slot.status = 8;
                else slot.status = 4;
                break;
            }
        }

        osuPacketWriter.MatchUpdate(mpLobby);

        // Send this update to all users in the stream
        global.StreamsHandler.sendToStream(global.matches[currentUser.currentMatch][0], osuPacketWriter.toBuffer, null);
    },

    sendMatchUpdate:function(currentUser) {
        const mpLobby = global.matches[currentUser.currentMatch][1];
        const osuPacketWriter = new osu.Bancho.Writer;

        osuPacketWriter.MatchUpdate(mpLobby);

        // Update all users in the match with new match information
        global.StreamsHandler.sendToStream(global.matches[currentUser.currentMatch][0], osuPacketWriter.toBuffer, null);
    },
    
    updateMatch:function(currentUser, data) {
        // Update match with new data
        global.matches[currentUser.currentMatch][1] = data;
        const osuPacketWriter = new osu.Bancho.Writer;

        osuPacketWriter.MatchUpdate(global.matches[currentUser.currentMatch][1]);

        // Send this new match data to all users in the match
        global.StreamsHandler.sendToStream(global.matches[currentUser.currentMatch][0], osuPacketWriter.toBuffer, null);

        // Update the match listing in the lobby to reflect these changes
        this.updateMatchListing();
    },

    moveToSlot:function(currentUser, data) {
        const mpLobby = global.matches[currentUser.currentMatch][1];
        const osuPacketWriter = new osu.Bancho.Writer;

        let currentUserData, slotIndex;
        // Loop through all slots in the match
        for (let i = 0; i < mpLobby.slots.length; i++) {
            const slot = mpLobby.slots[i];
            // Make sure the user in this slot is the user we want
            if (slot.playerId != currentUser.id) continue;

            currentUserData = slot;
            slotIndex = i;
            break;
        }

        // Set the new slot's data to the user's old slot data
        mpLobby.slots[data].playerId = currentUserData.playerId;
        currentUser.matchSlotId = data;
        mpLobby.slots[data].status = currentUserData.status;

        // Set the old slot's data to open
        mpLobby.slots[slotIndex].playerId = -1;
        mpLobby.slots[slotIndex].status = 1;

        osuPacketWriter.MatchUpdate(mpLobby);

        // Send this change to all users in the match
        global.StreamsHandler.sendToStream(global.matches[currentUser.currentMatch][0], osuPacketWriter.toBuffer, null);

        // Update the match listing in the lobby to reflect this change
        this.updateMatchListing();
    },

    kickPlayer:function(currentUser, data) {
        const mpLobby = global.matches[currentUser.currentMatch][1];
        const osuPacketWriter = new osu.Bancho.Writer;

        // Make sure the user attempting to kick / lock is the host of the match
        if (mpLobby.host != currentUser.id) return;

        // Get the data of the slot at the index sent by the client
        const slot = mpLobby.slots[data];
        let cachedPlayerId = slot.playerId;

        // If the slot is empty lock instead of kicking
        if (slot.playerId === -1) { // Slot is empty, lock it
            if (slot.status === 1) slot.status = 2;
            else slot.status = 1;
        }
        // The slot isn't empty, prepare to kick the player
        else {
            const kickedPlayer = getUserById(slot.playerId);
            kickedPlayer.matchSlotId = -1;
            slot.playerId = -1;
            slot.status = 1;
        }

        osuPacketWriter.MatchUpdate(mpLobby);

        // Inform all users in the match of the change
        global.StreamsHandler.sendToStream(global.matches[currentUser.currentMatch][0], osuPacketWriter.toBuffer, null);

        // Update the match listing in the lobby listing to reflect this change
        this.updateMatchListing();

        if (cachedPlayerId !== null || cachedPlayerId !== -1) {
            // Remove the kicked user from the match stream
            global.StreamsHandler.removeUserFromStream(global.matches[currentUser.currentMatch][0], cachedPlayerId);
        }
    },

    matchSkip:function(currentUser) {
        const mpLobby = global.matches[currentUser.currentMatch][1];

        if (global.matches[currentUser.currentMatch][2] == null) {
            global.matches[currentUser.currentMatch][2] = [];

            const skippedSlots = global.matches[currentUser.currentMatch][2];

            for (let i = 0; i < mpLobby.slots.length; i++) {
                const slot = mpLobby.slots[i];
                // Make sure the slot has a user in it
                if (slot.playerId === -1 || slot.status === 1 || slot.status === 2) continue;
    
                // Add the slot's user to the loaded checking array
                skippedSlots.push({playerId: slot.playerId, skipped: false}); 
            }

            
        }

        const skippedSlots = global.matches[currentUser.currentMatch][2];

        for (let i = 0; i < skippedSlots.length; i++) {
            // If loadslot belongs to this user then set loaded to true
            if (skippedSlots[i].playerId == currentUser.id) {
                skippedSlots[i].skipped = true;
            }
        }

        let allSkipped = true;
        for (let i = 0; i < skippedSlots.length; i++) {
            if (skippedSlots[i].skipped) continue;

            // A user hasn't finished playing
            allSkipped = false;
        }

        // All players have finished playing, finish the match
        if (allSkipped) {
            const osuPacketWriter = new osu.Bancho.Writer;
            osuPacketWriter.MatchPlayerSkipped(currentUser.id);
            osuPacketWriter.MatchSkip();
            global.StreamsHandler.sendToStream(global.matches[currentUser.currentMatch][0], osuPacketWriter.toBuffer, null);

            global.matches[currentUser.currentMatch][2] = null;
        } else {
            const osuPacketWriter = new osu.Bancho.Writer;
            osuPacketWriter.MatchPlayerSkipped(currentUser.id);

            global.StreamsHandler.sendToStream(global.matches[currentUser.currentMatch][0], osuPacketWriter.toBuffer, null);
        }
    },

    missingBeatmap:function(currentUser, state) {
        const mpLobby = global.matches[currentUser.currentMatch][1];
        const osuPacketWriter = new osu.Bancho.Writer;

        // Loop through all slots in the match
        for (let i = 0; i < mpLobby.slots.length; i++) {
            const slot = mpLobby.slots[i];
            // Make sure the user in the slot is the user we want to update
            if (slot.playerId != currentUser.id) continue;

            // If the user is missing the beatmap set the status to reflect it
            if (state) slot.status = 16;
            // The user is not missing the beatmap, set the status to normal
            else slot.status = 4;
            break;
        }

        osuPacketWriter.MatchUpdate(mpLobby);

        // Inform all users in the match of this change
        global.StreamsHandler.sendToStream(global.matches[currentUser.currentMatch][0], osuPacketWriter.toBuffer, null);
    },

    transferHost:function(currentUser, data) {
        const mpLobby = global.matches[currentUser.currentMatch][1];
        const osuPacketWriter = new osu.Bancho.Writer;

        // Get the information of the user that the host is being transfered to
        const newUser = getUserById(mpLobby.slots[data].playerId);

        // Set the lobby's host to the new user
        mpLobby.host = newUser.id;

        osuPacketWriter.MatchUpdate(mpLobby);

        // Inform all clients in the match of the change
        global.StreamsHandler.sendToStream(global.matches[currentUser.currentMatch][0], osuPacketWriter.toBuffer, null);
    },

    // TODO: Allow freemod to work
    updateMods(currentUser, data) {
        // Make sure the person updating mods is the host of the match
        // TODO: Add a check here for is freemod is enabled
        console.log(global.matches[currentUser.currentMatch][1]);
        console.log(data);
        if (Object.keys(global.matches[currentUser.currentMatch][1].slots[0]).includes("mods")) {
            const mpLobby = global.matches[currentUser.currentMatch][1];
            const osuPacketWriter = new osu.Bancho.Writer;
            for (let i = 0; i < mpLobby.slots.length; i++) {
                const slot = mpLobby.slots[i];
                if (slot.playerId === currentUser.id) {
                    slot.mods = data;
                    break;
                }
            }

            osuPacketWriter.MatchUpdate(global.matches[currentUser.currentMatch][1]);

            global.StreamsHandler.sendToStream(global.matches[currentUser.currentMatch][0], osuPacketWriter.toBuffer, null);
        } else {
            if (global.matches[currentUser.currentMatch][1].host !== currentUser.id) return;
            const osuPacketWriter = new osu.Bancho.Writer;

            // Change the matches mods to these new mods
            // TODO: Do this per user if freemod is enabled
            global.matches[currentUser.currentMatch][1].activeMods = data;

            osuPacketWriter.MatchUpdate(global.matches[currentUser.currentMatch][1]);

            // Inform all users in the match of the change
            global.StreamsHandler.sendToStream(global.matches[currentUser.currentMatch][0], osuPacketWriter.toBuffer, null);
        }

        // Update match listing in the lobby to reflect this change
        this.updateMatchListing();
    },

    startMatch(currentUser) {
        const mpLobby = global.matches[currentUser.currentMatch][1];
        // Make sure the match is not already in progress
        // The client sometimes double fires the start packet
        if (mpLobby.inProgress) return;
        mpLobby.inProgress = true;
        // Create array for monitoring users until they are ready to play
        global.matches[currentUser.currentMatch][2] = [];
        const loadedSlots = global.matches[currentUser.currentMatch][2];
        // Loop through all slots in the match
        for (let i = 0; i < mpLobby.slots.length; i++) {
            const slot = mpLobby.slots[i];
            // Make sure the slot has a user in it
            if (slot.playerId === -1 || slot.status === 1 || slot.status === 2) continue;

            // Add the slot's user to the loaded checking array
            loadedSlots.push({playerId: slot.playerId, loaded: false}); 
        }
        const osuPacketWriter = new osu.Bancho.Writer;

        // Loop through all slots in the match
        for (let i = 0; i < mpLobby.slots.length; i++) {
            const slot = mpLobby.slots[i];
            // Make sure the slot has a user in it
            if (slot.playerId === -1 || slot.status === 1 || slot.status === 2) continue;

            // Set the user's status to playing
            slot.status = 32;
        }

        osuPacketWriter.MatchStart(mpLobby);

        // Inform all users in the match that it has started
        global.StreamsHandler.sendToStream(global.matches[currentUser.currentMatch][0], osuPacketWriter.toBuffer, null);

        // Update all users in the match with new info
        this.sendMatchUpdate(currentUser);

        // Update match listing in lobby to show the game is in progress
        this.updateMatchListing();
    },

    setPlayerLoaded:function(currentUser) {
        const loadedSlots = global.matches[currentUser.currentMatch][2];

        // Loop through all user load check items
        for (let i = 0; i < loadedSlots.length; i++) {
            // If loadslot belongs to this user then set loaded to true
            if (loadedSlots[i].playerId == currentUser.id) {
                loadedSlots[i].loaded = true;
            }
        }

        // Loop through all loaded slots and check if all users are loaded
        let allLoaded = true;
        for (let i = 0; i < loadedSlots.length; i++) {
            if (loadedSlots[i].loaded) continue;

            // A user wasn't loaded, keep waiting.
            allLoaded = false;
            break;
        }

        // All players have loaded the beatmap, start playing.
        if (allLoaded) {
            let osuPacketWriter = new osu.Bancho.Writer;
            osuPacketWriter.MatchAllPlayersLoaded();
            global.StreamsHandler.sendToStream(global.matches[currentUser.currentMatch][0], osuPacketWriter.toBuffer, null);

            // Blank out user loading array
            global.matches[currentUser.currentMatch][2] = null;
        }
    },

    onPlayerFinishMatch:function(currentUser) {
        const mpLobby = global.matches[currentUser.currentMatch][1];
        // If user loading slots do not exist
        if (global.matches[currentUser.currentMatch][2] == null) {
            global.matches[currentUser.currentMatch][2] = [];
            // Repopulate user loading slots again
            const loadedSlots = global.matches[currentUser.currentMatch][2];
            for (let i = 0; i < mpLobby.slots.length; i++) {
                const slot = mpLobby.slots[i];
                // Make sure the slot has a user
                if (slot.playerId === -1 || slot.status === 1 || slot.status === 2) continue;
    
                // Populate user loading slots with this user's id and load status
                loadedSlots.push({playerId: slot.playerId, loaded: false}); 
            }
        } 
        
        const loadedSlots = global.matches[currentUser.currentMatch][2];

        // Loop through all loaded slots to make sure all users have finished playing
        for (let i = 0; i < loadedSlots.length; i++) {
            if (loadedSlots[i].playerId == currentUser.id) {
                loadedSlots[i].loaded = true;
            }
        }

        let allLoaded = true;
        for (let i = 0; i < loadedSlots.length; i++) {
            if (loadedSlots[i].loaded) continue;

            // A user hasn't finished playing
            allLoaded = false;
        }

        // All players have finished playing, finish the match
        if (allLoaded) this.finishMatch(currentUser);
    },

    finishMatch:function(currentUser) {
        const mpLobby = global.matches[currentUser.currentMatch][1];
        if (!mpLobby.inProgress) return;
        global.matches[currentUser.currentMatch][2] = [];
        mpLobby.inProgress = false;
        let osuPacketWriter = new osu.Bancho.Writer;

        // Loop through all slots in the match
        for (let i = 0; i < mpLobby.slots.length; i++) {
            const slot = mpLobby.slots[i];
            // Make sure the slot has a user
            if (slot.playerId === -1 || slot.status === 1 || slot.status === 2) continue;

            // Set the user's status back to normal from playing
            slot.status = 4;
        }

        osuPacketWriter.MatchComplete();

        // Inform all users in the match that it is complete
        global.StreamsHandler.sendToStream(global.matches[currentUser.currentMatch][0], osuPacketWriter.toBuffer, null);

        // Update all users in the match with new info
        this.sendMatchUpdate(currentUser);

        // Update match info in the lobby to reflect that the match has finished
        this.updateMatchListing();
    },

    updatePlayerScore:function(currentUser, data) {
        const osuPacketWriter = new osu.Bancho.Writer;

        // Make sure the user's slot ID is not invalid
        if (currentUser.matchSlotId == -1) return;

        // Get the user's current slotID and append it to the givien data, just incase.
        data.id = currentUser.matchSlotId;

        osuPacketWriter.MatchScoreUpdate(data);

        // Send the newly updated score to all users in the match
        global.StreamsHandler.sendToStream(global.matches[currentUser.currentMatch][0], osuPacketWriter.toBuffer, null);
    },

    leaveMatch:function(currentUser) {
        try {
            const mpLobby = global.matches[currentUser.currentMatch][1];

            let userInMatch = false;
            // Loop through all slots in the match
            for (let i = 0; i < mpLobby.slots.length; i++) {
                const slot = mpLobby.slots[i];
                // Check if the user is in this slot
                if (slot.playerId == currentUser.id) {
                    userInMatch = true;
                    break;
                }
            }

            // Make sure we don't run more than once
            // Again, client double firing packets.
            if (!userInMatch) return;

            let osuPacketWriter = new osu.Bancho.Writer;
    
            // Loop through all slots in the match
            for (let i = 0; i < mpLobby.slots.length; i++) {
                const slot = mpLobby.slots[i];
                // Make sure the user is in this slot
                if (slot.playerId != currentUser.id) continue;
    
                // Set the slot's status to avaliable
                slot.playerId = -1;
                slot.status = 1;
                
                break;
            }
    
            osuPacketWriter.MatchUpdate(mpLobby);
    
            // Remove the leaving user from the match's stream
            global.StreamsHandler.removeUserFromStream(global.matches[currentUser.currentMatch][0], currentUser.id);

            // Inform all users in the match that the leaving user has left
            global.StreamsHandler.sendToStream(global.matches[currentUser.currentMatch][0], osuPacketWriter.toBuffer, null);

            osuPacketWriter = new osu.Bancho.Writer;

            // Remove user from the multiplayer channel for the match
            osuPacketWriter.ChannelRevoked("#multiplayer");

            currentUser.addActionToQueue(osuPacketWriter.toBuffer);
    
            let empty = true;
            // Check if the match is empty
            for (let i = 0; i < mpLobby.slots.length; i++) {
                const slot = mpLobby.slots[i];
                // Check if the slot is avaliable
                if (slot.playerId === -1) continue;
               
                // There is a user in the match
                empty = false;
                break;
            }
    
            // The match is empty, proceed to remove it.
            if (empty) {
                let matchIndex;
                // Loop through all matches
                for (let i = 0; i < global.matches.length; i++) {
                    // If the match matches the match the user has left
                    if (global.matches[i][0] == global.matches[currentUser.currentMatch][0]) {
                        matchIndex = i;
                        break;
                    }
                }
    
                // Make sure we got a match index
                if (matchIndex == null) return;
    
                // Remove this match from the list of active matches
                global.matches.splice(matchIndex, 1);
            }
        } catch (e) { }
        // Update the match listing to reflect this change (either removal or user leaving)
        this.updateMatchListing();

        // Delay a 2nd match listing update
        setTimeout(() => {
            this.updateMatchListing();
        }, 1000);
    }
}