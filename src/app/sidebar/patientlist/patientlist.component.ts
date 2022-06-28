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
import { RbacService } from "../../services/rbac.service";
import { Observable } from 'rxjs';
import { SharedDataContainerService } from '../../services/shared-data-container.service';
import * as $ from "jquery";
import { Subscription } from 'rxjs';
import { ResizeService } from 'src/app/services/resize.service';


@Component({
  selector: 'app-patientlist',
  templateUrl: './patientlist.component.html',
  styleUrls: ['./patientlist.component.css']
})


export class PatientlistComponent implements OnInit, OnDestroy {

  subscriptions: Subscription = new Subscription();

  patientlst: any = [];
  patientlistname: patientlist[] = [];
  showExportList: boolean = false;
  persona: string;
  personaContext: PersonaContext = new PersonaContext();
  selectedValue: string = "";
  dataRows: DataRow[] = [];
  messageDisplay: string = "";
  logedinUserID: string;

  displayPort: string;
  private resizeSubscription: Subscription;

  selectedApplicationPatientlist: string = "";

  // updatePatientListTrigger = Observable.merge(this.LoadNotifyService.requestLoad);

  // patientList = this.updatePatientListTrigger.subscribe(() => this.reloadPatientList());

  constructor(
    private patientListService: PatientListService,
    public RbacService: RbacService,
    private errorHandlerService: ErrorHandlerService,
    private webStorageService: WebStorageService,
    private reqService: ApirequestService,
    private authService: AuthenticationService,
    private headerService: HeaderService,
    private LoadNotifyService: LoadNotifyService,
    private sharedData: SharedDataContainerService,
    private resizeService: ResizeService
  ) {


  }

  @ViewChild('patientlistDropdownMenu')
  private patientlistDropdownMenu: ElementRef

