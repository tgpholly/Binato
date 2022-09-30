const osu = require("osu-packet"),
	  maths = require("./util/Maths.js"),
	  Streams = require("./Streams.js"),
	  OsuBattleRoyale = require("./MultiplayerExtras/OsuBattleRoyale.js");

module.exports = function(User, Message, Stream, IsCalledFromMultiplayer = false) {
	if (Message[0] != "!") return;

	const command = Message.split(" ")[0];
	const args = Message.split(" ");

	let responseMessage = "";

	let commandBanchoPacketWriter = null;

	switch (command) {
		case "!help":
			// This is terrible
			if (args.length == 1) {
				responseMessage = "Commands with an * next to them have a sub help section" +
								  "\n!help - Shows this message" +
								  "\n!roll - Rolls a random number or a number between 0 and a given number" +
								  "\n!ranking* - Sets your perfered ranking type" +
								  "\n!mp* - Shows information about all multiplayer commands" + 
								  "\n!admin* - Shows information about all admin commands";
			} else {
				switch (args[1]) {
					case "ranking":
						responseMessage = "Ranking Commands:" +
										  "\n!ranking pp - Sets your ranking type to pp" +
										  "\n!ranking score - Sets your ranking type to score" +
										  "\n!ranking acc - Sets your ranking type to accuracy";
					break;

					case "mp":
						responseMessage = "Multiplayer Commands:" +
										  "\n!mp start - Starts a multiplayer match with a delay" +
										  "\n!mp abort - Aborts the currently running multiplayer match" +
										  "\n!mp obr - Enables Battle Royale mode";
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

		case "!ranking":
			if (args.length == 1) {
				responseMessage = "You need to select a ranking mode! use \"!help ranking\" to see the options.";
			} else {
				switch (args[1]) {
					case "pp":
						responseMessage = "Set ranking mode to pp";
						User.rankingMode = 0;
						User.updateUserInfo(true);
					break;

					case "score":
						responseMessage = "Set ranking mode to score";
						User.rankingMode = 1;
						User.updateUserInfo(true);
					break;

					case "acc":
						responseMessage = "Set ranking mode to accuracy";
						User.rankingMode = 2;
						User.updateUserInfo(true);
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

		case "!mp":
			if (!IsCalledFromMultiplayer) return;
			if (User.currentMatch.matchStartCountdownActive) return;
			if (args.length == 1) return;
			switch (args[1]) {
				case "start":
					if (args.length > 3) return;
					if (!isNaN(args[2])) {
						User.currentMatch.matchStartCountdownActive = true;
						let countdown = parseInt(args[2]);
						let intervalRef = setInterval(() => {
							let local_osuPacketWriter = new osu.Bancho.Writer;
							if (countdown != 0 && countdown > 0) countdown--;
							if (countdown <= 10 && countdown > 0) {
								local_osuPacketWriter.SendMessage({
									sendingClient: global.botUser.username,
									message: "Starting in " + countdown,
									target: "#multiplayer",
									senderId: global.botUser.id
								});
								Streams.sendToStream(Stream, local_osuPacketWriter.toBuffer, null);
							} else if (countdown == 0) {
								local_osuPacketWriter.SendMessage({
									sendingClient: global.botUser.username,
									message: "Good luck, have fun!",
									target: "#multiplayer",
									senderId: global.botUser.id
								});
								Streams.sendToStream(Stream, local_osuPacketWriter.toBuffer, null);
								User.currentMatch.matchStartCountdownActive = false;
								setTimeout(() => User.currentMatch.startMatch(), 1000);
								clearInterval(intervalRef);
							}
						}, 1000);
					} else {
						responseMessage = "Good luck, have fun!";
						setTimeout(() => User.currentMatch.startMatch(), 1000); 
					}
				break;

				case "abort":
					//if (args.length > 2) return;
					User.currentMatch.finishMatch();
				break;

				case "obr":
					if (User.currentMatch.multiplayerExtras != null) {
						if (User.currentMatch.multiplayerExtras.name == "osu! Battle Royale") {
							commandBanchoPacketWriter = new osu.Bancho.Writer;
							commandBanchoPacketWriter.SendMessage({
								sendingClient: global.botUser.username,
								message: "osu! Battle Royale has been disabled!",
								target: "#multiplayer",
								senderId: global.botUser.id
							});
							User.currentMatch.multiplayerExtras = null;
							Streams.sendToStream(Stream, commandBanchoPacketWriter.toBuffer, null);
						}
						else enableOBR(User, Stream, commandBanchoPacketWriter);
					}
					else enableOBR(User, Stream, commandBanchoPacketWriter);
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
				sendingClient: global.botUser.username,
				message: responseMessage,
				target: Stream,
				senderId: global.botUser.id
			});
		} else {
			osuPacketWriter.SendMessage({
				sendingClient: global.botUser.username,
				message: responseMessage,
				target: "#multiplayer",
				senderId: global.botUser.id
			});
		}
	}
	Streams.sendToStream(Stream, osuPacketWriter.toBuffer, null);
}

function enableOBR(User, Stream, commandBanchoPacketWriter) {
	User.currentMatch.multiplayerExtras = new OsuBattleRoyale(User.currentMatch);
	commandBanchoPacketWriter = new osu.Bancho.Writer;
	commandBanchoPacketWriter.SendMessage({
		sendingClient: global.botUser.username,
		message: "osu! Battle Royale has been enabled!",
		target: "#multiplayer",
		senderId: global.botUser.id
	});
	commandBanchoPacketWriter.SendMessage({
		sendingClient: global.botUser.username,
		message: "New Multiplayer Rules Added:\n - Players that are in a failed state by the end of the map get eliminated\n - The player(s) with the lowest score get eliminated",
		target: "#multiplayer",
		senderId: global.botUser.id
	});
	Streams.sendToStream(Stream, commandBanchoPacketWriter.toBuffer, null);
}