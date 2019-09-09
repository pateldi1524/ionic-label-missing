import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { RouteReuseStrategy } from '@angular/router';

import { IonicModule, IonicRouteStrategy } from '@ionic/angular';
import { SplashScreen } from '@ionic-native/splash-screen/ngx';
import { StatusBar } from '@ionic-native/status-bar/ngx';
import { SharedService } from 'src/app/providers/shared.service';
import { HTTP_INTERCEPTORS, HttpClientModule, HttpClient } from '@angular/common/http';
import { TranslateModule, TranslateLoader } from '@ngx-translate/core';
import { TranslateHttpLoader } from '@ngx-translate/http-loader';
import { AppComponent } from './app.component';
import { AppRoutingModule } from './app-routing.module';
import { IonicStorageModule } from '@ionic/storage';
import { Network } from '@ionic-native/network/ngx';
import { BackgroundMode } from '@ionic-native/background-mode/ngx';
import { AppVersion } from '@ionic-native/app-version/ngx';
import { InAppBrowser } from '@ionic-native/in-app-browser/ngx';
import { SQLite } from '@ionic-native/sqlite/ngx';
import { IonicSelectableModule } from 'ionic-selectable';
import { Device } from '@ionic-native/device/ngx';
import { ScreenOrientation } from '@ionic-native/screen-orientation/ngx';
import { AndroidPermissions } from '@ionic-native/android-permissions/ngx';
import { Camera } from '@ionic-native/camera/ngx';
import { MediaCapture } from '@ionic-native/media-capture/ngx';
import { WebView } from '@ionic-native/ionic-webview/ngx';
import { File } from '@ionic-native/file/ngx';
import { FilePath } from '@ionic-native/file-path/ngx';
import { FileTransfer } from '@ionic-native/file-transfer/ngx';
import { NumberOnlyDirective } from './directives/number-only.directive';

// Language files loading
export function HttpLoaderFactory(http: HttpClient, shared: SharedService) {
    return new TranslateHttpLoader(http, './assets/i18n/', '.json');
}

@NgModule({
    declarations: [AppComponent],
    entryComponents: [],
    imports: [
        BrowserModule,
        IonicModule.forRoot(),
        IonicStorageModule.forRoot(),
        AppRoutingModule,
        HttpClientModule,
        IonicSelectableModule,
        TranslateModule.forRoot({
            loader: {
                provide: TranslateLoader,
                useFactory: HttpLoaderFactory,
                deps: [HttpClient]
            }
        }),
    ],
    providers: [
        StatusBar,
        SplashScreen,
        Network,
        BackgroundMode,
        { provide: RouteReuseStrategy, useClass: IonicRouteStrategy },
        InAppBrowser,
        AndroidPermissions,
        AppVersion,
        Device,
        SQLite,
        ScreenOrientation,
        Camera,
        MediaCapture,
        WebView,
        File,
        FilePath,
        FileTransfer
    ],
    bootstrap: [AppComponent]
})
export class AppModule { }
