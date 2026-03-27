import { readFileSync } from "fs";

export default abstract class ChatHistory {
	private static history: Array<string> = new Array<string>();
	private static lastGeneratedPage: string;
	private static hasChanged: boolean = true;
	private static readonly HISTORY_LENGTH = 10;
	private static readonly PAGE_TEMPLATE = readFileSync("./web/chatPageTemplate.html").toString();

	public static AddMessage(message: string) : void {
		if (this.history.length === this.HISTORY_LENGTH) {
			this.history.splice(0, 1);
		}

		this.history.push(message);
		this.hasChanged = true;
	}

	public static GenerateForWeb() : string {
		if (this.hasChanged) {
			let lines = "";
			let flip = false;

			for (let i = 0; i < this.HISTORY_LENGTH; i++) {
				lines += `<div class="line line${flip ? 1 : 0}">${this.history[i] == null ? "<hidden>blank</hidden>" : this.history[i].replaceAll("<", "&lt;").replaceAll(">", "&gt;").replaceAll("\n", "<br>")}</div>`
				flip = !flip;
			}

			this.lastGeneratedPage = this.PAGE_TEMPLATE.toString().replace("|content|", lines);
			this.hasChanged = false;
		}
		
		return this.lastGeneratedPage;
	}
}