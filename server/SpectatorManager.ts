import { DataStream } from "./objects/DataStream";
import { SharedContent } from "./interfaces/SharedContent";
import { User } from "./objects/User";
const osu = require("osu-packet");

export class SpectatorManager {
	private sharedContent:SharedContent;

	public constructor(sharedContent:SharedContent) {
		this.sharedContent = sharedContent;
	}

	public startSpectating(user:User, userIdToSpectate:number) {
		const userToSpectate = this.sharedContent.users.getById(userIdToSpectate);
		if (userToSpectate === undefined) {
			return;
		}

		// Use existing or create spectator stream
		let spectateStream:DataStream;
		if (userToSpectate.spectatorStream === undefined) {
			user.spectatorStream = spectateStream = userToSpectate.spectatorStream = this.sharedContent.streams.CreateStream(`spectator:${userToSpectate.username}`);
		} else {
			user.spectatorStream = spectateStream = userToSpectate.spectatorStream;
		}

		user.spectatingUser = userToSpectate;

		let osuPacketWriter = new osu.Bancho.Writer;

		osuPacketWriter.SpectatorJoined(user.id);

		userToSpectate.addActionToQueue(osuPacketWriter.toBuffer);

		osuPacketWriter = new osu.Bancho.Writer;

		osuPacketWriter.FellowSpectatorJoined(user.id);

		spectateStream.Send(osuPacketWriter.toBuffer);
	}

	// TODO: Interface for spectateFrameData
	public spectatorFrames(user:User, spectateFrameData:any) {
		if (user.spectatorStream === undefined) {
			return;
		}

		const osuPacketWriter = new osu.Bancho.Writer;
		osuPacketWriter.SpectateFrames(spectateFrameData);

		user.spectatorStream.Send(osuPacketWriter.toBuffer);
	}

	public stopSpectating(user:User) {
		if (user.spectatingUser === undefined || user.spectatorStream === undefined) {
			return;
		}

		const spectatedUser = user.spectatingUser;

		let osuPacketWriter = new osu.Bancho.Writer;
		osuPacketWriter.SpectatorLeft(user.id);
		spectatedUser.addActionToQueue(osuPacketWriter.toBuffer);

		const stream = user.spectatorStream;

		stream.RemoveUser(user);
		user.spectatorStream = undefined;
		user.spectatingUser = undefined;

		if (stream.IsActive) {
			osuPacketWriter = new osu.Bancho.Writer;
			osuPacketWriter.FellowSpectatorLeft(user.id);
			stream.Send(osuPacketWriter.toBuffer);
		} else {
			spectatedUser.spectatorStream = undefined;
		}
	}
}