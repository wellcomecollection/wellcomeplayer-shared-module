
import IExtension = require("../coreplayer-shared-module/iExtension");
import IWellcomeExtension = require("./iWellcomeExtension");
import IProvider = require("../coreplayer-shared-module/iProvider");
import IWellcomeProvider = require("./iWellcomeProvider");
import restrictedFile = require("../wellcomeplayer-dialogues-module/restrictedFileDialogue");
import login = require("../wellcomeplayer-dialogues-module/loginDialogue");
import baseExtension = require("../coreplayer-shared-module/baseExtension");
import baseFooter = require("../coreplayer-shared-module/footerPanel");
import footer = require("../wellcomeplayer-extendedfooterpanel-module/footerPanel");
import help = require("../coreplayer-dialogues-module/helpDialogue");
import conditions = require("../wellcomeplayer-dialogues-module/conditionsDialogue");
import baseLeft = require("../coreplayer-shared-module/leftPanel");
import left = require("../coreplayer-treeviewleftpanel-module/treeViewLeftPanel");
import baseRight = require("../coreplayer-shared-module/rightPanel");
import coreMediaElementExtension = require("../../extensions/coreplayer-mediaelement-extension/extension");
import download = require("../wellcomeplayer-dialogues-module/downloadDialogue");

class Behaviours {

	sessionTimer: any;

    static TRACK_EVENT: string = 'onTrackEvent';
    static TRACK_VARIABLE: string = 'onTrackVariable';

