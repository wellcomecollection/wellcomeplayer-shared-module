
import IExtension = require("../coreplayer-shared-module/iExtension");

interface IWellcomeExtension extends IExtension{
	$conditionsDialogue: JQuery;
	$downloadDialogue: JQuery;
	$embedDialogue: JQuery;
	$helpDialogue: JQuery;
	$loginDialogue: JQuery;
	$restrictedFileDialogue: JQuery;

	allowCloseLogin(): boolean;
	authorise(canvasIndex: number, successCallback: any, failureCallback: any): void;
	closeActiveDialogue(): void;
	getInadequatePermissionsMessage(canvasIndex): string;
	hasPermissionToViewCurrentItem(): boolean;
	isAuthorised(canvasIndex): boolean;
	isDownloadEnabled(): boolean;
	isGuest(): boolean;
	isLoggedIn(): boolean;
    isEmbedEnabled(): boolean;
	isSaveToLightboxEnabled(): boolean;
	login(params: any): void;
	nextAvailableIndex(direction: number, requestedIndex: number): number;
	prefetchAsset(canvasIndex: number, successCallback: any): void;
	showLoginDialogue(params): void;
	showRestrictedFileDialogue(params): void;
	trackEvent(category: string, action: string, label: string, value: string): void;
	trackVariable(slot: number, name: string, value: string, scope: number): void;
	updateSlidingExpiration(): void;
	viewIndex(canvasIndex: number, successCallback?: any): void;
	viewNextAvailableIndex(requestedIndex: number, callback: any): void;
}

export = IWellcomeExtension;