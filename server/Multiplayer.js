const osu = require("osu-packet"),
      getUserById = require("./util/getUserById.js"),
      DatabaseHelper = require("./DatabaseHelper.js"),
      StatusUpdate = require("./Packets/StatusUpdate.js");

module.exports = {
    userEnterLobby:function(currentUser) {
        if (currentUser.currentMatch != null) {
            this.leaveMatch(currentUser);
            currentUser.currentMatch = null;
        }

        global.StreamsHandler.addUserToStream("multiplayer_lobby", currentUser.id);

        const osuPacketWriter1 = new osu.Bancho.Writer;
            let userIds = [];

            for (let i = 0; i < global.users.length; i++) {
                userIds.push(global.users[i].id);
            }

            osuPacketWriter1.UserPresenceBundle(userIds);

            global.StreamsHandler.sendToStream("multiplayer_lobby", osuPacketWriter1.toBuffer, null);

        for (let i = 0; i < global.matches.length; i++) {
            for (let i1 = 0; i1 < global.matches[i][1].slots.length; i1++) {
                const slot = global.matches[i][1].slots[i1];
                if (slot.playerId == -1 || slot.status == 2) continue;
                const osuPacketWriter = new osu.Bancho.Writer;

                const User = getUserById(slot.playerId);

                // Get user score info from the database
                const userScoreDB = DatabaseHelper.getFromDB(`SELECT * FROM users_modes_info WHERE user_id = ${User.id} AND mode_id = ${User.playMode} LIMIT 1`);

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
                    rank: 1, 
                    performance: userScoreDB.pp_raw
                };

                osuPacketWriter.HandleOsuUpdate(UserStatusObject);

                global.StreamsHandler.sendToStream("multiplayer_lobby", osuPacketWriter.toBuffer, null);
            }
            const osuPacketWriter = new osu.Bancho.Writer;

            osuPacketWriter.MatchNew(global.matches[i][1]);

            currentUser.addActionToQueue(osuPacketWriter.toBuffer);
        }
        const osuPacketWriter = new osu.Bancho.Writer;
        osuPacketWriter.ChannelJoinSuccess("#lobby");
        if (!global.StreamsHandler.isUserInStream("#lobby", currentUser.id))
            global.StreamsHandler.addUserToStream("#lobby", currentUser.id);
        
        currentUser.addActionToQueue(osuPacketWriter.toBuffer);
    },

    updateMatchListing:function() {
        const osuPacketWriter1 = new osu.Bancho.Writer;
        let userIds = [];

        for (let i = 0; i < global.users.length; i++) {
            userIds.push(global.users[i].id);
        }

        osuPacketWriter1.UserPresenceBundle(userIds);

        global.StreamsHandler.sendToStream("multiplayer_lobby", osuPacketWriter1.toBuffer, null);
        for (let i = 0; i < global.matches.length; i++) {
            for (let i1 = 0; i1 < global.matches[i][1].slots.length; i1++) {
                const slot = global.matches[i][1].slots[i1];
                if (slot.playerId == -1 || slot.status == 2) continue;
                const osuPacketWriter = new osu.Bancho.Writer;

                const User = getUserById(slot.playerId);

                // Get user score info from the database
                const userScoreDB = DatabaseHelper.getFromDB(`SELECT * FROM users_modes_info WHERE user_id = ${User.id} AND mode_id = ${User.playMode} LIMIT 1`);

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
                    rank: 1, 
                    performance: userScoreDB.pp_raw
                };

                osuPacketWriter.HandleOsuUpdate(UserStatusObject);

                global.StreamsHandler.sendToStream("multiplayer_lobby", osuPacketWriter.toBuffer, null);
            }
            const osuPacketWriter = new osu.Bancho.Writer;

            osuPacketWriter.MatchNew(global.matches[i][1]);

            global.StreamsHandler.sendToStream("multiplayer_lobby", osuPacketWriter.toBuffer, null);
        }
    },

    createMultiplayerMatch:function(currentUser, data) {
        const osuPacketWriter = new osu.Bancho.Writer;

        if (data.gamePassword == '') data.gamePassword == null;

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

        StatusUpdate(currentUser, currentUser.id);
        osuPacketWriter.MatchNew(NewMatchObject);

        // Queue match creation for user
        currentUser.addActionToQueue(osuPacketWriter.toBuffer);

        global.StreamsHandler.addStream(`mp_${data.gameName.split(" ").join("-")}`, true, NewMatchObject.matchId);

        global.matches.push([`mp_${data.gameName.split(" ").join("-")}`, NewMatchObject]);

        this.updateMatchListing();

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
            for (let i = 0; i < mpLobby.slots.length; i++) {
                const slot = mpLobby.slots[i];
                if (slot.playerId !== -1 || slot.status === 2) continue;
                full = false;
                slot.playerId = currentUser.id;
                currentUser.matchSlotId = i;
                slot.status = 4;
                break;
            }

            osuPacketWriter1.MatchUpdate(mpLobby);
            osuPacketWriter.MatchJoinSuccess(mpLobby);

            if (full) {
                osuPacketWriter = new osu.Bancho.Writer;
                osuPacketWriter.MatchJoinFail();
            } else {
                global.StreamsHandler.removeUserFromStream("multiplayer_lobby", currentUser.id);
            }

            currentUser.currentMatch = data.matchId;

            global.StreamsHandler.addUserToStream(streamName, currentUser.id);

            global.StreamsHandler.sendToStream(streamName, osuPacketWriter1.toBuffer, null);

            osuPacketWriter.ChannelJoinSuccess("#multiplayer");

            currentUser.addActionToQueue(osuPacketWriter.toBuffer);
        } catch (e) {
            const osuPacketWriter = new osu.Bancho.Writer;

            osuPacketWriter.MatchJoinFail();

            currentUser.addActionToQueue(osuPacketWriter.toBuffer);

            this.updateMatchListing();
        }
    },

    setReadyState:function(currentUser, state) {
        const mpLobby = global.matches[currentUser.currentMatch][1];
        const osuPacketWriter = new osu.Bancho.Writer;

        for (let i = 0; i < mpLobby.slots.length; i++) {
            const slot = mpLobby.slots[i];
            if (slot.playerId == currentUser.id) {
                if (state) slot.status = 8;
                else slot.status = 4;
                console.log("e");
                break;
            }
        }

        osuPacketWriter.MatchUpdate(mpLobby);

        global.StreamsHandler.sendToStream(global.matches[currentUser.currentMatch][0], osuPacketWriter.toBuffer, null);
    },

    sendMatchUpdate:function(currentUser) {
        const mpLobby = global.matches[currentUser.currentMatch][1];
        const osuPacketWriter = new osu.Bancho.Writer;

        osuPacketWriter.MatchUpdate(mpLobby);

        global.StreamsHandler.sendToStream(global.matches[currentUser.currentMatch][0], osuPacketWriter.toBuffer, null);
    },
    
    updateMatch:function(currentUser, data) {
        global.matches[currentUser.currentMatch][1] = data;
        const osuPacketWriter = new osu.Bancho.Writer;

        osuPacketWriter.MatchUpdate(global.matches[currentUser.currentMatch][1]);

        global.StreamsHandler.sendToStream(global.matches[currentUser.currentMatch][0], osuPacketWriter.toBuffer, null);
    },

    moveToSlot:function(currentUser, data) {
        const mpLobby = global.matches[currentUser.currentMatch][1];
        const osuPacketWriter = new osu.Bancho.Writer;

        let currentUserData, slotIndex;
        for (let i = 0; i < mpLobby.slots.length; i++) {
            const slot = mpLobby.slots[i];
            if (slot.playerId != currentUser.id) continue;

            currentUserData = slot;
            slotIndex = i;
            break;
        }

        mpLobby.slots[data].playerId = currentUserData.playerId;
        currentUser.matchSlotId = data;
        mpLobby.slots[data].status = currentUserData.status;

        mpLobby.slots[slotIndex].playerId = -1;
        mpLobby.slots[slotIndex].status = 1;

        osuPacketWriter.MatchUpdate(mpLobby);

        global.StreamsHandler.sendToStream(global.matches[currentUser.currentMatch][0], osuPacketWriter.toBuffer, null);
    },

    kickPlayer:function(currentUser, data) {
        const mpLobby = global.matches[currentUser.currentMatch][1];
        const osuPacketWriter = new osu.Bancho.Writer;

        if (mpLobby.host != currentUser.id) return;

        const slot = mpLobby.slots[data];
        let cachedPlayerId = slot.playerId;

        if (slot.playerId === -1) { // Slot is empty, lock it
            if (slot.status === 1) slot.status = 2;
            else slot.status = 1;
        } else { // Slot isn't empty kick player
            const kickedPlayer = getUserById(slot.playerId);
            kickedPlayer.matchSlotId = -1;
            slot.playerId = -1;
            slot.status = 1;
        }

        osuPacketWriter.MatchUpdate(mpLobby);

        global.StreamsHandler.sendToStream(global.matches[currentUser.currentMatch][0], osuPacketWriter.toBuffer, null);

        if (cachedPlayerId !== null || cachedPlayerId !== -1) {
            global.StreamsHandler.removeUserFromStream(global.matches[currentUser.currentMatch][0], cachedPlayerId);
        }
    },

    missingBeatmap:function(currentUser, state) {
        const mpLobby = global.matches[currentUser.currentMatch][1];
        const osuPacketWriter = new osu.Bancho.Writer;

        for (let i = 0; i < mpLobby.slots.length; i++) {
            const slot = mpLobby.slots[i];
            if (slot.playerId != currentUser.id) continue;

            if (state) {
                slot.status = 16;
            } else {
                slot.status = 4;
            }
            break;
        }

        osuPacketWriter.MatchUpdate(mpLobby);

        global.StreamsHandler.sendToStream(global.matches[currentUser.currentMatch][0], osuPacketWriter.toBuffer, null);
    },

    transferHost:function(currentUser, data) {
        const mpLobby = global.matches[currentUser.currentMatch][1];
        const osuPacketWriter = new osu.Bancho.Writer;

        const newUser = getUserById(mpLobby.slots[data].playerId);

        mpLobby.host = newUser.id;

        osuPacketWriter.MatchUpdate(mpLobby);

        global.StreamsHandler.sendToStream(global.matches[currentUser.currentMatch][0], osuPacketWriter.toBuffer, null);
    },

    updateMods(currentUser, data) { // TODO: Allow freemod to work
        if (global.matches[currentUser.currentMatch][1].host !== currentUser.id) return;
        const osuPacketWriter = new osu.Bancho.Writer;

        global.matches[currentUser.currentMatch][1].activeMods = data;

        osuPacketWriter.MatchUpdate(global.matches[currentUser.currentMatch][1]);

        global.StreamsHandler.sendToStream(global.matches[currentUser.currentMatch][0], osuPacketWriter.toBuffer, null);
    },

    startMatch(currentUser) {
        const mpLobby = global.matches[currentUser.currentMatch][1];
        if (mpLobby.inProgress) return;
        mpLobby.inProgress = true;
        global.matches[currentUser.currentMatch][2] = [];
        const loadedSlots = global.matches[currentUser.currentMatch][2];
        for (let i = 0; i < mpLobby.slots.length; i++) {
            const slot = mpLobby.slots[i];
            if (slot.playerId === -1 || slot.status === 1 || slot.status === 2) continue;

            loadedSlots.push({playerId: slot.playerId, loaded: false}); 
        }
        const osuPacketWriter = new osu.Bancho.Writer;

        for (let i = 0; i < mpLobby.slots.length; i++) {
            const slot = mpLobby.slots[i];
            if (slot.playerId === -1 || slot.status === 1 || slot.status === 2) continue;

            slot.status = 32;
        }

        osuPacketWriter.MatchStart(mpLobby);

        global.StreamsHandler.sendToStream(global.matches[currentUser.currentMatch][0], osuPacketWriter.toBuffer, null);

        this.sendMatchUpdate(currentUser);
    },

    setPlayerLoaded:function(currentUser) {
        const loadedSlots = global.matches[currentUser.currentMatch][2];

        for (let i = 0; i < loadedSlots.length; i++) {
            if (loadedSlots[i].playerId == currentUser.id) {
                loadedSlots[i].loaded = true;
            }
        }

        let allLoaded = true;
        for (let i = 0; i < loadedSlots.length; i++) {
            if (loadedSlots[i].loaded) continue;

            allLoaded = false;
        }

        if (allLoaded) {
            let osuPacketWriter = new osu.Bancho.Writer;
            osuPacketWriter.MatchAllPlayersLoaded();
            global.StreamsHandler.sendToStream(global.matches[currentUser.currentMatch][0], osuPacketWriter.toBuffer, null);

            global.matches[currentUser.currentMatch][2] = null;
        }
    },

    onPlayerFinishMatch:function(currentUser) {
        const mpLobby = global.matches[currentUser.currentMatch][1];
        if (global.matches[currentUser.currentMatch][2] == null) {
            global.matches[currentUser.currentMatch][2] = [];
            const loadedSlots = global.matches[currentUser.currentMatch][2];
            for (let i = 0; i < mpLobby.slots.length; i++) {
                const slot = mpLobby.slots[i];
                if (slot.playerId === -1 || slot.status === 1 || slot.status === 2) continue;
    
                loadedSlots.push({playerId: slot.playerId, loaded: false}); 
            }
        } 
        
        const loadedSlots = global.matches[currentUser.currentMatch][2];

        for (let i = 0; i < loadedSlots.length; i++) {
            if (loadedSlots[i].playerId == currentUser.id) {
                loadedSlots[i].loaded = true;
            }
        }

        let allLoaded = true;
        for (let i = 0; i < loadedSlots.length; i++) {
            if (loadedSlots[i].loaded) continue;

            allLoaded = false;
        }

        if (allLoaded) this.finishMatch(currentUser);
    },

    finishMatch:function(currentUser) {
        const mpLobby = global.matches[currentUser.currentMatch][1];
        if (!mpLobby.inProgress) return;
        global.matches[currentUser.currentMatch][2] = [];
        mpLobby.inProgress = false;
        let osuPacketWriter = new osu.Bancho.Writer;

        for (let i = 0; i < mpLobby.slots.length; i++) {
            const slot = mpLobby.slots[i];
            if (slot.playerId === -1 || slot.status === 1 || slot.status === 2) continue;

            slot.status = 4;
        }

        osuPacketWriter.MatchComplete();

        global.StreamsHandler.sendToStream(global.matches[currentUser.currentMatch][0], osuPacketWriter.toBuffer, null);

        this.sendMatchUpdate(currentUser);
    },

    updatePlayerScore:function(currentUser, data) {
        const osuPacketWriter = new osu.Bancho.Writer;

        if (currentUser.matchSlotId == -1) return console.log("it did the big fuck");

        data.id = currentUser.matchSlotId;

        osuPacketWriter.MatchScoreUpdate(data);

        global.StreamsHandler.sendToStream(global.matches[currentUser.currentMatch][0], osuPacketWriter.toBuffer, null);
    },

    leaveMatch:function(currentUser) {
        try {
            const mpLobby = global.matches[currentUser.currentMatch][1];
            let osuPacketWriter = new osu.Bancho.Writer;
    
            for (let i = 0; i < mpLobby.slots.length; i++) {
                const slot = mpLobby.slots[i];
                if (slot.playerId != currentUser.id) continue;
    
                slot.playerId = -1;
                slot.status = 1;
                
                break;
            }
    
            osuPacketWriter.MatchUpdate(mpLobby);
    
            global.StreamsHandler.sendToStream(global.matches[currentUser.currentMatch][0], osuPacketWriter.toBuffer, null);

            osuPacketWriter = new osu.Bancho.Writer;

            osuPacketWriter.ChannelRevoked("#multiplayer");

            currentUser.addActionToQueue(osuPacketWriter.toBuffer);
    
            let empty = true;
            for (let i = 0; i < mpLobby.slots.length; i++) {
                const slot = mpLobby.slots[i];
                if (slot.playerId === -1) continue;
               
                empty = false;
                break;
            }
    
            if (empty) {
                let matchIndex;
                for (let i = 0; i < global.matches.length; i++) {
                    if (global.matches[i][0] == global.matches[currentUser.currentMatch][0]) {
                        matchIndex = i;
                        break;
                    }
                }
    
                // Make sure we got a match index
                if (matchIndex == null) return;
    
                global.matches.splice(matchIndex, 1);
    
                
            }
        } catch (e) { }
        this.updateMatchListing();

        setTimeout(() => {
            this.updateMatchListing();
        }, 500);
    }
}