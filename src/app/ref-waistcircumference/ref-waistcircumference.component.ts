//BEGIN LICENSE BLOCK 
//Interneuron Terminus

//Copyright(C) 2024  Interneuron Limited

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
import { Component, Input, OnInit } from '@angular/core';
import { BsModalRef } from 'ngx-bootstrap/modal';
import { ApirequestService } from 'src/app/services/apirequest.service';
import { v4 as uuidv4 } from 'uuid';
import { Subscription } from 'rxjs';
import { AppConfig } from 'src/app/app.config';
import { Observation, Observationevent, PersonObservationScale } from 'src/app/Models/person.model';
import { AuthenticationService } from 'src/app/services/authentication.service';
import { filter, filterParams, filterparam, filters, orderbystatement, selectstatement } from 'src/app/Models/Filter.model';
import { SharedDataContainerService } from 'src/app/services/shared-data-container.service';
import * as moment from 'moment';

@Component({
  selector: 'app-ref-waistcircumference',
  templateUrl: './ref-waistcircumference.component.html',
  styleUrls: ['./ref-waistcircumference.component.css']
})
export class RefWaistcircumferenceComponent implements OnInit {

  subscriptions: Subscription = new Subscription();

  observationevent_id: string = '';
  eventcorrelationid: string;
  height: any;
  errorMessage: string = "";
  unitOfMeasure: string;
  headerLabelText: string;
  isSaving: boolean = false;
  invalidHeight = false;
  personId = "";
  username = ""
  personscale: PersonObservationScale;
  listofRecords:any;
  Choosenfilterdate:any;
  filterdata:any;

  constructor(private apiRequest: ApirequestService, private sharedData: SharedDataContainerService, private authService: AuthenticationService, public bsModalRef: BsModalRef) {
    this.headerLabelText = "Reference Waist circumference";
    this.unitOfMeasure = "cm";
    this.init();
  }

