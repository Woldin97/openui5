import { readFileSync } from "node:fs";
import { resolve } from "node:path";

// cache the content of each file to avoid opening the same file multiple times
let mContent = {};

export function getContent(sFilePath) {
	const sFileName = resolve(sFilePath);
	if (mContent[sFileName]) {
		return mContent[sFileName];
	}

	mContent[sFileName] = JSON.parse(readFileSync(sFilePath, "utf8"));
	return mContent[sFileName];
};
export function clearCache() {
	mContent = {};
};
