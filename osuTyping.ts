import { OsuPacketWriter } from "./server/interfaces/OsuPacketWriter";

// Dummy file
const nodeOsu = require("osu-packet");

export abstract class osu {
	static Bancho = {
		Writer: function() : OsuPacketWriter {
			return new nodeOsu.Bancho.Writer();
		}
	};

	static Client = {
		Reader: function(data:any) : any {
			return new nodeOsu.Client.Reader(data);
		}
	};
}