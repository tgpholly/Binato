import FunkyArray from "./FunkyArray";
import User from "./User";

export default class UserArray extends FunkyArray<User> {
	public getById(id:number) : User | undefined {
		for (const user of this.getIterableItems()) {
			if (user.id == id) 
				return user;
		}

		return undefined;
	}

	public getByUsername(username:string) : User | undefined {
		for (const user of this.getIterableItems()) {
			if (user.username === username)
				return user;
		}

		return undefined;
	}

	public getByToken(token:string) : User | undefined {
		return this.getByKey(token);
	}
}