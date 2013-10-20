
import IExtension = require("../coreplayer-shared-module/iExtension");
import IWellcomeExtension = require("./iWellcomeExtension");
import IProvider = require("../coreplayer-shared-module/iProvider");
import IWellcomeProvider = require("./iWellcomeProvider");
import restrictedFile = require("../wellcomeplayer-dialogues-module/restrictedFileDialogue");
import login = require("../wellcomeplayer-dialogues-module/loginDialogue");
import baseExtension = require("../coreplayer-shared-module/baseExtension");

class Behaviours {
	
	sessionTimer: any;

	constructor(public extension: IWellcomeExtension){

	}

	isSaveToLightboxEnabled(): boolean {

        if (this.extension.provider.config.options.saveToLightboxEnabled === false) return false;
        if (!this.extension.provider.isHomeDomain) return false;
        if (!this.extension.provider.isOnlyInstance) return false;

        return true;
    }

    isDownloadEnabled(): boolean {

        // download enabled?
        switch (this.extension.provider.type) {
            case "book":
                if (this.extension.provider.config.options.bookDownloadEnabled === false) {
                    return false;
                }
                break;
            case "video":
                if (this.extension.provider.config.options.videoDownloadEnabled === false) {
                    return false;
                }
                break;
            case "audio":
                if (this.extension.provider.config.options.audioDownloadEnabled === false) {
                    return false;
                }
                break;
        }

        // download available?
        if (!this.extension.provider.assetSequence.extensions.permittedOperations.length) {
            return false;
        }

        return true;
    }

    getTrackActionLabel(): string {
        return      "bNumber: " + this.extension.provider.pkg.identifier 
                + ", type: " + this.extension.provider.type 
                + ", assetSequenceIndex: " + this.extension.provider.assetSequenceIndex
                + ", asset: " + this.extension.currentAssetIndex 
                + ", isLoggedIn: " + this.isLoggedIn() 
                + ", isHomeDomain: " + this.extension.provider.isHomeDomain 
                + ", uri: " + window.parent.location;
    }

    trackAction(category: string, action: string): void{
    	var label = this.getTrackActionLabel();

        //log(category, action, label);

        // update sliding session expiration.
        this.updateSlidingExpiration();

        try {
            trackEvent(category, action, label);
        } catch (e) {
            // do nothing
        }
    }

    updateSlidingExpiration(): void {

        // not necessary if content is all open.
        if (this.extension.provider.pkg.extensions.isAllOpen) return;

        // some (or all) of the content requires login.
        // if the user has a session, update the sliding expiration.
        if (!this.isLoggedIn()) return;

        var that = this;

        // get ttl.
        $.ajax({
            url: '/service/ttl',
            type: 'GET',
            success: (time) => {
                time = parseInt(time);

                // don't create a session timer if the session has expired.
                if (time == -1) return;

                var ms = time * 1000;

                if (that.sessionTimer) {
                    clearTimeout(that.sessionTimer);
                }

                that.sessionTimer = setTimeout(function () {
                    that.extension.closeActiveDialogue();
                    that.extension.showDialogue(that.extension.provider.config.modules.genericDialogue.content.sessionExpired, () => {
                        that.extension.refresh();
                    }, that.extension.provider.config.modules.genericDialogue.content.refresh, false);
                }, ms);
            }
        });
    }

    allowCloseLogin(): boolean {

        // if there's only one asset in the package, you must login to see anything,
        // so don't allow it to be closed.
        // necessary for video/audio which have no ui to trigger
        // new login event.
        return this.extension.provider.assetSequence.assets.length != 1;
    }

    getInadequatePermissionsMessage(assetIndex): string {

        var section = this.extension.getSectionByAssetIndex(assetIndex);

        switch (section.extensions.accessCondition.toLowerCase()) {
            case 'requires registration':
                return this.extension.provider.config.modules.loginDialogue.requiresRegistrationPermissionsMessage;
            case 'clinical images':
                return this.extension.provider.config.modules.loginDialogue.clinicalImagesPermissionsMessage;
            case 'restricted files':
                return this.extension.provider.config.modules.loginDialogue.restrictedFilesPermissionsMessage;
            case 'closed':
                return this.extension.provider.config.modules.loginDialogue.closedPermissionsMessage;
        }

        return this.extension.provider.config.modules.loginDialogue.inadequatePermissionsMessage;
    }

    showRestrictedFileDialogue(params): void {
        $.publish(restrictedFile.RestrictedFileDialogue.SHOW_RESTRICTED_FILE_DIALOGUE, [params]);
    }

    isAuthorised(assetIndex): boolean {

        var section = this.extension.getSectionByAssetIndex(assetIndex);

        if (section.extensions.authStatus.toLowerCase() == "allowed") {
            return true;
        }

        return false;
    }

    hasPermissionToViewCurrentItem(): boolean{
        return this.isAuthorised(this.extension.currentAssetIndex);
    }

    isLoggedIn(): boolean {
        return document.cookie.indexOf("wlauth") >= 0;
    }

