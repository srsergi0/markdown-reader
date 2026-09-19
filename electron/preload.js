const { contextBridge, ipcRenderer } = require("electron");

const REQUEST_CHANNELS = [
	"getInitialFile",
	"openFileDialog",
	"openFolderDialog",
	"getFileContent",
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
];

const EVENT_CHANNELS = ["initialFile", "fileChanged", "folderChanged"];

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
});
