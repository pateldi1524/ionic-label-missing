import { Injectable } from '@angular/core';
import { SQLite, SQLiteObject } from '@ionic-native/sqlite/ngx';
import { Platform, NavController, MenuController, Events } from '@ionic/angular';
import { SharedService } from './shared.service';

@Injectable({
    providedIn: 'root'
})
export class SqlStorageService {
    database: SQLiteObject;
    constructor(
        private sqlite: SQLite,
        private platform: Platform,
        private shared: SharedService
    ) {

    }
}