    showLoginDialogue(params): void {
        // this needs to be postponed otherwise
        // it will trigger before the login event
        // handler is registered.
        setTimeout(() => {
            $.publish(login.LoginDialogue.SHOW_LOGIN_DIALOGUE, [params]);
        }, 1);
    }

    // pass direction as 1 or -1.
    nextAvailableIndex(direction: number, requestedIndex: number) {

        for (var i = requestedIndex; i < this.extension.provider.assetSequence.assets.length && i >= 0; i += direction) {
            if (i == requestedIndex) continue;
            if (this.isAuthorised(i)) {
                return i;
            }
        }

        return null;
    }

    viewNextAvailableIndex(requestedIndex: number, callback: any): void {

        var nextAvailableIndex;

        if (requestedIndex < this.extension.currentAssetIndex) {
            nextAvailableIndex = this.nextAvailableIndex(-1, requestedIndex);
        } else {
            nextAvailableIndex = this.nextAvailableIndex(1, requestedIndex);
        }

        if (nextAvailableIndex) {
            callback(nextAvailableIndex);
        } else {
            this.extension.showDialogue(this.extension.provider.config.modules.genericDialogue.content.noRemainingVisibleItems);
        }
    }

    login(params: any) {
        var ajaxOptions = {
            url: this.extension.provider.getLoginUri(params.username, params.password),
            type: "GET",
            dataType: "json",
            xhrFields: { withCredentials: true },
            // success callback
            success: (result: any) => {
                
                $.publish(login.LoginDialogue.HIDE_LOGIN_DIALOGUE);

                if (result.Message.toLowerCase() == "success") {
                    this.extension.triggerSocket(login.LoginDialogue.LOGIN, result.DisplayNameBase64);
                    params.successCallback(true);
                } else {
                    params.failureCallback(result.Message, true);
                }
            },
            // error callback
            error: (result: any) => {
                 $.publish(login.LoginDialogue.HIDE_LOGIN_DIALOGUE);

                params.failureCallback(this.extension.provider.config.modules.genericDialogue.content.error, true);
            }
        };

        $.ajax(ajaxOptions);
    }

    authorise(assetIndex: number, successCallback: any, failureCallback: any): void {

        var section = this.extension.getSectionByAssetIndex(assetIndex);

        switch (section.extensions.authStatus.toLowerCase()) {
            case 'allowed':
                successCallback(false);
                break;
            case 'denied':
                if (this.isLoggedIn()) { // inadequate permissions
                    // if it's a restricted file, there are no login
                    // credentials to view it, so show restricted file dialogue.
                    if (section.extensions.accessCondition.toLowerCase() === "restricted files") {
                        this.showRestrictedFileDialogue({
                            requestedIndex: assetIndex,
                            allowClose: this.allowCloseLogin()
                        });
                    } else {
                        this.showLoginDialogue({
                            successCallback: successCallback,
                            failureCallback: failureCallback,
                            inadequatePermissions: true,
                            requestedIndex: assetIndex,
                            allowClose: this.allowCloseLogin(),
                            message: this.getInadequatePermissionsMessage(assetIndex)
                        });
                    }
                } else {
                    this.showLoginDialogue({
                        successCallback: successCallback,
                        failureCallback: failureCallback,
                        requestedIndex: assetIndex,
                        allowClose: this.allowCloseLogin()
                    });
                }
                break;
            case 'expired':
                this.showLoginDialogue({
                    successCallback: successCallback,
                    failureCallback: failureCallback,
                    message: this.extension.provider.config.modules.loginDialogue.loginExpiredMessage,
                    requestedIndex: assetIndex,
                    allowClose: this.allowCloseLogin()
                });
                break;
            case 'notacceptedtermsyet':
                this.extension.showDialogue(this.extension.provider.config.modules.genericDialogue.content.notAcceptedTermsYetMessage);
                break;
        }
    }

    // ensures that a file is in the server cache.
    prefetchAsset(assetIndex: number, successCallback: any): void{
        var asset = this.extension.getAssetByIndex(assetIndex);

        var prefetchUri = this.extension.provider.getPrefetchUri(asset);

        $.getJSON(prefetchUri, function (result) {
            if (result.Success) {
                successCallback(asset.fileUri);
            } else {
                console.log(result.Message);
            }
        });
    }

    viewIndex(assetIndex: number, successCallback?: any): void {
        // authorise.
        this.authorise(assetIndex,
            // success callback
            (reload: boolean) => {
                if (reload) {
                    // reload the package.
                    this.extension.provider.reload(() => {
                        $.publish(baseExtension.BaseExtension.RELOAD);
                        this.viewIndex(assetIndex, successCallback);
                    });
                } else {
                    
                    this.extension.currentAssetIndex = assetIndex;
                    $.publish(baseExtension.BaseExtension.ASSET_INDEX_CHANGED, [assetIndex]);

                    if (successCallback) {
                        successCallback(assetIndex);
                    }
                }
            },
            // failure callback.
            (message: string, retry: boolean) => {
                this.extension.showDialogue(message, () => {
                    if (retry) {
                        this.viewIndex(assetIndex, successCallback);
                    }
                });
            }
        );
    }
}

export = Behaviours;