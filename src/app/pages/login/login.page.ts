import { SessionService } from './../../providers/session.service';
import { StorageService } from './../../providers/storage.service';
import { MsgService } from './../../providers/msg.service';
import { ApiService } from './../../providers/api.service';
import { SharedService } from './../../providers/shared.service';
import { Component, OnInit, NgZone } from '@angular/core';
import { MenuController, NavController, Events } from '@ionic/angular';
import { Router, NavigationExtras } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { SplashScreen } from '@ionic-native/splash-screen/ngx';
import { Network } from '@ionic-native/network/ngx';
import { SqlStorageService } from 'src/app/providers/sql-storage.service';

@Component({
    selector: 'app-login',
    templateUrl: './login.page.html',
    styleUrls: ['./login.page.scss'],
})
export class LoginPage implements OnInit {
    user = { username: 'test@test.com', password: 'test' };
    visiblePassword = false;

    constructor(
        public menuCtrl: MenuController,
        private router: Router,
        private navCtrl: NavController,
        public shared: SharedService,
        private api: ApiService,
        public msg: MsgService,
        public translate: TranslateService,
        private storage: StorageService,
        private session: SessionService,
        private splashScreen: SplashScreen,
        private network: Network,
        private zone: NgZone,
        private events: Events,
        private sql: SqlStorageService,
    ) {
        this.menuCtrl.enable(false);
    }

    ionViewDidEnter() {
        this.splashScreen.hide();
        // below is work around of https://github.com/ionic-team/ionic/issues/19065 this issue
        const ionApp = document.getElementsByTagName('ion-app')[0];
        ionApp.style.height = '100%';
        const loginPage = document.querySelector('app-login') as HTMLElement;
        loginPage.style.height = '100%';
        setTimeout(() => {
            loginPage.style.height = '';
            ionApp.style.height = '';
        }, 100);
    }

    // Before page enter
    ionViewWillEnter() {
        document.getElementsByTagName('ion-app')[0].style.width = '';
        this.shared.isOnline = this.network.type !== 'none' && this.network.type !== 'unknown';
        this.shared.connectionImg = this.shared.isOnline ? 'assets/imgs/wifi.png' : 'assets/imgs/no-wifi.png';
    }

    /*
    * below is patch because of bug in ionic orientation change.
    * bug raised by dv here - https://github.com/ionic-team/ionic/issues/19101
    */
    // Page will leave
    ionViewWillLeave() {

    }

    ngOnInit() {
    }

    // Login clicked
    login() {
        this.shared.showLoading();
        setTimeout(() => { // timeout to assume API call time
            this.shared.hideLoading();
            this.session.userActive(); // Start session watch
            this.shared.isLoggedIn = true;
            this.events.publish('user:login', { isOnline: true });
            this.navCtrl.navigateRoot('/home');
        }, 1000);

        // this.navCtrl.navigateRoot('/privacy-policy');
    }

    forgotPassword() {
        if (this.shared.isOnline) {
            this.navCtrl.navigateForward('/forgot-password');
        } else {
            this.shared.showToast(this.msg.MSG_NO_CONNECTION);
        }
    }

    togglePassword() {
        this.visiblePassword = !this.visiblePassword;
    }
}
