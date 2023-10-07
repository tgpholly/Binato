import { RowDataPacket } from "mysql2";
import Database from "../objects/Database";
import Shared from "../objects/Shared";
import UserModeInfo from "../objects/database/UserModeInfo";
import { Mode } from "fs";
import { RankingMode } from "../enums/RankingMode";

export default class UserModesInfoRepository {
	private database:Database;
	public constructor(shared:Shared) {
		this.database = shared.database;
	}

	public async selectByUserIdModeId(id:number, mode:Mode) {
		const query = await this.database.query("CALL SelectUserModesInfoByUserIdModeId(?,?)", [id, mode]);
		if (query != null) {
			const userModeInfo = new UserModeInfo();
			populateUserModeInfoFromRowDataPacket(userModeInfo, query[0][0]);

			return userModeInfo;
		}

		return null;
	}

	public async selectRankByIdModeIdRankingMode(id:number, mode:Mode, rankingMode:RankingMode) : Promise<number | null> {
		let query:RowDataPacket[] | undefined;
		switch (rankingMode) {
			case RankingMode.RANKED_SCORE:
				query = await this.database.query("CALL SelectUserScoreRankByIdModeId(?,?)", [id, mode]);
				break;

			case RankingMode.AVG_ACCURACY:
				query = await this.database.query("CALL SelectUserAccRankByIdModeId(?,?)", [id, mode]);
				break;

			case RankingMode.PP:
			default:
				query = await this.database.query("CALL SelectUserPPRankByIdModeId(?,?)", [id, mode]);
				break;
		}

		if (query != null && query.length != 0) {
			return query[0][0].rank;
		}

		return null;
	}
}

function populateUserModeInfoFromRowDataPacket(userModeInfo:UserModeInfo, rowDataPacket:RowDataPacket) {
	userModeInfo.n = rowDataPacket["n"];
	userModeInfo.user_id = rowDataPacket["user_id"];
	userModeInfo.mode_id = rowDataPacket["mode_id"];
	userModeInfo.count300 = rowDataPacket["count300"];
	userModeInfo.count100 = rowDataPacket["count100"];
	userModeInfo.count50 = rowDataPacket["count50"];
	userModeInfo.countmiss = rowDataPacket["countmiss"];
	userModeInfo.playcount = rowDataPacket["playcount"];
	userModeInfo.total_score = rowDataPacket["total_score"];
	userModeInfo.ranked_score = rowDataPacket["ranked_score"];
	userModeInfo.pp_rank = rowDataPacket["pp_rank"];
	userModeInfo.pp_raw = rowDataPacket["pp_raw"];
	userModeInfo.count_rank_ss = rowDataPacket["count_rank_ss"];
	userModeInfo.count_rank_s = rowDataPacket["count_rank_s"];
	userModeInfo.count_rank_a = rowDataPacket["count_rank_a"];
	userModeInfo.pp_country_rank = rowDataPacket["pp_country_rank"];
	userModeInfo.playtime = rowDataPacket["playtime"];
	userModeInfo.avg_accuracy = rowDataPacket["avg_accuracy"];
	userModeInfo.level = rowDataPacket["level"];
	userModeInfo.is_deleted = rowDataPacket["is_deleted"];
}