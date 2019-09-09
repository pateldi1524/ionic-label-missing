import { Injectable } from '@angular/core';
import { environment } from '../../environments/environment';
@Injectable({
    providedIn: 'root'
})
export class ConfigService {
    // Variables
    isDebug = !environment.production;

    IDEL_TIME = 10; // idel time 1680 second (28 min)
    TIMEOUT_TIME = 10; // timeout in 120 second after warning (2 min)
    CONFIGURATION_DATA_EXPIRED = 2; // Configuration data expired in ( 25 Hour * 60) = 1440 minutes
    constructor() {

    }
}
