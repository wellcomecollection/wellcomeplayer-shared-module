
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
	trackEvent(category: string, action: string, label: string, value: string): void;
	trackVariable(slot: number, name: string, value: string, scope: number): void;
	isSaveToLightboxEnabled(): boolean;
	isDownloadEnabled(): boolean;

	$loginDialogue: JQuery;
	$embedDialogue: JQuery;
	$downloadDialogue: JQuery;
	$helpDialogue: JQuery;
	$conditionsDialogue: JQuery;
	$restrictedFileDialogue: JQuery;
}

export = IWellcomeExtension;