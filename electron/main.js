const {
	app,
	BrowserWindow,
	Menu,
	ipcMain,
	dialog,
	shell,
} = require("electron");
const path = require("node:path");
const fs = require("node:fs");
const fsp = require("node:fs/promises");
const os = require("node:os");

const DEV_SERVER_URL = process.env.VITE_DEV_SERVER_URL || "http://localhost:5173";
const isDev = !app.isPackaged;

let mainWindow = null;
let pendingOpenPath = null;
let rendererReady = false;
let initialFileDelivered = false;

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

function extractMarkdownPath(argv) {
	const candidates = (argv || []).filter(
		(arg) =>
			typeof arg === "string" &&
			!arg.startsWith("-") &&
			/\.(md|markdown)$/i.test(arg),
	);
	for (const candidate of candidates) {
		try {
			if (fs.existsSync(candidate)) return path.resolve(candidate);
		} catch {
			// ignore
		}
	}
	return null;
}

function sendToRenderer(channel, payload) {
	if (mainWindow && !mainWindow.isDestroyed()) {
		mainWindow.webContents.send(channel, payload);
	}
}

class SearchIndexer {
	constructor() {
		this.cache = new Map();
		this.folderPath = null;
	}

	async indexFile(filePath, filename) {
		try {
			const content = await fsp.readFile(filePath, "utf8");
			const lines = content.split(/\r?\n/).map((line) => ({
				raw: line,
				lower: line.toLowerCase(),
			}));
			this.cache.set(filePath, { filename, lines });
		} catch {
			this.cache.delete(filePath);
		}
	}

	removeFile(filePath) {
		this.cache.delete(filePath);
	}

	clear() {
		this.cache.clear();
		this.folderPath = null;
	}

	async indexFolder(dir) {
		if (this.folderPath === dir && this.cache.size > 0) return;
		this.clear();
		this.folderPath = dir;

		const filesToProcess = [];
		const walk = async (currentDir) => {
			try {
				const items = await fsp.readdir(currentDir, { withFileTypes: true });
				for (const item of items) {
					const fullPath = path.join(currentDir, item.name);
					if (item.isDirectory()) {
						if (item.name !== "node_modules" && !item.name.startsWith(".")) {
							await walk(fullPath);
						}
					} else if (
						item.name.endsWith(".md") ||
						item.name.endsWith(".markdown")
					) {
						filesToProcess.push({ path: fullPath, name: item.name });
					}
				}
			} catch (err) {
				console.error("Walk error in indexFolder:", err);
			}
		};

		await walk(dir);

		const concurrency = 20;
		for (let i = 0; i < filesToProcess.length; i += concurrency) {
			const batch = filesToProcess.slice(i, i + concurrency);
			await Promise.all(batch.map((file) => this.indexFile(file.path, file.name)));
		}
	}

	search(query) {
		if (!query) return [];
		const lowerQ = query.toLowerCase();
		const results = [];
		for (const [filePath, fileData] of this.cache.entries()) {
			const lines = fileData.lines;
			for (let i = 0; i < lines.length; i++) {
				if (lines[i].lower.includes(lowerQ)) {
					results.push({
						path: filePath,
						filename: fileData.filename,
						line: i + 1,
						content: lines[i].raw.trim(),
					});
				}
			}
		}
		return results;
	}
}

const indexer = new SearchIndexer();

let currentWatcher = null;
let currentWatchedPath = null;
let currentFolderWatcher = null;
let currentWatchedFolder = null;
let folderRescanTimeout = null;

async function scanDir(dir) {
	const entries = [];
	try {
		const items = await fsp.readdir(dir, { withFileTypes: true });
		const sorted = items.sort((a, b) => {
			if (a.isDirectory() && !b.isDirectory()) return -1;
			if (!a.isDirectory() && b.isDirectory()) return 1;
			return a.name.localeCompare(b.name);
		});
		for (const item of sorted) {
			const fullPath = path.join(dir, item.name);
			if (item.isDirectory()) {
				if (item.name === "node_modules" || item.name.startsWith(".")) continue;
				const children = await scanDir(fullPath);
				entries.push({
					name: item.name,
					path: fullPath,
					isDirectory: true,
					children,
				});
			} else if (item.name.endsWith(".md") || item.name.endsWith(".markdown")) {
				entries.push({ name: item.name, path: fullPath, isDirectory: false });
			}
		}
	} catch {
		// ignore unreadable directories
	}
	return entries;
}

