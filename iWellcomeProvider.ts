
import IProvider = require("../coreplayer-shared-module/iProvider");

interface IWellcomeProvider extends IProvider{

	moreInfo: any;

    getLoginUri(username: string, password: string): string;
    getMoreInfoUri(): string;
    getPrefetchUri(asset: any): string;
    getSaveUri(): string;
}

export = IWellcomeProvider;