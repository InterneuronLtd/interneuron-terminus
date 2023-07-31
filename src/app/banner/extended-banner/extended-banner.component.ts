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
import { HttpClient } from '@angular/common/http';
import { Component, EventEmitter, Input, OnDestroy, OnInit, Output } from '@angular/core';
import { Subscription } from 'rxjs';
import { AppConfig } from 'src/app/app.config';
import { Column, MainBannerData, PatientBanner } from 'src/app/Models/patientBanner.model';
import { PatientBannerColumnLabelData } from 'src/app/Models/patientBannerColumnLabelData.model';
import { ApirequestService } from 'src/app/services/apirequest.service';
import { ResizeService } from 'src/app/services/resize.service';

@Component({
  selector: 'app-extended-banner',
  templateUrl: './extended-banner.component.html',
  styleUrls: ['./extended-banner.component.css']
})
export class ExtendedBannerComponent implements OnInit, OnDestroy {
  subscriptions: Subscription = new Subscription();
  patientBanner: PatientBanner;
  personId: string;

  columns: string;

  private resizeSubscription: Subscription;
  displayPort: string;

  constructor(private reqService: ApirequestService, private resizeService: ResizeService, private httpClient: HttpClient) { }

  ngOnInit() {
    this.resizeSubscription = this.resizeService.displayPort$.subscribe((value:any) => {
      this.displayPort = value;
    });
  }



  ngOnDestroy() {
    if (this.resizeSubscription) {
      this.resizeSubscription.unsubscribe();
    }
  }

  @Input() set value(value: string) {
      if(value) {
        this.personId = value;
        this.getPatientBannerConfig();
      }
  };


  @Output() returnExtendedBannerResponse: EventEmitter<boolean> = new EventEmitter();

  sendExtendedBannerResponse(value: boolean) {
    this.returnExtendedBannerResponse.emit(value);
  }


  getPatientBannerConfig() {
    this.httpClient.get("./assets/config/patientBanner.json")
      .subscribe(
        (data) => {
          this.patientBanner = <PatientBanner>data;
          this.generateMainPatientBanner();
          this.generateColumnsOfPatientBanner();
        }
      );
  }

  // async getData() {
  //     await this.reqService.getRequest(AppConfig.settings.apiServices.find(x => x.serviceName == 'GetBannerMainAllergies').serviceUrl + '?synapseattributename=person_id&attributevalue=' + this.personId)
  //       .then(
  //         (response) => {
  //           if(response) {
  //             this.mainAllergies = JSON.parse(response)[0];
  //             //console.log("ExtendedBanner", this.mainAllergies);
  //             this.sendExtendedBannerResponse(true);
  //           }
  //         }

  //       ).catch
  //       {
  //         this.sendExtendedBannerResponse(false);
  //       };
  // }








  //Generate main banner
  async generateMainPatientBanner() {
    let mainBannerResponse: any;

    if (this.patientBanner.mainBanner.endpointUri != "") {
      await this.reqService.getRequest(this.patientBanner.mainBanner.endpointUri + this.personId)
        .then(
          (response) => {
            mainBannerResponse = JSON.parse(response);

            let mainBannerData: MainBannerData = this.patientBanner.mainBanner.data;

            this.generateColumnsOfPatientBanner();
          }
        );
    }
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
