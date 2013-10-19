

import IProvider = require("../coreplayer-shared-module/iProvider");

interface IWellcomeProvider extends IProvider{
	getMoreInfoUri(): string;
	getPrefetchUri(asset: any): string;
	getAssetUri(asset: any): string;
	getLoginUri(username: string, password: string): string;
	getSaveUri(): string;
}

export = IWellcomeProvider;