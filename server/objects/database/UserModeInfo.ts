import { Mode } from "../../enums/Mode";

export default class UserModeInfo {
	n:number = Number.MIN_VALUE;
	user_id:number = Number.MIN_VALUE;
	mode_id:Mode = Mode.Unknown;
	count300:number = Number.MIN_VALUE;
	count100:number = Number.MIN_VALUE;
	count50:number = Number.MIN_VALUE;
	countmiss:number = Number.MIN_VALUE;
	playcount:number = Number.MIN_VALUE;
	total_score:number = Number.MIN_VALUE;
	ranked_score:number = Number.MIN_VALUE;
	pp_rank:number = Number.MIN_VALUE;
	pp_raw:number = Number.MIN_VALUE;
	count_rank_ss:number = Number.MIN_VALUE;
	count_rank_s:number = Number.MIN_VALUE;
	count_rank_a:number = Number.MIN_VALUE;
	pp_country_rank:number = Number.MIN_VALUE;
	playtime:number = Number.MIN_VALUE;
	avg_accuracy:number = Number.MIN_VALUE;
	level:number = Number.MIN_VALUE;
	is_deleted:boolean = false;
}