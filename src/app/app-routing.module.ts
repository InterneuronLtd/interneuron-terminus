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

import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { OidcCallbackComponent } from './oidc-callback/oidc-callback.component';
import { AppComponent } from './app.component';
import { AuthGuardService } from './services/auth-guard.service';
import { OidcLogoutComponent } from './oidc-logout/oidc-logout.component';

//const routes: Routes = [
//  {
//    path: '',
//    children: [],

//  },
//  {
//    path: 'protected',
//    component: AppComponent,
//    canActivate: [AuthGuardService]
//  },

//  {
//    path: 'oidc-callback',
//    component: OidcCallbackComponent
//  }

//];

const routes: Routes = [
  {
    path: '', canActivate: [AuthGuardService],
    children: []
  },
  {
    path: 'oidc-callback',
    component: OidcCallbackComponent
  },
  {
    path: 'oidc-logout',
    component: OidcLogoutComponent
  }
];



@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
