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


import { Component, OnInit } from '@angular/core';
import * as jwt_decode from "jwt-decode";

import { HeaderService } from '../../services/header.service';
import { DataRow } from 'src/app/Models/dataRow.model';
import { DataColumn } from 'src/app/Models/dataColumn.model';
import { AppConfig } from 'src/app/app.config';
import { ErrorHandlerService } from 'src/app/services/error-handler.service';
import { ApirequestService } from '../../services/apirequest.service';
import { AuthenticationService } from '../../services/authentication.service';


@Component({
  selector: 'app-my-patients',
  templateUrl: './my-patients.component.html',
  styleUrls: ['./my-patients.component.css']
})
export class MyPatientsComponent implements OnInit {

  dataRows: DataRow[] = [];

  myPatientLoadingMessage: string;

  postBody: string;

  userId: string;

  constructor(private headerService: HeaderService, private errorHandlerService: ErrorHandlerService, private reqService: ApirequestService, private authService: AuthenticationService) {
    this.headerService.changedMyPatients.subscribe(
      (response: boolean) => {
        if (response) {
          this.getUserId();
        }
      },
      error => this.errorHandlerService.handleError(error)
    );
  }

  ngOnInit() {
    this.getUserId();
  }

  getUserId() {
    let decodedToken = this.authService.decodeAccessToken(this.authService.user.access_token);
    if (decodedToken != null) {
      this.userId = decodedToken.IPUId.replace("\\","\\\\");
    }
    this.getListData();
  }

  showMyPatientList() {    
    this.headerService.myPatient.next(true);
    this.headerService.MyPatientTabularData.next(this.dataRows);
  }

  getListData() {
    this.myPatientLoadingMessage = "loading";

    this.postBody = `[
                      {
                        "filters": [{
                            "filterClause": "userid = @userid"
                         }]
                      },
                      {
                        "filterparams": [{"paramName": "userid", "paramValue": "` + this.userId + `"}]
                      },
                      {
                        "selectstatement": "SELECT *"
                      },
                      {
                        "ordergroupbystatement": "ORDER BY 2"
                      }
                    ]`;

    this.reqService.postRequest(AppConfig.settings.apiServices.find(x => x.serviceName == 'GetMyPatientList').serviceUrl, this.postBody)
      .then(
        (response) => {
          let arrResponse = response;
          if (arrResponse && arrResponse.length > 0) {
            let Rows: DataRow[] = [];
            let properties = Object.keys(arrResponse[0]);
            for (let res of arrResponse) {
              let Row: DataRow = new DataRow;
              for (let property of properties) {
                let Column: DataColumn;
                Column = JSON.parse(res[property]);
                Row.columns.push(Column);
              }
              Rows.push(Row);
            }
            this.dataRows = Rows;
            if (this.dataRows.length == 0) {
              this.dataRows = [];
              this.myPatientLoadingMessage = "No Data";
            }
            else {
              this.myPatientLoadingMessage = "";
            }
          }
          else {
            this.dataRows = [];
            this.myPatientLoadingMessage = "No Data";
          }
        },
        error=>{ this.errorHandlerService.handleError(error),this.myPatientLoadingMessage = "Error"}
       
      );
  }
}
