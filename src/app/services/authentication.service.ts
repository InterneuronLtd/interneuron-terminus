//BEGIN LICENSE BLOCK 
//Interneuron Terminus

//Copyright(C) 2025  Interneuron Limited

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

import { Injectable } from '@angular/core';
import { UserManager, User } from 'oidc-client';
import { AppConfig } from '../app.config';
import * as jwt_decode from "jwt-decode";

@Injectable({
  providedIn: 'root'
})
export class AuthenticationService {
  manager: UserManager;
  user: User = null;
  onLogoutCallback: () => void | null;

  constructor() {
    //var settings = {
    //  authority: 'https://synapseidentityserver.dev.interneuron.io',
    //  client_id: 'terminus-framework',
    //  client_secret: 'secret',
    //  redirect_uri: 'http://localhost:4200/oidc-callback',
    //  post_logout_redirect_uri: 'http://localhost:4200/oidc-logout?oidccallback=true',
    //  response_type: "id_token token",
    //  scope: "openid profile",
    //  automaticSilentRenew: true,
    //  silent_redirect_uri: 'http://localhost:4200/assets/silent-refresh.html',
    //  accessTokenExpiringNotificationTime: 60
    //};

    var settings = AppConfig.settings.OIDCConfig;
    this.manager = new UserManager(settings);

    this.manager.getUser().then(user => {
      this.user = user;
    }).catch(err => {
      //console.log(err);
    });

    this.manager.events.addAccessTokenExpired(() => { this.logout() })

    this.manager.events.addUserSessionChanged(() => {
      if (this.onLogoutCallback) {
        try {
          this.onLogoutCallback();
        }
        catch { }
      }
    });

  }
  decodeAccessToken(token: string): any {
    try {
      return jwt_decode(token);
    }
    catch (Error) {
      return null;
    }
  }
  public getUser(): Promise<User> {
    return this.manager.getUser();
  }

  public login(): Promise<void> {
    return this.manager.signinRedirect();
  }

  public renewToken(): Promise<User> {
    return this.manager.signinSilent();
  }

  public logout(): Promise<void> {
    const signOutRedirection = this.manager.signoutRedirect();
    if (this.onLogoutCallback) {
      try {
        this.onLogoutCallback();
      }
      catch { }
    }
    return signOutRedirection;
  }

  completeAuthentication(): Promise<void> {
    return this.manager.signinRedirectCallback().then(user => {
      this.user = user;
    }).catch(e => {
      console.log(e);
      window.location.href = window.location.origin + "/oidc-logout"
    }
    );
  }

  //getAuthorizationHeaderValue(): string {
  //  return `${this.user.token_type} ${this.user.access_token}`;
  //}

  //getClaims(): any {
  //  return this.user.profile;
  //}

  //isLoggedIn(): boolean {
  //  return this.user != null && !this.user.expired;
  //}

  //getClientSettings(): UserManagerSettings {
  //  return {
  //    authority: 'https://demo.identityserver.io/', //'https://synapseidentityserver.dev.interneuron.io',
  //    client_id: 'implicit',//terminus-framework',
  //    client_secret: 'secret',
  //    redirect_uri: 'http://localhost:4200/oidc-callback',
  //    post_logout_redirect_uri: 'http://localhost:4200/oidc-logout',
  //    response_type: "id_token token",
  //    scope: "openid profile email api"

  //  };
  //}

}
