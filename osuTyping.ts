import OsuPacketWriter from "./server/interfaces/OsuPacketWriter";

const nodeOsu = require("osu-packet");

export default abstract class osu {
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