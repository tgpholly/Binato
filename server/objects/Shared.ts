import ChatManager from "../ChatManager";
import DataStreamArray from "../objects/DataStreamArray";
import MultiplayerManager from "../MultiplayerManager";
import PrivateChatManager from "../PrivateChatManager";
import UserArray from "../objects/UserArray";
import User from "./User";
import LatLng from "./LatLng";
import Bot from "../Bot";
import Permissions from "../enums/Permissions";

export default class Shared {
	public readonly chatManager: ChatManager;
	public readonly multiplayerManager: MultiplayerManager;
	public readonly privateChatManager: PrivateChatManager;
	public readonly streams: DataStreamArray;
	public readonly users: UserArray;
	public readonly bot: Bot;

	public constructor() {
		this.streams = new DataStreamArray();

		// Add the bot user
		this.users = new UserArray();
		const botUser = this.users.add("bot", new User(3, "SillyBot", "bot", Permissions.None, this));
		botUser.location = new LatLng(50, -32);
		this.bot = new Bot(this, botUser);

		this.chatManager = new ChatManager(this);
		// Setup chat channels
		this.chatManager.AddChatChannel("osu", "The main channel", true);
		this.chatManager.AddChatChannel("lobby", "Talk about multiplayer stuff");
		this.chatManager.AddChatChannel("english", "Talk in exclusively English");
		this.chatManager.AddChatChannel("japanese", "Talk in exclusively Japanese");

		this.multiplayerManager = new MultiplayerManager(this);
		this.privateChatManager = new PrivateChatManager(this);
	}
}