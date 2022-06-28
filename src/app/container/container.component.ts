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


import { Component, OnInit, OnDestroy } from '@angular/core';
import { HeaderService } from '../services/header.service';
import { ErrorHandlerService } from '../services/error-handler.service';
import { WebComponentLoaderService } from '../services/web-component-loader.service';
import { DataRow } from '../Models/dataRow.model';
import { Module } from '../Models/application.model';
import { PersonaContext } from '../Models/personaContext.model';
import { WebStorageService } from '../services/webstorage.service';
import { ApirequestService } from '../services/apirequest.service';
import { AppConfig } from '../app.config';
import { AuthenticationService } from 'src/app/services/authentication.service';
import { SharedDataContainerService } from '../services/shared-data-container.service';


@Component({
  selector: 'app-container',
  templateUrl: './container.component.html',
  styleUrls: ['./container.component.css']
})
export class ContainerComponent implements OnInit, OnDestroy {




  showExpandedList: boolean = false;
  showPatientList: boolean = false;
  filter: string = '';
  patientListHeader: string = '';
  dataRows: DataRow[] = [];
  selectedValue: string;
  p: number; //current page



  logedinUserID: string;

  messageDisplay: string = "";

  constructor(private headerService: HeaderService,
    private errorHandlerService: ErrorHandlerService,
    private moduleLoader: WebComponentLoaderService,
    private webStorageService: WebStorageService,
    private reqService: ApirequestService,
    private authService: AuthenticationService,
    private sharedData: SharedDataContainerService
  ) {
    this.subscribeEvents();
  }

  ngOnInit() {

    let decodedToken = this.authService.decodeAccessToken(this.authService.user.access_token);
    if (decodedToken != null) {

      this.logedinUserID = decodedToken.IPUId;
    }
  }

  subscribeEvents() {

    //Subscribe to show or hide patient detail popup from Mypatient and sideBar
    this.headerService.myPatient.subscribe(
      (show: boolean) => {
        this.showExpandedList = show;
      },
      error => this.errorHandlerService.handleError(error)
    );

    //Load data from  SideBar patient List PatientListsTabularData
    this.headerService.PatientListsTabularData.subscribe(
      (DataRow: DataRow[]) => {
        if (this.patientListHeader != "My Patients") {
          this.dataRows = DataRow;
          this.showPatientList = this.dataRows.length > 0 ? true : false;
        }
      },
      error => this.errorHandlerService.handleError(error)
    );
    //Load data from patient list
    this.headerService.wardPatientTabularData.subscribe(
      (DataRow: DataRow[]) => {
        if (this.patientListHeader != "My Patients") {
          this.dataRows = DataRow;
          this.showPatientList = this.dataRows.length > 0 ? true : false;
        }
      },
      error => this.errorHandlerService.handleError(error)
    );
    //Load data from  My favorite patient List
    this.headerService.MyPatientTabularData.subscribe(
      (DataRow: DataRow[]) => {
        this.dataRows = DataRow;
        this.showPatientList = this.dataRows.length > 0 ? true : false;
        this.patientListHeader = "My Patients";
      },
      error => this.errorHandlerService.handleError(error)
    );

    // subscribe to dropdown personacontext
    this.headerService.PatientListHeaderDisplay.subscribe(
      (headerText: string) => {
        this.patientListHeader = headerText;

      },
      error => this.errorHandlerService.handleError(error)
    );

    this.headerService.selectedPersonaContext.subscribe(
      (personaContext: PersonaContext) => {
        this.patientListHeader = personaContext.contextname;
      },
      error => this.errorHandlerService.handleError(error)
    );

    this.headerService.patientMessage.subscribe(
      (patientMessage: string) => {

        this.messageDisplay = patientMessage;
      },
      error => { this.messageDisplay = "Error", this.errorHandlerService.handleError(error) }
    );

    this.headerService.selectedModule.subscribe(
      (module: Module) => {
        try {
          this.moduleLoader.loadComponent(module);
        } catch (error) {
          //console.log("error loading component:" + error)
        }
      },
      error => this.errorHandlerService.handleError(error)
    );

    this.headerService.applicationId.subscribe(
      (applicationId: string) => {
        this.moduleLoader.loadComponent(null);
      },
      error => this.errorHandlerService.handleError(error)
    )
    this.headerService.myPatientSelected.subscribe(
      (myPatientSelected: string) => {

        this.sharedData.personId = myPatientSelected;
        if (this.webStorageService.getLocalStorageItem("Terminus:" + this.logedinUserID + ":ContextField") != null && this.webStorageService.getLocalStorageItem("Terminus:" + this.logedinUserID + ":ContextField") == "person_id") {
          this.sharedData.contexts = null;
          this.sharedData.contextValue = this.sharedData.personId;
          this.selectedValue = this.sharedData.personId;
          this.webStorageService.removeLocalStorageItem("Terminus:" + this.logedinUserID + ":Contexts");
        }
        else {
          if (this.webStorageService.getLocalStorageItem("Terminus:" + this.logedinUserID + ":Contexts") != null) {
            this.sharedData.contexts = this.webStorageService.getLocalStorageItem("Terminus:" + this.logedinUserID + ":Contexts");
            this.sharedData.contextValue = this.sharedData.contexts[0][this.webStorageService.getLocalStorageItem("Terminus:" + this.logedinUserID + ":ContextField")];
            this.selectedValue = this.sharedData.contexts[0][this.webStorageService.getLocalStorageItem("Terminus:" + this.logedinUserID + ":ContextField")];
          }
          else {
            this.sharedData.contexts = null;
            this.sharedData.contextValue = "";
          }
        }
      },
      error => this.errorHandlerService.handleError(error)
    );

  }




  hideMyPatientList() {
    this.filter = "";
    this.headerService.myPatient.next(false);
  }

  ngOnDestroy() {
    this.headerService.myPatient.unsubscribe();
    this.headerService.MyPatientTabularData.unsubscribe();
    this.headerService.wardPatientTabularData.unsubscribe();
    this.headerService.selectedModule.unsubscribe();
  }



  selectedPatient(person: DataRow) {
    if (person) {
      if (person.columns[0].defaultcontextfield == "person_id") {
        this.sharedData.personId = person.columns[0].matchedcontext;
        this.sharedData.contexts = null;
        this.sharedData.contextValue = this.sharedData.personId;
        this.sharedData.contextField = person.columns[0].defaultcontextfield;
        this.selectedValue = this.sharedData.personId;
        this.webStorageService.setLocalStorageItem("Terminus:" + this.logedinUserID + ":Patient", this.sharedData.personId);
        this.webStorageService.setLocalStorageItem("Terminus:" + this.logedinUserID + ":ContextField", this.sharedData.contextField);
        this.webStorageService.removeLocalStorageItem("Terminus:" + this.logedinUserID + ":Contexts");
        this.headerService.myPatientSelected.next(this.sharedData.personId);
      }
      else {
        this.getContexts(person.columns[0].defaultcontext, person.columns[0].defaultcontextfield, person.columns[0].matchedcontext);
      }
      this.headerService.myPatient.next(false);
    }
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
            this.selectedValue = this.sharedData.contextValue;
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
            this.webStorageService.removeLocalStorageItem("Terminus:" + this.logedinUserID + ":Contexts");
            this.webStorageService.removeLocalStorageItem("Terminus:" + this.logedinUserID + ":ContextField");
            this.headerService.myPatientSelected.next(this.sharedData.personId);
          }
        }
      );
  }
}
