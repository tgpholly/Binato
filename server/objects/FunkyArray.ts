export default class FunkyArray<T> {
	private items:any = {};
	private itemKeys:Array<string> = Object.keys(this.items);
	private iterableArray:Array<T> = new Array<T>();

	public add(key:string, item:T, regenerate:boolean = true) : T {
		this.items[key] = item;

		if (regenerate) {
			this.itemKeys = Object.keys(this.items);
			this.regenerateIterableArray();
		}

		return this.items[key];
	}

	public remove(key:string, regenerate:boolean = true) {
		delete this.items[key];
		if (regenerate) {
			this.itemKeys = Object.keys(this.items);
			this.regenerateIterableArray();
		}
	}

	public removeFirstItem(regenerate:boolean = true) : void {
		delete this.items[this.itemKeys[0]];
		this.itemKeys = Object.keys(this.items);
		if (regenerate) this.regenerateIterableArray();
	}

	public regenerateIterableArray() : void {
		this.iterableArray = new Array();
		for (let itemKey of this.itemKeys) {
			this.iterableArray.push(this.items[itemKey]);
		}
		this.itemKeys = Object.keys(this.items);
	}

	public getFirstItem() : T {
		return this.items[this.itemKeys[0]];
	}

	public getLength() : number {
		return this.itemKeys.length;
	}

	public getKeyById(id:number) : string {
		return this.itemKeys[id];
	}

	public getById(id:number) : T | undefined {
		return this.items[this.itemKeys[id]];
	}

	public getByKey(key:string) : T | undefined {
		if (key in this.items) {
			return this.items[key];
		}

		return undefined;
	}

	public getKeys() : Array<string> {
		return this.itemKeys;
	}

	public getItems() : any {
		return this.items;
	}

	public getIterableItems() : Array<T> {
		return this.iterableArray;
	}
}