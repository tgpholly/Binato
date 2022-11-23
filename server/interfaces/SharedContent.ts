import { ChatManager } from "../ChatManager";
import { MultiplayerManager } from "../MultiplayerManager";
import { Database } from "../objects/Database";
import { DataStreamArray } from "../objects/DataStreamArray";
import { UserArray } from "../objects/UserArray";

export interface SharedContent {
	chatManager:ChatManager,
	database:Database,
	mutiplayerManager:MultiplayerManager,
	streams:DataStreamArray,
	users:UserArray,
}