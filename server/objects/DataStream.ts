import { ConsoleHelper } from "../../ConsoleHelper";
import Constants from "../../Constants";
import DataStreamArray from "./DataStreamArray";
import User from "./User";
import UserArray from "./UserArray";
import { hexlify } from "../Util";

type DeleteFunction = (dataStream:DataStream) => void;

export default class DataStream {
	private users:UserArray = new UserArray();
	public readonly name:string;
	private readonly parent:DataStreamArray;
	private readonly removeWhenEmpty:boolean;
	private inactive:boolean = false;
	public onDelete?:DeleteFunction;

	public constructor(name:string, parent:DataStreamArray, removeWhenEmpty:boolean) {
		this.name = name;
		this.parent = parent;
		this.removeWhenEmpty = removeWhenEmpty;
	}

	public get IsActive() : boolean {
		return this.inactive;
	}

	private checkInactive() {
		if (this.inactive) {
			throw `Stream ${this.name} is inactive (deleted) and cannot be used here.`;
		}
	}

	public get userCount() : number {
		return this.users.getLength();
	}

	public HasUser(user:User) : boolean {
		return this.users.getByKey(user.uuid) !== undefined;
	}

	public AddUser(user:User) : void {
		this.checkInactive();

		if (!(user.uuid in this.users.getItems())) {
			this.users.add(user.uuid, user);
			ConsoleHelper.printStream(`Added [${user.username}] to stream [${this.name}]`);
		}
	}

	public RemoveUser(user:User) : void {
		this.checkInactive();

		if (user.uuid in this.users.getItems()) {
			this.users.remove(user.uuid);
			ConsoleHelper.printStream(`Removed [${user.username}] from stream [${this.name}]`);
		}
		if (this.removeWhenEmpty && this.users.getLength() === 0) {
			this.Delete();
		}
	}

	public Delete() {
		if (typeof(this.onDelete) === "function") {
			this.onDelete(this);
		}
		this.parent.DeleteStream(this);
	}

	public Deactivate() {
		this.inactive = true;
	}

	public Send(data:Buffer) {
		this.checkInactive();

		for (let user of this.users.getIterableItems()) {
			user.addActionToQueue(data);
		}
		if (Constants.DEBUG) {
			ConsoleHelper.printStream(`Sent Buffer<${hexlify(data)}> to all users in stream [${this.name}]`);
		}
	}

	public SendWithExclusion(data:Buffer, exclude:User) {
		this.checkInactive();

		for (let user of this.users.getIterableItems()) {
			if (user.uuid !== exclude.uuid) {
				user.addActionToQueue(data);
			}
		}
		if (Constants.DEBUG) {
			ConsoleHelper.printStream(`Sent Buffer<${hexlify(data)}> to all users in stream [${this.name}] excluding user [${exclude.username}]`);
		}
	}
}