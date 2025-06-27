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
import { HttpClient, HttpHeaders, HttpErrorResponse } from '@angular/common/http';
import { AuthenticationService } from './authentication.service';
import { Router } from '@angular/router';
import { firstValueFrom } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ApirequestService {

  constructor(private httpClient: HttpClient, private authService: AuthenticationService, private router: Router) { }

  public getRequest(uri: string): Promise<any> {
    return this.authService.getUser().then(user => {
      if (user && !user.expired) {
        return this.callApiGet(user.access_token, uri);
      }
      else if (user) {
        return this.authService.renewToken().then(user => {
          return this.callApiGet(user.access_token, uri);
        });
      }
      else {
        //console.log("ApiRequestService: request failed as user is not logged in: redirecting to logout");
        this.router.navigate(['oidc-logout']);
      }
    });
  }

  public postRequest(uri: string, body: any): Promise<any> {
    return this.authService.getUser().then(user => {
      if (user && !user.expired) {
        return this.callApiPost(user.access_token, uri, body);
      }
      else if (user) {
        return this.authService.renewToken().then(user => {
          return this.callApiPost(user.access_token, uri, body);
        });
      }
      else {
        //console.log("ApiRequestService: request failed as user is not logged in: redirecting to logout");
        this.router.navigate(['oidc-logout']);
      }
    });
  }

  public deleteRequest(uri: string): Promise<any> {
    return this.authService.getUser().then(user => {
      if (user && !user.expired) {
        return this.callApiDelete(user.access_token, uri);
      }
      else if (user) {
        return this.authService.renewToken().then(user => {
          return this.callApiDelete(user.access_token, uri);
        });
      }
      else {
        //console.log("ApiRequestService: request failed as user is not logged in: redirecting to logout");
        this.router.navigate(['oidc-logout']);
      }
    });
  }

  public getDocumentByPost(uri: string, body: any): Promise<any> {
    return this.authService.getUser().then(user => {
      if (user && !user.expired) {
        return this.callApiGetDocumentByPost(user.access_token, uri, body);
      }
      else if (user) {
        return this.authService.renewToken().then(user => {
          return this.callApiGetDocumentByPost(user.access_token, uri, body);
        });
      }
      else {
        //console.log("ApiRequestService: request failed as user is not logged in: redirecting to logout");
        this.router.navigate(['oidc-logout']);
      }
    });
  }


  private callApiGet(token: string, uri: string) {
    let headers = new HttpHeaders({
      'Accept': 'application/json',
      'Authorization': 'Bearer ' + token
    });

    return firstValueFrom(this.httpClient.get(uri, { headers: headers }))
      .catch((result: HttpErrorResponse) => {
        if (result.status === 401) {

        }
        throw result;
      });
  }

  private callApiPost(token: string, uri: string, body: string) {
    let headers = new HttpHeaders({
      'Content-Type': 'application/json; charset=utf-8',
      'Authorization': 'Bearer ' + token
    });

    return firstValueFrom(this.httpClient.post(uri, body, { headers: headers }))
      .catch((result: HttpErrorResponse) => {
        if (result.status === 401) {

        }
        throw result;
      });
  }

  private callApiDelete(token: string, uri: string) {
    let headers = new HttpHeaders({
      'Accept': 'application/json',
      'Authorization': 'Bearer ' + token
    });

    return firstValueFrom(this.httpClient.delete(uri, { headers: headers }))
      .catch((result: HttpErrorResponse) => {
        if (result.status === 401) {

        }
        throw result;
      });
  }

  private callApiGetDocumentByPost(token: string, uri: string, body: string) {

    let headers = new HttpHeaders({
      'Content-Type': 'application/json; charset=utf-8',
      'Authorization': 'Bearer ' + token
    });

    return firstValueFrom(this.httpClient.post(uri, body, { headers: headers, responseType: 'blob' })
    ).catch((result: HttpErrorResponse) => {
      console.log(result
      );
      if (result.status === 401) {

      }
      throw result;
    });
  }

}
