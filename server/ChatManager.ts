import { Channel } from "./objects/Channel";
import { ConsoleHelper } from "../ConsoleHelper";
import { FunkyArray } from "./objects/FunkyArray";
import { User } from "./objects/User";
import { SharedContent } from "./interfaces/SharedContent";
const osu = require("osu-packet");

export class ChatManager {
	public chatChannels:FunkyArray<Channel> = new FunkyArray<Channel>();
	public forceJoinChannels:FunkyArray<Channel> = new FunkyArray<Channel>();
	private readonly sharedContent:SharedContent;

	public constructor(sharedContent:SharedContent) {
		this.sharedContent = sharedContent;
	}

	public AddChatChannel(name:string, description:string, forceJoin:boolean = false) : Channel {
		const stream = this.sharedContent.streams.CreateStream(`chat_channel:${name}`, false);
		const channel = new Channel(this.sharedContent, `#${name}`, description, stream);
		this.chatChannels.add(channel.name, channel);
		if (forceJoin) {
			this.forceJoinChannels.add(name, channel);
		}
		ConsoleHelper.printChat(`Created chat channel [${name}]`);
		return channel;
	}

	public AddSpecialChatChannel(name:string, streamName:string, forceJoin:boolean = false) : Channel {
		const stream = this.sharedContent.streams.CreateStream(`chat_channel:${streamName}`, false);
		const channel = new Channel(this.sharedContent, `#${name}`, "", stream);
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

	public GetChannelByName(channelName:string) : Channel | undefined {
		return this.chatChannels.getByKey(channelName);
	}

	public ForceJoinChannels(user:User) {
		for (let channel of this.forceJoinChannels.getIterableItems()) {
			channel.Join(user);
		}
	}

	public SendChannelListing(user:User) {
		const osuPacketWriter = new osu.Bancho.Writer;
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