import Channel from "./objects/Channel";
import ConsoleHelper from "../ConsoleHelper";
import FunkyArray from "./objects/FunkyArray";
import User from "./objects/User";
import osu from "../osuTyping";
import PrivateChannel from "./objects/PrivateChannel";
import StreamManager from "./StreamManager";

export default abstract class ChatManager {
	public static chatChannels: FunkyArray<Channel> = new FunkyArray<Channel>();
	public static forceJoinChannels: FunkyArray<Channel> = new FunkyArray<Channel>();

	public static AddChatChannel(name:string, description:string, forceJoin:boolean = false) : Channel {
		const stream = StreamManager.CreateStream(`chat_channel:${name}`, false);
		const channel = new Channel(`#${name}`, description, stream);
		this.chatChannels.add(channel.name, channel);
		if (forceJoin) {
			this.forceJoinChannels.add(name, channel);
		}
		ConsoleHelper.printChat(`Created chat channel [${name}]`);
		return channel;
	}

	public static AddSpecialChatChannel(name:string, streamName:string, forceJoin:boolean = false) : Channel {
		const stream = StreamManager.CreateStream(`chat_channel:${streamName}`, false);
		const channel = new Channel(`#${name}`, "", stream);
		this.chatChannels.add(channel.name, channel);
		if (forceJoin) {
			this.forceJoinChannels.add(name, channel);
		}
		ConsoleHelper.printChat(`Created chat channel [${name}]`);
		return channel;
	}

	public static RemoveChatChannel(channel:Channel | string) {
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

	public static AddPrivateChatChannel(user0:User, user1:User) {
		const stream = StreamManager.CreateStream(`private_channel:${user0.username},${user1.username}`, true);
		const channel = new PrivateChannel(user0, user1, stream);
		this.chatChannels.add(channel.name, channel);
		ConsoleHelper.printChat(`Created private chat channel [${channel.name}]`);
		return channel;
	}

	public static GetChannelByName(channelName:string) : Channel | undefined {
		return this.chatChannels.getByKey(channelName);
	}

	public static GetPrivateChannelByName(channelName:string) : Channel | undefined {
		return this.chatChannels.getByKey(channelName);
	}

	public static ForceJoinChannels(user:User) {
		for (const channel of this.forceJoinChannels.getIterableItems()) {
			channel.Join(user);
		}
	}
	

	public static SendChannelListing(user:User) {
		const osuPacketWriter = osu.Bancho.Writer();
		for (const channel of this.chatChannels.getIterableItems()) {
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