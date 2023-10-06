import { Permissions } from "../enums/Permissions";

export default interface UserPresenceData {
	userId: number,
	username: string,
	timezone: number,
	countryId: number,
	permissions: Permissions,
	longitude: number,
	latitude: number,
	rank: number
}