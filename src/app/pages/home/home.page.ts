import { Component, ViewChild } from '@angular/core';
import { MenuController, NavController, Events } from '@ionic/angular';
import { ModalController } from '@ionic/angular';
import { SharedService } from 'src/app/providers/shared.service';
import { ApiService } from 'src/app/providers/api.service';
import { MsgService } from 'src/app/providers/msg.service';
import { SqlStorageService } from 'src/app/providers/sql-storage.service';
import { StorageService } from 'src/app/providers/storage.service';
import { IonicSelectableComponent } from 'ionic-selectable';
@Component({
    selector: 'app-home',
    templateUrl: 'home.page.html',
    styleUrls: ['home.page.scss'],
})
export class HomePage {
    @ViewChild('modelTypeSelection') modelTypeSelection: IonicSelectableComponent;
    @ViewChild('vehicleDiagramSelection') vehicleDiagramSelection: IonicSelectableComponent;

    RegistrationNumber = '';
    constructor(
        public menuCtrl: MenuController,
        public modalController: ModalController,
        public shared: SharedService,
        public api: ApiService,
        public navCtrl: NavController,
        public msg: MsgService,
        public sql: SqlStorageService,
        public storage: StorageService,
        private events: Events,
    ) {
        this.menuCtrl.enable(true);
    }

    ionViewWillEnter() {
        document.getElementsByTagName('ion-app')[0].style.width = '100%';
        // When session expired
        this.events.subscribe('session-expired', () => {
            // Close modal if open
            if (this.modelTypeSelection !== undefined) {
                if (this.modelTypeSelection.isOpened) {
                    this.modelTypeSelection.close();
                }
            }

            if (this.modelTypeSelection !== undefined) {
                if (this.vehicleDiagramSelection.isOpened) {
                    this.vehicleDiagramSelection.close();
                }
            }
        });
    }

    // Page will leave
    ionViewWillLeave() {
        this.events.unsubscribe('session-expired');
    }

    // Page entered
    ionViewDidEnter() {
        // submit pending inspection
        if (this.shared.isConfigurationExpired === true) {
            this.events.publish('configurationExpired');
        }
    }

    // identify vehicle if exist or not - Next button
    identifyVehicle() {
    }

}
