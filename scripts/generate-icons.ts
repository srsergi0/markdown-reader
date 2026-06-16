import { mkdir } from "fs/promises";
import { join } from "path";

const srcPath = "src/assets/icon.png";
const outDir = "src/assets/icon.iconset";

console.log(`Generating icons from ${srcPath}...`);

// Ensure output directory exists
await mkdir(outDir, { recursive: true });

// Required macOS iconset sizes and suffixes
const sizes = [
	{ name: "16x16", size: 16 },
	{ name: "16x16@2x", size: 32 },
	{ name: "32x32", size: 32 },
	{ name: "32x32@2x", size: 64 },
	{ name: "128x128", size: 128 },
	{ name: "128x128@2x", size: 256 },
	{ name: "256x256", size: 256 },
	{ name: "256x256@2x", size: 512 },
	{ name: "512x512", size: 512 },
	{ name: "512x512@2x", size: 1024 },
];

const imgFile = Bun.file(srcPath);

if (!await imgFile.exists()) {
	console.error(`Error: Source icon file not found at ${srcPath}`);
	process.exit(1);
}

for (const { name, size } of sizes) {
	const destPath = join(outDir, `icon_${name}.png`);
	console.log(`Writing ${destPath} (${size}x${size})...`);
	await imgFile.image().resize(size, size).png().write(destPath);
}

console.log("All icons generated successfully!");
