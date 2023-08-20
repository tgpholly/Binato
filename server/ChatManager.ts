import { Channel } from "./objects/Channel";
import { ConsoleHelper } from "../ConsoleHelper";
import { FunkyArray } from "./objects/FunkyArray";
import { User } from "./objects/User";
import { Shared } from "./objects/Shared";
import { osu } from "../osuTyping";
import { PrivateChannel } from "./objects/PrivateChannel";

export class ChatManager {
	public chatChannels:FunkyArray<Channel> = new FunkyArray<Channel>();
	public forceJoinChannels:FunkyArray<Channel> = new FunkyArray<Channel>();
	private readonly shared:Shared;

	public constructor(shared:Shared) {
		this.shared = shared;
	}

	public AddChatChannel(name:string, description:string, forceJoin:boolean = false) : Channel {
		const stream = this.shared.streams.CreateStream(`chat_channel:${name}`, false);
		const channel = new Channel(this.shared, `#${name}`, description, stream);
		this.chatChannels.add(channel.name, channel);
		if (forceJoin) {
			this.forceJoinChannels.add(name, channel);
		}
		ConsoleHelper.printChat(`Created chat channel [${name}]`);
		return channel;
	}

	public AddSpecialChatChannel(name:string, streamName:string, forceJoin:boolean = false) : Channel {
		const stream = this.shared.streams.CreateStream(`chat_channel:${streamName}`, false);
		const channel = new Channel(this.shared, `#${name}`, "", stream);
		this.chatChannels.add(channel.name, channel);
		if (forceJoin) {
			this.forceJoinChannels.add(name, channel);
		}
		ConsoleHelper.printChat(`Created chat channel [${name}]`);
		return channel;
	}

	public RemoveChatChannel(channel:Channel | string) {
		if (channel instanceof Channel) {
			channel.stream.Delete();
			this.chatChannels.remove(channel.stream.name);
			this.forceJoinChannels.remove(channel.stream.name)
		} else {
			const chatChannel = this.GetChannelByName(channel);
			if (chatChannel instanceof Channel) {
				chatChannel.stream.Delete();
				this.chatChannels.remove(chatChannel.stream.name);
				this.forceJoinChannels.remove(chatChannel.stream.name)
			}
		}
	}

	public AddPrivateChatChannel(user0:User, user1:User) {
		const stream = this.shared.streams.CreateStream(`private_channel:${user0.username},${user1.username}`, true);
		const channel = new PrivateChannel(user0, user1, stream);
		this.chatChannels.add(channel.name, channel);
		ConsoleHelper.printChat(`Created private chat channel [${channel.name}]`);
		return channel;
	}

	public GetChannelByName(channelName:string) : Channel | undefined {
		return this.chatChannels.getByKey(channelName);
	}

	public GetPrivateChannelByName(channelName:string) : Channel | undefined {
		return this.chatChannels.getByKey(channelName);
	}

	public ForceJoinChannels(user:User) {
		for (let channel of this.forceJoinChannels.getIterableItems()) {
			channel.Join(user);
		}
	}
	

	public SendChannelListing(user:User) {
		const osuPacketWriter = osu.Bancho.Writer();
		for (let channel of this.chatChannels.getIterableItems()) {
			if (channel.isSpecial) {
				continue;
			}

			osuPacketWriter.ChannelAvailable({
				channelName: channel.name,
				channelTopic: channel.description,
				channelUserCount: channel.userCount
			});
		}
		user.addActionToQueue(osuPacketWriter.toBuffer);
	}
}