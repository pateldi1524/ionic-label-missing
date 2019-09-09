import { Injectable } from '@angular/core';
import { Storage } from '@ionic/storage';
import * as CryptoJS from 'crypto-js';

@Injectable({
    providedIn: 'root'
})
export class StorageService {
    secret = 'BSi#s3Cur3-k3y'; // local storage secure
    constructor(private storage: Storage) { }

    // Set value in localstorage
    set(key, value) {
        let storeValue = value;
        if (typeof value === 'object') {
            storeValue = JSON.stringify(value);
        }
        
        return this.storage.set(key, CryptoJS.AES.encrypt(storeValue, this.secret).toString());
    }

    // Get value from local storage
    get(key) {
        return this.storage.get(key).then((val) => {
            if (val != null) {
                const decrypted = CryptoJS.AES.decrypt(val.toString(), this.secret);
                return decrypted.toString(CryptoJS.enc.Utf8);
            } else {
                return val;
            }
        }, err => {
            return err;
        });
    }

    // Remove key
    remove(key) {
        return this.storage.remove(key).then((val) => {
            return val;
        }, err => {
            return err;
        });
    }

    // Remove all
    removeAll() {
        return this.storage.clear().then((val) => {
            return val;
        }, err => {
            return err;
        });
    }


}
