import osu from "../../osuTyping";
import Bot from "../Bot";
import ChatHistory from "../ChatHistory";
import Shared from "../objects/Shared";
import DataStream from "./DataStream";
import User from "./User";

export default class Channel {
	public name:string;
	public description:string;
	public stream:DataStream;
	public isLocked:boolean = false;
	private _isSpecial:boolean = false;

	private readonly bot:Bot;

	public constructor(shared:Shared, name:string, description:string, stream:DataStream, isSpecial:boolean = false) {
		this.name = name;
		this.description = description;
		this.stream = stream;
		this._isSpecial = isSpecial;

		this.bot = shared.bot;
	}

	public get isSpecial() : boolean {
		return this._isSpecial;
	}

	public get userCount() : number {
		return this.stream.userCount;
	}

	public SendMessage(sender:User, message:string) {
		if (!this.isLocked) {
			const osuPacketWriter = osu.Bancho.Writer();
			osuPacketWriter.SendMessage({
				sendingClient: sender.username,
				message: message,
				target: this.name,
				senderId: sender.id
			});
			this.stream.SendWithExclusion(osuPacketWriter.toBuffer, sender);
			if (this.name === "#osu") {
				ChatHistory.AddMessage(`${sender.username}: ${message}`);
			}
		}

		if (message[0] === "!") {
			this.bot.OnMessage(this, sender, message);
		} else if (this.isLocked) {
			return this.SendSystemMessage("This channel is currently locked", sender);
		}
	}

	public SendBotMessage(message:string, sendTo?:User) {
		const osuPacketWriter = osu.Bancho.Writer();
		osuPacketWriter.SendMessage({
			sendingClient: this.bot.user.username,
			message: message,
			target: this.name,
			senderId: this.bot.user.id
		});

		if (sendTo instanceof User) {
			sendTo.addActionToQueue(osuPacketWriter.toBuffer);
		} else {
			this.stream.Send(osuPacketWriter.toBuffer);
		}

		if (this.name === "#osu") {
			ChatHistory.AddMessage(`${this.bot.user.username}: ${message}`);
		}
	}

	public SendSystemMessage(message:string, sendTo?:User) {
		const osuPacketWriter = osu.Bancho.Writer();
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
		const osuPacketWriter = osu.Bancho.Writer();
		osuPacketWriter.ChannelJoinSuccess(this.name);
		user.addActionToQueue(osuPacketWriter.toBuffer);
	}

	public Leave(user:User) {
		this.stream.RemoveUser(user);
		const osuPacketWriter = osu.Bancho.Writer();
		osuPacketWriter.ChannelRevoked(this.name);
		user.addActionToQueue(osuPacketWriter.toBuffer);
	}
}