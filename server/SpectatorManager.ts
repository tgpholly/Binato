import DataStream from "./objects/DataStream";
import Shared from "./objects/Shared";
import User from "./objects/User";
import osu from "../osuTyping";

export default class SpectatorManager {
	private shared:Shared;

	public constructor(shared:Shared) {
		this.shared = shared;
	}

	public startSpectating(user:User, userIdToSpectate:number) {
		const userToSpectate = this.shared.users.getById(userIdToSpectate);
		if (userToSpectate === undefined) {
			return;
		}

		// Use existing or create spectator stream
		let spectateStream:DataStream;
		if (userToSpectate.spectatorStream === undefined) {
			user.spectatorStream = spectateStream = userToSpectate.spectatorStream = this.shared.streams.CreateStream(`spectator:${userToSpectate.username}`);
		} else {
			user.spectatorStream = spectateStream = userToSpectate.spectatorStream;
		}

		user.spectatingUser = userToSpectate;

		let osuPacketWriter = osu.Bancho.Writer();

		osuPacketWriter.SpectatorJoined(user.id);

		userToSpectate.addActionToQueue(osuPacketWriter.toBuffer);

		osuPacketWriter = osu.Bancho.Writer();

		osuPacketWriter.FellowSpectatorJoined(user.id);

		spectateStream.Send(osuPacketWriter.toBuffer);
	}

	// TODO: Interface for spectateFrameData
	public spectatorFrames(user:User, spectateFrameData:any) {
		if (user.spectatorStream === undefined) {
			return;
		}

		const osuPacketWriter = osu.Bancho.Writer();
		osuPacketWriter.SpectateFrames(spectateFrameData);

		user.spectatorStream.Send(osuPacketWriter.toBuffer);
	}

	public stopSpectating(user:User) {
		if (user.spectatingUser === undefined || user.spectatorStream === undefined) {
			return;
		}

		const spectatedUser = user.spectatingUser;

		let osuPacketWriter = osu.Bancho.Writer();
		osuPacketWriter.SpectatorLeft(user.id);
		spectatedUser.addActionToQueue(osuPacketWriter.toBuffer);

		const stream = user.spectatorStream;

		stream.RemoveUser(user);
		user.spectatorStream = undefined;
		user.spectatingUser = undefined;

		if (stream.IsActive) {
			osuPacketWriter = osu.Bancho.Writer();
			osuPacketWriter.FellowSpectatorLeft(user.id);
			stream.Send(osuPacketWriter.toBuffer);
		} else {
			spectatedUser.spectatorStream = undefined;
		}
	}
}