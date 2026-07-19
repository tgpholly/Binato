import { Socket } from "node:net";

export default class SocketInfo {
	public readonly isLegacy: boolean;
	public readonly socket?: Socket;

	public constructor(isLegacy: boolean, socket?: Socket) {
		this.isLegacy = isLegacy;
		this.socket = socket;
	}
}