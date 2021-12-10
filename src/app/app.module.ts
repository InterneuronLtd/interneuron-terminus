//BEGIN LICENSE BLOCK 
//Interneuron Terminus

//Copyright(C) 2021  Interneuron CIC

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
import { PatientBannerComponent } from './container/patient-banner/patient-banner.component';
import { ModuleListComponent } from './container/module-list/module-list.component';
import { FormsModule } from '@angular/forms';
import { FontAwesomeModule} from '@fortawesome/angular-fontawesome';
import { library } from '@fortawesome/fontawesome-svg-core';
import { fas } from '@fortawesome/free-solid-svg-icons';
import {  } from '@fortawesome/fontawesome-svg-core';
import { BannerComponent } from './banner/banner.component';
import { MainDemographicsComponent } from './banner/main-demographics/main-demographics.component';
import { MainEncounterComponent } from './banner/main-encounter/main-encounter.component';
import { MainAllergiesComponent } from './banner/main-allergies/main-allergies.component';
import { MainBadgesComponent } from './banner/main-badges/main-badges.component';
import { MainWarningsComponent } from './banner/main-warnings/main-warnings.component';
import { BannerActionsComponent } from './banner/banner-actions/banner-actions.component';
import { ResizeService } from './services/resize.service';

export function initializeApp(appConfig: AppConfig) {
  return () => appConfig.load();
}

@NgModule({
  declarations: [
    AppComponent,
    OidcCallbackComponent,
    OidcLogoutComponent,
    PatientBannerComponent,
    ModuleListComponent,
    BannerComponent,
    MainDemographicsComponent,
    MainEncounterComponent,
    MainAllergiesComponent,
    MainBadgesComponent,
    MainWarningsComponent,
    BannerActionsComponent
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
    FontAwesomeModule
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
