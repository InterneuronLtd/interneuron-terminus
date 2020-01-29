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


import { Component, OnInit, OnDestroy, ViewChild, ElementRef } from '@angular/core';
import { PatientListService } from 'src/app/services/patient-list.service';
import { HeaderService } from 'src/app/services/header.service';
import { patientlist } from '../../Models/Patientlist.model';
import { ApirequestService } from '../../services/apirequest.service';
import { AppConfig } from '../../app.config';
import { ErrorHandlerService } from 'src/app/services/error-handler.service';
import { DataRow } from 'src/app/Models/dataRow.model';
import { PersonaContext } from '../../Models/personaContext.model';
import { WebStorageService } from "../../services/webstorage.service"
import { AuthenticationService } from 'src/app/services/authentication.service';
import * as jwt_decode from "jwt-decode";
import { DataColumn } from 'src/app/Models/dataColumn.model';
import { LoadNotifyService } from '../../services/load-notify.service';
import { Observable } from 'rxjs/Observable';
import 'rxjs/add/observable/timer';
import 'rxjs/add/operator/switchMap';
import 'rxjs/add/operator/merge';
import 'rxjs/add/operator/do';


@Component({
  selector: 'app-patientlist',
  templateUrl: './patientlist.component.html',
  styleUrls: ['./patientlist.component.css']
})


export class PatientlistComponent implements OnInit, OnDestroy {
  patientlst: any = [];
  patientlistname: patientlist[] = [];
  showExportList: boolean = false;
  persona: string;
  personaContext: PersonaContext = new PersonaContext();
  selectedPatientvalue: string = "";
  dataRows: DataRow[] = [];
  messageDisplay: string = "";
  logedinUserID: string;

  selectedApplicationPatientlist: string = "";

  updatePatientListTrigger = Observable.merge(this.LoadNotifyService.requestLoad);

  patientList = this.updatePatientListTrigger.subscribe(() => this.reloadPatientList());

  constructor(
    private patientListService: PatientListService,
    private errorHandlerService: ErrorHandlerService,
    private webStorageService: WebStorageService,
    private reqService: ApirequestService,
    private authService: AuthenticationService,
    private headerService: HeaderService,
    private LoadNotifyService: LoadNotifyService
  ) {

  }

  @ViewChild('patientlistDropdownMenu')
  private patientlistDropdownMenu: ElementRef
  ngOnInit() {

    this.getPatientlists();

    //document.getElementById('patientlistDropdownMenu').innerHTML = "<i class='icon-list'>&nbsp</i>Patient List";

    this.patientlistDropdownMenu.nativeElement.innerHTML = "<i class='icon-list'>&nbsp</i>Team Lists";
    let decodedToken = this.decodeAccessToken(this.authService.user.access_token);
    if (decodedToken != null) {

      this.logedinUserID = decodedToken.IPUId;
    }
    this.subscribe();
    this.headerService.selectedApplicationPatientlistName.subscribe(
      (selectedApplicationPatientlist: string) => {
        if (selectedApplicationPatientlist == "") {
          this.selectedApplicationPatientlist = "Please select a list. "
        }
        else {
          this.selectedApplicationPatientlist = selectedApplicationPatientlist;
        }
      },
      error => this.errorHandlerService.handleError(error)
    );
    this.headerService.PatientListUpdated.subscribe(
      (text: string) => {
        this.getPatientlists();

      },
      error => this.errorHandlerService.handleError(error)
    );
    this.headerService.selectedPersonaContext.subscribe(
      (personaContext: PersonaContext) => {
        this.personaContext = personaContext;

      },
      error => this.errorHandlerService.handleError(error)
    );
  }


  getPatientlists() {
    this.reqService.getRequest(AppConfig.settings.apiServices.find(x => x.serviceName == 'GetPatientListbyCount').serviceUrl)
      .then(
        (patientlist) => {
          this.patientlistname = <patientlist[]>JSON.parse(patientlist);


        },
        error => this.errorHandlerService.handleError(error)
      )
  }