	constructor(public extension: IWellcomeExtension){

        // track events
        $.subscribe(baseExtension.BaseExtension.CREATED, () => {

            this.trackEvent('Items', 'Viewed', '');

            if (!this.extension.provider.isHomeDomain){
                this.trackVariable(2, 'Embedded', this.extension.provider.domain, 2);
            }

            this.extension.$loginDialogue.find('.close').on('click', () => {
                this.trackEvent('Player Interactions', 'Log in', 'Closed');
            });

            this.extension.$embedDialogue.find('.close').on('click', () => {
                this.trackEvent('Player Interactions', 'Embed', 'Closed');
            });

            this.extension.$downloadDialogue.find('.close').on('click', () => {
                this.trackEvent('Player Interactions', 'Download', 'Closed');
            });

            this.extension.$helpDialogue.find('.close').on('click', () => {
                this.trackEvent('Player Interactions', 'Help', 'Closed');
            });

            this.extension.$conditionsDialogue.find('.close').on('click', () => {
                this.trackEvent('Player Interactions', 'Conditions', 'Closed');
            });

            if (this.extension.$restrictedFileDialogue){
                this.extension.$restrictedFileDialogue.find('.close').on('click', () => {
                    this.trackEvent('Player Interactions', 'Restricted File', 'Closed');
                });
            }

            var seeAlso = this.extension.provider.getSeeAlso();

            if (seeAlso && this.extension.isSeeAlsoEnabled()){
                $.publish(baseExtension.BaseExtension.SHOW_MESSAGE, [seeAlso.markup]);
            }
        });

        $.subscribe(login.LoginDialogue.SHOW_LOGIN_DIALOGUE, () => {
            this.trackEvent('Player Interactions', 'Log in', 'Opened');
        });

        $.subscribe(help.HelpDialogue.SHOW_HELP_DIALOGUE, () => {
            this.trackEvent('Player Interactions', 'Help', 'Opened', '');
        });

        $.subscribe(conditions.ConditionsDialogue.SHOW_CONDITIONS_DIALOGUE, () => {
            this.trackEvent('Player Interactions', 'Conditions', 'Opened', '');
        });

        $.subscribe(footer.FooterPanel.DOWNLOAD, () => {
            this.trackEvent('Player Interactions', 'Download', 'Opened', '');
        });

        $.subscribe(download.DownloadDialogue.PREVIEW, (e, type) => {

            switch (type){
                case "currentViewAsJpg":
                    this.trackEvent('Files', 'Previewed - Current View');
                    break;
                case "wholeImageHighResAsJpg":
                    this.trackEvent('Files', 'Previewed - Whole Image High Res');
                    break;
                case "wholeImageLowResAsJpg":
                    this.trackEvent('Files', 'Previewed - Whole Image Low Res');
                    break;
                case "entireDocumentAsPdf":
                    this.trackEvent('Files', 'Previewed - Entire Document As PDF');
                    break;
            }
        });

        $.subscribe(download.DownloadDialogue.DOWNLOAD, (e, type) => {

            switch (type){
                case "currentViewAsJpg":
                    this.trackEvent('Files', 'Downloaded - Current View');
                    break;
                case "wholeImageHighResAsJpg":
                    this.trackEvent('Files', 'Downloaded - Whole Image High Res');
                    break;
                case "wholeImageLowResAsJpg":
                    this.trackEvent('Files', 'Downloaded - Whole Image Low Res');
                    break;
                case "entireDocumentAsPdf":
                    this.trackEvent('Files', 'Downloaded - Entire Document As PDF');
                    break;
            }
        });

        $.subscribe(footer.FooterPanel.SAVE, () => {
            this.trackEvent('Player Interactions', 'Save to Lightbox', 'Opened', '');
        });

        $.subscribe(baseFooter.FooterPanel.EMBED, () => {
            this.trackEvent('Player Interactions', 'Embed', 'Opened', '');
        });

        $.subscribe(baseExtension.BaseExtension.TOGGLE_FULLSCREEN, () => {
            if (this.extension.isFullScreen) {
                this.trackEvent('Player Interactions', 'Full Screen', 'Exit');
            } else {
                this.trackEvent('Player Interactions', 'Full Screen', 'Enter');
            }
        });

        $.subscribe(baseLeft.LeftPanel.OPEN_LEFT_PANEL, () => {
            this.trackEvent('Player Interactions', 'Left Panel', 'Opened');
        });

        $.subscribe(baseLeft.LeftPanel.CLOSE_LEFT_PANEL, () => {
            this.trackEvent('Player Interactions', 'Left Panel', 'Closed');
        });

        $.subscribe(left.TreeViewLeftPanel.OPEN_TREE_VIEW, () => {
            this.trackEvent('Player Interactions', 'Tree', 'Opened');
        });

        $.subscribe(left.TreeViewLeftPanel.OPEN_THUMBS_VIEW, () => {
            this.trackEvent('Player Interactions', 'Thumbs', 'Opened');
        });

        $.subscribe(baseRight.RightPanel.OPEN_RIGHT_PANEL, () => {
            this.trackEvent('Player Interactions', 'Right Panel', 'Opened');
        });

        $.subscribe(baseRight.RightPanel.CLOSE_RIGHT_PANEL, () => {
            this.trackEvent('Player Interactions', 'Right Panel', 'Closed');
        });

        $.subscribe(restrictedFile.RestrictedFileDialogue.SHOW_RESTRICTED_FILE_DIALOGUE, () => {
            this.trackEvent('Player Interactions', 'Restricted File', 'Opened');
        });

        $.subscribe(coreMediaElementExtension.Extension.MEDIA_PLAYED, () => {
            this.trackEvent('Player Interactions', 'Play');
        });

        $.subscribe(coreMediaElementExtension.Extension.MEDIA_PAUSED, () => {
            this.trackEvent('Player Interactions', 'Pause');
        });

        $.subscribe(coreMediaElementExtension.Extension.MEDIA_ENDED, () => {
            this.trackEvent('Player Interactions', 'Ended');
        });

        // see also
        $.subscribe(baseExtension.BaseExtension.ASSET_INDEX_CHANGED, () => {
            var seeAlso = this.extension.getCurrentAsset().seeAlso;

            if (seeAlso && this.extension.isSeeAlsoEnabled()){
                $.publish(baseExtension.BaseExtension.SHOW_MESSAGE, [seeAlso.markup]);
            } else {
                $.publish(baseExtension.BaseExtension.HIDE_MESSAGE);
            }
        });
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

    trackEvent(category: string, action: string, label?: string, value?: any): void{

        // update sliding session expiration.
        this.updateSlidingExpiration();

        if (!label) {
            label = this.getGenericTrackingLabel();
        } else {
            label += ', ' + this.getGenericTrackingLabel();
        }

        if (!value){
            window.trackEvent(category, action, label);
        } else {
            window.trackEvent(category, action, label, parseInt(value));
        }
    }

    trackVariable(slot: number, name: string, value: string, scope: number): void{
        window.trackVariable(slot, name, value, scope);
    }

    getGenericTrackingLabel(): string{
        var moreInfo = (<IWellcomeProvider>this.extension.provider).moreInfo;

        var format = 'n/a';
        var institution = 'n/a';
        var identifier = this.extension.provider.assetSequence.packageIdentifier;
        var digicode = 'n/a';
        var collectioncode = 'n/a';

        if (moreInfo){
            if (moreInfo.bibDocType) format = moreInfo.bibDocType;
            if (moreInfo.Institution) institution = moreInfo.Institution;
            if (moreInfo.marc759a) digicode = moreInfo.marc759a;
            if (moreInfo.marc905a) collectioncode = moreInfo.marc905a;

            return  'Format: ' + format +
                    ', Institution: ' + institution +
                    ', Identifier: ' + identifier +
                    ', Digicode: ' + digicode +
                    ', Collection code: ' + collectioncode +
                    ', Uri: ' + parent.document.URL;
        }

        return '';
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
                return this.extension.provider.config.modules.loginDialogue.content.requiresRegistrationPermissionsMessage;
            case 'clinical images':
                return this.extension.provider.config.modules.loginDialogue.content.clinicalImagesPermissionsMessage;
            case 'restricted files':
                return this.extension.provider.config.modules.loginDialogue.content.restrictedFilesPermissionsMessage;
            case 'closed':
                return this.extension.provider.config.modules.loginDialogue.content.closedPermissionsMessage;
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

                    this.trackVariable(1, 'Logged in', 'true', 2);

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
                    // if section is 'requires registration', show login as guest option.
                    if (section.extensions.accessCondition.toLowerCase() === "requires registration"){
                        this.showLoginDialogue({
                            successCallback: successCallback,
                            failureCallback: failureCallback,
                            requestedIndex: assetIndex,
                            allowClose: this.allowCloseLogin(),
                            allowGuestLogin: true,
                            message: this.getInadequatePermissionsMessage(assetIndex)
                        });
                    } else {
                        // don't allow guest login.
                        this.showLoginDialogue({
                            successCallback: successCallback,
                            failureCallback: failureCallback,
                            requestedIndex: assetIndex,
                            allowClose: this.allowCloseLogin(),
                            allowGuestLogin: false,
                            message: this.getInadequatePermissionsMessage(assetIndex)
                        });
                    }
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

        $.getJSON(prefetchUri, (result) => {
            if (result.Success) {
                successCallback(asset.fileUri);
            } else {
                this.extension.showDialogue(result.Message);
                return;
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

                    this.trackEvent('Pages', 'Viewed', 'Index: ' + String(assetIndex));

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