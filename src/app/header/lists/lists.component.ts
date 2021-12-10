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


import { Component, OnInit, OnDestroy } from '@angular/core';
import { HeaderService } from '../../services/header.service';
import { ErrorHandlerService } from '../../services/error-handler.service';
import { ApplicationList } from '../../Models/applicationlist.model';
import { AppConfig } from '../../app.config';
import { ApirequestService } from '../../services/apirequest.service';
import { AuthenticationService } from '../../services/authentication.service';
import { WebStorageService } from "../../services/webstorage.service";
import { RbacService } from "../../services/rbac.service";
import * as jwt_decode from "jwt-decode";
import { Rbacobject } from '../../Models/Filter.model';


@Component({
  selector: 'app-lists',
  templateUrl: './lists.component.html',
  styleUrls: ['./lists.component.css']
})
export class ListsComponent implements OnInit, OnDestroy {

  applicationLists: ApplicationList[];
  applicationId: string;
  logedinUserID: string;
  selectedList: string;
  RbacList: Rbacobject[] = [];
  constructor(
    private headerService: HeaderService,
    private RbacService:RbacService,
    private errorHandlerService: ErrorHandlerService,
    private reqService: ApirequestService,
    private authService: AuthenticationService,
    private webStorageService: WebStorageService
  ) {

  }

  ngOnInit() {
    let decodedToken = this.authService.decodeAccessToken(this.authService.user.access_token);
    if (decodedToken != null) {
      this.GetRoleBaseddata(decodedToken);
      this.logedinUserID = decodedToken.IPUId;
    }
    this.getApplicationId();
  }
  decodeAccessToken(token: string): any {
    try {
      return jwt_decode(token);
    }
    catch (Error) {
      return null;
    }
  }
  GetRoleBaseddata(decodedToken: any)
  {
    this.RbacService.GetRoleBaseddata(decodedToken,'GetRBAClist')
    .then(
      (response: Rbacobject[]) => {
        this.RbacList = response;
      },
     
    )
    
  } 

  getApplicationId() {
    this.headerService.applicationId.subscribe(
      (applicationId: string) => {
        this.applicationId = applicationId;
        this.getApplicationList(this.applicationId);
      },
      error => this.errorHandlerService.handleError(error) 
    )
  }

  getApplicationList(applicationId: string) {
    this.applicationLists=[];
    this.reqService.getRequest(AppConfig.settings.apiServices.find(x => x.serviceName == 'GetApplicationList').serviceUrl)
      .then(
        (applicationLists) => {
          this.applicationLists = [];
          let AllapplicationLists = <ApplicationList[]>JSON.parse(applicationLists);
          AllapplicationLists =AllapplicationLists.filter(x => x.application_id === applicationId);
         
        
           
           for (var i = 0; i < AllapplicationLists.length; i++) {
            let length=   this.RbacList.filter(x => x.objectname.toLowerCase() ==AllapplicationLists[i].listname.toLowerCase()).length;
         
           if(length>0)
           {
            this.applicationLists.push(AllapplicationLists[i]);
           }
          }
          if (this.applicationLists.length > 0) {
            if (this.webStorageService.getLocalStorageItem("Terminus:" + this.logedinUserID + ":ListType") == null) {

              this.appListSelection(this.applicationLists[0]);
              this.selectedList = this.applicationLists[0].listname;
              this.webStorageService.setLocalStorageItem("Terminus:" + this.logedinUserID + ":ListType", this.applicationLists[0]);
            }
            else {
              let checkApplicationExits = this.applicationLists.find(x => x.applicationlist_id == this.webStorageService.getLocalStorageItem("Terminus:" + this.logedinUserID + ":ListType").applicationlist_id);

              if (checkApplicationExits == undefined) {
                this.appListSelection(this.applicationLists[0]);
                this.selectedList = this.applicationLists[0].listname;
                this.webStorageService.setLocalStorageItem("Terminus:" + this.logedinUserID + ":ListType", this.applicationLists[0]);
              }
              else {
                this.appListSelection(this.webStorageService.getLocalStorageItem("Terminus:" + this.logedinUserID + ":ListType"));
                this.selectedList = this.webStorageService.getLocalStorageItem("Terminus:" + this.logedinUserID + ":ListType").listname;
              }
            }
          }
          else
          {
            this.headerService.selectedApplicationPatientlist.next("");
            this.headerService.selectedApplicationPatientlistName.next("");
          }
        },
        error => this.errorHandlerService.handleError(error)
      );
  }

  appListSelection(applicationList: ApplicationList) {
    if (applicationList) {
      document.getElementById('listDropdownMenu').innerHTML = applicationList.listname;  //== 'eace71d2-606d-45c4-8d47-0319894973d1' ? 'Current Inpatients' : '';
      this.headerService.applicationListId.next(applicationList.applicationlist_id);
      this.headerService.wardPatientTabularData.next([]);//Empty Sidebar list before  geting new list
      this.selectedList = applicationList.listname;
      //Load side bar patient list based on current patient
      this.headerService.selectedApplicationPatientlist.next(applicationList.listid);
      this.headerService.selectedApplicationPatientlistName.next(applicationList.listname);
      this.webStorageService.setLocalStorageItem("Terminus:" + this.logedinUserID + ":ListType", applicationList);
    }
  }

  ngOnDestroy() {
    this.headerService.applicationId.unsubscribe();
  }
}