  @Input() set value(value: string) {
    if (value) {
      this.personId = this.sharedData.personId;

    }
  };
  ngOnInit(): void {
    let decodedToken = this.authService.decodeAccessToken(this.authService.user.access_token);
    if (decodedToken != null)
      this.username = decodedToken.name ? (Array.isArray(decodedToken.name) ? decodedToken.name[0] : decodedToken.name) : decodedToken.IPUId;

    //set uer idle session timeout settings from config.

  }

  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }
  ChoosenfilterdateChange(value: Date): void {
   // this.Choosenfilterdate = moment(value,"DD/MM/YYYY");
   
   let selectedDate= moment(value);
   let maxselectedDate= moment(value);
   maxselectedDate.set({
    hour: 23,
    minute: 59,
    second: 0,
    millisecond: 0,
  });
   selectedDate.set({
    hour: 0,
    minute: 0,
    second: 0,
    millisecond: 0,
  });
  if(value){
    this.filterdata= this.listofRecords.filter(x=>moment(x.datestarted).isSameOrAfter(selectedDate) && moment(x.datestarted).isSameOrBefore(maxselectedDate) )
  }
  else{
    this.filterdata=this.listofRecords.slice(0,5);
  }
   
  }
  init() {
    this.errorMessage = "";

    this.apiRequest.postRequest(AppConfig.settings.apiServices.find(x => x.serviceName == 'GetWaistCircumferenceObservations').serviceUrl, this.createHeightFilter())
      .then((response) => {
        if (response.length > 0) {
          this.listofRecords=response;
          this.filterdata= this.listofRecords.slice(0,5);
          if (response[0].value != "" || response[0].value != null) {
            this.height = response[0].value;
          } else {
            this.height = 0;
          }
        } else {
          this.height = 0;
        }
      }
      )

  }

  inputCheck(event) {
    let height = event.target.value.toString();
    let [leftDigits, rightDigits] = height.split('.');
    let newLeftDigit;
    let newRightDigit;
    if (leftDigits.length > 3) {
      newLeftDigit = leftDigits.slice(0, 3);
    } else {
      newLeftDigit = leftDigits;
    }
    if (rightDigits && rightDigits.length > 2) {
      newRightDigit = rightDigits.slice(0, 2);
    } else if (rightDigits) {
      newRightDigit = rightDigits
    }
    let updatedHeight: any = newLeftDigit + (newRightDigit ? ('.' + newRightDigit) : '');
    if (leftDigits.length === 2 && leftDigits[0] === '0' && leftDigits[1] === '0') {
      updatedHeight = '0';
    }


    setTimeout(() => {
      if (updatedHeight == 0) {
        updatedHeight = undefined;
      }
      this.height = updatedHeight;
      this.errorMessage = "";
    }, 0);

  }

  saveHeightObs() {
    let isAmend: boolean = false;
    let observation_id: string = uuidv4();
    let personId: string = this.sharedData.personId;
    this.sharedData.getCurrentEncounter((encounterId: string) => {
      let scale: string = "" //this.sharedData.obsScales.filter(x => x.scaletypename == this.sharedData.currentEWSScale)[0].observationscaletype_id;
      let loggedInUser: string = this.username;

      if (this.errorMessage == "" && this.height && !(isNaN(this.height) || this.height <= 0)) {
        this.isSaving = true;
        this.observationevent_id = uuidv4();
        this.eventcorrelationid = uuidv4();

        let newObsEvent = new Observationevent(
          this.observationevent_id,
          personId,
          this.getDateTime(),
          this.getDateTime(),
          loggedInUser,
          encounterId,
          isAmend,
          168,
          scale,
          null,
          null,
          loggedInUser,
          null,
          null,
          this.eventcorrelationid,
          true);

        let heightObs = new Observation(
          observation_id,
          "",
          "",
          newObsEvent.datefinished,
          newObsEvent.observationevent_id,
          "cba85751-22ce-42b6-858b-0911eeae072e",
          "",
          this.height.toString(),
          false,
          loggedInUser,
          this.eventcorrelationid
        );
         this.sharedData.showExpandedBanner =false;
        this.apiRequest.postRequest(AppConfig.settings.apiServices.find(x => x.serviceName == 'PostObservationEvent').serviceUrl, JSON.stringify(newObsEvent))
          .then((response) => {



            this.apiRequest.postRequest(AppConfig.settings.apiServices.find(x => x.serviceName == 'PostObservation').serviceUrl, JSON.stringify(heightObs))
              .then((response) => {


                // this.appService.isHeightCaptured = true;
                this.sharedData.refHeightValue = this.height;
                this.sharedData.showClinicInformation=true;
                // this.sharedData.showExpandedBanner =true;
                this.bsModalRef.content.saveDone(true);
                this.bsModalRef.hide();

              }, (error) => {
                this.bsModalRef.hide();

              })

          }, (error) => {
            this.bsModalRef.hide();

          })

      } else {
        this.errorMessage = "Please enter correct value";
      }
    });
  }

  createHeightFilter() {
    //let condition = "person_id = @person_id and encounter_id = @encounter_id";
    let condition = "person_id = @person_id";

    let f = new filters()
    f.filters.push(new filter(condition));

    let pm = new filterParams();
    pm.filterparams.push(new filterparam("person_id", this.sharedData.personId));
    // pm.filterparams.push(new filterparam("encounter_id", this.appService.encounter.encounter_id));

    let select = new selectstatement("SELECT *");

    let orderby = new orderbystatement("ORDER BY observationeventdatetime desc");

    let body = [];
    body.push(f);
    body.push(pm);
    body.push(select);
    body.push(orderby);

    return JSON.stringify(body);
  }

  getDateTime(): string {
    var date = new Date();

    let year = date.getFullYear();
    let month = (date.getMonth() + 1);
    let day = date.getDate();
    let hrs = date.getHours();
    let mins = date.getMinutes();
    let secs = date.getSeconds();
    let msecs = date.getMilliseconds();

    let returndate = (year + "-" + (month < 10 ? "0" + month : month) + "-" + (day < 10 ? "0" + day : day) +
      "T" + (hrs < 10 ? "0" + hrs : hrs) + ":" + (mins < 10 ? "0" + mins : mins) + ":" + (secs < 10 ? "0" + secs : secs) + "." + (msecs < 10 ? "00" + msecs : (msecs < 100 ? "0" + msecs : msecs)));

    return returndate;
  }

}