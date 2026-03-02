import FunkyArray from "./objects/FunkyArray";
import User from "./objects/User";
import Bot from "./Bot";

export default abstract class Users {
	private static readonly users: FunkyArray<User> = new FunkyArray<User>();
	public static bot: Bot;

	public static add(key: string, user: User, regenerate: boolean = true) {
		return this.users.add(key, user, regenerate);
	}

	public static remove(key: string) {
		this.users.remove(key);
	}

	public static getIterableItems() {
		return this.users.getIterableItems();
	}

	public static get length() {
		return this.users.getLength();
	}

	public static getById(id:number) : User | undefined {
		for (const user of this.users.getIterableItems()) {
			if (user.id == id) 
				return user;
		}

		return undefined;
	}

	public static getByUsername(username:string) : User | undefined {
		for (const user of this.users.getIterableItems()) {
			if (user.username === username)
				return user;
		}

		return undefined;
	}

	public static getByToken(token:string) : User | undefined {
		return this.users.getByKey(token);
	}
}