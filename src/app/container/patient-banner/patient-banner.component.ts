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

import { Component, OnInit, OnDestroy } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import * as jwt_decode from "jwt-decode";
import { patientlist, personPatientlist } from '../../Models/Patientlist.model';
import { PatientBanner, Column, MainBannerData } from '../../Models/patientBanner.model';
import { PatientBannerColumnLabelData } from '../../Models/patientBannerColumnLabelData.model';
import { ApirequestService } from '../../services/apirequest.service';
import { ErrorHandlerService } from '../../services/error-handler.service';
import { HeaderService } from '../../services/header.service';
import { AppConfig } from '../../app.config';
import { AuthenticationService } from '../../services/authentication.service';
import { WebStorageService } from "../../services/webstorage.service";


@Component({
  host: {
    '(document:click)': 'onClickCustomdropdown($event)',
  },
  selector: 'app-patient-banner',
  templateUrl: './patient-banner.component.html',
  styleUrls: ['./patient-banner.component.css']
})
export class PatientBannerComponent implements OnInit, OnDestroy {

  patientlistname: patientlist[] = [];

  showPatientdropdown: string = 'false';

  itemList = [];

  selectedItems = [];

  dropdownSettings = {};

  logedinUserID: string;

  patientBanner: PatientBanner;

  leftSideTopRow: string;

  rightSideTopRowFirstLabel: string;

  rightSideTopRowFirstValue: string;

  rightSideTopRowMiddleLabel: string;

  rightSideTopRowMiddleValue: string;

  rightSideTopRowLastLabel: string;

  rightSideTopRowLastValue: string;

  leftSideBottomRowFirstLabel: string;

  leftSideBottomRowFirstValue: string;

  leftSideBottomRowMiddleLabel: string;

  leftSideBottomRowMiddleValue: string;

  leftSideBottomRowLastLabel: string;

  leftSideBottomRowLastValue: string;

  extLeftSideBottomRowFirstLabel: string;

  extLeftSideBottomRowFirstValue: string;

  extLeftSideBottomRowLastLabel: string;

  extLeftSideBottomRowLastValue: string;

  rightSideBottomRowFirstLabel: string;

  rightSideBottomRowFirstValue: string;

  rightSideBottomRowMiddleLabel: string;

  rightSideBottomRowMiddleValue: string;

  rightSideBottomRowLastLabel: string;

  rightSideBottomRowLastValue: string;

  columns: string;

  personId: string;

  postBody: string;

  userId: string;

  showRemoveButton: boolean = false;

  showPatientBanner: boolean = false;

  constructor(private webStorageService: WebStorageService, private httpClient: HttpClient, private reqService: ApirequestService, private headerService: HeaderService, private errorHandlerService: ErrorHandlerService, private authService: AuthenticationService) {

    this.headerService.myPatientSelected.subscribe(
      (myPatientSelected: string) => {
        this.webStorageService.setLocalStorageItem("Terminus:" + this.logedinUserID + ":Patient", myPatientSelected);
        this.getPatientlists();
        this.loadBanner(myPatientSelected);
      },
      error => this.errorHandlerService.handleError(error)
    );

    this.headerService.loadPatientBanner.subscribe(
      (myPatientSelected: string) => {

        this.loadBanner(myPatientSelected);
      },
      error => this.errorHandlerService.handleError(error)
    );
  }