function stopFileWatcher() {
	if (currentWatcher) {
		currentWatcher.close();
		currentWatcher = null;
	}
	currentWatchedPath = null;
}

function stopFolderWatcher() {
	if (folderRescanTimeout) {
		clearTimeout(folderRescanTimeout);
		folderRescanTimeout = null;
	}
	if (currentFolderWatcher) {
		currentFolderWatcher.close();
		currentFolderWatcher = null;
	}
	currentWatchedFolder = null;
}

async function readMarkdownFile(filePath) {
	try {
		const content = await fsp.readFile(filePath, "utf8");
		return { path: filePath, content, filename: path.basename(filePath) };
	} catch (err) {
		console.error("Failed to read markdown file:", err);
		return null;
	}
}

function registerIpcHandlers() {
	ipcMain.handle("getInitialFile", async () => {
		rendererReady = true;
		if (initialFileDelivered) return null;
		const filePath = pendingOpenPath || extractMarkdownPath(process.argv);
		pendingOpenPath = null;
		if (!filePath) return null;
		initialFileDelivered = true;
		return readMarkdownFile(filePath);
	});

	ipcMain.handle("openFileDialog", async () => {
		const result = await dialog.showOpenDialog(mainWindow, {
			title: "Open Markdown File",
			properties: ["openFile"],
			filters: [
				{ name: "Markdown", extensions: ["md", "markdown"] },
				{ name: "All Files", extensions: ["*"] },
			],
		});
		if (result.canceled || result.filePaths.length === 0) return null;
		const filePath = result.filePaths[0];
		try {
			const content = await fsp.readFile(filePath, "utf8");
			return { content, path: filePath, filename: path.basename(filePath) };
		} catch {
			return null;
		}
	});

	ipcMain.handle("openFolderDialog", async () => {
		const result = await dialog.showOpenDialog(mainWindow, {
			properties: ["openDirectory"],
		});
		if (result.canceled || result.filePaths.length === 0) return null;
		return result.filePaths;
	});

	ipcMain.handle("getFileContent", async (_event, { path: filePath }) => {
		const content = await fsp.readFile(filePath, "utf8");
		return { content, filename: path.basename(filePath) };
	});

	ipcMain.handle("getPathInfo", async (_event, { path: targetPath }) => {
		try {
			const stat = await fsp.stat(targetPath);
			return {
				exists: true,
				isDirectory: stat.isDirectory(),
				isFile: stat.isFile(),
			};
		} catch {
			return { exists: false, isDirectory: false, isFile: false };
		}
	});

	ipcMain.handle("resolvePath", async (_event, { basePath, relativePath }) => {
		return path.resolve(path.dirname(basePath), relativePath);
	});

	ipcMain.handle("startWatching", async (_event, { path: filePath }) => {
		if (currentWatchedPath === filePath && currentWatcher) return {};
		stopFileWatcher();
		currentWatchedPath = filePath;
		try {
			currentWatcher = fs.watch(filePath, () => {
				void (async () => {
					try {
						const content = await fsp.readFile(filePath, "utf8");
						indexer.indexFile(filePath, path.basename(filePath));
						sendToRenderer("fileChanged", { path: filePath, content });
					} catch {
						// file might be temporarily unreadable
					}
				})();
			});
		} catch (err) {
			console.error("Failed to watch file:", err);
		}
		return {};
	});

	ipcMain.handle("stopWatching", async () => {
		stopFileWatcher();
		return {};
	});

	ipcMain.handle("saveFile", async (_event, { path: filePath, content }) => {
		stopFileWatcher();
		await fsp.writeFile(filePath, content, "utf8");
		indexer.indexFile(filePath, path.basename(filePath));
		return {};
	});

	ipcMain.handle("readFolder", async (_event, { path: folderPath }) => {
		indexer.indexFolder(folderPath).catch((err) => console.error("Index error:", err));
		return scanDir(folderPath);
	});

	ipcMain.handle("startWatchingFolder", async (_event, { path: folderPath }) => {
		indexer.indexFolder(folderPath).catch((err) => console.error("Index error:", err));
		if (currentFolderWatcher && currentWatchedFolder === folderPath) return {};
		stopFolderWatcher();
		currentWatchedFolder = folderPath;

		const rescan = () => {
			if (folderRescanTimeout) clearTimeout(folderRescanTimeout);
			folderRescanTimeout = setTimeout(async () => {
				try {
					const files = await scanDir(folderPath);
					sendToRenderer("folderChanged", { files });
				} catch {
					// ignore
				}
			}, 400);
		};

		try {
			currentFolderWatcher = fs.watch(
				folderPath,
				{ recursive: true },
				(_eventType, filename) => {
					if (!filename) return;
					const fullPath = path.join(folderPath, filename);
					const name = filename.toLowerCase();
					if (name.endsWith(".md") || name.endsWith(".markdown")) {
						indexer.indexFile(fullPath, path.basename(filename));
						rescan();
					} else if (_eventType === "rename") {
						rescan();
					}
				},
			);
		} catch (err) {
			console.error("Failed to watch folder:", err);
		}
		return {};
	});

	ipcMain.handle("stopWatchingFolder", async () => {
		stopFolderWatcher();
		return {};
	});

	ipcMain.handle("searchInFolder", async (_event, { query }) => {
		return indexer.search(query);
	});

	ipcMain.handle("savePdf", async (_event, { html, filename }) => {
		const pdfName = filename.replace(/\.(md|markdown)$/i, "") + ".pdf";
		const htmlPath = path.join(os.tmpdir(), `md-print-${Date.now()}.html`);
		const pdfPath = path.join(os.tmpdir(), pdfName);
		let printWindow = null;
		try {
			await fsp.writeFile(htmlPath, html, "utf8");
			printWindow = new BrowserWindow({
				show: false,
				webPreferences: { sandbox: true },
			});
			await printWindow.loadFile(htmlPath);
			const data = await printWindow.webContents.printToPDF({
				printBackground: true,
				preferCSSPageSize: true,
			});
			await fsp.writeFile(pdfPath, data);
			await shell.openPath(pdfPath);
			return { path: pdfPath };
		} catch (err) {
			console.error("Failed to generate PDF:", err);
			return null;
		} finally {
			if (printWindow) printWindow.destroy();
			fsp.unlink(htmlPath).catch(() => {});
		}
	});

	ipcMain.handle("saveHtml", async (_event, { html, filename }) => {
		try {
			const htmlName = filename.replace(/\.(md|markdown)$/i, "") + ".html";
			const htmlPath = path.join(os.tmpdir(), htmlName);
			await fsp.writeFile(htmlPath, html, "utf8");
			await shell.openPath(htmlPath);
			return { path: htmlPath };
		} catch (err) {
			console.error("Failed to save HTML:", err);
			return null;
		}
	});

	ipcMain.handle("openExternalUrl", async (_event, { url }) => {
		try {
			await shell.openExternal(url);
			return { success: true };
		} catch (err) {
			console.error("Failed to open external URL:", err);
			return { success: false };
		}
	});

	ipcMain.handle("update:check", async () => {
		if (!autoUpdater) return { supported: false };
		try {
			const result = await autoUpdater.checkForUpdates();
			return { supported: true, version: result?.updateInfo?.version || null };
		} catch (err) {
			console.error("Update check failed:", err);
			sendToRenderer("update:status", {
				state: "error",
				message: err?.message || String(err),
			});
			return { supported: true };
		}
	});

	ipcMain.handle("update:download", async () => {
		if (!autoUpdater) return { supported: false };
		try {
			await autoUpdater.downloadUpdate();
			return { supported: true };
		} catch (err) {
			console.error("Update download failed:", err);
			sendToRenderer("update:status", {
				state: "error",
				message: err?.message || String(err),
			});
			return { supported: true };
		}
	});

	ipcMain.handle("update:install", async () => {
		if (!autoUpdater) return { supported: false };
		setImmediate(() => {
			try {
				autoUpdater.quitAndInstall();
			} catch (err) {
				console.error("Update install failed:", err);
			}
		});
		return { supported: true };
	});
}

