import { ConfigService } from './config.service';
import { Injectable } from '@angular/core';
import { Observable, of, forkJoin } from 'rxjs';
import { catchError, tap, finalize } from 'rxjs/operators';
import { HttpClient } from '@angular/common/http';
import { SharedService } from './shared.service';
import { StorageService } from './storage.service';
@Injectable({
    providedIn: 'root'
})
export class ApiService {
    BASE_URL: string;

    constructor(
        private http: HttpClient,
        config: ConfigService,
        private shared: SharedService,
        private storage: StorageService
    ) {
    }
}
