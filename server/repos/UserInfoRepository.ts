import { RowDataPacket } from "mysql2";
import Database from "../objects/Database";
import Shared from "../objects/Shared";
import UserInfo from "../objects/database/UserInfo";

export default class UserInfoRepository {
	private database:Database;
	public constructor(shared:Shared) {
		this.database = shared.database;
	}

	public async getById(id:number) {
		const query = await this.database.query("SELECT * FROM users_info WHERE id = ? AND is_deleted = 0 LIMIT 1", [id]);
		if (query != null) {
			const userInfo = new UserInfo();
			populateUserInfoFromRowDataPacket(userInfo, query[0]);

			return userInfo;
		}

		return null;
	}

	public async getByUsername(username:string) {
		const query = await this.database.query("SELECT * FROM users_info WHERE username = ? AND is_deleted = 0 LIMIT 1", [username]);
		if (query != null) {
			const userInfo = new UserInfo();
			populateUserInfoFromRowDataPacket(userInfo, query[0]);

			return userInfo;
		}

		return null;
	}
}

function populateUserInfoFromRowDataPacket(userInfo:UserInfo, rowDataPacket:RowDataPacket) {
	userInfo.id = rowDataPacket["id"];
	userInfo.username = rowDataPacket["username"];
	userInfo.username_safe = rowDataPacket["username_safe"];
	userInfo.password_hash = rowDataPacket["password_hash"];
	userInfo.password_salt = rowDataPacket["password_salt"];
	userInfo.email = rowDataPacket["email"];
	userInfo.country = rowDataPacket["country"];
	userInfo.reg_date = rowDataPacket["reg_date"];
	userInfo.last_login_date = rowDataPacket["last_login_date"];
	userInfo.last_played_mode = rowDataPacket["last_played_mode"];
	userInfo.online_now = rowDataPacket["online_now"];
	userInfo.tags = rowDataPacket["tags"];
	userInfo.supporter = rowDataPacket["supporter"];
	userInfo.web_session = rowDataPacket["web_session"];
	userInfo.verification_needed = rowDataPacket["verification_needed"];
	userInfo.password_change_required = rowDataPacket["password_change_required"];
	userInfo.has_old_password = rowDataPacket["has_old_password"];
	userInfo.password_reset_key = rowDataPacket["password_reset_key"];
	userInfo.away_message = rowDataPacket["away_message"];
	userInfo.last_modified_time = rowDataPacket["last_modified_time"];
	userInfo.is_deleted = rowDataPacket["is_deleted"];
}