import DataStream from "./objects/DataStream";
import User from "./objects/User";
import osu from "../osuTyping";
import SpectateFramesData from "./interfaces/packetTypes/SpectateFramesData";
import StreamManager from "./StreamManager";
import Users from "./Users";

export default abstract class SpectatorManager {
	public static StartSpectating(user: User, userIdToSpectate: number) {
		const userToSpectate = Users.getById(userIdToSpectate);
		if (userToSpectate === undefined) {
			return;
		}

		// Use existing or create spectator stream
		let spectateStream: DataStream;
		if (userToSpectate.spectatorStream === undefined) {
			user.spectatorStream = spectateStream = userToSpectate.spectatorStream = StreamManager.CreateStream(`spectator:${userToSpectate.username}`);

		} else {
			user.spectatorStream = spectateStream = userToSpectate.spectatorStream;
		}

		user.spectatingUser = userToSpectate;
		spectateStream.AddUser(user);

		let osuPacketWriter = osu.Bancho.Writer();

		osuPacketWriter.SpectatorJoined(user.id);

		userToSpectate.addActionToQueue(osuPacketWriter.toBuffer);

		osuPacketWriter = osu.Bancho.Writer();

		osuPacketWriter.FellowSpectatorJoined(user.id);

		spectateStream.Send(osuPacketWriter.toBuffer);
	}

	public static SpectatorFrames(user: User, spectateFramesData: SpectateFramesData) {
		if (user.spectatorStream === undefined) {
			return;
		}

		const osuPacketWriter = osu.Bancho.Writer();
		osuPacketWriter.SpectateFrames(spectateFramesData);

		user.spectatorStream.Send(osuPacketWriter.toBuffer);
	}

	public static StopSpectating(user: User) {
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