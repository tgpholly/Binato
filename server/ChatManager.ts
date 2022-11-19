import { Channel } from "./objects/Channel";
import { ConsoleHelper } from "../ConsoleHelper";
import { FunkyArray } from "./objects/FunkyArray";
import { DataStreamArray } from "./objects/DataStreamArray";

export class ChatManager {
	public chatChannels:FunkyArray<Channel> = new FunkyArray<Channel>();
	public streams:DataStreamArray;

	public constructor(streams:DataStreamArray) {
		this.streams = streams;
	}

	public AddChatChannel(name:string, description:string, forceJoin:boolean = false) {
		const stream = this.streams.CreateStream(`chat_channel:${name}`, false);
		this.chatChannels.add(name, new Channel(name, description, stream, forceJoin));
		ConsoleHelper.printChat(`Created chat channel [${name}]`);
	}
}