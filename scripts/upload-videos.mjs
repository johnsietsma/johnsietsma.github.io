// Uploads videos in public/assets/video/ to the R2 bucket behind media.johnsietsma.com.
// Skips files already uploaded with the same size. Videos are gitignored; reference them as
// https://media.johnsietsma.com/video/<path>
//
// Usage: node scripts/upload-videos.mjs [--dry-run]

import { spawnSync } from "node:child_process";
import { readdirSync, statSync } from "node:fs";
import { extname, join, relative, sep } from "node:path";

const BUCKET = "johnsietsma-media";
const MEDIA_URL = "https://media.johnsietsma.com";
const LOCAL_DIR = "public/assets/video";
const CONTENT_TYPES = { ".mp4": "video/mp4", ".webm": "video/webm", ".mov": "video/quicktime" };

const dryRun = process.argv.includes("--dry-run");

function* walk(dir) {
	for (const entry of readdirSync(dir, { withFileTypes: true })) {
		const path = join(dir, entry.name);
		if (entry.isDirectory()) yield* walk(path);
		else if (CONTENT_TYPES[extname(entry.name).toLowerCase()]) yield path;
	}
}

async function remoteSize(url) {
	const res = await fetch(url, { method: "HEAD" });
	return res.ok ? Number(res.headers.get("content-length")) : null;
}

let uploaded = 0;
let skipped = 0;

for (const file of walk(LOCAL_DIR)) {
	const key = `video/${relative(LOCAL_DIR, file).split(sep).join("/")}`;
	const url = `${MEDIA_URL}/${key}`;
	const size = statSync(file).size;

	if ((await remoteSize(url)) === size) {
		skipped++;
		continue;
	}

	console.log(`${dryRun ? "Would upload" : "Uploading"} ${key} (${(size / 1e6).toFixed(1)} MB)`);
	if (!dryRun) {
		const result = spawnSync(
			"npx",
			[
				"wrangler", "r2", "object", "put", `${BUCKET}/${key}`,
				"--file", file,
				"--content-type", CONTENT_TYPES[extname(file).toLowerCase()],
				"--cache-control", "public, max-age=31536000",
				"--remote",
			],
			{ stdio: "inherit", shell: process.platform === "win32" },
		);
		if (result.status !== 0) process.exit(result.status ?? 1);
	}
	console.log(`  ${url}`);
	uploaded++;
}

console.log(`${uploaded} ${dryRun ? "to upload" : "uploaded"}, ${skipped} already up to date.`);
