//BEGIN LICENSE BLOCK 
//Interneuron Terminus

//Copyright(C) 2022  Interneuron CIC

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


import { Component, OnInit } from '@angular/core';
import { AuthenticationService } from '..//../services/authentication.service';
import * as jwt_decode from "jwt-decode";
import { UserIdleService } from 'angular-user-idle';
import { Router } from '@angular/router';
import { AppConfig } from '../../app.config';

@Component({
  selector: 'app-appnav',
  templateUrl: './appnav.component.html',
  styleUrls: ['./appnav.component.css']
})
export class AppnavComponent implements OnInit {

  username: string = "";
  constructor(private authService: AuthenticationService, private router: Router, private userIdle: UserIdleService) {
    if (performance.navigation.type != 1) {
      location.reload();
    }
  }

  ngOnInit() {
    //console.log('here in header');
    let decodedToken = this.authService.decodeAccessToken(this.authService.user.access_token);
    if (decodedToken != null)
      this.username = decodedToken.name ? (Array.isArray(decodedToken.name) ? decodedToken.name[0] : decodedToken.name) : decodedToken.IPUId;

    //set uer idle session timeout settings from config.
    this.userIdle.setConfigValues(AppConfig.settings.userIdle);
    this.userIdle.startWatching();
    this.userIdle.onTimerStart().subscribe(
      //(count) => console.log(count)
    );
    this.userIdle.onTimeout().subscribe(() => { if (this.authService.user) this.authService.logout(); });

  }


  oidcLogout() {
    this.authService.logout();
  }

}
