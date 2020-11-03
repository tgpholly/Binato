const osu = require("osu-packet"),
      maths = require("./util/Maths.js"),
      Multiplayer = require("./Multiplayer.js");

module.exports = function(User, Message, Stream, IsCalledFromMultiplayer = false) {
    if (Message[0] != "!") return;
    const command = Message.split(" ")[0];
    const args = Message.split(" ");

    let responseMessage = "";

    let gay = null;

    switch (command) {
        case "!help":
            // This is terrible
            if (args.length == 1) {
                responseMessage = "Commands:" +
                                  "\n!help - Shows this message" +
                                  "\n!roll - Rolls a random number or a number between 0 and a given number" +
                                  "\n  -  Submenus:" +
                                  "\n      mp - Shows information about all multiplayer commands" + 
                                  "\n      admin - Shows information about all admin commands";
            } else {
                switch (args[1]) {
                    case "mp":
                        responseMessage = "Multiplayer Commands:" +
                                          "\n!mp start - Starts a multiplayer match with a delay" +
                                          "\n!mp abort - Aborts the currently running multiplayer match";
                    break;

                    case "admin":
                        responseMessage = "Admin Commands:" +
                                          "\n!lock - Locks/Unlocks a channel and limits conversation to mods and above only";
                    break;

                    default:
                        break;
                }
            }
        break;

        case "!roll":
            if (args.length == 1) {
                responseMessage = User.username + " rolled " + maths.randInt(0, 65535);
            } else {
                if (`${parseInt(args[1])}` == "NaN") responseMessage = User.username + " rolled " + maths.randInt(0, 65535);
                else responseMessage = User.username + " rolled " + maths.randInt(0, parseInt(args[1]));
            }
        break;

        case "!lock":
            if (!Stream.includes("#")) responseMessage = "Multiplayer channels and private channels cannot be locked!";
            else {
                for (let i = 0; i < global.channels.length; i++) {
                    // Find the channel that pertains to this stream
                    if (global.channels[i].channelName == Stream) {
                        if (global.channels[i].locked) {
                            global.channels[i].locked = false;
                            responseMessage = "Channel is now unlocked.";
                        } else {
                            global.channels[i].locked = true;
                            responseMessage = "Channel is now locked, chat restricted to mods and above.";
                        }
                        break;
                    }
                }
            }
        break;

        case "!msg":
            gay = new osu.Bancho.Writer;

            gay.RTX(args[1]);

            //User.addActionToQueue(gay.toBuffer());
            global.StreamsHandler.sendToStream(Stream, gay.toBuffer, null);
        break;

        case "!fuckoff":
            gay = new osu.Bancho.Writer;

            gay.Ping(0);

            User.addActionToQueue(gay.toBuffer);
        break;

        case "!mp":
            if (!IsCalledFromMultiplayer) return;
            if (args.length == 1) return;
            switch (args[1]) {
                case "start":
                    if (args.length > 3) return;
                    if (`${parseInt(args[2])}` != "NaN") {
                        let countdown = parseInt(args[2]);
                        let intervalRef = setInterval(() => {
                            let local_osuPacketWriter = new osu.Bancho.Writer;
                            if (countdown != 0 && countdown > 0) countdown--;
                            if (countdown <= 10 && countdown > 0) {
                                local_osuPacketWriter.SendMessage({
                                    sendingClient: global.users[0].username,
                                    message: "Starting in " + countdown,
                                    target: "#multiplayer",
                                    senderId: global.users[0].id
                                });
                                global.StreamsHandler.sendToStream(Stream, local_osuPacketWriter.toBuffer, null);
                            } else if (countdown == 0) {
                                local_osuPacketWriter.SendMessage({
                                    sendingClient: global.users[0].username,
                                    message: "Good luck, have fun!",
                                    target: "#multiplayer",
                                    senderId: global.users[0].id
                                });
                                global.StreamsHandler.sendToStream(Stream, local_osuPacketWriter.toBuffer, null);
                                setTimeout(() => Multiplayer.startMatch(User), 1000);
                                clearInterval(intervalRef);
                            }
                        }, 1000);
                    } else {
                        responseMessage = "Good luck, have fun!";
                        setTimeout(() => Multiplayer.startMatch(User), 1000); 
                    }
                break;

                case "abort":
                    if (args.length > 2) return;
                    Multiplayer.finishMatch(User);
                break;

                default:
                    break;
            }
        break;
    }

    const osuPacketWriter = new osu.Bancho.Writer;
    if (responseMessage != "") {
        if (Stream.includes("#")) {
            osuPacketWriter.SendMessage({
                sendingClient: global.users[0].username,
                message: responseMessage,
                target: Stream,
                senderId: global.users[0].id
            });
        } else {
            osuPacketWriter.SendMessage({
                sendingClient: global.users[0].username,
                message: responseMessage,
                target: "#multiplayer",
                senderId: global.users[0].id
            });
        }
    }
    global.StreamsHandler.sendToStream(Stream, osuPacketWriter.toBuffer, null);
}