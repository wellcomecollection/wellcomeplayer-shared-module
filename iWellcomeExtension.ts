
import IExtension = require("../coreplayer-shared-module/iExtension");

interface IWellcomeExtension extends IExtension{
	viewIndex(assetIndex: number, successCallback?: any): void;
	prefetchAsset(assetIndex: number, successCallback: any): void;
	authorise(assetIndex: number, successCallback: any, failureCallback: any): void;
	login(params: any): void;
	viewNextAvailableIndex(requestedIndex: number, callback: any): void;
	nextAvailableIndex(direction: number, requestedIndex: number): number;
	showLoginDialogue(params): void;
	isLoggedIn(): boolean;
	hasPermissionToViewCurrentItem(): boolean;
	isAuthorised(assetIndex): boolean;
	showRestrictedFileDialogue(params): void;
	getInadequatePermissionsMessage(assetIndex): string;
	allowCloseLogin(): boolean;
	updateSlidingExpiration(): void;
	closeActiveDialogue(): void;
	trackAction(category: string, action: string): void;
	getTrackActionLabel(): string;
	isSaveToLightboxEnabled(): boolean;
	isDownloadEnabled(): boolean;
}

export = IWellcomeExtension;