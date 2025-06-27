//BEGIN LICENSE BLOCK 
//Interneuron Terminus

//Copyright(C) 2025  Interneuron Limited

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
import { BsModalRef, BsModalService } from 'ngx-bootstrap/modal';
import { Subscription } from 'rxjs';
import { AppConfig } from 'src/app/app.config';
import { Column, MainBannerData, PatientBanner } from 'src/app/Models/patientBanner.model';
import { config, PatientBannerColumnLabelData } from 'src/app/Models/patientBannerColumnLabelData.model';
import { ApirequestService } from 'src/app/services/apirequest.service';
import { ResizeService } from 'src/app/services/resize.service';
import { RefWeightHeightComponent } from '../../ref-weight-height/ref-weight-height.component';
import { RecRefHeightComponent } from '../../rec-ref-height/rec-ref-height.component';
import { WebStorageService } from 'src/app/services/webstorage.service';
import { HeaderService } from 'src/app/services/header.service';
import { SharedDataContainerService } from 'src/app/services/shared-data-container.service';
import { AdditionalInfo } from 'src/app/Models/ModuleDataContract.model';
import { BannerMainWarnings } from 'src/app/Models/banner/banner.mainwarnings';
import { GPConnectGetDataResponse, GPConnectService } from 'src/app/shared/gpconnect/gpconnect.service';
import { GPConnectSyncStatus } from 'src/app/Models/GPConnect/gpconnect.model';
import { ToastrService } from 'ngx-toastr';
import * as moment from 'moment';
import { NotificationReceivedResponse, registerSubscribers, subscribeMessageByTopic } from 'src/app/notification/lib/notification.observable.util_v2';
import { RefWaistcircumferenceComponent } from '../../ref-waistcircumference/ref-waistcircumference.component';
@Component({
  selector: 'app-extended-banner',
  templateUrl: './extended-banner.component.html',
  styleUrls: ['./extended-banner.component.css'],
  providers: [GPConnectService]
})
export class ExtendedBannerComponent implements OnInit, OnDestroy {
  subscriptions: Subscription = new Subscription();
  patientBanner: PatientBanner;
  personId: string;
  showbanner = false;
  bsModalRef: BsModalRef;
  columns: string;
  activetab = "";
  mainWarnings: BannerMainWarnings[];
  private resizeSubscription: Subscription;
  displayPort: string;
  env: string = AppConfig.settings.env;
  counter=0;
  objectKeys = Object.keys;
  acuteMedicationsSinceInMonths = AppConfig.settings.GPConnectConfig.acuteMedicationsInMonths;
  repeatMedicationsSinceInMonths = AppConfig.settings.GPConnectConfig.repeatMedicationsInMonths;
  gpConnect: {data: any, syncState: number | null, msgs: string[] | null} = {data: null, syncState: GPConnectSyncStatus.Unverified, msgs: []};
  demographics: any;
  hideGPConnectFeature = AppConfig.settings.GPConnectConfig.hideThisFeature;
  readMoreGPMsg = false;
  gpConnectMsgLen = 0;
  redflags: string;
  constructor(public modalService: BsModalService, public sharedData: SharedDataContainerService, private webStorage: WebStorageService, private headerService: HeaderService, private reqService: ApirequestService, private resizeService: ResizeService, private httpClient: HttpClient,
    private toastrService: ToastrService,
    private gpConnectService: GPConnectService) {
  
    if (!AppConfig.settings.enableWSConnection) {
      subscribeMessageByTopic("EXT_BANNER_GPCONNECT_RESYNCED", 'GPCONNECT_SYNC_COMPLETE', (cb) => {
        console.log('reloading gpconnect data due to resync');
        console.log('response for notification topic');
        this.toastrService.warning('GP Connect data has been refreshed for this patient.');
        if (!this.hideGPConnectFeature) {//added both fns for gpconnect
          this.getGPConnectData();
        }
      });
    }
  }

  ngOnInit() {
    this.mainWarnings = this.sharedData.mainWarnings
    this.resizeSubscription = this.resizeService.displayPort$.subscribe((value: any) => {
      this.displayPort = value;
    });
  }

  ngOnDestroy() {
    if (this.resizeSubscription) {
      this.resizeSubscription.unsubscribe();
    }
  }

  @Input() set value(value: string) {
    if (value) {
      this.personId = value;
      this.getPatientBannerConfig();
      if (!this.hideGPConnectFeature) {//added both fns for gpconnect
        this.getDemographics().then(() => {
          this.getGPConnectData();
          if (AppConfig.settings.enableWSConnection)
            registerSubscribers("EXT_BANNER_GPCONNECT_RESYNCED", 'GPCONNECT_SYNC_COMPLETE', this.handleGPCRTNotificationResponse.bind(this));
        });
      }
    }
  };