let autoUpdater = null;

function initAutoUpdater() {
	if (!app.isPackaged) {
		console.log("Auto-update disabled in development.");
		return;
	}
	try {
		({ autoUpdater } = require("electron-updater"));
	} catch (err) {
		console.error("electron-updater is not available:", err);
		return;
	}

	autoUpdater.autoDownload = false;
	autoUpdater.autoInstallOnAppQuit = true;

	autoUpdater.on("checking-for-update", () => {
		sendToRenderer("update:status", { state: "checking" });
	});
	autoUpdater.on("update-available", (info) => {
		sendToRenderer("update:status", {
			state: "available",
			version: info.version,
			releaseNotes: typeof info.releaseNotes === "string" ? info.releaseNotes : null,
			releaseDate: info.releaseDate || null,
		});
	});
	autoUpdater.on("update-not-available", (info) => {
		sendToRenderer("update:status", {
			state: "not-available",
			version: info?.version || null,
		});
	});
	autoUpdater.on("download-progress", (progress) => {
		sendToRenderer("update:status", {
			state: "downloading",
			percent: progress.percent,
			transferred: progress.transferred,
			total: progress.total,
			bytesPerSecond: progress.bytesPerSecond,
		});
	});
	autoUpdater.on("update-downloaded", (info) => {
		sendToRenderer("update:status", {
			state: "downloaded",
			version: info.version,
		});
	});
	autoUpdater.on("error", (err) => {
		sendToRenderer("update:status", {
			state: "error",
			message: err?.message || String(err),
		});
	});
}

