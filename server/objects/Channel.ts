import { DataStream } from "./DataStream";
import { User } from "./User";
const osu = require("osu-packet");

export class Channel {
	public name:string;
	public description:string;
	public stream:DataStream;
	private isLocked:boolean = false;

	public constructor(name:string, description:string, stream:DataStream) {
		this.name = name;
		this.description = description;
		this.stream = stream;
	}

	public get userCount() {
		return this.stream.userCount;
	}

	public SendMessage(sender:User, message:string) {
		const isBotCommand = message[0] === "!";

		if (this.isLocked && !isBotCommand) {
			return this.SendSystemMessage("This channel is currently locked", sender);
		}

		if (isBotCommand) {
			if (message.split(" ")[0] === "!lock") {
				this.isLocked = true;
			}
		}

		const osuPacketWriter = new osu.Bancho.Writer;
		osuPacketWriter.SendMessage({
			sendingClient: sender.username,
			message: message,
			target: this.name,
			senderId: sender.id
		});
		this.stream.SendWithExclusion(osuPacketWriter.toBuffer, sender);
	}

	public SendSystemMessage(message:string, sendTo?:User) {
		const osuPacketWriter = new osu.Bancho.Writer;
		osuPacketWriter.SendMessage({
			sendingClient: "System",
			message: message,
			target: this.name,
			senderId: 1
		});

		if (sendTo instanceof User) {
			sendTo.addActionToQueue(osuPacketWriter.toBuffer);
		} else {
			this.stream.Send(osuPacketWriter.toBuffer);
		}
	}

	public Join(user:User) {
		this.stream.AddUser(user);
		const osuPacketWriter = new osu.Bancho.Writer;
		osuPacketWriter.ChannelJoinSuccess(this.name);
		user.addActionToQueue(osuPacketWriter.toBuffer);
	}

	public Leave(user:User) {
		this.stream.RemoveUser(user);
	}
}