import { Channel } from "./objects/Channel";
import { ConsoleHelper } from "../ConsoleHelper";
import { FunkyArray } from "./objects/FunkyArray";
import { DataStreamArray } from "./objects/DataStreamArray";
import { User } from "./objects/User";
const osu = require("osu-packet");

export class ChatManager {
	public chatChannels:FunkyArray<Channel> = new FunkyArray<Channel>();
	public forceJoinChannels:FunkyArray<Channel> = new FunkyArray<Channel>();
	public streams:DataStreamArray;

	public constructor(streams:DataStreamArray) {
		this.streams = streams;
	}

	public AddChatChannel(name:string, description:string, forceJoin:boolean = false) {
		const stream = this.streams.CreateStream(`chat_channel:${name}`, false);
		const channel = new Channel(`#${name}`, description, stream);
		this.chatChannels.add(channel.name, channel);
		if (forceJoin) {
			this.forceJoinChannels.add(name, channel);
		}
		ConsoleHelper.printChat(`Created chat channel [${name}]`);
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
			osuPacketWriter.ChannelAvailable({
				channelName: channel.name,
				channelTopic: channel.description,
				channelUserCount: channel.userCount
			});
		}
		user.addActionToQueue(osuPacketWriter.toBuffer);
	}
}