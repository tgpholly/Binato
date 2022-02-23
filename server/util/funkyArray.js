class FunkyArray {
	constructor() {
		this.items = {};
		this.itemKeys = Object.keys(this.items);

		this.iterableArray = [];
	}

	add(uuid, item, regenerate = true) {
		this.items[uuid] = item;

		if (regenerate) {
			this.itemKeys = Object.keys(this.items);
			this.regenerateIterableArray();
		}

		return this.items[uuid];
	}

	remove(uuid, regenerate = true) {
		delete this.items[uuid];
		if (regenerate) {
			this.itemKeys = Object.keys(this.items);
			this.regenerateIterableArray();
		}
	}

	removeFirstItem(regenerate = true) {
		delete this.items[this.itemKeys[0]];
		this.itemKeys = Object.keys(this.items);
		if (regenerate) this.regenerateIterableArray();
	}

	regenerateIterableArray() {
		this.iterableArray = new Array();
		for (let itemKey of this.itemKeys) {
			this.iterableArray.push(this.items[itemKey]);
		}
		this.itemKeys = Object.keys(this.items);
	}

	getFirstItem() {
		return this.items[this.itemKeys[0]];
	}

	getLength() {
		return this.itemKeys.length;
	}

	getKeyById(id) {
		return this.itemKeys[id];
	}

	getById(id) {
		return this.items[this.itemKeys[id]];
	}

	getByKey(key) {
		return this.items[key];
	}

	getKeys() {
		return this.itemKeys;
	}

	getItems() {
		return this.items;
	}

	getIterableItems() {
		return this.iterableArray;
	}
}

module.exports = FunkyArray;