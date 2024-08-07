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
import { Component, OnInit, ChangeDetectorRef, ViewChild, ElementRef } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { ApirequestService } from '../services/apirequest.service';
import { ErrorHandlerService } from '../services/error-handler.service';
import { HeaderService } from '../services/header.service';
import { AppConfig } from '../app.config';
import { AuthenticationService } from '../services/authentication.service';
import { WebStorageService } from '../services/webstorage.service';
import { RbacService } from '../services/rbac.service';
import { SharedDataContainerService } from '../services/shared-data-container.service';
import { Observation, Person } from '../Models/person.model';
import { ResizeService } from '../services/resize.service';
import { Subscription } from 'rxjs';
import { UserAgentService } from '../services/user-agent.service';
import { BrowserModel } from '../Models/browser.model';
import { Application } from '../Models/application.model';
import { filter, filterParams, filterparam, filters, orderbystatement, selectstatement } from '../Models/Filter.model';
import { RecRefHeightComponent } from '../rec-ref-height/rec-ref-height.component';
import { BsModalRef, BsModalService } from 'ngx-bootstrap/modal';
import { RefWeightHeightComponent } from '../ref-weight-height/ref-weight-height.component';


@Component({
  selector: 'app-banner',
  templateUrl: './banner.component.html',
  styleUrls: ['./banner.component.css']
})
export class BannerComponent implements OnInit {

  private resizeSubscription: Subscription;
  displayPort: string;

  logedinUserID: string;
  personId: string;
  userId: string;
  person: Person;
  passedInPersonId: string;
  bsModalRef: BsModalRef;

  showPatientBanner: boolean = false;
  isStandAloneApplication: boolean = false;
  demographicsReturned: boolean = false;
  unableToLoadPatient: boolean = false;

  browser: BrowserModel;
  isLatestAndGreatest: Boolean = false;

  nhsVerificationMessage: string = "";
  nhsVerificationStatus: string = "";

  personLabelText: string = AppConfig.settings.personLabelText ? AppConfig.settings.personLabelText : "Patient";
  env: string = AppConfig.settings.env;
  mainCarer: string="";

  constructor(private webStorageService: WebStorageService, public modalService: BsModalService, private reqService: ApirequestService, private headerService: HeaderService,
    private errorHandlerService: ErrorHandlerService, private authService: AuthenticationService, public sharedData: SharedDataContainerService, private resizeService: ResizeService, private cd: ChangeDetectorRef, private userAgentService: UserAgentService) {


    this.headerService.selectedApplication.subscribe(
      (application: Application) => {
        if (application.applicationtype_id == "STAND_ALONE") {
          this.isStandAloneApplication = true;
        }
        else {
          this.isStandAloneApplication = false;
        }
      }
    );


    this.headerService.myPatientSelected.subscribe(
      (myPatientSelected: string) => {
        if (myPatientSelected != "") {
          this.passedInPersonId = myPatientSelected;
          this.demographicsReturned = false;
          this.showPatientBanner = false;
          this.unableToLoadPatient = false;
          this.personId = myPatientSelected;
          this.webStorageService.setLocalStorageItem("Terminus:" + this.logedinUserID + ":Patient", myPatientSelected);
          this.sharedData.personId = myPatientSelected;
          this.getHeightWeight();
          this.showBannerIfPatientExists(myPatientSelected);
          //this.getPatientlists();
          //this.loadBanner(myPatientSelected);
        }
      },
      error => this.errorHandlerService.handleError(error)
    );

    this.headerService.loadPatientBanner.subscribe(
      (myPatientSelected: string) => {
        this.sharedData.personId = myPatientSelected;
        this.showBannerIfPatientExists(myPatientSelected);
      },
      error => this.errorHandlerService.handleError(error)
    );
  }



