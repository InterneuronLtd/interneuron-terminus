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

import { Component, OnInit } from '@angular/core';
import { AuthenticationService } from '../services/authentication.service';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-oidc-logout',
  templateUrl: './oidc-logout.component.html',
  styleUrls: ['./oidc-logout.component.css']
})
export class OidcLogoutComponent implements OnInit {

  constructor(private authService: AuthenticationService, private route: ActivatedRoute) { }
  callbackParam: string;
  logoutMessage: string;
  ngOnInit() {
    if (this.authService.user)
      this.authService.logout();

    this.route.queryParamMap.subscribe(queryParams => {
      this.callbackParam = queryParams.get("oidccallback")
    })
    if (this.callbackParam != "true") {
      this.logoutMessage = "Please wait while we are logging you out.";

    }
    else
      this.logoutMessage = "Your session has ended, please click on the link below to login again.";
  }

}
