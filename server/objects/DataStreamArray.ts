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

	public DeleteStream(stream:DataStream | string) {
		const isObject = stream instanceof DataStream;
		if (isObject) {
			stream.Deactivate();
			this.remove(stream.name);
		} else {
			const dso = this.getByKey(stream);
			if (dso != null) {
				dso.Deactivate();
			}
			this.remove(stream);
		}
		ConsoleHelper.printStream(`Deleted stream [${isObject ? stream.name : stream}]`);
	}

	public RemoveUserFromAllStreams(user:User) {
		for (let stream of this.getIterableItems()) {
			stream.RemoveUser(user);
		}
	}
}