import { Permissions } from "../../enums/Permissions";

export default class UserInfo {
	id:number = Number.MIN_VALUE;
	username:string = "";
	username_safe:string = "";
	password_hash:string = "";
	password_salt:string = "";
	email:string = "";
	country:string = "";
	reg_date:Date = new Date(0);
	last_login_date:Date = new Date(0);
	last_played_mode:number = Number.MIN_VALUE;
	online_now:boolean = false;
	tags:Permissions = Permissions.None;
	supporter:boolean = false;
	web_session:string = "";
	verification_needed:boolean = false;
	password_change_required:boolean = false;
	has_old_password:number = Number.MIN_VALUE;
	password_reset_key:string = "";
	away_message:string = "";
	last_modified_time:Date = new Date(0);
	is_deleted:boolean = false;
}