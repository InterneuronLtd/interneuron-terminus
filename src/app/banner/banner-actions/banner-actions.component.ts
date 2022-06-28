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
import { HttpClient } from '@angular/common/http';
import { Component, EventEmitter, Input, OnDestroy, OnInit, Output } from '@angular/core';
import { AppConfig } from 'src/app/app.config';
import { patientlist, personPatientlist } from '../../Models/Patientlist.model';
import { ApirequestService } from 'src/app/services/apirequest.service';
import { AuthenticationService } from 'src/app/services/authentication.service';
import { ErrorHandlerService } from 'src/app/services/error-handler.service';
import { HeaderService } from 'src/app/services/header.service';
import { SharedDataContainerService } from 'src/app/services/shared-data-container.service';
import { WebStorageService } from 'src/app/services/webstorage.service';
import { RbacService } from '../../services/rbac.service';
import { Subscription } from 'rxjs';
import { ResizeService } from 'src/app/services/resize.service';

@Component({
  selector: 'app-banner-actions',
  templateUrl: './banner-actions.component.html',
  styleUrls: ['./banner-actions.component.css']
})
export class BannerActionsComponent implements OnInit, OnDestroy {

  private resizeSubscription: Subscription;
  displayPort: string;
  selectedView: string = "collapsed";

  logedinUserID: string;
  personId: string;
  patientlistname: patientlist[] = [];
  showPatientdropdown: string = 'false';
  itemList = [];
  selectedItems = [];
  dropdownSettings = {};
  userId: string;
  postBody: string;
  showRemoveButton: boolean = false;

  constructor( private RbacService: RbacService, private webStorageService: WebStorageService, private httpClient: HttpClient, private reqService: ApirequestService, private headerService: HeaderService,
    private errorHandlerService: ErrorHandlerService, private authService: AuthenticationService, private sharedData: SharedDataContainerService, private resizeService: ResizeService) { }

    ngOnDestroy() {
      if (this.resizeSubscription) {
        this.resizeSubscription.unsubscribe();
      }
    }

  ngOnInit() {
    this.resizeSubscription = this.resizeService.displayPort$.subscribe((value:any) => {
      this.displayPort = value;
    });


  }



  // Input and Output Parameters
  @Input() set value(value: string) {
    if(value) {

      this.dropdownSettings = {
        singleSelection: false,
        text: "Select Patient List",
        selectAllText: 'Select All',
        unSelectAllText: 'UnSelect All',
        enableSearchFilter: false,
        classes: "myclass custom-class"
      };

      // let UserdecodedToken = this.authService.decodeAccessToken(this.authService.user.access_token);
      // if (UserdecodedToken != null) {
      //   this.logedinUserID = UserdecodedToken.IPUId;
      // }

      this.personId = value;
      this.getUserId();
      this.getPatientlists();
      this.checkForPatientInMyPatients();
    }
  };

  @Input() set view(view: string) {
    if(view) {
      this.selectedView = view;
    }
};


  @Output() returnActionsResponse: EventEmitter<boolean> = new EventEmitter();

  sendActionsResponse(value: boolean) {
  this.returnActionsResponse.emit(value);
}
  // EndInput and Output Parameters

  getPatientlists() {
    this.itemList = [];
    this.reqService.getRequest(AppConfig.settings.apiServices.find(x => x.serviceName == 'GetPatientList').serviceUrl)
      .then(
        (patientlist) => {
          this.patientlistname = <patientlist[]>JSON.parse(patientlist);
          for (let patientlistnameitem of this.patientlistname) {
            this.itemList.push({ "id": patientlistnameitem.patientlist_id, "itemName": patientlistnameitem.patientlistname });
          }
          this.getPatientlistsSelected();
        },
        error => this.errorHandlerService.handleError(error)
      )
  }

