import { Injectable } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
@Injectable({
    providedIn: 'root'
})
export class MsgService {

    // Menu items
    homePage = 'homePage';
    SIGN_OUT = 'signOut';

    // Messages
    // Common messages
    TITLE_CONNECTION_LOST = 'connectionLost';
    TITLE_CONFIG_EXPIRED = 'configurationExpired';
    TITLE_SERVER_ERROR = 'serverErrorTitle';
    MSG_SESSION_EXPIRE_IN = 'sessionExpiring';
    MSG_SESSION_EXPIRED = 'sessionExpired';
    MSG_SESSION_EXPIRED_TITLE = 'titleSessionExpired';
    MSG_GO_ONLINE = 'connectionRestored';
    MSG_CONNECTION_LOST = 'configurationFailedReconnect';
    MSG_CONFIG_SERVER_ERROR = 'serverError';
    BTN_REFRESH = 'refresh';
    BTN_LOGIN = 'login';
    BTN_TRY_AGAIN = 'tryAgain';

    // Login screen
    MSG_USERNAME_REQUIRE = 'validationEmail';
    MSG_PASSWORD_REQUIRE = 'validationPassword';
    MSG_NO_CONNECTION = 'noInternet';
    MSG_SERVER_ERROR = 'failureTryAgain';
    INVALID_LOGIN = 'loginFailed';
    STATUS_401_MSG = 'forbiddenDescription';
    STATUS_403_MSG = 'userIsNotAuthenticatedForAction';
    NO_INTERNET = 'noInternetReconnect';
    TXT_LOADING = 'loading';

    // delete current inspection
    MSG_TITLE_REMOVE_INSPECTION_ALERT = 'confirm';
    MSG_TITLE_REMOVE_INSPECTION_ALERT_MESSAGE_DELETE_INSPECTION = 'deleteInspection';
    BTN_YES = 'yes';
    BTN_NO = 'no';
    BTN_OK = 'ok';

    constructor(
        private translate: TranslateService,
    ) {
    }

    translateMsgs() {
        for (const key in this) {
            if (typeof this[key.toString()] === 'string') {
                this.translate.get(this[key.toString()]).subscribe((res: string) => {
                    if (res !== undefined && res != null) {
                        this[key.toString()] = res;
                    }
                });
            }
        }
    }
}
