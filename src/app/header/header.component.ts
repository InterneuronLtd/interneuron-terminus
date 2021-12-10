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


import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { AuthenticationService } from '../services/authentication.service';
import * as jwt_decode from "jwt-decode";
import { isArray } from 'util';
import { AppConfig } from '../app.config';
import { UserIdleService } from 'angular-user-idle';
import { Router } from '@angular/router';
import * as $ from 'jquery';
import { RbacService } from "../services/rbac.service"
import { HeaderService } from '../services/header.service';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.css']
})


export class HeaderComponent implements OnInit {

  timeout: number = 0;
  showTimeoutModal: boolean = false;
  @ViewChild('openTimeoutModal') openTimeoutModalButton: ElementRef;
  
  username: string = "";
  headertemplatecolour:string="#f6f2f2"
  constructor(private RbacService:RbacService, private authService: AuthenticationService, private router: Router, private userIdle: UserIdleService, private headerService: HeaderService) {
    if (performance.navigation.type != 1) {
      location.reload(true);
    }

    this.headerService.collapsePatientList.subscribe(() => {
      if($('body').is('.sidebar-show')){
        this.togglePatientList();
      }
    });
  }

  ngOnInit() {
 
    if(typeof AppConfig.settings.currentEnvironment !== 'undefined')
    {
      this.headertemplatecolour=AppConfig.settings.ENVIdentificationTemplate.find(x => x.environment == AppConfig.settings.currentEnvironment).colour;
    }
  
    let decodedToken = this.authService.decodeAccessToken(this.authService.user.access_token);
    if (decodedToken != null){
    this.RbacService.GetRoleBasedAction(decodedToken);
      this.username = decodedToken.name ? (isArray(decodedToken.name) ? decodedToken.name[0] : decodedToken.name) : decodedToken.IPUId;
    }
    //set uer idle session timeout settings from config.
    this.userIdle.stopWatching();
    this.userIdle.setConfigValues(AppConfig.settings.userIdle);
    this.userIdle.startWatching();
    this.userIdle.onTimerStart().subscribe(
      (counter) => {
        if(!this.showTimeoutModal){
          this.openTimeoutModalButton.nativeElement.click();
          this.showTimeoutModal = true;
        }
        this.timeout = AppConfig.settings.userIdle.timeout - counter;
      }
    );
    
    this.userIdle.onTimeout().subscribe((count) => { 
      
      if (this.authService.user) {
        this.authService.logout();
      } 
    
    
    });

  }

 
  oidcLogout() {
    this.authService.logout();
  }

  continueSession(){
    this.userIdle.resetTimer();
    this.showTimeoutModal = false;
  }

  togglePatientList(){
    if ($('body').is('.sidebar-show')) {
      $("body").removeClass("sidebar-show");
    }
    else {
      $("body").addClass("sidebar-show");
    }
  }
}
