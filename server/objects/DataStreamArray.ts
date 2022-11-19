import { ConsoleHelper } from "../../ConsoleHelper";
import { DataStream } from "./DataStream";
import { FunkyArray } from "./FunkyArray";
import { User } from "./User";

export class DataStreamArray extends FunkyArray<DataStream> {
	public CreateStream(name:string, removeWhenEmpty:boolean = true) : DataStream {
		const dataStream:DataStream = this.add(name, new DataStream(name, this, removeWhenEmpty));
		ConsoleHelper.printStream(`Created stream [${name}]`);
		return dataStream;
	}

	public RemoveUserFromAllStreams(user:User) {
		for (let stream of this.getIterableItems()) {
			stream.RemoveUser(user);
		}
	}
}