  onClickCustomdropdown(event) {
    console.log(event.target.parentNode.id);
    if (event.target.parentNode.parentNode.id == "ddlPatientlistCustomDropdown" || event.target.id == "btnpatientCustomDropdown" || event.target.parentNode.id == "btnpatientCustomDropdown" || event.target.parentNode.parentNode.parentNode.id == "ddlPatientlistCustomDropdown") {
      if (event.target.id == "btnpatientCustomDropdown" || event.target.parentNode.id == "btnpatientCustomDropdown") {
        if (this.showPatientdropdown == 'true') {
          this.showPatientdropdown = 'false'
        }
        else {
          this.showPatientdropdown = 'true'
        }
      }
      else {
        this.showPatientdropdown = 'true'
      }

    }
    else {
      this.showPatientdropdown = 'false'
    }

  }
  loadBanner(personId: string) {
    this.showPatientBanner = false;

    this.leftSideTopRow = "";
    this.rightSideTopRowFirstLabel = "";
    this.rightSideTopRowFirstValue = "";
    this.rightSideTopRowMiddleLabel = "";
    this.rightSideTopRowMiddleValue = "";
    this.rightSideTopRowLastLabel = "";
    this.rightSideTopRowLastValue = "";
    this.leftSideBottomRowFirstLabel = "";
    this.leftSideBottomRowFirstValue = "";
    this.leftSideBottomRowMiddleLabel = "";
    this.leftSideBottomRowMiddleValue = "";
    this.leftSideBottomRowLastLabel = "";
    this.leftSideBottomRowLastValue = "";
    this.extLeftSideBottomRowFirstLabel = "";
    this.extLeftSideBottomRowFirstValue = "";
    this.extLeftSideBottomRowLastLabel = "";
    this.extLeftSideBottomRowLastValue = "";
    this.rightSideBottomRowFirstLabel = "";
    this.rightSideBottomRowFirstValue = "";
    this.rightSideBottomRowMiddleLabel = "";
    this.rightSideBottomRowMiddleValue = "";
    this.rightSideBottomRowLastLabel = "";
    this.rightSideBottomRowLastValue = "";

    this.personId = personId;
    this.getJSON();
    this.getUserId();
    this.checkForPatientInMyPatients();
  }

  ngOnInit() {
    this.dropdownSettings = {
      singleSelection: false,
      text: "Select Patient List",
      selectAllText: 'Select All',
      unSelectAllText: 'UnSelect All',
      enableSearchFilter: false,
      classes: "myclass custom-class"
    };

    let UserdecodedToken = this.decodeAccessToken(this.authService.user.access_token);
    if (UserdecodedToken != null) {
      this.logedinUserID = UserdecodedToken.IPUId;
    }
  }


