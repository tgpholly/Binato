import { FunkyArray } from "./FunkyArray";
import { User } from "./User";

export class UserArray extends FunkyArray<User> {
	public getById(id:number) : User | undefined {
		for (let user of this.getIterableItems()) {
			if (user.id == id) 
				return user;
		}

		return undefined;
	}

	public getByUsername(username:string) : User | undefined {
		for (let user of this.getIterableItems()) {
			if (user.username === username)
				return user;
		}

		return undefined;
	}

	public getByToken(token:string) : User | undefined {
		return this.getByKey(token);
	}
}