async function loadMainView() {
	if (isDev) {
		for (let attempt = 0; attempt < 60; attempt++) {
			try {
				await mainWindow.loadURL(DEV_SERVER_URL);
				console.log(`HMR enabled: Using Vite dev server at ${DEV_SERVER_URL}`);
				return;
			} catch {
				await sleep(500);
			}
		}
		console.warn("Dev server not reachable, falling back to bundled assets.");
	}
	await mainWindow.loadFile(path.join(__dirname, "..", "dist", "index.html"));
}

function createWindow() {
	mainWindow = new BrowserWindow({
		width: 1000,
		height: 750,
		minWidth: 380,
		minHeight: 360,
		title: "Markdown Reader",
		backgroundColor: "#1e1e1e",
		show: false,
		webPreferences: {
			preload: path.join(__dirname, "preload.js"),
			contextIsolation: true,
			nodeIntegration: false,
		},
	});

	mainWindow.once("ready-to-show", () => mainWindow.show());

	mainWindow.on("closed", () => {
		mainWindow = null;
	});

	void loadMainView();
}

const gotSingleInstanceLock = app.requestSingleInstanceLock();

if (!gotSingleInstanceLock) {
	app.quit();
} else {
	app.on("second-instance", async (_event, argv) => {
		const filePath = extractMarkdownPath(argv);
		if (mainWindow) {
			if (mainWindow.isMinimized()) mainWindow.restore();
			mainWindow.focus();
			if (filePath) {
				if (rendererReady) {
					try {
						const content = await fsp.readFile(filePath, "utf8");
						sendToRenderer("initialFile", {
							path: filePath,
							content,
							filename: path.basename(filePath),
						});
					} catch (err) {
						console.error("Failed to read file from second instance:", err);
					}
				} else {
					pendingOpenPath = filePath;
				}
			}
		}
	});

	app.on("open-file", (event, filePath) => {
		event.preventDefault();
		if (mainWindow && rendererReady) {
			fs.promises
				.readFile(filePath, "utf8")
				.then((content) =>
					sendToRenderer("initialFile", {
						path: filePath,
						content,
						filename: path.basename(filePath),
					}),
				)
				.catch((err) => console.error("Failed to read opened file:", err));
		} else {
			pendingOpenPath = filePath;
		}
	});

	app.whenReady().then(() => {
		if (process.platform !== "darwin") {
			Menu.setApplicationMenu(null);
		}
		registerIpcHandlers();
		initAutoUpdater();
		createWindow();

		app.on("activate", () => {
			if (BrowserWindow.getAllWindows().length === 0) createWindow();
		});
	});

	app.on("window-all-closed", () => {
		if (process.platform !== "darwin") app.quit();
	});
}