  ngOnDestroy() {
    this.headerService.myPatientSelected.unsubscribe();
  }



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
    let decodedToken = this.decodeAccessToken(this.authService.user.access_token);
    if (decodedToken != null)
      this.userId = decodedToken.IPUId.replace("\\", "\\\\");
  }

  decodeAccessToken(token: string): any {
    try {
      return jwt_decode(token);
    }
    catch (Error) {
      return null;
    }
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

  getJSON() {
    this.httpClient.get("./assets/config/patientBanner.json")
      .subscribe(
        (data) => {
          this.patientBanner = <PatientBanner>data;
          this.generateMainPatientBanner();
          this.generateColumnsOfPatientBanner();
        }
      );
  }

  //Generate main banner
  async generateMainPatientBanner() {
    let mainBannerResponse: any;

    if (this.patientBanner.mainBanner.endpointUri != "") {
      await this.reqService.getRequest(this.patientBanner.mainBanner.endpointUri + this.personId)
        .then(
          (response) => {
            mainBannerResponse = JSON.parse(response);

            if (mainBannerResponse && mainBannerResponse.length > 0) {
              this.showPatientBanner = true;
            }
            else {
              this.showPatientBanner = false;
            }
          }
        );
    }

    let mainBannerData: MainBannerData = this.patientBanner.mainBanner.data;

    //Top Row Start
    //Left Side Top
    if (mainBannerData.leftSideTopRow.endpointUri == "") {
      if (mainBannerResponse.length > 0 && mainBannerResponse[0][mainBannerData.leftSideTopRow.dataColumn]) {
        this.leftSideTopRow = mainBannerResponse[0][mainBannerData.leftSideTopRow.dataColumn];
      }
      else {
        this.leftSideTopRow = " ";
      }
    }
    else {
      let result: any;
      await this.reqService.getRequest(mainBannerData.leftSideTopRow.endpointUri + this.personId)
        .then(
          (response) => {
            result = JSON.parse(response);

            if (result && result.length > 0) {
              this.showPatientBanner = true;
            }
            else {
              this.showPatientBanner = false;
            }
          }
        );
      if (result.length > 0 && result[0][mainBannerData.leftSideTopRow.dataColumn]) {
        this.leftSideTopRow = result[0][mainBannerData.leftSideTopRow.dataColumn];
      }
      else {
        this.leftSideTopRow = " ";
      }
    }

    //Right Side Top First
    this.rightSideTopRowFirstLabel = mainBannerData.rightSideTopRowFirst.label;

    if (mainBannerData.rightSideTopRowFirst.endpointUri == "") {
      if (mainBannerResponse.length > 0 && mainBannerResponse[0][mainBannerData.rightSideTopRowFirst.dataColumn]) {
        this.rightSideTopRowFirstValue = mainBannerResponse[0][mainBannerData.rightSideTopRowFirst.dataColumn];
      }
      else {
        this.rightSideTopRowFirstValue = " ";
      }
    }
    else {
      let result: any;
      await this.reqService.getRequest(mainBannerData.rightSideTopRowFirst.endpointUri + this.personId)
        .then(
          (response) => {
            result = JSON.parse(response);
          }
        );
      if (result.length > 0 && result[0][mainBannerData.rightSideTopRowFirst.dataColumn]) {
        this.rightSideTopRowFirstValue = result[0][mainBannerData.rightSideTopRowFirst.dataColumn];
      }
      else {
        this.rightSideTopRowFirstValue = " ";
      }

    }

    //Right Side Top Middle
    this.rightSideTopRowMiddleLabel = mainBannerData.rightSideTopRowMiddle.label;

    if (mainBannerData.rightSideTopRowMiddle.endpointUri == "") {
      if (mainBannerResponse.length > 0 && mainBannerResponse[0][mainBannerData.rightSideTopRowMiddle.dataColumn]) {
        this.rightSideTopRowMiddleValue = mainBannerResponse[0][mainBannerData.rightSideTopRowMiddle.dataColumn];
      }
      else {
        this.rightSideTopRowMiddleValue = " ";
      }

    }
    else {
      let result: any;
      await this.reqService.getRequest(mainBannerData.rightSideTopRowMiddle.endpointUri + this.personId)
        .then(
          (response) => {
            result = JSON.parse(response);
          }
        );
      if (result.length > 0 && result[0][mainBannerData.rightSideTopRowMiddle.dataColumn]) {
        this.rightSideTopRowMiddleValue = result[0][mainBannerData.rightSideTopRowMiddle.dataColumn];
      }
      else {
        this.rightSideTopRowMiddleValue = " ";
      }

    }

    //Right Side Top Last
    this.rightSideTopRowLastLabel = mainBannerData.rightSideTopRowLast.label;

    if (mainBannerData.rightSideTopRowLast.endpointUri == "") {
      if (mainBannerResponse.length > 0 && mainBannerResponse[0][mainBannerData.rightSideTopRowLast.dataColumn]) {
        this.rightSideTopRowLastValue = mainBannerResponse[0][mainBannerData.rightSideTopRowLast.dataColumn];
      }
      else {
        this.rightSideTopRowLastValue = " ";
      }

    }
    else {
      let result: any;
      await this.reqService.getRequest(mainBannerData.rightSideTopRowLast.endpointUri + this.personId)
        .then(
          (response) => {
            result = JSON.parse(response);
          }
        );
      if (result.length > 0 && result[0][mainBannerData.rightSideTopRowLast.dataColumn]) {
        this.rightSideTopRowLastValue = result[0][mainBannerData.rightSideTopRowLast.dataColumn];
      }
      else {
        this.rightSideTopRowLastValue = " ";
      }

    }
    //Top Row End

    //Bottom Row Start
    //Left Side Bottom First
    this.leftSideBottomRowFirstLabel = mainBannerData.leftSideBottomRowFirst.label;

    if (mainBannerData.leftSideBottomRowFirst.endpointUri == "") {
      if (mainBannerResponse.length > 0 && mainBannerResponse[0][mainBannerData.leftSideBottomRowFirst.dataColumn]) {
        this.leftSideBottomRowFirstValue = mainBannerResponse[0][mainBannerData.leftSideBottomRowFirst.dataColumn];
      }
      else {
        this.leftSideBottomRowFirstValue = " ";
      }

    }
    else {
      let result: any;
      await this.reqService.getRequest(mainBannerData.leftSideBottomRowFirst.endpointUri + this.personId)
        .then(
          (response) => {
            result = JSON.parse(response);
          }
        );
      if (result.length > 0 && result[0][mainBannerData.leftSideBottomRowFirst.dataColumn]) {
        this.leftSideBottomRowFirstValue = result[0][mainBannerData.leftSideBottomRowFirst.dataColumn];
      }
      else {
        this.leftSideBottomRowFirstValue = " ";
      }

    }

    //Left Side Bottom Middle
    this.leftSideBottomRowMiddleLabel = mainBannerData.leftSideBottomRowMiddle.label;

    if (mainBannerData.leftSideBottomRowMiddle.endpointUri == "") {
      if (mainBannerResponse.length > 0 && mainBannerResponse[0][mainBannerData.leftSideBottomRowMiddle.dataColumn]) {
        this.leftSideBottomRowMiddleValue = mainBannerResponse[0][mainBannerData.leftSideBottomRowMiddle.dataColumn];
      }
      else {
        this.leftSideBottomRowMiddleValue = " ";
      }

    }
    else {
      let result: any;
      await this.reqService.getRequest(mainBannerData.leftSideBottomRowMiddle.endpointUri + this.personId)
        .then(
          (response) => {
            result = JSON.parse(response);
          }
        );
      if (result.length > 0 && result[0][mainBannerData.leftSideBottomRowMiddle.dataColumn]) {
        this.leftSideBottomRowMiddleValue = result[0][mainBannerData.leftSideBottomRowMiddle.dataColumn];
      }
      else {
        this.leftSideBottomRowMiddleValue = " ";
      }

    }

    //Left Side Bottom Last
    this.leftSideBottomRowLastLabel = mainBannerData.leftSideBottomRowLast.label;

    if (mainBannerData.leftSideBottomRowLast.endpointUri == "") {
      if (mainBannerResponse.length > 0 && mainBannerResponse[0][mainBannerData.leftSideBottomRowLast.dataColumn]) {
        this.leftSideBottomRowLastValue = mainBannerResponse[0][mainBannerData.leftSideBottomRowLast.dataColumn];
      }
      else {
        this.leftSideBottomRowLastValue = " ";
      }

    }
    else {
      let result: any;
      await this.reqService.getRequest(mainBannerData.leftSideBottomRowLast.endpointUri + this.personId)
        .then(
          (response) => {
            result = JSON.parse(response);
          }
        );
      if (result.length > 0 && result[0][mainBannerData.leftSideBottomRowLast.dataColumn]) {
        this.leftSideBottomRowLastValue = result[0][mainBannerData.leftSideBottomRowLast.dataColumn];
      }
      else {
        this.leftSideBottomRowLastValue = " ";
      }

    }

    //Ext Left Side Bottom Row First
    this.extLeftSideBottomRowFirstLabel = mainBannerData.extLeftSideBottomRowFirst.label;

    if (mainBannerData.extLeftSideBottomRowFirst.endpointUri == "") {
      if (mainBannerResponse.length > 0 && mainBannerResponse[0][mainBannerData.extLeftSideBottomRowFirst.dataColumn]) {
        this.extLeftSideBottomRowFirstValue = mainBannerResponse[0][mainBannerData.extLeftSideBottomRowFirst.dataColumn];
      }
      else {
        this.extLeftSideBottomRowFirstValue = " ";
      }

    }
    else {
      let result: any;
      await this.reqService.getRequest(mainBannerData.extLeftSideBottomRowFirst.endpointUri + this.personId)
        .then(
          (response) => {
            result = JSON.parse(response);
          }
        );
      if (result.length > 0 && result[0][mainBannerData.extLeftSideBottomRowFirst.dataColumn]) {
        this.extLeftSideBottomRowFirstValue = result[0][mainBannerData.extLeftSideBottomRowFirst.dataColumn];
      }
      else {
        this.extLeftSideBottomRowFirstValue = " ";
      }

    }

    //Ext Left Side Bottom Row Last
    this.extLeftSideBottomRowLastLabel = mainBannerData.extLeftSideBottomRowLast.label;

    if (mainBannerData.extLeftSideBottomRowLast.endpointUri == "") {
      if (mainBannerResponse.length > 0 && mainBannerResponse[0][mainBannerData.extLeftSideBottomRowLast.dataColumn]) {
        this.extLeftSideBottomRowLastValue = mainBannerResponse[0][mainBannerData.extLeftSideBottomRowLast.dataColumn];
      }
      else {
        this.extLeftSideBottomRowLastValue = " ";
      }

    }
    else {
      let result: any;
      await this.reqService.getRequest(mainBannerData.extLeftSideBottomRowLast.endpointUri + this.personId)
        .then(
          (response) => {
            result = JSON.parse(response);
          }
        );
      if (result.length > 0 && result[0][mainBannerData.extLeftSideBottomRowLast.dataColumn]) {
        this.extLeftSideBottomRowLastValue = result[0][mainBannerData.extLeftSideBottomRowLast.dataColumn];
      }
      else {
        this.extLeftSideBottomRowLastValue = " ";
      }

    }

    //Right Side Bottom First
    this.rightSideBottomRowFirstLabel = mainBannerData.rightSideBottomRowFirst.label;

    if (mainBannerData.rightSideBottomRowFirst.endpointUri == "") {
      if (mainBannerResponse.length > 0 && mainBannerResponse[0][mainBannerData.rightSideBottomRowFirst.dataColumn]) {
        this.rightSideBottomRowFirstValue = mainBannerResponse[0][mainBannerData.rightSideBottomRowFirst.dataColumn];
      }
      else {
        this.rightSideBottomRowFirstValue = " ";
      }

    }
    else {
      let result: any;
      await this.reqService.getRequest(mainBannerData.rightSideBottomRowFirst.endpointUri + this.personId)
        .then(
          (response) => {
            result = JSON.parse(response);
          }
        );
      if (result.length > 0 && result[0][mainBannerData.rightSideBottomRowFirst.dataColumn]) {
        this.rightSideBottomRowFirstValue = result[0][mainBannerData.rightSideBottomRowFirst.dataColumn];
      }
      else {
        this.rightSideBottomRowFirstValue = " ";
      }

    }

    //Right Side Bottom Middle
    this.rightSideBottomRowMiddleLabel = mainBannerData.rightSideBottomRowMiddle.label;

    if (mainBannerData.rightSideBottomRowMiddle.endpointUri == "") {
      if (mainBannerResponse.length > 0 && mainBannerResponse[0][mainBannerData.rightSideBottomRowMiddle.dataColumn]) {
        this.rightSideBottomRowMiddleValue = mainBannerResponse[0][mainBannerData.rightSideBottomRowMiddle.dataColumn];
      }
      else {
        this.rightSideBottomRowMiddleValue = " ";
      }

    }
    else {
      let result: any;
      await this.reqService.getRequest(mainBannerData.rightSideBottomRowMiddle.endpointUri + this.personId)
        .then(
          (response) => {
            result = JSON.parse(response);
          }
        );
      if (result.length > 0 && result[0][mainBannerData.rightSideBottomRowMiddle.dataColumn]) {
        this.rightSideBottomRowMiddleValue = result[0][mainBannerData.rightSideBottomRowMiddle.dataColumn];
      }
      else {
        this.rightSideBottomRowMiddleValue = " ";
      }

    }

    //Right Side Bottom Last
    this.rightSideBottomRowLastLabel = mainBannerData.rightSideBottomRowLast.label;

    if (mainBannerData.rightSideBottomRowLast.endpointUri == "") {
      if (mainBannerResponse.length > 0 && mainBannerResponse[0][mainBannerData.rightSideBottomRowLast.dataColumn]) {
        this.rightSideBottomRowLastValue = mainBannerResponse[0][mainBannerData.rightSideBottomRowLast.dataColumn];
      }
      else {
        this.rightSideBottomRowLastValue = " ";
      }

    }
    else {
      let result: any;
      await this.reqService.getRequest(mainBannerData.rightSideBottomRowLast.endpointUri + this.personId)
        .then(
          (response) => {
            result = JSON.parse(response);
          }
        );
      if (result.length > 0 && result[0][mainBannerData.rightSideBottomRowLast.dataColumn]) {
        this.rightSideBottomRowLastValue = result[0][mainBannerData.rightSideBottomRowLast.dataColumn];
      }
      else {
        this.rightSideBottomRowLastValue = " ";
      }

    }
    //Bottom Row End
  }

  //Generate columns for collapsed patient banner
  async generateColumnsOfPatientBanner() {
    this.columns = "";
    let columnsDiv = document.createElement("div");
    columnsDiv.classList.add("row");

    for (var i = 0; i < this.patientBanner.columns.length; i++) {

      let column: Column = this.patientBanner.columns[i];

      let columnDiv = document.createElement("div");
      columnDiv.classList.add("col-md-3");

      let spanHeader = document.createElement("span");
      spanHeader.classList.add("h5");
      if (column.header != "") {
        spanHeader.innerHTML = column.header;
      }
      else {
        spanHeader.innerHTML = column.header;
      }
      columnDiv.appendChild(spanHeader);

      let colData: any;

      if (column.endpointUri != "") {
        await this.reqService.getRequest(column.endpointUri + this.personId)
          .then(
            (data) => {
              colData = JSON.parse(data);
            }
          );
      }
      else {
        colData = null;
      }

      for (var j = 0; j < column.data.length; j++) {
        let data: PatientBannerColumnLabelData = column.data[j];

        let datarow = document.createElement("div");
        datarow.classList.add("row");

        let columnLabel = document.createElement("div");
        columnLabel.classList.add("col-sm-10");

        let spanLabel = document.createElement("span");
        spanLabel.classList.add("h6");
        spanLabel.innerHTML = data.label;

        columnLabel.appendChild(spanLabel);

        datarow.appendChild(columnLabel);

        let columnValue = document.createElement("div");
        columnValue.classList.add("col-sm-10");

        if (data.dataColumn) {
          let colRowData: any;
          if (data.endpointUri != "") {
            await this.reqService.getRequest(data.endpointUri + this.personId)
              .then(
                (response) => {
                  colRowData = JSON.parse(response);
                }
              )

            if (colRowData.length > 0) {

              for (var k = 0; k < colRowData.length; k++) {
                //added extra div for formatting
                let divrowvalue = document.createElement("div");
                divrowvalue.classList.add("row");

                //added extra div for formatting
                let divcolvalue = document.createElement("div");
                divcolvalue.classList.add("col-sm-10", "pb-3");

                let spanvalue = document.createElement("span");
                //spanvalue.classList.add("h6");

                if (colRowData[k][data.dataColumn] && colRowData[k][data.dataColumn] != "") {
                  spanvalue.innerHTML = colRowData[k][data.dataColumn];
                }
                else {
                  spanvalue.innerHTML = "&nbsp";
                }

                divcolvalue.appendChild(spanvalue);
                divrowvalue.appendChild(divcolvalue);
                columnValue.appendChild(divrowvalue);

              }

            }
            else {
              //added extra div for formatting
              let divrowvalue = document.createElement("div");
              divrowvalue.classList.add("row");

              //added extra div for formatting
              let divcolvalue = document.createElement("div");
              divcolvalue.classList.add("col-sm-10", "pb-3");

              let spanvalue = document.createElement("span");
              //spanvalue.classList.add("h6");

              spanvalue.innerHTML = "&nbsp";

              divcolvalue.appendChild(spanvalue);
              divrowvalue.appendChild(divcolvalue);
              columnValue.appendChild(divrowvalue);
            }
          }
          else {
            if (colData && colData.length > 0) {
              //added extra div for formatting
              let divRowValue = document.createElement("div");
              divRowValue.classList.add("row");

              //added extra div for formatting
              let divColValue = document.createElement("div");
              divColValue.classList.add("col-sm-10", "pb-3");

              let spanValue = document.createElement("span");
              //spanValue.classList.add("h6");

              if (colData[0][data.dataColumn] && colData[0][data.dataColumn] != "") {
                spanValue.innerHTML = colData[0][data.dataColumn];
              }
              else {
                spanValue.innerHTML = "&nbsp";
              }

              divColValue.appendChild(spanValue);
              divRowValue.appendChild(divColValue);
              columnValue.appendChild(divRowValue);
            }
            else {
              //added extra div for formatting
              let divRowValue = document.createElement("div");
              divRowValue.classList.add("row");

              //added extra div for formatting
              let divColValue = document.createElement("div");
              divColValue.classList.add("col-sm-10", "pb-3");

              let spanValue = document.createElement("span");
              //spanValue.classList.add("h6");
              spanValue.innerHTML = "&nbsp";

              divColValue.appendChild(spanValue);
              divRowValue.appendChild(divColValue);
              columnValue.appendChild(divRowValue);
            }
          }

        }
        else {
          //added extra div for formatting
          let divRowValue = document.createElement("div");
          divRowValue.classList.add("row");

          //added extra div for formatting
          let divColValue = document.createElement("div");
          divColValue.classList.add("col-sm-10", "pb-3");

          let spanValue = document.createElement("span");
          //spanValue.classList.add("h6");
          spanValue.innerHTML = "&nbsp";

          divColValue.appendChild(spanValue);
          divRowValue.appendChild(divColValue);
          columnValue.appendChild(divRowValue);
        }

        datarow.appendChild(columnValue);

        columnDiv.appendChild(datarow);
      }

      columnsDiv.appendChild(columnDiv);
    }
    this.columns = columnsDiv.outerHTML;
  }
}
