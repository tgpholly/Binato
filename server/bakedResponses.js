module.exports = function(s) {
	switch (s) {
		case "reconnect":
			return "\u0005\u0000\u0000\u0004\u0000\u0000\u0000����\u0018\u0000\u0000\u0011\u0000\u0000\u0000\u000b\u000fReconnecting...";

		default:
			return Buffer.alloc(0);
	}
}