  getPatientlistsSelected() {
    this.selectedItems = [];
    let id: string = this.personId;
    this.reqService.getRequest(AppConfig.settings.apiServices.find(x => x.serviceName == 'GetPatientListByPerson_id').serviceUrl + id)
      .then(
        (personPatientlist) => {
          let personPatientlistitems = <personPatientlist[]>JSON.parse(personPatientlist);
          this.patientlistname.sort((a, b) => (a.patientlistname > b.patientlistname) ? 1 : -1)
          for (let i = 0; i < this.patientlistname.length; i++) {
            this.patientlistname[i].selected = false;
            for (let j = 0; j < personPatientlistitems.length; j++) {

              if (personPatientlistitems[j].patientlist_id == this.patientlistname[i].patientlist_id) {

                this.patientlistname[i].selected = true;

              }
              else {

              }
            }
          }
          // grouping selected tiems
          //  this.patientlistname.sort((a, b) => (a.selected > b.selected) ? -1 : 1)

        },
        error => this.errorHandlerService.handleError(error)
      )
  }

  onItemSelect(item: any) {
    this.postBody = `{"personpatientlist_id" : "` + item.patientlist_id + `|` + this.personId + `", "person_id" : "` + this.personId + `", "patientlist_id" : "` + item.patientlist_id + `"}`;

    this.reqService.postRequest(AppConfig.settings.apiServices.find(x => x.serviceName == 'Postpersonpatientlist').serviceUrl, this.postBody)
      .then(
        () => {
          this.headerService.PatientListUpdated.next("");
        }
      )
  }

  OnItemclick(item: any) {
    for (let i = 0; i < this.patientlistname.length; i++) {

      if (item.patientlist_id == this.patientlistname[i].patientlist_id) {
        if (item.selected == true) {
          this.patientlistname[i].selected = false;
          this.OnItemDeSelect(item);
        }
        else {
          this.patientlistname[i].selected = true;
          this.onItemSelect(item);
        }
      }

    }


  }
  OnItemDeSelect(item: any) {
    let id: string = item.patientlist_id + `|` + this.personId;

    this.reqService.deleteRequest(AppConfig.settings.apiServices.find(x => x.serviceName == 'DeletePatientList').serviceUrl + id)
      .then(
        () => {
          this.headerService.PatientListUpdated.next("");
        }
      )
  }

  getUserId() {
    let decodedToken = this.authService.decodeAccessToken(this.authService.user.access_token);
    if (decodedToken != null)
      this.userId = decodedToken.IPUId.replace("\\", "\\\\");
  }

  checkForPatientInMyPatients() {
    let id: string = this.userId.replace("\\\\", "\\") + '|' + this.personId;

    let data: any
    this.reqService.getRequest(AppConfig.settings.apiServices.find(x => x.serviceName == 'CheckMyPatient').serviceUrl + id)
      .then(
        (response) => {
          data = JSON.parse(response);

          if (Object.keys(data).length === 0 && data.constructor === Object) {
            this.showRemoveButton = false;
          }
          else {
            this.showRemoveButton = true;
          }
        }
      );
  }

  insertPatientIntoMyPatients() {
    this.postBody = `{"mypatients_id" : "` + this.userId + `|` + this.personId + `", "userid" : "` + this.userId + `", "person_id" : "` + this.personId + `"}`;

    this.reqService.postRequest(AppConfig.settings.apiServices.find(x => x.serviceName == 'PostMyPatients').serviceUrl, this.postBody)
      .then(
        () => {
          this.headerService.changedMyPatients.next(true);
          this.showRemoveButton = true;
        }
      )
  }

  removePatientFromMyPatients() {
    let id: string = this.userId.replace("\\\\", "\\") + '|' + this.personId;

    this.reqService.deleteRequest(AppConfig.settings.apiServices.find(x => x.serviceName == 'DeleteMyPatient').serviceUrl + id)
      .then(
        () => {
          this.headerService.changedMyPatients.next(true);
          this.showRemoveButton = false;
        }
      )
  }




}