  async showBannerIfPatientExists(myPatientSelected: string) {
    this.showPatientBanner = false;
    this.cd.detectChanges();

    await this.reqService.getRequest(AppConfig.settings.apiServices.find(x => x.serviceName == 'GetPerson').serviceUrl + '&id=' + myPatientSelected)
      .then(
        (response) => {
          if (response) {
            this.person = JSON.parse(response);
            //console.log("Person Response: ", myPatientSelected);
            if (this.passedInPersonId === myPatientSelected) {
              this.showPatientBanner = true;
              this.unableToLoadPatient = false;
            }
            else {
              this.showPatientBanner = false;
              this.unableToLoadPatient = true;
            }
            this.cd.detectChanges();
          }
        }
      );
  }

  ngOnInit() {

    this.resizeSubscription = this.resizeService.displayPort$.subscribe((value: any) => {
      this.displayPort = value;
    });
    // this.dropdownSettings = {
    //   singleSelection: false,
    //   text: "Select Patient List",
    //   selectAllText: 'Select All',
    //   unSelectAllText: 'UnSelect All',
    //   enableSearchFilter: false,
    //   classes: "myclass custom-class"
    // };

    let UserdecodedToken = this.authService.decodeAccessToken(this.authService.user.access_token);
    if (UserdecodedToken != null) {
      this.logedinUserID = UserdecodedToken.IPUId;
    }

    this.browser = this.userAgentService.getBrowser();
    this.isLatestAndGreatest = this.userAgentService.checkIfLatestAndGreatest();

    console.log("Browser", this.browser);
    console.log("isLatestAndGreatest", this.isLatestAndGreatest);

  }
  openRecordWeightModal(context: string) {
  
    const config = {
      backdrop: true,
      ignoreBackdropClick: true,
      class: 'modal-dialog-centered modal-sm',
      initialState: {
        errorMessage: ""
      }
    };
    
    this.bsModalRef = this.modalService.show(RefWeightHeightComponent, config);
    this.bsModalRef.content = {
      saveDone: (isDone) => {
        // if (isDone && context == 'D' && this.appService.isWeightCapturedForToday) {
        //   //this.LoadModule('app-inpatient-prescribing');
        // }
      }
    };
 
       
  }
  openRecordHeightModal(context: string) {
 
    
        const config = {
          backdrop: true,
          ignoreBackdropClick: true,
          class: 'modal-dialog-centered modal-sm',
          initialState: {
            errorMessage: ""
          }
        };

        this.bsModalRef = this.modalService.show(RecRefHeightComponent, config);
        this.bsModalRef.content = {
          saveDone: (isDone) => {
            // if (isDone && context == 'D' && this.appService.isWeightCapturedForToday) {
            //   //this.LoadModule('app-inpatient-prescribing');
            // }
          }
        };
     
    };
 
