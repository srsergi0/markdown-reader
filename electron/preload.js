const { contextBridge, ipcRenderer, webUtils } = require("electron");

const REQUEST_CHANNELS = [
	"getInitialFile",
	"openFileDialog",
	"openFolderDialog",
	"getFileContent",
	"getPathInfo",
	"resolvePath",
	"startWatching",
	"stopWatching",
	"saveFile",
	"readFolder",
	"savePdf",
	"startWatchingFolder",
	"stopWatchingFolder",
	"searchInFolder",
	"saveHtml",
	"openExternalUrl",
	"update:check",
	"update:download",
	"update:install",
];

const EVENT_CHANNELS = [
	"initialFile",
	"fileChanged",
	"folderChanged",
	"update:status",
];

contextBridge.exposeInMainWorld("markdownReader", {
	invoke: (channel, params) => {
		if (!REQUEST_CHANNELS.includes(channel)) {
			return Promise.reject(new Error(`Unknown IPC channel: ${channel}`));
		}
		return ipcRenderer.invoke(channel, params);
	},
	on: (channel, listener) => {
		if (!EVENT_CHANNELS.includes(channel)) {
			throw new Error(`Unknown event channel: ${channel}`);
		}
		const wrapped = (_event, payload) => listener(payload);
		ipcRenderer.on(channel, wrapped);
		return () => ipcRenderer.removeListener(channel, wrapped);
	},
	getPathForFile: (file) => {
		try {
			return webUtils.getPathForFile(file);
		} catch {
			return "";
		}
	},
});
