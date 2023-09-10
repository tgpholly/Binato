import { readFileSync } from "fs";

export default abstract class ChatHistory {
	private static _history:Array<string> = new Array<string>();
	private static _lastGeneratedPage:string;
	private static _hasChanged:boolean = true;
	private static readonly HISTORY_LENGTH = 10;
	private static readonly PAGE_TEMPLATE = readFileSync("./web/chatPageTemplate.html").toString();

	public static AddMessage(message:string) : void {
		if (this._history.length === this.HISTORY_LENGTH) {
			this._history.splice(0, 1);
		}

		this._history.push(message);
		this._hasChanged = true;
	}

	public static GenerateForWeb() : string {
		if (this._hasChanged) {
			let lines = "", flip = false;

			for (let i = 0; i < this.HISTORY_LENGTH; i++) {
				lines += `<div class="line line${flip ? 1 : 0}">${this._history[i] == null ? "<hidden>blank</hidden>" : this._history[i].replaceAll("<", "&lt;").replaceAll(">", "&gt;").replaceAll("\n", "<br>")}</div>`
				flip = !flip;
			}

			this._lastGeneratedPage = this.PAGE_TEMPLATE.toString().replace("|content|", lines);
			this._hasChanged = false;
		}
		
		return this._lastGeneratedPage;
	}
}