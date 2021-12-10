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

import { Component, OnInit } from '@angular/core';
import { HeaderService } from '../../services/header.service';
import { Application } from '../../Models/application.model';
import { AppConfig } from '../../app.config';
import { ErrorHandlerService } from '../../services/error-handler.service';
import { ApirequestService } from '../../services/apirequest.service';
import { AuthenticationService } from '../../services/authentication.service';
import { WebStorageService } from "../../services/webstorage.service"
import { RbacService } from "../../services/rbac.service"
import {  Rbacobject } from '../../Models/Filter.model';

@Component({
  selector: 'app-applications',
  templateUrl: './applications.component.html',
  styleUrls: ['./applications.component.css']
})
export class ApplicationsComponent implements OnInit {

  applications: Application[];
  logedinUserID: string;
  selectedApplication: string;
  public RbacApplivations: Rbacobject[] = [];
  constructor(
    private headerService: HeaderService,
    private errorHandlerService: ErrorHandlerService,
    private reqService: ApirequestService,
    private authService: AuthenticationService,
    private webStorageService: WebStorageService,
    private RbacService:RbacService
  ) {
    let decodedToken = this.authService.decodeAccessToken(this.authService.user.access_token);
    if (decodedToken != null) {
      this.GetRoleBaseddata(decodedToken);
      this.logedinUserID = decodedToken.IPUId;
    }

  }

  ngOnInit() {
    
  
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
  GetRoleBaseddata(decodedToken: any)
  {
   
    this.RbacService.GetRoleBaseddata(decodedToken,'GetRBACApplication')
    .then(
      (response: Rbacobject[]) => {
        this.RbacApplivations = response;
        this.getApplications();
      },
     
    )
   
  } 
 
  
  getApplications() {
   
    this.reqService.getRequest(AppConfig.settings.apiServices.find(x => x.serviceName == 'GetApplications').serviceUrl)
      .then(
        (applications) => {
          this.applications=[];
          let allapplivation = <Application[]>JSON.parse(applications);
     
           for (var i = 0; i < allapplivation.length; i++) {
            let length=   this.RbacApplivations.filter(x => x.objectname.toLowerCase() ==allapplivation[i].applicationname.toLowerCase()).length;
         
           if(length>0)
           {
            this.applications.push(allapplivation[i]);
           }
          }
          
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
