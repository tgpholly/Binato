import { Channel } from "./objects/Channel";
import { ConsoleHelper } from "../ConsoleHelper";
import { FunkyArray } from "./objects/FunkyArray";
import { User } from "./objects/User";
import { Shared } from "./objects/Shared";
import { osu } from "../osuTyping";
import { PrivateChannel } from "./objects/PrivateChannel";

export class PrivateChatManager {
	public chatChannels:FunkyArray<PrivateChannel> = new FunkyArray<PrivateChannel>();
	private readonly shared:Shared;

	public constructor(shared:Shared) {
		this.shared = shared;
	}

	public AddChannel(user0:User, user1:User) : PrivateChannel {
		const stream = this.shared.streams.CreateStream(`private_channel:${user0.username},${user1.username}`, true);
		const channel = new PrivateChannel(user0, user1, stream);
		this.chatChannels.add(channel.name, channel);
		ConsoleHelper.printChat(`Created private chat channel [${channel.name}]`);
		return channel;
	}

	public RemoveChannel(channel:PrivateChannel | string) {
		if (channel instanceof Channel) {
			channel.stream.Delete();
			this.chatChannels.remove(channel.stream.name);
		} else {
			const chatChannel = this.GetChannelByName(channel);
			if (chatChannel instanceof Channel) {
				chatChannel.stream.Delete();
				this.chatChannels.remove(chatChannel.stream.name);
			}
		}
	}

	public GetChannelByName(channelName:string) : PrivateChannel | undefined {
		return this.chatChannels.getByKey(channelName);
	}
}