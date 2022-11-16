// Taken from https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Regular_Expressions
function escapeRegExp(string:string) {
	return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

export function replaceAll(inputString:string, toReplace:string, toReplaceWith:string) {
	return inputString.replace(`/:${escapeRegExp(toReplace)}:/g`, toReplaceWith);
}