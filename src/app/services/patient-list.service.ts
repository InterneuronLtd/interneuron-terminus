//BEGIN LICENSE BLOCK 
//Interneuron Terminus

//Copyright(C) 2023  Interneuron Holdings Ltd

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

import { Injectable, OnInit, OnDestroy } from '@angular/core';
import { DataRow } from '../Models/dataRow.model';
import { DataColumn } from '../Models/dataColumn.model';
import { ApirequestService } from './apirequest.service';
import { HeaderService } from './header.service';
import { ErrorHandlerService } from './error-handler.service';
import { AppConfig } from '../app.config';
import { PersonaContext } from '../Models/personaContext.model';
import { filter } from '../Models/Filter.model';
import { filterparam } from '../Models/Filterparam.model';
import { FilterRootObject } from '../Models/FilterRootObject.model';

@Injectable({
  providedIn: 'root'
})
export class PatientListService implements OnInit, OnDestroy {
  patients: filter;
  dataRows: DataRow[] = [];
  personaContexts: PersonaContext[];
  selectedpersona: string;
  selectedpersonaID: string;
  selectedpersonaContext: string = "";
  selectedApplicationPatientlist: string = "";
  selectedDisplayPort: string = "";
  constructor(
    private apicaller: ApirequestService,
    private errorHandlerService: ErrorHandlerService,
    private headerService: HeaderService
  ) {

    //Read persona from Persona Header DropDown Selected
    this.headerService.selectedPersona.subscribe(
      (persona: string) => {

        this.selectedpersona = persona;
      },
     error => this.errorHandlerService.handleError(error)
    );
    //Read persona from Persona Header DropDown Selected
    this.headerService.selectedPersonaID.subscribe(
      (selectedPersonaID: string) => {

        this.selectedpersonaID = selectedPersonaID;
      },
      error => this.errorHandlerService.handleError(error)
    );

    this.headerService.selectedPersonaContext.subscribe(
      (personaContext: PersonaContext) => {
        this.selectedpersonaContext = personaContext.contextname;
        if (this.selectedApplicationPatientlist != "")
          this.getList(this.selectedApplicationPatientlist);
      },
      error => this.errorHandlerService.handleError(error)
    );
    //Read current patient list from dropdown for application
    this.headerService.selectedApplicationPatientlist.subscribe(
      (selectedApplicationPatientlist: string) => {
        this.selectedApplicationPatientlist = selectedApplicationPatientlist;
        if (this.selectedpersonaContext != "")
          this.getList(this.selectedApplicationPatientlist);
      },
      error => this.errorHandlerService.handleError(error)
    );

  }
  ngOnInit() {
  }

  ngOnDestroy() {
    this.headerService.selectedPersona.unsubscribe();
    this.headerService.selectedPersonaContext.unsubscribe();

  }


  getList(selectedApplicationPatientList: string) {
    if (this.selectedApplicationPatientlist == "") {
      this.dataRows = [];
      this.headerService.patientMessage.next("No Patients");
      this.headerService.wardPatientTabularData.next(this.dataRows);
      return;
    }
    //json body/data for filter
    let postBody = ` [{
                    "filters": [{
                      "filterClause": "\\\"`+ this.selectedpersonaID + `\\\" = @value"
                    }]
                  }, {
                    "filterparams": [{
                      "paramName": "value",
                      "paramValue": "`+ this.selectedpersonaContext + `"
                    }]
                  }, {
                    "selectstatement": "SELECT *"
                  }]`;


    if (this.selectedpersona == "Hospital") {

      postBody = `[{
  "filters": [{
    "filterClause": "'1' = @hosp"
  }]
}, {
  "filterparams": [{
    "paramName": "@hosp",
    "paramValue": "1"
  }]
}, {
  "selectstatement": "SELECT *"
}]`
    }



      this.headerService.patientMessage.next("Loading...");
      this.apicaller.postRequest(AppConfig.settings.apiServices.find(x => x.serviceName == 'PostPatientList').serviceUrl + this.selectedApplicationPatientlist, postBody)
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

              this.dataRows = Rows;
              this.headerService.wardPatientTabularData.next(this.dataRows);
              this.headerService.patientMessage.next("");
            }
            else {
              this.dataRows = [];
              this.headerService.patientMessage.next("No Patients");
              this.headerService.wardPatientTabularData.next(this.dataRows);
            }
          },
          error => {
            this.errorHandlerService.handleError(error),
            this.dataRows = []
            this.headerService.wardPatientTabularData.next(this.dataRows)
            this.headerService.patientMessage.next("Error")
          }
        );

    }
  }

