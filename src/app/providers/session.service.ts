import { MsgService } from './msg.service';
import { AlertService } from './alert.service';
import { SharedService } from 'src/app/providers/shared.service';
import { ConfigService } from './config.service';
import { Injectable } from '@angular/core';
import { AlertController, Events, PopoverController } from '@ionic/angular';
import { ApiService } from './api.service';
import { StorageService } from './storage.service';

@Injectable({
    providedIn: 'root'
})
export class SessionService {
    idleTimerId; // Reference of idle watcher counter
    idleTimeExpireAt; // This is used when app become active from background to calculate time difference
    countDownTimer; // Reference of timer which shows warning of timeout
    sessionExpireAt; // This is used when app become active from background to calculate time difference
    stopCountDown = false; // Incase if session extended, this will be used to break countDownTimer
    alertExpiryMsg; // Reference of session expirty alert, need this to change time and dismiss when session timeout
    sessionExpiryDismissByTimeout = false; // Detect to check if session expiry dismiss by timer or by user
    isSessionExpired = false; // this is to dismiss expiry warning if session already expired
    constructor(
        private config: ConfigService,
        private shared: SharedService,
        private alertCtrl: AlertController,
        private alertProvider: AlertService,
        private msg: MsgService,
        public api: ApiService,
        private events: Events,
        public popoverController: PopoverController,
        public storageService: StorageService
    ) {
        // Reset idle timer on touch or move event
        document.addEventListener('click', (e: Event) => this.resetTimer());
        document.addEventListener('touchend', (e: Event) => this.resetTimer());
    }

    // Show idle after 'delay' milisecond
    startTimer(delay) {
        this.isSessionExpired = false;
        this.clearIdleTimer(); //  Before start clear if timer running
        this.idleTimeExpireAt = Date.now() + delay; // After this session expiry should show
        this.sessionExpireAt = Date.now() + delay + this.config.TIMEOUT_TIME; //  After this session is expired
        // Set timeout
        this.idleTimerId = setTimeout(() => {
            this.idle();
        }, delay);
    }

    // Reset Timer
    resetTimer() {
        this.clearIdleTimer();
        if (this.shared.isLoggedIn) {
            this.isSessionExpired = false;
            this.stopCountDown = true; // Stop countdown incase if started
            this.userActive(); // // If user logged in, start watch idle timer again
        }
    }

    // // If app is idle
    async idle() {
        this.stopCountDown = false; // Show previous countdown if any
        this.clearIdleTimer(); // Stop watching for idle, as its already idle

        // Create alert, session will expire after x second
        this.alertExpiryMsg = await this.alertCtrl.create({
            header: 'Session Expiry',
            message: this.getExpireTimeMsg(this.config.TIMEOUT_TIME),
            buttons: [{
                text: 'Extend',
                handler: () => {
                    // Extend session
                    this.extendSession();
                }
            }]
        });

        //     // Show alert
        await this.alertExpiryMsg.present().then(() => {
            if (this.isSessionExpired) {
                this.alertExpiryMsg.dismiss();
            }
        });

        //     // Start countdown timer
        this.startCountDownForSessionExpire(1);

        //     // On Session expiry alert dismiss
        await this.alertExpiryMsg.onDidDismiss().then((res) => {
            // Clear alert reference and stop countdown
            this.alertExpiryMsg = null;
            this.stopCountDown = true;
            if (this.sessionExpiryDismissByTimeout) {
                // If dismiss automatically on timeout
                this.sessionExpiryDismissByTimeout = false;
            } else if (this.shared.configurationExpireInSessionCountDown) {
                this.shared.configurationExpireInSessionCountDown = false;
                this.events.publish('configurationExpired', {});
            }
        });
    }

    // Clear Idle timer
    clearIdleTimer() {
        if (this.idleTimerId != null && this.idleTimerId !== undefined) {
            // Clear idle timer
            // this.idleTimerId.unsubscribe();
            clearTimeout(this.idleTimerId);
            this.idleTimerId = undefined;
        }
    }

    stopSessionExpireTimer() {
        // Clear session expire countdown
        if (this.countDownTimer != null && this.countDownTimer !== undefined) {
            clearTimeout(this.countDownTimer);
        }
    }

    userActive() {
        //  User is active, watch for inactivity
        this.stopCountDown = true;
        this.startTimer(this.config.IDEL_TIME * 1000);
    }
    // // sessionProvider

    appResume() {
        // When app resume from sleep
        if (this.idleTimeExpireAt > Date.now()) { // Check if idle time should expired
            this.startTimer(this.idleTimeExpireAt - Date.now());
        } else {
            this.sessionExpired();
        }
    }

    // Session expired
    sessionExpired() {
        this.isSessionExpired = true;
        this.alertProvider.dismissAlertIfOpen();
        if (this.shared.popoverMenu !== undefined) {
            this.popoverController.dismiss();
        }
        //  Hide countdown alert when session expire
        if (this.alertExpiryMsg !== undefined && this.alertExpiryMsg != null) {
            this.sessionExpiryDismissByTimeout = true;
            this.alertExpiryMsg.dismiss();
        }

        this.events.publish('session-expired');
        this.clearIdleTimer(); // clear idle timer
        this.shared.forceLogout(); // Logout user
        this.showSessionExpiredAlert();
    }

    // Show alert to user session is expired
    showSessionExpiredAlert() {
        this.shared.sessionExpiredAlertOpen = true;
        this.alertProvider.showAlert(this.msg.MSG_SESSION_EXPIRED_TITLE, this.msg.MSG_SESSION_EXPIRED, this.msg.BTN_OK, true).then(res => {
            this.shared.sessionExpiredAlertOpen = false;
            this.stopCountDown = true;
        });
    }
    // // Stop session watch
    stopSessionWatch() {
        this.clearIdleTimer();
    }

    // // Session expiry countdown
    startCountDownForSessionExpire(count) {
        if (this.stopCountDown == true) {
            // If session extended, stop countdown
            this.stopSessionExpireTimer();
            this.stopCountDown = false;
        } else {
            // If countdown not reached at limit and alert is shown to user
            if (count <= this.config.TIMEOUT_TIME && this.alertExpiryMsg != null) {
                // Clear timer if aleady there
                this.stopSessionExpireTimer();
                this.countDownTimer = setTimeout(() => {
                    if (this.alertExpiryMsg != null) {
                        this.alertExpiryMsg.message = this.getExpireTimeMsg(this.config.TIMEOUT_TIME - count);
                    }
                    this.startCountDownForSessionExpire(++count);
                }, 1000);
            } else {
                // Countdown over, session is expired
                this.stopSessionExpireTimer(); // Stop session expire timer
                this.sessionExpired(); // Session expired
            }
        }
    }

    // // Extend session
    extendSession() {
        this.clearIdleTimer(); // clear timer
        this.userActive(); // User active
        if (this.shared.isOnline) { // Call heartbeat if online
        }
    }

    // // Get message according to time left in session expire
    getExpireTimeMsg(count) {
        const seconds = Number(count);
        const h = Math.floor(seconds / 3600);
        const m = Math.floor(seconds % 3600 / 60);
        const s = Math.floor(seconds % 3600 % 60);

        const leftHours = h > 0 ? (h < 10) ? ('0' + h) : h : '00';
        const leftMinutes = m > 0 ? (m < 10) ? ('0' + m) : m : '00';
        const leftSeconds = s > 0 ? (s < 10) ? ('0' + s) : s : '00';

        return `${this.msg.MSG_SESSION_EXPIRE_IN} ${leftHours} : ${leftMinutes} : ${leftSeconds}`;
    }
}
