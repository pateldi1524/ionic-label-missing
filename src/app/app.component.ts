import { SessionService } from './providers/session.service';
import { SharedService } from './providers/shared.service';
import { MsgService } from './providers/msg.service';
import { Component } from '@angular/core';
import { Observable, of, forkJoin } from 'rxjs';
import { Platform, NavController, MenuController, Events, ModalController } from '@ionic/angular';
import { SplashScreen } from '@ionic-native/splash-screen/ngx';
import { StatusBar } from '@ionic-native/status-bar/ngx';
import { TranslateService } from '@ngx-translate/core';
import { BackgroundMode } from '@ionic-native/background-mode/ngx';
import { AppVersion } from '@ionic-native/app-version/ngx';
import { ConfigService } from './providers/config.service';
import { ApiService } from './providers/api.service';
import { AlertService } from './providers/alert.service';
import { StorageService } from './providers/storage.service';
import { SqlStorageService } from './providers/sql-storage.service';

declare var galleryRefresh: any;
@Component({
    selector: 'app-root',
    templateUrl: 'app.component.html'
})
export class AppComponent {
    public appPages = [
        {
            title: this.msg.homePage,
            value: 'inspection',
            img: 'home',
            url: '/home'
        },
        {
            title: this.msg.SIGN_OUT,
            value: 'signout',
            url: '',
            img: 'signout'
        }];
    configurationTimeoutAt;
    configurationTimer;
    configLoadedCount = 0;
    constructor(
        private platform: Platform,
        private splashScreen: SplashScreen,
        private statusBar: StatusBar,
        public translate: TranslateService,
        private msg: MsgService,
        public shared: SharedService,
        public api: ApiService,
        public alert: AlertService,
        private session: SessionService,
        private backgroundMode: BackgroundMode,
        private appVersion: AppVersion,
        public config: ConfigService,
        private navCtrl: NavController,
        private storage: StorageService,
        public menuCtrl: MenuController,
        private events: Events,
        private sql: SqlStorageService,
        public modalController: ModalController
    ) {
        this.initializeApp();
    }

    initializeApp() {
        this.platform.ready().then(() => {
            this.translate.setDefaultLang('en_GB');
            this.msg.translateMsgs();
            this.createMenuItems();
            this.statusBar.styleLightContent();
            this.statusBar.backgroundColorByHexString('#0e60a2');
            // this.splashScreen.hide();
            this.backgroundMode.enable();
            this.navCtrl.navigateRoot('/login');
            // If mobile app
            if (this.platform.is('cordova')) {
                this.platform.resume.subscribe(() => {
                    // Check if configuration expires
                    if (this.configurationTimer) {
                        this.setConfigurationTimer(this.configurationTimeoutAt - Date.now());
                    }
                    if (this.shared.isLoggedIn) {
                        this.session.appResume();
                    }
                    // this.checkForUpdate(appUpdateObj);
                    document.getElementsByTagName('ion-app')[0].style.width = '100%';
                    setTimeout(() => {
                        document.getElementsByTagName('ion-app')[0].style.width = '';
                    }, 1000);
                });
            }

            // get app version
            this.appVersion.getVersionNumber().then(res => {
                this.shared.appVersion = `${res}${this.shared.config.isDebug ? '-beta' : ''}`;
            });

            // Last refresh configuration data
            this.storage.get(this.shared.KEY_LAST_UPDATED_TIMESTAMP).then(res => {
                if (res != null) {
                    this.shared.lastRefreshed = new Date(res);
                    this.configurationDataTimer(false);
                }
            });

            // User login event
            this.events.subscribe('user:login', (type) => {
                if (type.isOnline) {
                    // Download configuration data if online
                    this.shared.isConfigurationExpired = false;
                    this.getSynchronizeData();
                } else {
                    // Get Configuration data from local storage if offline
                    this.storage.get(this.shared.KEY_CONFIG_DATA).then(res => {
                        if (res !== null) {
                            this.shared.configurationData = JSON.parse(res);
                        }
                    });
                }
            });

            window.addEventListener('keyboardWillHide', () => {
                const app = document.querySelector('ion-app');
                window.requestAnimationFrame(() => {
                    app.style.height = '100%';
                    window.requestAnimationFrame(() => {
                        app.style.height = '';
                    });
                });
            });
        });
    }

    createMenuItems() {
        const menuItem = [];
        this.appPages.forEach(page => {
            this.translate.get(page.title).subscribe((res: string) => {
                page.title = res;
                menuItem.push(page);
            });
        });
        if (menuItem.length > 0) {
            this.appPages = menuItem;
        }
    }

    // selected menu item
    async clickMenuOption(menu) {
        this.menuCtrl.close();

        // if item selected signout
        if (menu.value === 'signout') {

            this.events.publish('logout');
            this.session.stopSessionWatch();
            this.navCtrl.navigateRoot('/login');

        } else if (menu.value === 'inspection') {

            // if inspection not confirmed then no any alert reqired
            this.navCtrl.navigateRoot('/home');
        } else {
            // remaing items navigate from here
            this.navCtrl.navigateRoot(menu.url);
        }
    }

    // Language description
    getLanguageDescription(code) {
        if (this.shared.configurationData && code) {
            const langaugePosition = this.shared.configurationData.appSupportedLanguages.map(languageObj => languageObj.languageCode).indexOf(code);
            if (langaugePosition !== -1) {
                return this.shared.configurationData.appSupportedLanguages[langaugePosition].languageDescription;
            } else {
                return '';
            }
        } else {
            return '';
        }
    }

    // disabled menu item when device is offline
    disabledMenuItem(menu) {
        const isMenuItemDisable = (this.shared.isOnline && !this.shared.isLoggedInOnline) ||
            (!this.shared.isLoggedInOnline) ||
            (!this.shared.isOnline && this.shared.isLoggedInOnline);

        if (isMenuItemDisable && (menu === 'username' || menu.value === 'changePassword' || menu.value === 'synchronizationData' || menu.value === 'language')) {
            return true;
        }
    }

    // get synchronized vehicle data
    getSynchronizeData() {
        this.configLoadedCount = 0;
        // this.shared.showLoading();
        setTimeout(() => {
            this.shared.hideLoading();
        }, 2000);
    }

    configurationDataTimer(update) {
        if (update) {
            // If configurataion data just updated, set timeout after CONFIGURATION_DATA_EXPIRED minutes
            const nowDate = new Date();
            const expireDate = new Date(nowDate.getTime() + this.shared.config.CONFIGURATION_DATA_EXPIRED * 60000);

            // Set timeout after x minutes
            this.setConfigurationTimer(expireDate.getTime() - nowDate.getTime());

        } else {
            const timeSinceLastRefresh = Math.floor(Math.abs(new Date().getTime() - this.shared.lastRefreshed.getTime()) / 60000);
            // Check if expired
            if (timeSinceLastRefresh < this.shared.config.CONFIGURATION_DATA_EXPIRED) {
                // If not expires, set timeout after remianing time
                this.setConfigurationTimer((this.shared.config.CONFIGURATION_DATA_EXPIRED - timeSinceLastRefresh) * 60000);
            } else {
                // Data expired
                this.shared.isConfigurationExpired = true;
            }
        }
    }

    // Configuration data timer
    setConfigurationTimer(delay) {
        if (this.configurationTimer) {
            clearTimeout(this.configurationTimer);
        }

        this.configurationTimeoutAt = Date.now() + delay;
        this.configurationTimer = setTimeout(() => {
            this.configurationTimer = null;
        }, delay);
    }
}