  createWeightFilter() {
    // let condition = "person_id = @person_id and encounter_id = @encounter_id";
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
  createHeightFilter() {
    // let condition = "person_id = @person_id and encounter_id = @encounter_id";
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
  getHeightWeight() {
    this.sharedData.observation = [];

    this.reqService.postRequest(AppConfig.settings.apiServices.find(x => x.serviceName == 'Getweightobservations').serviceUrl, this.createHeightFilter())
      .then((response) => {
        if (response.length > 0) {

          for (let r of response) {
            this.sharedData.observation.push(<Observation>r);
          }
          if (response[0].value != "" || response[0].value != null) {
            let today = new Date();
            let lastObservedDate = new Date(response[0].observationeventdatetime);

            this.sharedData.refWeightValue = response[0].value;
            // this.appService.refWeightType = (response[0].method ?? "").indexOf("258083009") >= 0 ? RefWeightType.estimated :
            //     (response[0].method ?? "").indexOf("115341008") >= 0 ? RefWeightType.actual : null;

            // this.appService.refWeightRecordedOn = moment(new Date(response[0].observationeventdatetime)).format('DD-MMM-yyyy');
            // this.appService.logToConsole(`Weight: ${this.appService.refWeightValue} kg (${this.appService.refWeightRecordedOn})`);

            // let todayMoment = moment([today.getFullYear(), today.getMonth(), today.getDate()]);
            // let lastObservedMoment = moment([lastObservedDate.getFullYear(), lastObservedDate.getMonth(), lastObservedDate.getDate()]);
            // const diffDays = todayMoment.diff(lastObservedMoment, 'days');
            // this.appService.logToConsole(diffDays);

            // if (diffDays == 0) {
            //     this.appService.isWeightCapturedForToday = true;
            // } else {
            //     this.appService.isWeightCapturedForToday = false;
            // }
          }
          else {
            // this.appService.isWeightCapturedForToday = false;
          }
        }
        else {
          // this.appService.isWeightCapturedForToday = false;
          // this.appService.refWeightValue = undefined;
          // this.appService.refWeightType = null;
          // this.appService.refWeightRecordedOn = "";
        }
        // this.appService.logToConsole(this.appService.isWeightCapturedForToday);


        this.reqService.postRequest(AppConfig.settings.apiServices.find(x => x.serviceName == 'GetHeightOsbservations').serviceUrl, this.createHeightFilter())
          .then((response) => {
            if (response.length > 0) {
              if (response[0].value != "" || response[0].value != null) {
                // this.appService.isHeightCaptured = true;
                this.sharedData.refHeightValue = response[0].value;

                // if (!isNaN(+this.sharedData.refWeightValue) && +this.sharedData.refWeightValue > 0) {
                //     this.appService.bodySurfaceArea = +(Math.sqrt(+this.appService.refWeightValue * +response[0].value) / 60).toFixed(2);
                // }
              } else {
                //  this.appService.isHeightCaptured = false;
              }
            } else {
              // this.appService.isHeightCaptured = false;
              // this.appService.refHeightValue = undefined;
              // this.appService.bodySurfaceArea = undefined;
            }



          })
      })
  }

  ngOnDestroy() {
    if (this.resizeSubscription) {
      this.resizeSubscription.unsubscribe();
    }
    this.headerService.myPatientSelected.unsubscribe();
  }

  getUserId() {
    let decodedToken = this.authService.decodeAccessToken(this.authService.user.access_token);
    if (decodedToken != null)
      this.userId = decodedToken.IPUId.replace("\\", "\\\\");
  }

  
  receiveBannerDemographicResponse(value: boolean) {

    this.demographicsReturned = value;
    //console.log("receiveBannerDemographicResponse", value);
    //this.poaChange.emit(this.homePOA);
  }
  getmainCarer(value:string){
    
    this.mainCarer=value;
  }
  verifyNHS(event: any){
    if(event.nhsNumberVerification == 'Success'){
      this.nhsVerificationMessage = "The NHS Number has been successfully verified using the NHS Personal Demographics Service";
      this.nhsVerificationStatus = "success";
      this.displayNHSVerificationMessage();
    }
    else if(event.nhsNumberVerification == 'Error'){
      if(event.message != null)
      {
        this.nhsVerificationMessage = event.message;
        this.nhsVerificationStatus = "error";
        this.displayNHSVerificationMessage();
      }
      else{
        this.nhsVerificationMessage = "It has not been possible to verify the NHS Number using the NHS Personal Demographics Service";
        this.nhsVerificationStatus = "error";
        this.displayNHSVerificationMessage();
      }
    }
    else if(event.nhsNumberVerification == 'NotPresentInSynapse'){
      this.nhsVerificationMessage = "Patient does not exists in synapse database";
      this.nhsVerificationStatus = "error";
      this.displayNHSVerificationMessage();
    }
    else if(event.nhsNumberVerification == 'ConnectivityError'){
      this.nhsVerificationMessage = "It has not been possible to connect to the NHS Personal Demographics Service, please try again later";
      this.nhsVerificationStatus = "error";
      this.displayNHSVerificationMessage();
    }
  }

  displayNHSVerificationMessage(){
    setTimeout(() => {
     this.nhsVerificationMessage = "";
     this.nhsVerificationStatus = "";
    }, 8000)
  }

}