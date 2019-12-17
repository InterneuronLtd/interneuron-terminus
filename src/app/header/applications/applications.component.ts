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
import { HeaderService } from '../../services/header.service';
import { Application } from '../../Models/application.model';
import { AppConfig } from '../../app.config';
import { ErrorHandlerService } from '../../services/error-handler.service';
import { ApirequestService } from '../../services/apirequest.service';
import { AuthenticationService } from '../../services/authentication.service';
import { WebStorageService } from "../../services/webstorage.service"
import * as jwt_decode from "jwt-decode";
@Component({
  selector: 'app-applications',
  templateUrl: './applications.component.html',
  styleUrls: ['./applications.component.css']
})
export class ApplicationsComponent implements OnInit {

  applications: Application[];
  logedinUserID: string;
  selectedApplication: string;

  constructor(
    private headerService: HeaderService,
    private errorHandlerService: ErrorHandlerService,
    private reqService: ApirequestService,
    private authService: AuthenticationService,
    private webStorageService: WebStorageService
  ) { }

  ngOnInit() {
    let decodedToken = this.decodeAccessToken(this.authService.user.access_token);
    if (decodedToken != null) {

      this.logedinUserID = decodedToken.IPUId;
    }
    this.getApplications();
  }
  decodeAccessToken(token: string): any {
    try {
      return jwt_decode(token);
    }
    catch (Error) {
      return null;
    }
  }
  appSelection(application: Application) {
    if (application) {
      if (document.getElementById('appDropdownMenu').innerHTML != application.applicationname) {
        document.getElementById('appDropdownMenu').innerHTML = application.applicationname;
        document.getElementById('listDropdownMenu').innerHTML = 'Lists';
        this.headerService.applicationId.next(application.application_id);
        this.webStorageService.setLocalStorageItem("Terminus:" + this.logedinUserID + ":Application", application);
      }
    }
  }

  getApplications() {
    this.reqService.getRequest(AppConfig.settings.apiServices.find(x => x.serviceName == 'GetApplications').serviceUrl)
      .then(
        (applications) => {
          this.applications = <Application[]>JSON.parse(applications);
          if (this.applications.length > 0) {
            if (this.webStorageService.getLocalStorageItem("Terminus:" + this.logedinUserID + ":Application") == null) {//check local storage is null

              this.appSelection(this.applications[0]);
              this.selectedApplication = this.applications[0].applicationname;
              this.webStorageService.setLocalStorageItem("Terminus:" + this.logedinUserID + ":Application", this.applications[0]);
            }
            else {
              let checkApplicationExits = this.applications.find(x => x.application_id == this.webStorageService.getLocalStorageItem("Terminus:" + this.logedinUserID + ":Application").application_id);
              //if local storage is not null check that value is present in current dropdown
              if (checkApplicationExits == null) {
                this.appSelection(this.applications[0]);
                this.selectedApplication = this.applications[0].applicationname;
                this.webStorageService.setLocalStorageItem("Terminus:" + this.logedinUserID + ":Application", this.applications[0]);
              }
              else {// load from local storage
                this.selectedApplication = this.webStorageService.getLocalStorageItem("Terminus:" + this.logedinUserID + ":Application").applicationname;
                this.appSelection(this.webStorageService.getLocalStorageItem("Terminus:" + this.logedinUserID + ":Application"));
              }
            }
          }
        },
        error => this.errorHandlerService.handleError(error)
      )
  }
}
