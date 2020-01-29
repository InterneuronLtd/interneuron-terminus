// Interneuron Terminus
// Copyright(C) 2019  Interneuron CIC
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
import { PatientBannerComponent } from './container/patient-banner/patient-banner.component';
import { ModuleListComponent } from './container/module-list/module-list.component';
import { FormsModule } from '@angular/forms';

export function initializeApp(appConfig: AppConfig) {
  return () => appConfig.load();
}

@NgModule({
  declarations: [
    AppComponent,
    OidcCallbackComponent,
    OidcLogoutComponent,
    PatientBannerComponent,
    ModuleListComponent
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
    AngularWebStorageModule
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
    ErrorHandlerService
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
