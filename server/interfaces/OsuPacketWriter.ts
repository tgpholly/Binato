import ChannelData from "./ChannelData"
import MatchData from "./MatchData"
import MatchScoreData from "./MatchScoreData"
import MessageData from "./MessageData"
import SpectateFramesData from "./SpectateFramesData"
import StatusUpdateData from "./StatusUpdateData"
import UserPresenceData from "./UserPresenceData"
import UserQuitData from "./UserQuitData"

export default interface OsuPacketWriter {
	// Functions
	LoginReply(data:number) : OsuPacketWriter,
	CommandError() : OsuPacketWriter,
	SendMessage(data:MessageData) : OsuPacketWriter,
	Ping() : OsuPacketWriter,
	HandleIrcChangeUsername(data:string) : OsuPacketWriter,
	HandleIrcQuit() : OsuPacketWriter,
	HandleOsuUpdate(data:StatusUpdateData) : OsuPacketWriter,
	HandleUserQuit(data:UserQuitData) : OsuPacketWriter,
	SpectatorJoined(data:number) : OsuPacketWriter,
	SpectatorLeft(data:number) : OsuPacketWriter,
	SpectateFrames(data:SpectateFramesData) : OsuPacketWriter,
	VersionUpdate() : OsuPacketWriter,
	SpectatorCantSpectate(data:number) : OsuPacketWriter,
	GetAttention() : OsuPacketWriter,
	Announce(data:string) : OsuPacketWriter,
	MatchUpdate(data:MatchData) : OsuPacketWriter,
	MatchNew(data:MatchData) : OsuPacketWriter,
	MatchDisband(data:number) : OsuPacketWriter,
	MatchJoinSuccess(data:MatchData) : OsuPacketWriter,
	MatchJoinFail() : OsuPacketWriter,
	FellowSpectatorJoined(data:number) : OsuPacketWriter,
	FellowSpectatorLeft(data:number) : OsuPacketWriter,
	MatchStart(data:MatchData) : OsuPacketWriter,
	MatchScoreUpdate(data:MatchScoreData) : OsuPacketWriter,
	MatchTransferHost() : OsuPacketWriter,
	MatchAllPlayersLoaded() : OsuPacketWriter,
	MatchPlayerFailed(data:number) : OsuPacketWriter,
	MatchComplete() : OsuPacketWriter,
	MatchSkip() : OsuPacketWriter,
	Unauthorised() : OsuPacketWriter,
	ChannelJoinSuccess(data:string) : OsuPacketWriter,
	ChannelAvailable(data:ChannelData) : OsuPacketWriter,
	ChannelRevoked(data:string) : OsuPacketWriter,
	ChannelAvailableAutojoin(data:ChannelData) : OsuPacketWriter,
	BeatmapInfoReply() : OsuPacketWriter,
	LoginPermissions(data:number) : OsuPacketWriter,
	FriendsList(data:Array<number>) : OsuPacketWriter,
	ProtocolNegotiation(data:number) : OsuPacketWriter,
	TitleUpdate(data:string) : OsuPacketWriter,
	Monitor() : OsuPacketWriter,
	MatchPlayerSkipped(data:number) : OsuPacketWriter,
	UserPresence(data:UserPresenceData) : OsuPacketWriter,
	Restart(data:number) : OsuPacketWriter,
	Invite(data:MessageData) : OsuPacketWriter,
	ChannelListingComplete() : OsuPacketWriter,
	MatchChangePassword(data:string) : OsuPacketWriter,
	BanInfo(data:number) : OsuPacketWriter,
	UserSilenced(data:number) : OsuPacketWriter,
	UserPresenceSingle(data:number) : OsuPacketWriter,
	UserPresenceBundle(data:Array<number>) : OsuPacketWriter,
	UserPMBlocked(data:MessageData) : OsuPacketWriter,
	TargetIsSilenced(data:MessageData) : OsuPacketWriter,
	VersionUpdateForced() : OsuPacketWriter,
	SwitchServer(data:number) : OsuPacketWriter,
	AccountRestricted() : OsuPacketWriter,
	RTX(data:string) : OsuPacketWriter,
	SwitchTourneyServer(data:string) : OsuPacketWriter

	toBuffer : Buffer
}