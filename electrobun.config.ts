import type { ElectrobunConfig } from "electrobun";

export default {
	app: {
		name: "Markdown Reader",
		identifier: "markdownreader.electrobun.dev",
		version: "1.0.0",
	},
	build: {
		copy: {
			"dist/index.html": "views/mainview/index.html",
			"dist/assets": "views/mainview/assets",
		},
		watchIgnore: ["dist/**"],
		mac: {
			bundleCEF: false,
			icons: "src/assets/icon.iconset",
		},
		linux: {
			bundleCEF: false,
		},
		win: {
			bundleCEF: false,
			icon: "src/assets/icon.ico",
		},
	},
} satisfies ElectrobunConfig;
