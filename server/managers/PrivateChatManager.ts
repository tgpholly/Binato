import Channel from "../objects/Channel";
import ConsoleHelper from "../../ConsoleHelper";
import FunkyArray from "../objects/FunkyArray";
import User from "../objects/User";
import PrivateChannel from "../objects/PrivateChannel";
import StreamManager from "./StreamManager";

export default abstract class PrivateChatManager {
	public static readonly chatChannels: FunkyArray<PrivateChannel> = new FunkyArray<PrivateChannel>();

	public static AddChannel(user0: User, user1: User) : PrivateChannel {
		const stream = StreamManager.CreateStream(`private_channel:${user0.username},${user1.username}`, true);
		const channel = new PrivateChannel(user0, user1, stream);
		this.chatChannels.add(channel.name, channel);
		ConsoleHelper.printChat(`Created private chat channel [${channel.name}]`);
		return channel;
	}

	public static RemoveChannel(channel: PrivateChannel | string) {
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

	public static GetChannelByName(channelName: string) : PrivateChannel | undefined {
		return this.chatChannels.getByKey(channelName);
	}
}