  @Output() returnExtendedBannerResponse: EventEmitter<boolean> = new EventEmitter();

  sendExtendedBannerResponse(value: boolean) {
    this.returnExtendedBannerResponse.emit(value);
  }
  activetabClick(header: any) {
    this.activetab = header;
  }

  getPatientBannerConfig() {
    this.httpClient.get("./assets/config/patientBannerNew.json")
      .subscribe(
        (data) => {

          this.patientBanner = <PatientBanner>data;
          if(this.sharedData.showClinicInformation==true){
            this.activetab = "Clinical Information"
           
          }else{
            this.activetab = this.patientBanner.columns[0].header
          }
         
          this.showbanner = true;
          this.generateMainPatientBanner();
          //  this.generateColumnsOfPatientBanner();
        }
      );

  }
  ngAfterViewInit() {

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


    for (var i = 0; i < this.patientBanner.columns.length; i++) {

      let column: Column = this.patientBanner.columns[i];
      ///////////////////////////////////////
      let tabdiv = document.getElementById(column.id);
      let columnsDiv = document.createElement("div");
      columnsDiv.classList.add("row");
      if (column.id == "warringcontant") {
        let waringhtml = document.getElementById("waringhtml");
        if(waringhtml){
        tabdiv.appendChild(waringhtml);
        }
        continue;
      }
      ////////////////////////////////////////////
      // let columnDiv = document.createElement("div");
      // columnDiv.classList.add("col-md-3");

      // let spanHeader = document.createElement("span");
      // spanHeader.classList.add("h5");
      // if (column.header != "") {
      //   spanHeader.innerHTML = column.header;
      // }
      // else {
      //   spanHeader.innerHTML = column.header;
      // }
      // columnDiv.appendChild(spanHeader);
      for (var p = 0; p < column.data.length; p++) {
        let colDataArray: any;
        let URL = column.data[p].endpointUri
        if (AppConfig.settings.env == "social_care") {
          URL = column.data[p].socialcareURL;
        }

        this.generateArrayData(tabdiv, column, URL, column.data[p].config)
        //   if (column.data[p].endpointUri != "") {
        //     await this.reqService.getRequest(column.data[p].endpointUri + this.personId)
        //       .then(
        //         (data) => {
        //           colDataArray = JSON.parse(data);
        //         }
        //       );
        //   }
        //   else {
        //     colDataArray = null;
        //   }
        //   for (var colData = 0; colData < colDataArray.length; colData++) {
        //     let maindatarow = document.createElement("row");
        //     maindatarow.classList.add("row");
        //     let divcard = document.createElement("card");
        //     divcard.classList.add("card");
        //     let divebody = document.createElement("card-body");
        //     divebody.classList.add("card-body");

        //     divcard.appendChild(divebody);
        //     divebody.appendChild(maindatarow);

        //   for (var j = 0; j < column.data.length; j++) {
        //     let data: PatientBannerColumnLabelData = column.data[j];

        //     let datarow = document.createElement("div");
        //     datarow.classList.add("col-3");

        //     let columnLabel = document.createElement("div");
        //     columnLabel.classList.add("col-sm-12");

        //     let spanLabel = document.createElement("span");
        //     spanLabel.classList.add("h6");
        //     spanLabel.innerHTML = data[j].label;

        //     columnLabel.appendChild(spanLabel);

        //     datarow.appendChild(columnLabel);

        //     let columnValue = document.createElement("div");
        //     columnValue.classList.add("col-sm-12");

        //     if (data.config.dataColumn) {
        //       let colRowData: any;
        //       if (data.endpointUri != "") {
        //         await this.reqService.getRequest(data.endpointUri + this.personId)
        //           .then(
        //             (response) => {
        //               colRowData = JSON.parse(response);
        //             }
        //           )

        //         if (colRowData.length > 0) {

        //           for (var k = 0; k < colRowData.length; k++) {
        //             //added extra div for formatting
        //             let divrowvalue = document.createElement("div");
        //             divrowvalue.classList.add("col");

        //             //added extra div for formatting
        //             let divcolvalue = document.createElement("div");
        //             divcolvalue.classList.add("col-sm-12", "pb-3");

        //             let spanvalue = document.createElement("span");
        //             let spanvalueLable = document.createElement("span");
        //             spanvalueLable.classList.add("h6");
        //             //spanvalue.classList.add("h6");

        //             if (colRowData[k][data.dataColumn] && colRowData[k][data.dataColumn] != "") {
        //               spanvalueLable.innerHTML = colRowData[k][data.label];
        //               spanvalue.innerHTML = colRowData[k][data.dataColumn];
        //             }
        //             else {
        //               spanvalue.innerHTML = "&nbsp";
        //             }
        //             divcolvalue.appendChild(spanvalueLable);
        //             divcolvalue.appendChild(spanvalue);
        //             divrowvalue.appendChild(divcolvalue);
        //             columnValue.appendChild(divrowvalue);

        //           }

        //         }
        //         else {
        //           //added extra div for formatting
        //           let divrowvalue = document.createElement("div");
        //           divrowvalue.classList.add("row");

        //           //added extra div for formatting
        //           let divcolvalue = document.createElement("div");
        //           divcolvalue.classList.add("col-sm-12", "pb-3");

        //           let spanvalue = document.createElement("span");
        //           //spanvalue.classList.add("h6");

        //           spanvalue.innerHTML = "&nbsp";

        //           divcolvalue.appendChild(spanvalue);
        //           divrowvalue.appendChild(divcolvalue);
        //           columnValue.appendChild(divrowvalue);
        //         }
        //       }
        //       else {
        //         if (colData && colData.length > 0) {
        //           //added extra div for formatting
        //           let divRowValue = document.createElement("div");
        //           divRowValue.classList.add("row");

        //           //added extra div for formatting
        //           let divColValue = document.createElement("div");
        //           divColValue.classList.add("col-sm-12", "pb-3");

        //           let spanValue = document.createElement("span");
        //           //spanValue.classList.add("h6");

        //           if (colData[0][data.dataColumn] && colData[0][data.dataColumn] != "") {
        //             spanValue.innerHTML = colData[0][data.dataColumn];
        //           }
        //           else {
        //             spanValue.innerHTML = "&nbsp";
        //           }

        //           divColValue.appendChild(spanValue);
        //           divRowValue.appendChild(divColValue);
        //           columnValue.appendChild(divRowValue);
        //         }
        //         else {
        //           //added extra div for formatting
        //           let divRowValue = document.createElement("div");
        //           divRowValue.classList.add("row");

        //           //added extra div for formatting
        //           let divColValue = document.createElement("div");
        //           divColValue.classList.add("col-sm-12", "pb-3");

        //           let spanValue = document.createElement("span");
        //           //spanValue.classList.add("h6");
        //           spanValue.innerHTML = "&nbsp";

        //           divColValue.appendChild(spanValue);
        //           divRowValue.appendChild(divColValue);
        //           columnValue.appendChild(divRowValue);
        //         }
        //       }

        //     }
        //     else {
        //       //added extra div for formatting
        //       let divRowValue = document.createElement("div");
        //       divRowValue.classList.add("row");

        //       //added extra div for formatting
        //       let divColValue = document.createElement("div");
        //       divColValue.classList.add("col-sm-12", "pb-3");

        //       let spanValue = document.createElement("span");
        //       //spanValue.classList.add("h6");
        //       spanValue.innerHTML = "&nbsp";

        //       divColValue.appendChild(spanValue);
        //       divRowValue.appendChild(divColValue);
        //       columnValue.appendChild(divRowValue);
        //     }

        //     datarow.appendChild(columnValue);

        //     columnsDiv.appendChild(datarow);
        //     tabdiv.appendChild(columnsDiv);
        //   }
        // }
      }
    
      //  columnsDiv.appendChild(columnDiv);
    }
   
    // this.columns = columnsDiv.outerHTML;
  }

