import { DataStream } from "./DataStream";

export class Channel {
	public name:string;
	public description:string;
	public userCount:number = 0;
	private stream:DataStream;
	private forceJoin:boolean;

	public constructor(name:string, description:string, stream:DataStream, forceJoin:boolean = false) {
		this.name = name;
		this.description = description;
		this.stream = stream;
		this.forceJoin = forceJoin;
	}

	public SendMessage(message:string) {

	}
}