    ngOnInit() {

      this.resizeSubscription = this.resizeService.displayPort$.subscribe((value:any) => {
        this.displayPort = value;
      });

    this.getPatientlists();

    //document.getElementById('patientlistDropdownMenu').innerHTML = "<i class='icon-list'>&nbsp</i>Patient List";


    let decodedToken = this.authService.decodeAccessToken(this.authService.user.access_token);
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
          if (this.sharedData.personId == "") {
            if (DataRow[0].columns[0].defaultcontextfield == "person_id") {
              if (this.webStorageService.getLocalStorageItem("Terminus:" + this.logedinUserID + ":Patient") == null) {//check local storage is null
                this.sharedData.personId = DataRow[0].columns[0].matchedcontext;
                this.sharedData.contextField = DataRow[0].columns[0].defaultcontextfield;
                this.sharedData.contexts = null;
                this.webStorageService.removeLocalStorageItem("Terminus:" + this.logedinUserID + ":Contexts");
                this.webStorageService.setLocalStorageItem("Terminus:" + this.logedinUserID + ":Patient", DataRow[0].columns[0].matchedcontext);
                this.webStorageService.setLocalStorageItem("Terminus:" + this.logedinUserID + ":ContextField", this.sharedData.contextField);
                this.headerService.myPatientSelected.next(DataRow[0].columns[0].matchedcontext);
              }
              else {
                this.sharedData.personId = this.webStorageService.getLocalStorageItem("Terminus:" + this.logedinUserID + ":Patient");
                this.headerService.myPatientSelected.next(this.sharedData.personId);
              }
            }
            else {
              if (this.webStorageService.getLocalStorageItem("Terminus:" + this.logedinUserID + ":Contexts") == null) {//check local storage is null
                this.getContexts(DataRow[0].columns[0].defaultcontext, DataRow[0].columns[0].defaultcontextfield, DataRow[0].columns[0].matchedcontext);
              }
              else {
                this.sharedData.contexts = this.webStorageService.getLocalStorageItem("Terminus:" + this.logedinUserID + ":Contexts");
                this.headerService.myPatientSelected.next(this.sharedData.contexts[0].person_id);
              }
            }
          }

          this.showExportList = true;
        }
        else {
          if (this.sharedData.personId == "") {
            if (this.webStorageService.getLocalStorageItem("Terminus:" + this.logedinUserID + ":Patient") != null && this.webStorageService.getLocalStorageItem("Terminus:" + this.logedinUserID + ":Contexts") == null) {
              this.sharedData.personId = this.webStorageService.getLocalStorageItem("Terminus:" + this.logedinUserID + ":Patient");
              this.headerService.myPatientSelected.next(this.sharedData.personId);
            }

            if (this.webStorageService.getLocalStorageItem("Terminus:" + this.logedinUserID + ":Contexts") != null) {
              this.sharedData.contexts = this.webStorageService.getLocalStorageItem("Terminus:" + this.logedinUserID + ":Contexts");
              this.headerService.myPatientSelected.next(this.sharedData.contexts[0].person_id);
            }
          }
          this.showExportList = false;
        }
      },
      error => this.errorHandlerService.handleError(error)
    );
    this.headerService.myPatientSelected.subscribe(
      (myPatientSelected: string) => {
        this.sharedData.personId = myPatientSelected;

        if (this.webStorageService.getLocalStorageItem("Terminus:" + this.logedinUserID + ":ContextField") != null && this.webStorageService.getLocalStorageItem("Terminus:" + this.logedinUserID + ":ContextField") == "person_id") {
          this.sharedData.contexts = null;
          this.webStorageService.removeLocalStorageItem("Terminus:" + this.logedinUserID + ":Contexts");
          this.sharedData.contextValue = this.sharedData.personId;
          this.selectedValue = this.sharedData.personId;
        }
        else {
          if (this.webStorageService.getLocalStorageItem("Terminus:" + this.logedinUserID + ":Contexts") != null) {
            this.sharedData.contexts = this.webStorageService.getLocalStorageItem("Terminus:" + this.logedinUserID + ":Contexts");
            this.selectedValue = this.sharedData.contexts[0][this.webStorageService.getLocalStorageItem("Terminus:" + this.logedinUserID + ":ContextField")];
          }
          else {
            this.sharedData.contexts = null;
            this.sharedData.contextValue = "";
            this.selectedValue = "";
            this.webStorageService.removeLocalStorageItem("Terminus:" + this.logedinUserID + ":Contexts");
          }
        }
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

    if (this.resizeSubscription) {
      this.resizeSubscription.unsubscribe();
    }
  }


  selectedPatient(person: DataRow) {
    if (person) {
      if (person.columns[0].defaultcontextfield == "person_id") {
        this.sharedData.personId = person.columns[0].matchedcontext;
        this.sharedData.contexts = null;
        this.webStorageService.removeLocalStorageItem("Terminus:" + this.logedinUserID + ":Contexts");
        this.sharedData.contextValue = this.sharedData.personId;
        this.selectedValue = this.sharedData.personId;
        this.sharedData.contextField = person.columns[0].defaultcontextfield;
        this.webStorageService.setLocalStorageItem("Terminus:" + this.logedinUserID + ":ContextField", this.sharedData.contextField);
        this.webStorageService.setLocalStorageItem("Terminus:" + this.logedinUserID + ":Patient", person.columns[0].matchedcontext);
        this.headerService.myPatientSelected.next(person.columns[0].matchedcontext);
        if(this.displayPort === 'Mobile') {
          this.hidePatientList();
        }
    }
    else {
        this.getContexts(person.columns[0].defaultcontext, person.columns[0].defaultcontextfield, person.columns[0].matchedcontext);
      }
    }
  }

  hidePatientList() {
    $("body").removeClass("sidebar-show");
  }

  showPatientList() {
    $("body").addClass("sidebar-show");
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
    // this.updatePatientListTrigger.do(this.LoadNotifyService.loadComplete);
  }

  getContexts(defaultContext: string, defaultContextField: string, value: string) {
    this.sharedData.contextField = defaultContextField;
    this.reqService.getRequest(AppConfig.settings.apiServices.find(x => x.serviceName == 'GetContext').serviceUrl + defaultContext + "/" + defaultContextField + "/" + value)
      .then(
        (contexts) => {
          if (contexts != "[]") {
            this.sharedData.contexts = JSON.parse(contexts);
            this.sharedData.personId = this.sharedData.contexts[0].person_id;
            this.sharedData.contextValue = this.sharedData.contexts[0][this.sharedData.contextField];
            this.selectedValue = this.sharedData.contexts[0][this.sharedData.contextField];
            this.webStorageService.setLocalStorageItem("Terminus:" + this.logedinUserID + ":Patient", this.sharedData.personId);
            this.webStorageService.setLocalStorageItem("Terminus:" + this.logedinUserID + ":Contexts", this.sharedData.contexts);
            this.webStorageService.setLocalStorageItem("Terminus:" + this.logedinUserID + ":ContextField", this.sharedData.contextField);
            this.headerService.myPatientSelected.next(this.sharedData.personId);
          }
          else {
            this.sharedData.contexts = null;
            this.sharedData.personId = "";
            this.sharedData.contextValue = "";
            this.sharedData.contextField = "";
            this.selectedValue = "";
            this.webStorageService.removeLocalStorageItem("Terminus:" + this.logedinUserID + ":Patient");
            this.webStorageService.removeLocalStorageItem("Terminus:" + this.logedinUserID + ":Contexts");
            this.webStorageService.removeLocalStorageItem("Terminus:" + this.logedinUserID + ":ContextField");
            this.headerService.myPatientSelected.next(this.sharedData.personId);
          }
        }
      );
  }
}
