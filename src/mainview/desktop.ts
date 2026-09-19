import type { FileEntry } from "../shared/types";

type DesktopBridge = {
	invoke: (channel: string, params?: unknown) => Promise<any>;
	on: (channel: string, listener: (payload: any) => void) => () => void;
	getPathForFile?: (file: File) => string;
};

declare global {
	interface Window {
		markdownReader?: DesktopBridge;
	}
}

const bridge: DesktopBridge = window.markdownReader ?? {
	invoke: async () => {
		throw new Error("Desktop bridge unavailable (running outside Electron).");
	},
	on: () => () => {},
	getPathForFile: () => "",
};

export type SearchResult = {
	path: string;
	filename: string;
	line: number;
	content: string;
};

export type UpdateStatus =
	| { state: "checking" }
	| {
			state: "available";
			version: string;
			releaseNotes: string | null;
			releaseDate: string | null;
	  }
	| { state: "not-available"; version: string | null }
	| {
			state: "downloading";
			percent: number;
			transferred: number;
			total: number;
			bytesPerSecond: number;
	  }
	| { state: "downloaded"; version: string }
	| { state: "error"; message: string };

export const desktop = {
	proxy: {
		request: {
			getInitialFile: (): Promise<{
				content: string;
				path: string;
				filename: string;
			} | null> => bridge.invoke("getInitialFile"),
			openFileDialog: (
				_params: Record<string, never> = {},
			): Promise<{ content: string; path: string; filename: string } | null> =>
				bridge.invoke("openFileDialog"),
			openFolderDialog: (
				_params: Record<string, never> = {},
			): Promise<string[] | null> => bridge.invoke("openFolderDialog"),
			getFileContent: (params: {
				path: string;
			}): Promise<{ content: string; filename: string }> =>
				bridge.invoke("getFileContent", params),
			getPathInfo: (params: {
				path: string;
			}): Promise<{ exists: boolean; isDirectory: boolean; isFile: boolean }> =>
				bridge.invoke("getPathInfo", params),
			resolvePath: (params: {
				basePath: string;
				relativePath: string;
			}): Promise<string> => bridge.invoke("resolvePath", params),
			startWatching: (_params: {
				path: string;
			}): Promise<Record<string, never>> => bridge.invoke("startWatching", _params),
			stopWatching: (
				_params: Record<string, never> = {},
			): Promise<Record<string, never>> => bridge.invoke("stopWatching"),
			saveFile: (params: {
				path: string;
				content: string;
			}): Promise<Record<string, never>> => bridge.invoke("saveFile", params),
			readFolder: (params: { path: string }): Promise<FileEntry[]> =>
				bridge.invoke("readFolder", params),
			savePdf: (params: {
				html: string;
				filename: string;
			}): Promise<{ path: string } | null> => bridge.invoke("savePdf", params),
			startWatchingFolder: (params: {
				path: string;
			}): Promise<Record<string, never>> =>
				bridge.invoke("startWatchingFolder", params),
			stopWatchingFolder: (
				_params: Record<string, never> = {},
			): Promise<Record<string, never>> => bridge.invoke("stopWatchingFolder"),
			searchInFolder: (params: {
				path: string;
				query: string;
			}): Promise<SearchResult[]> => bridge.invoke("searchInFolder", params),
			saveHtml: (params: {
				html: string;
				filename: string;
			}): Promise<{ path: string } | null> => bridge.invoke("saveHtml", params),
			openExternalUrl: (params: {
				url: string;
			}): Promise<{ success: boolean }> =>
				bridge.invoke("openExternalUrl", params),
			checkForUpdates: (): Promise<{
				supported: boolean;
				version?: string | null;
			}> => bridge.invoke("update:check"),
			downloadUpdate: (): Promise<{ supported: boolean }> =>
				bridge.invoke("update:download"),
			installUpdate: (): Promise<{ supported: boolean }> =>
				bridge.invoke("update:install"),
		},
	},
	on: (
		channel: "initialFile" | "fileChanged" | "folderChanged" | "update:status",
		listener: (payload: any) => void,
	) => bridge.on(channel, listener),
	getPathForFile: (file: File): string => bridge.getPathForFile?.(file) ?? "",
};
