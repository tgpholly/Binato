import ChatManager from "../ChatManager";
import Config from "../interfaces/Config";
import Database from "../objects/Database";
import DataStreamArray from "../objects/DataStreamArray";
import MultiplayerManager from "../MultiplayerManager";
import PrivateChatManager from "../PrivateChatManager";
import { existsSync, readFileSync } from "fs";
import UserArray from "../objects/UserArray";
import User from "./User";
import LatLng from "./LatLng";
import Bot from "../Bot";
import { ConsoleHelper } from "../../ConsoleHelper";

export default class Shared {
	public readonly chatManager:ChatManager;
	public readonly config:Config;
	public readonly database:Database;
	public readonly multiplayerManager:MultiplayerManager;
	public readonly privateChatManager:PrivateChatManager;
	public readonly streams:DataStreamArray;
	public readonly users:UserArray;
	public readonly bot:Bot;

	public constructor() {
		if (!existsSync("./config.json")) {
			ConsoleHelper.printError("Config file missing!");
			ConsoleHelper.printError("Check the GitHub for an example or create one with the example you have.");
			process.exit(1);
		}
		this.config = JSON.parse(readFileSync("./config.json").toString()) as Config;
		this.database = new Database(this.config.database.address, this.config.database.port, this.config.database.username, this.config.database.password, this.config.database.name);
		this.streams = new DataStreamArray();

		// Add the bot user
		this.users = new UserArray();
		const botUser = this.users.add("bot", new User(3, "SillyBot", "bot", this));
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