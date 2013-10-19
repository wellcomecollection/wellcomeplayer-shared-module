define(["require", "exports", "../wellcomeplayer-dialogues-module/restrictedFileDialogue", "../wellcomeplayer-dialogues-module/loginDialogue", "../coreplayer-shared-module/baseExtension"], function(require, exports, __restrictedFile__, __login__, __baseExtension__) {
    
    
    
    
    var restrictedFile = __restrictedFile__;
    var login = __login__;
    var baseExtension = __baseExtension__;

    var Behaviours = (function () {
        function Behaviours(extension) {
            this.extension = extension;
        }
        Behaviours.prototype.isSaveToLightboxEnabled = function () {
            if ((this.extension.provider).config.options.saveToLightboxEnabled === false)
                return false;
            if (!(this.extension.provider).isHomeDomain)
                return false;
            if (!(this.extension.provider).isOnlyInstance)
                return false;

            return true;
        };

        Behaviours.prototype.isDownloadEnabled = function () {
            switch ((this.extension.provider).type) {
                case "book":
                    if ((this.extension.provider).config.options.bookDownloadEnabled === false) {
                        return false;
                    }
                    break;
                case "video":
                    if ((this.extension.provider).config.options.videoDownloadEnabled === false) {
                        return false;
                    }
                    break;
                case "audio":
                    if ((this.extension.provider).config.options.audioDownloadEnabled === false) {
                        return false;
                    }
                    break;
            }

            if (!(this.extension.provider).assetSequence.extensions.permittedOperations.length) {
                return false;
            }

            return true;
        };

        Behaviours.prototype.getTrackActionLabel = function () {
            return "bNumber: " + (this.extension.provider).pkg.identifier + ", type: " + (this.extension.provider).type + ", assetSequenceIndex: " + (this.extension.provider).assetSequenceIndex + ", asset: " + this.extension.currentAssetIndex + ", isLoggedIn: " + this.isLoggedIn() + ", isHomeDomain: " + (this.extension.provider).isHomeDomain + ", uri: " + window.parent.location;
        };

        Behaviours.prototype.trackAction = function (category, action) {
            var label = this.getTrackActionLabel();

            //log(category, action, label);
            // update sliding session expiration.
            this.updateSlidingExpiration();

            try  {
                trackEvent(category, action, label);
            } catch (e) {
                // do nothing
            }
        };

        Behaviours.prototype.closeActiveDialogue = function () {
            $.publish(Behaviours.CLOSE_ACTIVE_DIALOGUE);
        };

        Behaviours.prototype.updateSlidingExpiration = function () {
            if ((this.extension.provider).pkg.extensions.isAllOpen)
                return;

            if (!this.isLoggedIn())
                return;

            var that = this;

            // get ttl.
            $.ajax({
                url: '/service/ttl',
                type: 'GET',
                success: function (time) {
                    time = parseInt(time);

                    if (time == -1)
                        return;

                    var ms = time * 1000;

                    if (that.sessionTimer) {
                        clearTimeout(that.sessionTimer);
                    }

                    that.sessionTimer = setTimeout(function () {
                        (that.extension).closeActiveDialogue();
                        (that.extension).showDialogue((that.extension.provider).config.modules.genericDialogue.content.sessionExpired, function () {
                            that.extension.refresh();
                        }, (that.extension.provider).config.modules.genericDialogue.content.refresh, false);
                    }, ms);
                }
            });
        };

        Behaviours.prototype.allowCloseLogin = function () {
            // if there's only one asset in the package, you must login to see anything,
            // so don't allow it to be closed.
            // necessary for video/audio which have no ui to trigger
            // new login event.
            return (this.extension.provider).assetSequence.assets.length != 1;
        };

        Behaviours.prototype.getInadequatePermissionsMessage = function (assetIndex) {
            var section = this.extension.getSectionByAssetIndex(assetIndex);

            switch (section.extensions.accessCondition.toLowerCase()) {
                case 'requires registration':
                    return (this.extension.provider).config.modules.loginDialogue.requiresRegistrationPermissionsMessage;
                case 'clinical images':
                    return (this.extension.provider).config.modules.loginDialogue.clinicalImagesPermissionsMessage;
                case 'restricted files':
                    return (this.extension.provider).config.modules.loginDialogue.restrictedFilesPermissionsMessage;
                case 'closed':
                    return (this.extension.provider).config.modules.loginDialogue.closedPermissionsMessage;
            }

            return (this.extension.provider).config.modules.loginDialogue.inadequatePermissionsMessage;
        };

        Behaviours.prototype.showRestrictedFileDialogue = function (params) {
            $.publish(restrictedFile.RestrictedFileDialogue.SHOW_RESTRICTED_FILE_DIALOGUE, [params]);
        };

        Behaviours.prototype.isAuthorised = function (assetIndex) {
            var section = this.extension.getSectionByAssetIndex(assetIndex);

            if (section.extensions.authStatus.toLowerCase() == "allowed") {
                return true;
            }

            return false;
        };

        Behaviours.prototype.hasPermissionToViewCurrentItem = function () {
            return this.isAuthorised(this.extension.currentAssetIndex);
        };

        Behaviours.prototype.isLoggedIn = function () {
            return document.cookie.indexOf("wlauth") >= 0;
        };

        Behaviours.prototype.showLoginDialogue = function (params) {
            // this needs to be postponed otherwise
            // it will trigger before the login event
            // handler is registered.
            setTimeout(function () {
                $.publish(login.LoginDialogue.SHOW_LOGIN_DIALOGUE, [params]);
            }, 1);
        };

        // pass direction as 1 or -1.
        Behaviours.prototype.nextAvailableIndex = function (direction, requestedIndex) {
            for (var i = requestedIndex; i < (this.extension.provider).assetSequence.assets.length && i >= 0; i += direction) {
                if (i == requestedIndex)
                    continue;
                if (this.isAuthorised(i)) {
                    return i;
                }
            }

            return null;
        };

        Behaviours.prototype.viewNextAvailableIndex = function (requestedIndex, callback) {
            var nextAvailableIndex;

            if (requestedIndex < this.extension.currentAssetIndex) {
                nextAvailableIndex = this.nextAvailableIndex(-1, requestedIndex);
            } else {
                nextAvailableIndex = this.nextAvailableIndex(1, requestedIndex);
            }

            if (nextAvailableIndex) {
                callback(nextAvailableIndex);
            } else {
                (this.extension).showDialogue((this.extension.provider).config.modules.genericDialogue.content.noRemainingVisibleItems);
            }
        };

        Behaviours.prototype.login = function (params) {
            var _this = this;
            var ajaxOptions = {
                url: (this.extension.provider).getLoginUri(params.username, params.password),
                type: "GET",
                dataType: "json",
                xhrFields: { withCredentials: true },
                // success callback
                success: function (result) {
                    $.publish(login.LoginDialogue.HIDE_LOGIN_DIALOGUE);

                    if (result.Message.toLowerCase() == "success") {
                        (_this.extension).triggerSocket(login.LoginDialogue.LOGIN, result.DisplayNameBase64);
                        params.successCallback(true);
                    } else {
                        params.failureCallback(result.Message, true);
                    }
                },
                // error callback
                error: function (result) {
                    $.publish(login.LoginDialogue.HIDE_LOGIN_DIALOGUE);

                    params.failureCallback((_this.extension.provider).config.modules.genericDialogue.content.error, true);
                }
            };

            $.ajax(ajaxOptions);
        };

        Behaviours.prototype.authorise = function (assetIndex, successCallback, failureCallback) {
            var section = this.extension.getSectionByAssetIndex(assetIndex);

            switch (section.extensions.authStatus.toLowerCase()) {
                case 'allowed':
                    successCallback(false);
                    break;
                case 'denied':
                    if (this.isLoggedIn()) {
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
                        message: (this.extension.provider).config.modules.loginDialogue.loginExpiredMessage,
                        requestedIndex: assetIndex,
                        allowClose: this.allowCloseLogin()
                    });
                    break;
                case 'notacceptedtermsyet':
                    (this.extension).showDialogue((this.extension.provider).config.modules.genericDialogue.content.notAcceptedTermsYetMessage);
                    break;
            }
        };

        // ensures that a file is in the server cache.
        Behaviours.prototype.prefetchAsset = function (assetIndex, successCallback) {
            var asset = this.extension.getAssetByIndex(assetIndex);

            var prefetchUri = (this.extension.provider).getPrefetchUri(asset);

            $.getJSON(prefetchUri, function (result) {
                if (result.Success) {
                    successCallback(asset.fileUri);
                } else {
                    console.log(result.Message);
                }
            });
        };

        Behaviours.prototype.viewIndex = function (assetIndex, successCallback) {
            var _this = this;
            // authorise.
            this.authorise(assetIndex, // success callback
            function (reload) {
                if (reload) {
                    // reload the package.
                    (_this.extension.provider).reload(function () {
                        $.publish(baseExtension.BaseExtension.RELOAD);
                        _this.viewIndex(assetIndex, successCallback);
                    });
                } else {
                    _this.extension.currentAssetIndex = assetIndex;
                    $.publish(baseExtension.BaseExtension.ASSET_INDEX_CHANGED, [assetIndex]);

                    if (successCallback) {
                        successCallback(assetIndex);
                    }
                }
            }, // failure callback.
            function (message, retry) {
                (_this.extension).showDialogue(message, function () {
                    if (retry) {
                        _this.viewIndex(assetIndex, successCallback);
                    }
                });
            });
        };
        Behaviours.CLOSE_ACTIVE_DIALOGUE = 'onCloseActiveDialogue';
        return Behaviours;
    })();

    
    return Behaviours;
});
//# sourceMappingURL=behaviours.js.map
