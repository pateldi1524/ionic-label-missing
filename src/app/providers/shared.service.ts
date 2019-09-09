import { MsgService } from './msg.service';
import { Injectable, NgZone } from '@angular/core';
import { Observable, of, throwError } from 'rxjs';
import { Router } from '@angular/router';
import { HttpErrorResponse } from '@angular/common/http';
import { ConfigService } from './config.service';
import { ToastController, NavController, Events } from '@ionic/angular';
import { LoadingController } from '@ionic/angular';
import { InAppBrowser } from '@ionic-native/in-app-browser/ngx';
import { Network } from '@ionic-native/network/ngx';
import { StorageService } from '../providers/storage.service';
import { PopoverController } from '@ionic/angular';
import { File } from '@ionic-native/file/ngx';

declare var galleryRefresh: any;
@Injectable({
    providedIn: 'root'
})
export class SharedService {
    // Common variables used in coded
    config;
    isLoading = false;
    loadingSpinner: any;
    isOnline = true;
    isLoggedIn = false;
    isLoggedInOnline = false;
    isPreviouslyConnected = false;
    previousConnectedType;
    sessionId;
    user;
    connectionImg = '';
    sessionExpiredAlertOpen = false;
    appVersion;
    configurationData;
    userGroupId;
    userId;
    currentPopover = null;
    galleryOpenedFrom; // This is to get user back to this page when gallery close
    popoverMenu;
    dateFormate = 'dd-MM-yyyy HH:mm';

    // Variable keys
    KEY_CREDENTIAL = 'credential';
    KEY_USER = 'user';
    KEY_CONFIG_DATA = 'configurationData';
    KEY_LAST_UPDATED_TIMESTAMP = 'lastUpdatedDate';

    // configuration data const
    lastRefreshed;
    isConfigurationExpired = false;
    configurationExpiredInInspection = false;
    configurationExpireInSessionCountDown = false; // this variable is used to indentify if configuration expire while session expiry warning
    // isInspetionStartedInOnline = false; // is inspection started in online mode
    justLoggedIn = false; // This is to wait to load configuration data first before send video
    
    // inspection damage list
    public damageType;


    constructor(
        private configService: ConfigService,
        public toastController: ToastController,
        public loadingController: LoadingController,
        public msg: MsgService,
        private iab: InAppBrowser,
        private network: Network,
        private router: Router,
        private storage: StorageService,
        public popoverController: PopoverController,
        public navCtrl: NavController,
        public file: File,
        private event: Events
    ) {

        this.config = configService;
        this.isOnline = this.network.type !== 'none' && this.network.type !== 'unknown';
        this.isPreviouslyConnected = !this.isOnline;
        this.previousConnectedType = this.network.type;
        this.connectionImg = this.isOnline ? 'assets/imgs/wifi.png' : 'assets/imgs/no-wifi.png';

        // If connection offline
        this.network.onDisconnect().subscribe(() => {
            if (this.isPreviouslyConnected || this.previousConnectedType !== this.network.type) {
                this.isOnline = this.network.type !== 'none' && this.network.type !== 'unknown';
                this.previousConnectedType = this.network.type;
                this.isPreviouslyConnected = !this.isOnline;
                this.connectionImg = this.isOnline ? 'assets/imgs/wifi.png' : 'assets/imgs/no-wifi.png';
            }
        });

        // If connection online
        this.network.onConnect().subscribe(() => {
            // make device online if previously NOT connected
            // OR
            // if previously connected then previously network type not same with current network type
            if (!this.isPreviouslyConnected || this.previousConnectedType !== this.network.type) {

                // update previously connected network type
                this.previousConnectedType = this.network.type;

                // now device is connected then change the value for this
                this.isPreviouslyConnected = true;

                // if user looged with offline then network icon will not change to online.
                if (this.isLoggedInOnline || !this.isLoggedIn) {
                    // before we determine the connection type. Might need to wait.(make network stable)
                    setTimeout(() => {
                        this.isOnline = this.network.type !== 'none' && this.network.type !== 'unknown';
                        this.connectionImg = this.isOnline ? 'assets/imgs/wifi.png' : 'assets/imgs/no-wifi.png';
                        this.event.publish('submitInspection');
                    }, 3000);
                }
            }
        });
    }

    isEmpty(value) {
        return value === '' || value === undefined || value == null;
    }

    // Handle API error
    handleError(error: HttpErrorResponse) {
        return throwError(error);
    }

    showHttpErrorMsg(err, isLogin?) {
        isLogin = isLogin || false;
        switch (err.status) {
            case 400:
            case 500:
                if (err.error && err.error.errors && err.error.errors.length >= 1) {
                    this.showToast(err.error.errors.join('\r\n'), 5000);
                } else if (err.error && err.error.errorMessage) {
                    this.showToast(err.error.errorMessage);
                } else {
                    this.showToast(this.msg.MSG_SERVER_ERROR);
                }
                break;

            case 401:
                this.showToast(isLogin ? this.msg.INVALID_LOGIN : this.msg.STATUS_401_MSG);
                break;

            case 403:
                this.showToast(this.msg.STATUS_403_MSG);
                break;

            default:
                this.showToast(this.msg.MSG_SERVER_ERROR);
        }
    }

    // Function to display log
    log(msg) {
        if (this.configService.isDebug) { // Show logs only if debug mode true
            console.log(msg);
        }
    }

    // Open url
    openUrl(url, target?) {
        target = target || '_blank';
        this.iab.create(url, target, 'hideurlbar=yes,hidenavigationbuttons=yes,toolbarcolor=white,closebuttoncolor=black');
    }

    // show toast message
    async showToast(msg, toastDuration?) {
        toastDuration = toastDuration || 2000;
        const toast = await this.toastController.create({
            message: msg,
            duration: toastDuration,
            cssClass: 'ion-text-center'
        });
        toast.present();
    }

    // Show loading
    async showLoading() {
        console.log('show loading');
        this.isLoading = true;
        this.loadingSpinner = await this.loadingController.create({
            message: this.msg.TXT_LOADING,
            showBackdrop: true
        });
        await this.loadingSpinner.present().then(() => {
            if (!this.isLoading) {
                this.loadingSpinner.dismiss();
            }
        });

    }

    // Hide loading
    async hideLoading() {
        this.isLoading = false;
        if (this.loadingSpinner !== undefined) {
            return await this.loadingSpinner.dismiss();
        }
    }

    // Call this when session expire
    forceLogout() {
        this.event.publish('logout');
        if (!this.isOnline) { /*this.api.logout().then()*/ }
        // Redirect to Login page
        // this.router.navigate(['/login'], { replaceUrl: true });
        this.navCtrl.navigateRoot('/login');
    }
}
