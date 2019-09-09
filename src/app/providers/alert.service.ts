import { Injectable } from '@angular/core';
import { AlertController, NavController } from '@ionic/angular';

@Injectable({
    providedIn: 'root'
})
export class AlertService {
    alertMsg;
    constructor(
        private alertCtrl: AlertController,
        private navCtrl: NavController
    ) { }

    showAlert(title: string, alertMessage: string, button: string, dismissPrevious: boolean) {
        return new Promise(async (resolve, reject) => {
            if (this.alertMsg != undefined && dismissPrevious) {
                const dismissAlert = this.alertMsg.dismiss();
                dismissAlert.then(() => {
                });
            }
            this.alertMsg = await this.alertCtrl.create({
                header: title,
                message: alertMessage,
                backdropDismiss: false,
                buttons: [{
                    text: button,
                    handler: () => {
                        resolve(true);
                    }
                }]
            });
            // Timeout  to prevent present multiple alert same time which are created when app was in background
            setTimeout(async () => {
                await this.alertMsg.present();
            }, 1);
        });
    }

    dismissAlertIfOpen() {
        if (this.alertMsg !== undefined) {
            const dismissAlert = this.alertMsg.dismiss();
            dismissAlert.then(() => {
            });
        }
    }

    dynamicAlert(title: string, alertMessage: string, btnArr: Array<any>, dismissPrevious: boolean) {
        return new Promise(async (resolve, reject) => {
            if (this.alertMsg !== undefined && dismissPrevious) {
                const dismissAlert = this.alertMsg.dismiss();
                dismissAlert.then(() => {
                });
            }

            const alertButtons = [];
            btnArr.forEach(element => {
                alertButtons.push({
                    text: element.name,
                    handler: () => {
                        resolve(element.value);
                    }
                });
            });

            this.alertMsg = await this.alertCtrl.create({
                header: title,
                message: alertMessage,
                backdropDismiss: false,
                buttons: alertButtons
            });

            // Timeout  to prevent present multiple alert same time which are created when app was in background
            setTimeout(async () => {
                await this.alertMsg.present();
            }, 1);
        });
    }
}
