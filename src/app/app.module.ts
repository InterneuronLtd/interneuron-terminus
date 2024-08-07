//BEGIN LICENSE BLOCK 
//Interneuron Terminus

//Copyright(C) 2024  Interneuron Limited

//This program is free software: you can redistribute it and/or modify
//it under the terms of the GNU General Public License as published by
//the Free Software Foundation, either version 3 of the License, or
//(at your option) any later version.

//This program is distributed in the hope that it will be useful,
//but WITHOUT ANY WARRANTY; without even the implied warranty of
//MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.

//See the
//GNU General Public License for more details.

//You should have received a copy of the GNU General Public License
//along with this program.If not, see<http://www.gnu.org/licenses/>.
//END LICENSE BLOCK 
// Interneuron Terminus
// Copyright(C) 2023  Interneuron Holdings Ltd
// This program is free software: you can redistribute it and/or modify
// it under the terms of the GNU General Public License as published by
// the Free Software Foundation, either version 3 of the License, or
// (at your option) any later version.
// This program is distributed in the hope that it will be useful,
// but WITHOUT ANY WARRANTY; without even the implied warranty of
// MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.
// See the
// GNU General Public License for more details.
// You should have received a copy of the GNU General Public License
// along with this program.If not, see<http://www.gnu.org/licenses/>.

import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { HttpClientModule } from '@angular/common/http';
import { APP_INITIALIZER } from '@angular/core';
import { AppConfig } from './app.config';
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { HeaderModule } from './header/header.module';
import { HeaderService } from './services/header.service';
import { SidebarModule } from './sidebar/sidebar.module';
import { ContainerModule } from './container/container.module';
import { FooterModule } from './footer/footer.module';
import { OidcCallbackComponent } from './oidc-callback/oidc-callback.component';
import { ErrorHandlerService } from './services/error-handler.service';
import { OidcLogoutComponent } from './oidc-logout/oidc-logout.component';
import { UserIdleModule } from 'angular-user-idle';
import { AngularWebStorageModule } from 'angular-web-storage';
import { FormsModule } from '@angular/forms';
import { FontAwesomeModule} from '@fortawesome/angular-fontawesome';
import { library } from '@fortawesome/fontawesome-svg-core';
import { fas } from '@fortawesome/free-solid-svg-icons';
import {  } from '@fortawesome/fontawesome-svg-core';
import { ResizeService } from './services/resize.service';
import { BannerModule } from './banner/banner.module';
import { SecondaryModuleLoaderComponent } from './container/secondary-module-loader/secondary-module-loader.component'
import { ToastrModule } from 'ngx-toastr';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { WhatthreewordsLoaderDirective } from './directives/whatthreewords-loader.directive';
import { WhatThreeWordsComponent } from './what-three-words/what-three-words.component';

export function initializeApp(appConfig: AppConfig) {
  return () => appConfig.load();
}

@NgModule({
  declarations: [
    AppComponent,
    OidcCallbackComponent,
    OidcLogoutComponent,
    SecondaryModuleLoaderComponent,
    WhatthreewordsLoaderDirective,
    WhatThreeWordsComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    HeaderModule,
    SidebarModule,
    ContainerModule,
    FooterModule,
    HttpClientModule,
    UserIdleModule.forRoot({ idle: 3600, timeout: 5, ping: 5 }),
    FormsModule,
    AngularWebStorageModule,
    FontAwesomeModule,
    BannerModule,
    BrowserAnimationsModule,
    ToastrModule.forRoot({
      timeOut: 10000,
      preventDuplicates: true,
    })
  ],
  providers: [
    HeaderService,
    AppConfig,
    {
      provide: APP_INITIALIZER,
      useFactory: initializeApp,
      deps: [AppConfig],
      multi: true
    },
    ErrorHandlerService,
    ResizeService
  ],
  bootstrap: [AppComponent]
})
export class AppModule {
    constructor() {
      library.add(fas);
  }
 }