import ConsoleHelper from "../ConsoleHelper";
import DataStream from "./objects/DataStream";
import FunkyArray from "./objects/FunkyArray";
import User from "./objects/User";

export default abstract class StreamManager {
	private static readonly streams: FunkyArray<DataStream> = new FunkyArray<DataStream>();

	public static CreateStream(name: string, removeWhenEmpty: boolean = true): DataStream {
		const dataStream: DataStream = this.streams.add(name, new DataStream(name, removeWhenEmpty));
		ConsoleHelper.printStream(`Created stream [${name}]`);
		return dataStream;
	}

	public static DeleteStream(stream: DataStream | string) {
		const isObject = stream instanceof DataStream;
		if (isObject) {
			stream.Deactivate();
			this.streams.remove(stream.name);
		} else {
			const dso = this.streams.getByKey(stream);
			if (dso != null) {
				dso.Deactivate();
			}
			this.streams.remove(stream);
		}
		ConsoleHelper.printStream(`Deleted stream [${isObject ? stream.name : stream}]`);
	}

	public static RemoveUserFromAllStreams(user: User) {
		for (const stream of this.streams.getIterableItems()) {
			stream.RemoveUser(user);
		}
	}
}