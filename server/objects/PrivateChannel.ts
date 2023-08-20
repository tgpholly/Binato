import { osu } from "../../osuTyping";
import { Shared } from "../objects/Shared";
import { Channel } from "./Channel";
import { DataStream } from "./DataStream";
import { User } from "./User";

export class PrivateChannel extends Channel {
	private readonly user0:User;
	private readonly user1:User;

	public constructor(user0:User, user1:User, stream:DataStream) {
		super(user0.shared, `${user0.username}${user1.username}`, "", stream);
		this.user0 = user0;
		this.user1 = user1;
	}

	public override SendMessage(sender:User, message:string) {
		const osuPacketWriter = osu.Bancho.Writer();
		if (!this.stream.HasUser(this.user0)) {
			this.Join(this.user0);
		}
		if (!this.stream.HasUser(this.user1)) {
			this.Join(this.user1);
		}

		let target:string = this.user1.username;
		if (sender.uuid === this.user1.uuid) {
			target = this.user0.username;
		}

		osuPacketWriter.SendMessage({
			sendingClient: sender.username,
			message: message,
			target: target,
			senderId: sender.id
		});
		this.stream.SendWithExclusion(osuPacketWriter.toBuffer, sender);
	}

	public override Join(user:User) {
		this.stream.AddUser(user);
		const osuPacketWriter = osu.Bancho.Writer();
		if (user.uuid === this.user0.uuid) {
			osuPacketWriter.ChannelJoinSuccess(this.user1.username);
		} else if (user.uuid === this.user1.uuid) {
			osuPacketWriter.ChannelJoinSuccess(this.user0.username);
		}
		user.addActionToQueue(osuPacketWriter.toBuffer);
	}

	public override Leave(user:User) {
		this.stream.RemoveUser(user);
		const osuPacketWriter = osu.Bancho.Writer();
		if (user.id === this.user0.id) {
			osuPacketWriter.ChannelRevoked(this.user1.username);
		} else if (user.id === this.user1.id) {
			osuPacketWriter.ChannelRevoked(this.user0.username);
		}
		user.addActionToQueue(osuPacketWriter.toBuffer);
	}
}