  async generateArrayData(columnsDiv: any, column: Column, url: string, configobj: config[]) {


    let colDataArray: any;

    if (url != "") {
      await this.reqService.getRequest(url + this.personId)
        .then(
          (data) => {
            colDataArray = JSON.parse(data);
            if(this.counter==5){//check all banner url loaded
              this.sharedData.showExpandedBanner=true;
              this.sharedData.showClinicInformation=false;
            }
            this.counter++;
           
          }
        );
    }
    else {
      colDataArray = null;
    }
    var colData = 0
    if (colDataArray.length == 0) {
      colData = -1
    }
    for (colData; colData < colDataArray.length; colData++) {
      let maindatarow = document.createElement("div");
      maindatarow.classList.add("row");
      let divcard = document.createElement("card");
      divcard.classList.add("card");
      divcard.style.marginBottom = "0px"
      let divebody = document.createElement("card-body");
      divebody.classList.add("card-body");

      divcard.appendChild(divebody);
      divebody.appendChild(maindatarow);
      for (var j = 0; j < configobj.length; j++) {
        let data: config = configobj[j];
        if (data.label == "Other Contact" && this.env == "social_care") {
          continue;
        }
       
        if (data.label == "Lives with Person" && this.env != "social_care") {
          continue;
        }
        let datarow = document.createElement("div");
        datarow.classList.add("col");
        maindatarow.appendChild(datarow);
        let columnLabel = document.createElement("div");
        columnLabel.classList.add("row");

        let spanLabel = document.createElement("span");
        spanLabel.classList.add("col", "h6");


        spanLabel.innerHTML = data.label;

        // display redflags in warnings section at last
        if(this.env == 'social_care' && colDataArray[0] && colDataArray[0].redflags) {
          this.redflags = colDataArray[0].redflags;
        }



        if (data.label == "Height") {
          let hight = document.createElement("span");
          hight.classList.add("Reference_height", "col");
          hight.style.width = "35";
          hight.style.cursor = "pointer";
          hight.style.height = "35";
          hight.style.marginTop = "-5px"
          hight.style.marginLeft = "6px"
          hight.style.backgroundImage = "url('assets/images/Edit _Button_Small.svg')";
          hight.style.backgroundRepeat = "no-repeat";

          hight.addEventListener("click", this.openRecordHeightModal.bind(this, 'H'))
          // hight.setAttribute("onclick", "openRecordHeightModal()") 
          spanLabel.appendChild(hight);

          //= this.openRecordHeightModal();
          // spanLabel.innerHTML = data.label + "<div title='Height' class='Reference_height' (click)='openRecordHeightModal('H')'></div>"
        }
        if (data.label == "Waist Circumference") {
          let Weight = document.createElement("span");
          Weight.classList.add("col");
          Weight.style.width = "35";
          Weight.style.height = "35";
          Weight.style.cursor = "pointer";
          Weight.style.marginTop = "-5px"
          Weight.style.marginLeft = "6px"
          Weight.style.backgroundImage = "url('assets/images/Edit _Button_Small.svg')";
          Weight.style.backgroundRepeat = "no-repeat";

          Weight.addEventListener("click", this.openCircumferenceModal.bind(this, 'W'))
          // hight.setAttribute("onclick", "openRecordHeightModal()") 
          spanLabel.appendChild(Weight);

          //= this.openRecordHeightModal();
          // spanLabel.innerHTML = data.label + "<div title='Height' class='Reference_height' (click)='openRecordHeightModal('H')'></div>"
        }
        if (data.label == "Weight") {
          let Weight = document.createElement("span");
          Weight.classList.add("col");
          Weight.style.width = "35";
          Weight.style.height = "35";
          Weight.style.cursor = "pointer";
          Weight.style.marginTop = "-5px"
          Weight.style.marginLeft = "6px"
          Weight.style.backgroundImage = "url('assets/images/Edit _Button_Small.svg')";
          Weight.style.backgroundRepeat = "no-repeat";

          Weight.addEventListener("click", this.openRecordWeightModal.bind(this, 'W'))
          // hight.setAttribute("onclick", "openRecordHeightModal()") 
          spanLabel.appendChild(Weight);

          //= this.openRecordHeightModal();
          // spanLabel.innerHTML = data.label + "<div title='Height' class='Reference_height' (click)='openRecordHeightModal('H')'></div>"
        }
        if (data.label == "Allergies") {
          if(this.env != 'mental_healthcare') {
            let button = document.createElement("span");
            button.classList.add("col");
            button.style.width = "35";
            button.style.height = "35";
            button.style.cursor = "pointer";
            button.style.marginTop = "-5px"
            button.style.marginLeft = "6px"
            button.style.backgroundImage = "url('assets/images/Edit _Button_Small.svg')";
            button.style.backgroundRepeat = "no-repeat";
  
            button.addEventListener("click", this.resolveModule.bind(this, 'H'))
            // hight.setAttribute("onclick", "openRecordHeightModal()") 
            spanLabel.appendChild(button);
  
            //= this.openRecordHeightModal();
            // spanLabel.innerHTML = data.label + "<div title='Height' class='Reference_height' (click)='openRecordHeightModal('H')'></div>"
          }
         
        }
        if (data.label == "Diagnosis") {
          if(this.env != 'mental_healthcare'){
            let button = document.createElement("span");
            button.classList.add("col");
            button.style.width = "35";
            button.style.height = "35";
            button.style.cursor = "pointer";
            button.style.marginTop = "-5px"
            button.style.marginLeft = "6px"
            button.style.backgroundImage = "url('assets/images/Edit _Button_Small.svg')";
            button.style.backgroundRepeat = "no-repeat";

            button.addEventListener("click", this.openDiagnosis.bind(this, 'H'))
            // hight.setAttribute("onclick", "openRecordHeightModal()") 
            spanLabel.appendChild(button);

            //= this.openRecordHeightModal();
            // spanLabel.innerHTML = data.label + "<div title='Height' class='Reference_height' (click)='openRecordHeightModal('H')'></div>"
          }
        }

        columnLabel.appendChild(spanLabel);

        datarow.appendChild(columnLabel);


        let columnValue = document.createElement("div");
        columnValue.classList.add("row");

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
              if(data.label == "Procedures"){
                for (var k = 0; k < colRowData.length; k++) {
                  let divrowvalue = document.createElement("div");

                  let divcolvalue = document.createElement("div");
                  divcolvalue.classList.add("col-12", "pb-1");
  
                  let spanvalue = document.createElement("span");
  
                  let divToolTip = document.createElement("div");
  
  
                  if (colRowData[k][data.dataColumn] && colRowData[k][data.dataColumn] != "") {
                    divToolTip.innerHTML = colRowData[k][data.dataColumn];
                    divToolTip.classList.add("procedureTooltip");
                    spanvalue.innerHTML = "<b>Name:</b> " + colRowData[k][data.dataColumn] + "<br /><b>Code:</b> " + colRowData[k]["code"] + "<br /><b>Procedure Date:</b> " + this.formatDate(colRowData[k]["proceduredate"]);
                    spanvalue.classList.add("procedureTooltiptext");
                  }
                  else {
                    spanvalue.innerHTML = "&nbsp";
                  }
                  divToolTip.appendChild(spanvalue)
                  divcolvalue.appendChild(divToolTip);
                  divrowvalue.appendChild(divcolvalue);
                  columnValue.appendChild(divrowvalue);
                }
              }
              else {
                for (var k = 0; k < colRowData.length; k++) {
                  //added extra div for formatting
                  let divrowvalue = document.createElement("div");
                  divrowvalue.classList.add("h6");
  
                  //added extra div for formatting
                  let divcolvalue = document.createElement("div");
                  divcolvalue.classList.add("col-sm-12", "pb-3");
  
                  let spanvalue = document.createElement("span");
                  spanvalue.classList.add("col", "h6");
                  let spanvalueLable = document.createElement("span");
                  spanvalueLable.classList.add("col", "h6");
                  //spanvalue.classList.add("h6");
  
                  if (colRowData[k][data.dataColumn] && colRowData[k][data.dataColumn] != "") {
                    spanvalueLable.innerHTML = colRowData[k][data.label];
                    spanvalue.innerHTML = colRowData[k][data.dataColumn];
                  }
                  else {
                    spanvalue.innerHTML = "&nbsp";
                  }
                  divcolvalue.appendChild(spanvalueLable);
                  divcolvalue.appendChild(spanvalue);
                  divrowvalue.appendChild(divcolvalue);
                  columnValue.appendChild(divrowvalue);
  
                }
              }
            }
            else {
              //added extra div for formatting
              let divrowvalue = document.createElement("div");
              divrowvalue.classList.add("row");

              //added extra div for formatting
              let divcolvalue = document.createElement("div");
              divcolvalue.classList.add("col-sm-12", "pb-3");

              let spanvalue = document.createElement("span");
              //spanvalue.classList.add("h6");

              spanvalue.innerHTML = "&nbsp";

              divcolvalue.appendChild(spanvalue);
              divrowvalue.appendChild(divcolvalue);
              columnValue.appendChild(divrowvalue);
            }
          }
          else {
            if (colDataArray[colData]) {
              //added extra div for formatting
              // let divRowValue = document.createElement("div");
              // divRowValue.classList.add("row");

              //added extra div for formatting
              // let divColValue = document.createElement("div");
              // divColValue.classList.add("col");

              let spanValue = document.createElement("span");
              spanValue.classList.add("col");
              spanValue.style.paddingBottom = "15px"
             
              let codedata =colDataArray[colData][data.dataColumn]
              if (colDataArray[colData][data.dataColumn] && colDataArray[colData][data.dataColumn] != "") {
                if(data.label =="Is Next Of Kin" && data.dataColumn == "contactrolecode"){
                 
                  if(codedata.includes("NOK")){
                    spanValue.innerHTML = "Yes"
                  }
                  else{
                    spanValue.innerHTML = "No"
                  }
                }
                else if(data.label =="Emergency Contact" && data.dataColumn == "contactrolecode"){
                  if(codedata.includes("EC")){
                    spanValue.innerHTML = "Yes"
                  }
                  else{
                    spanValue.innerHTML = "No"
                  }

                }
                else if(data.label =="Main Contact" && data.dataColumn == "contactrolecode"){
                  if(codedata.includes("MC")){
                    spanValue.innerHTML = "Yes"
                  }
                  else{
                    spanValue.innerHTML = "No"
                  }

                }
                else if((data.dataColumn == "telnumber" && columnsDiv.id == "Demographicinformation") && AppConfig.settings.env == "social_care") {
                  let telephoneValue = colDataArray[colData][data.dataColumn];
                  let splitTelNumber = telephoneValue.split('|');
                  let splitISDCode = splitTelNumber[0].split('_');
                  let finalTelephoneNumber = '+' + splitISDCode[1] + splitTelNumber[1];
                  spanValue.innerHTML = finalTelephoneNumber;
                }
               else if (data.dataColumn == "telnumber" || data.dataColumn == "othercontact" || data.dataColumn == 'Email') {
                  spanValue.innerHTML = colDataArray[colData][data.dataColumn].replaceAll(',', '<br/>');
                }                
               else if (data.dataColumn == "address") {

                  let address = colDataArray[colData][data.dataColumn].replaceAll(',,', ',');
                  if (address) {
                    address = address.replaceAll(',,', ',');
                    address = address.replaceAll(', ,', ',');
                    spanValue.innerHTML = address.replaceAll(',  ,', ',');
                  }
                }
                else if (data.dataColumn == "weight") {
                  spanValue.innerHTML = colDataArray[colData][data.dataColumn] + " kg";
                }
                else if (data.dataColumn == "circumf" || data.dataColumn == "height") {
                  spanValue.innerHTML = colDataArray[colData][data.dataColumn] + " cm";
  
                }
                else {

                  spanValue.innerHTML = colDataArray[colData][data.dataColumn];
                }
              }           

              else {
                spanValue.innerHTML = "&nbsp";
              }

              // divColValue.appendChild(spanValue);
              // divRowValue.appendChild(divColValue);

              columnValue.appendChild(spanValue);


            }
            else {
              //added extra div for formatting
              let divRowValue = document.createElement("div");
              divRowValue.classList.add("row");

              //added extra div for formatting
              let divColValue = document.createElement("div");
              divColValue.classList.add("col-sm-12", "pb-3");

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
          divColValue.classList.add("col-sm-12", "pb-3");

          let spanValue = document.createElement("span");
          //spanValue.classList.add("h6");
          spanValue.innerHTML = "&nbsp";

          divColValue.appendChild(spanValue);
          divRowValue.appendChild(divColValue);
          columnValue.appendChild(divRowValue);
        }

        datarow.appendChild(columnValue);

        columnsDiv.appendChild(divcard);

      }
    }



  }
  resolveModule() {
    this.sharedData.showExpandedBanner=false;
    this.headerService.loadSecondaryModule.next("app-terminus-allergies");
  }
  openDiagnosis() {
    this.sharedData.showExpandedBanner=false;
    this.headerService.loadSecondaryModule.next("app-clinical-summary");
  }
  
  openRecordWeightModal(context: string) {

    const config = {
      backdrop: true,
      ignoreBackdropClick: true,
      class: 'modal-dialog-centered',
      initialState: {
        errorMessage: ""
      }
    };

    this.bsModalRef = this.modalService.show(RefWeightHeightComponent, config);
    this.bsModalRef.content = {
      saveDone: (isDone) => {
        this.headerService.loadPatientBanner.next(this.webStorage.getSessionStorageItem("terminus:personcontext"));
        // if (isDone && context == 'D' && this.appService.isWeightCapturedForToday) {
        //   //this.LoadModule('app-inpatient-prescribing');
        // }
      }
    };


  }
  openCircumferenceModal(context: string) {

    const config = {
      backdrop: true,
      ignoreBackdropClick: true,
      class: 'modal-dialog-centered',
      initialState: {
        errorMessage: ""
      }
    };

    this.bsModalRef = this.modalService.show(RefWaistcircumferenceComponent, config);
    this.bsModalRef.content = {
      saveDone: (isDone) => {
       // this.headerService.loadPatientBanner.next(this.webStorage.getSessionStorageItem("terminus:personcontext"));
        // if (isDone && context == 'D' && this.appService.isWeightCapturedForToday) {
        //   //this.LoadModule('app-inpatient-prescribing');
        // }
      }
    };


  }
  EditBanner() {
    this.headerService.loadSecondaryModule.next("person-manager-module");
    this.sharedData.componentLoaderAdditionalInfo.push(new AdditionalInfo("editmode", true));
  }
  openRecordHeightModal(context: string) {


    const config = {
      backdrop: true,
      ignoreBackdropClick: true,
      class: 'modal-dialog-centered',
      initialState: {
        errorMessage: ""
      }
    };

    this.bsModalRef = this.modalService.show(RecRefHeightComponent, config);
    this.bsModalRef.content = {
      saveDone: (isDone) => {
        this.headerService.loadPatientBanner.next(this.webStorage.getSessionStorageItem("terminus:personcontext"));
        // if (isDone && context == 'D' && this.appService.isWeightCapturedForToday) {
        //   //this.LoadModule('app-inpatient-prescribing');
        // }
      }
    };

  };

  removeTimePartIfExists(dateVal: string | null, format?: string | null, inputFormat?: string | null) : string {
    if(!dateVal) return '';
    try {
      let fmtDt = moment(moment(dateVal).format('LL')).format(format ?? 'DD/MM/YYYY');
      console.log('1', dateVal, moment(moment(dateVal).format('LL')).isValid())
      if(moment(fmtDt).isValid())
        return fmtDt;
      fmtDt  = moment(dateVal, inputFormat ??'YYYY-MM-DD').format('DD/MM/YYYY');
      console.log('2', dateVal, moment(fmtDt).isValid())

      if(moment(fmtDt).isValid())
        return fmtDt;
      console.log('3', dateVal, moment(dateVal, inputFormat ?? 'DD-MM-YYYY').isValid())
    return  moment(dateVal, inputFormat ?? 'DD-MM-YYYY').format('DD/MM/YYYY');
      // let dt: string[] = [dateVal];
      // if(dateVal.includes('T'))
      //   dt = dateVal.split('T');
      // else if(dateVal.includes(' '))
      //   dt = dateVal.split(' ')
      // if(!dt || !dt.length) return '';
      // let day, month, year;
      // if (/^\d{1,2}\-\d{1,2}\-\d{4}$/.test(dt[0]))
      //   [day, month, year] = dt[0].split("-")
      // else if (/^\d{1,2}\/\d{1,2}\/\d{4}$/.test(dt[0]))
      //   [month, day, year] = dt[0].split("/")
      // else
      //   [year, month, day] = dt[0].split("-");

      // const date = new Date(Number(year), Number(month) - 1, Number(day));
      // date.setDate(date.getDate());
      // const val = new DatePipe('en-UK').transform(date, 'dd/MM/yyyy');
      // return val;
    } catch(e) { 
      console.error('Unable to format the input date', e);
      try {
        return moment(dateVal, 'DD-MM-YYYY').format('DD/MM/YYYY');
      } catch {}
      return ''; 
    }
  }

  getScheduleEndDtForGPCData(endDt: string | null, duration: string | null, startDt: string | null) {
    if (endDt) return this.removeTimePartIfExists(endDt);
    if (!endDt && !duration) return '';
    if (!startDt) return '';
    if (startDt && duration) {
      return moment(startDt).add(1, 'days').format('DD/MM/YYYY');
      // startDt = this.removeTimePartIfExists(startDt);
      // const [day, month, year] = startDt.split("/")
      // const date = new Date(Number(year), Number(month) -1, Number(day));
      // date.setDate(date.getDate() + Number(duration));
      // return new DatePipe('en-UK').transform(date, 'dd/MM/yyyy');
    }
    return '';
  }

  displayGPAllergyDetail(allergy: any): string {
    const allergyText = allergy.allergytext ? allergy.allergyText : '';
    if(!allergy || !allergy.allergyCodes || !allergy.allergyCodes.length) return allergyText;

    const snomedCode = allergy.allergyCodes.filter(rec=> rec.system === 'http://snomed.info/sct');
    if(!snomedCode || !snomedCode.length) return allergyText;

    return `${snomedCode[0].code} - ${snomedCode[0].text} ${allergyText}`;
  }
  displayGPAllergyReactions(allergy: any): string[] {
    if(!allergy || !allergy.reactions || !allergy.reactions.length) return [];

    const reactions: string[] = [];
    for(const reaction of allergy.reactions) {
      let reactionVal = '';
      reactionVal = reaction.severity ?? '';
      const snomedCode = reaction.manifestations?.filter(rec=> rec.system === 'http://snomed.info/sct');
      if(snomedCode && snomedCode.length)
      reactionVal = reactionVal ? `${reactionVal} - ${snomedCode[0].text}` : '';
      
      if(reactionVal && reactionVal.length)
      reactions.push(reactionVal);
    }
    return reactions;
  }

  async getGPConnectData() {
    const acuteMedicationsSinceInMonths = AppConfig.settings.GPConnectConfig.acuteMedicationsInMonths;
    const repeatMedicationsSinceInMonths = AppConfig.settings.GPConnectConfig.repeatMedicationsInMonths;
    const nhsNumber = this.demographics.nhsnumber;
    //const encounterId = null;//any recent encounter for this nhs number
    if(!nhsNumber) {
      console.error('Unable to get NHSNumber to sync GPConnect data');
      return;
    }
    //always try to get data for most recent sync
    const response: GPConnectGetDataResponse = await this.gpConnectService.getGPConnectData(nhsNumber, acuteMedicationsSinceInMonths, repeatMedicationsSinceInMonths);
    console.log('gp connect api response===', response);
    this.gpConnect.syncState = GPConnectSyncStatus.Unverified;
    this.handleGPConnectResponse(response);
  }

  handleGPConnectResponse(response: GPConnectGetDataResponse) {
    this.gpConnect.data = null;
    this.gpConnect.msgs = [];
    this.gpConnectMsgLen = 0;
    if (!response || !response.data || (response.errorMessages && response.errorMessages.length)) {
      let msg = response && response.errorMessages?.join('. ',);
      msg = msg || 'UNKNOWN ERROR: No response returned from the GP Connect Synapse API';
      //this.toastrService.error(msg);
      console.log(msg);
      this.gpConnect.syncState = (response && response.statusCode === 200) ? GPConnectSyncStatus.Unverified : GPConnectSyncStatus.UNKNOWNERROR;
      return;
    }
    this.gpConnect.data = response.data;
    //there cannot be multiple syncstatus returned - but messages can be
    if (response.data.messages && response.data.messages.length) {
      let msgIndex = 0;
      for (const msg of response.data.messages) {
        if (!msg) continue;
        const { messageCode, messageText, messageCategory, messageSyncOpCategory } = msg;
        if (msgIndex === 0) {
          const msgCodeAsInt = messageCode != null ? parseInt(messageCode) : 0;
          if (msgCodeAsInt === 1) {
            this.gpConnect.syncState = GPConnectSyncStatus.PDSVerificationFail;
            if(messageSyncOpCategory === 'GPC API Error')
              this.gpConnect.msgs.push(messageText);
          }
          else if (msgCodeAsInt === 2) {
            this.gpConnect.syncState = GPConnectSyncStatus.Success_With_Warnings;
            this.gpConnect.msgs.push(messageText);
          }
          else if (msgCodeAsInt === 0)
            this.gpConnect.syncState = GPConnectSyncStatus.Success;
        }
        if(this.gpConnect.msgs && this.gpConnect.msgs.length)
           this.gpConnectMsgLen = this.gpConnect.msgs.join('. ').length;
      }
    } else {
      this.gpConnect.syncState = GPConnectSyncStatus.Success;
    }
  }

  async getDemographics() {
    const response: any = await this.reqService.getRequest(AppConfig.settings.apiServices.find(x => x.serviceName == 'GetBannerMainDemographics').serviceUrl + '?synapseattributename=person_id&attributevalue=' + this.personId)
    if (response) {
      this.demographics = JSON.parse(response)[0];
      if (this.demographics.nhsnumber) {
        this.demographics.nhsnumber = this.demographics.nhsnumber.replace(/\s/g, "");
      }
    }
  }

  handleGPCRTNotificationResponse(res: NotificationReceivedResponse) {
    if (!this.hideGPConnectFeature && res && res.data) {
      console.log('response for notification api', res);
      const { personId, nhsNumber } = JSON.parse(res.data);
      if (!this.hideGPConnectFeature) {//added both fns for gpconnect
        console.log('reloading gpconnect data due to resync', res, nhsNumber, this.demographics);
        if (nhsNumber && this.demographics.nhsnumber && nhsNumber === this.demographics.nhsnumber) {
          this.toastrService.warning('GP Connect data has been refreshed for this patient.');
          this.getGPConnectData();
        }
        //this.getGPConnectData();
      }
    }
  }

  formatDate(inputDate) {
    var date = new Date(inputDate);
  
    // Extract the components of the date
    var day = date.getDate();
    var month = date.getMonth() + 1; // Months are zero-based
    var year = date.getFullYear();
  
    // Pad the day and month with leading zeros if necessary
    var formattedDay = day < 10 ? "0" + day : day;
    var formattedMonth = month < 10 ? "0" + month : month;
  
    // Return the formatted date string
    return formattedDay + "/" + formattedMonth + "/" + year;
  }
  ResolveBannerWarning(Warning){
    this.sharedData.showExpandedBanner=false;
    if(Warning.warninggroup == "WEIGHT"){
      const config = {
        backdrop: true,
        ignoreBackdropClick: true,
        class: 'modal-dialog-centered',
        initialState: {
          errorMessage: ""
        }
      };
  
      this.bsModalRef = this.modalService.show(RefWeightHeightComponent, config);
      this.bsModalRef.content = {
        saveDone: (isDone) => {
          this.headerService.loadPatientBanner.next(this.webStorage.getSessionStorageItem("terminus:personcontext"));
          // if (isDone && context == 'D' && this.appService.isWeightCapturedForToday) {
          //   //this.LoadModule('app-inpatient-prescribing');
          // }
        }
      };
    }
    if(Warning.warninggroup.toLowerCase().includes("allergies")) {
      this.headerService.loadSecondaryModule.next("app-terminus-allergies");
    }
    if(Warning.warninggroup == "VTE"){
    this.headerService.loadSecondaryModule.next("app-assessments-module");
    }
    // if(Warning.warninggroup == "VTE"){

    // }
  }
}
