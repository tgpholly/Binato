import { ConsoleHelper } from "../../ConsoleHelper";
import { Constants } from "../../Constants";
import { DataStreamArray } from "./DataStreamArray";
import { User } from "./User";
import { UserArray } from "./UserArray";

export class DataStream {
	private users:UserArray = new UserArray();
	private readonly name:string;
	private readonly parent:DataStreamArray;
	private readonly removeWhenEmpty:boolean;

	public constructor(name:string, parent:DataStreamArray, removeWhenEmpty:boolean) {
		this.name = name;
		this.parent = parent;
		this.removeWhenEmpty = removeWhenEmpty;
	}

	public AddUser(user:User) : void {
		if (!(user.uuid in this.users.getItems())) {
			this.users.add(user.uuid, user);
			ConsoleHelper.printStream(`Added user [${user.username}|${user.uuid}] to stream [${this.name}]`);
		}
	}

	public RemoveUser(user:User) : void {
		if (user.uuid in this.users.getItems()) {
			this.users.remove(user.uuid);
			ConsoleHelper.printStream(`Removed user [${user.username}|${user.uuid}] from stream [${this.name}]`);
		}
		if (this.removeWhenEmpty && this.users.getLength() === 0) {
			this.parent.remove(this.name);
		}
	}

	public Send(data:Buffer) {
		for (let user of this.users.getIterableItems()) {
			user.addActionToQueue(data);
		}

		if (Constants.DEBUG) {
			ConsoleHelper.printStream(`Sent [${data.toString()}] to all users in stream [${this.name}]`);
		}
	}
}