  decodeAccessToken(token: string): any {
    try {
      return jwt_decode(token);
    }
    catch (Error) {
      return null;
    }
  }
  setDisplay() {

    let styles = {
      'display': this.showExportList ? 'block' : 'none'
    }
    return styles;
  }
  subscribe() {
    this.headerService.wardPatientTabularData.subscribe(
      (DataRow: DataRow[]) => {

        this.dataRows = DataRow;
        if (this.dataRows.length > 0) {
          if (this.selectedPatientvalue == "") {
            if (this.webStorageService.getLocalStorageItem("Terminus:" + this.logedinUserID + ":Patient") == null) {//check local storage is null
              this.selectedPatientvalue = DataRow[0].columns[0].matchedcontext;
              this.headerService.myPatientSelected.next(this.selectedPatientvalue);
              this.webStorageService.setLocalStorageItem("Terminus:" + this.logedinUserID + ":Patient", this.selectedPatientvalue);
            }
            else {
              this.selectedPatientvalue = this.webStorageService.getLocalStorageItem("Terminus:" + this.logedinUserID + ":Patient");
              this.headerService.myPatientSelected.next(this.selectedPatientvalue);
            }

          }
          this.showExportList = true;

        } else {
          if (this.selectedPatientvalue == "") {
            if (this.webStorageService.getLocalStorageItem("Terminus:" + this.logedinUserID + ":Patient") != null) {
              this.selectedPatientvalue = this.webStorageService.getLocalStorageItem("Terminus:" + this.logedinUserID + ":Patient");
              this.headerService.myPatientSelected.next(this.selectedPatientvalue);
            }
          }
          this.showExportList = false;
        }
      },
      error => this.errorHandlerService.handleError(error)
    );
    this.headerService.myPatientSelected.subscribe(
      (myPatientSelected: string) => {

        this.selectedPatientvalue = myPatientSelected;
      },
      error => this.errorHandlerService.handleError(error)
    );
    this.headerService.patientMessage.subscribe(
      (patientMessage: string) => {

        this.messageDisplay = patientMessage;
      },
      error => { this.messageDisplay = "Error", this.errorHandlerService.handleError(error) }
    );

  }
  ngOnDestroy() {
    this.headerService.wardPatientTabularData.unsubscribe();

  }
  selectedPatient(person: DataRow) {
    if (person) {
      this.selectedPatientvalue = person.columns[0].matchedcontext;
      this.webStorageService.setLocalStorageItem("Terminus:" + this.logedinUserID + ":Patient", this.selectedPatientvalue);
      this.headerService.myPatientSelected.next(this.selectedPatientvalue);

    }
  }

  showMyPatientList() {
    this.headerService.wardPatientTabularData.next(this.dataRows);
    this.headerService.myPatient.next(true);
  }

  onRefresh() {
    this.patientListService.getList('')
  }

  getpatientExpandedList(personlistitem: patientlist) {

    let postBody = `[
      {
        "filters": [{
            "filterClause": "patientlist_id = @patientlist_id"
         }]
      },
      {
        "filterparams": [{"paramName": "patientlist_id", "paramValue": "` + personlistitem.patientlist_id + `"}]
      },
      {
        "selectstatement": "SELECT *"
      }
    ]`;

    this.reqService.postRequest(AppConfig.settings.apiServices.find(x => x.serviceName == 'GetMyPatientExpandedList').serviceUrl, postBody)
      .then(
        (response: any[]) => {
          if (response.length > 0) {
            let Rows: DataRow[] = [];
            let properties = Object.keys(response[0]);
            for (let res of response) {
              let Row: DataRow = new DataRow;
              for (let property of properties) {
                let Column: DataColumn;
                Column = JSON.parse(res[property]);
                Row.columns.push(Column);
              }
              Rows.push(Row);
            }
            this.headerService.PatientListsTabularData.next(Rows);
            this.headerService.myPatient.next(true);
            this.headerService.PatientListHeaderDisplay.next(personlistitem.patientlistname);
          }
          else {
            this.headerService.PatientListsTabularData.next([]);
            this.headerService.myPatient.next(true);
            this.headerService.PatientListHeaderDisplay.next(personlistitem.patientlistname);
          }

        },
        error => {
          this.errorHandlerService.handleError(error),
            this.headerService.PatientListsTabularData.next([])

        }
      );

  }

  reloadPatientList() {
    this.patientListService.getList("");
    this.updatePatientListTrigger.do(this.LoadNotifyService.loadComplete);
  }

}
