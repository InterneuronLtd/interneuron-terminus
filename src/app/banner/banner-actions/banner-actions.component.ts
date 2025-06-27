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
import { AppConfig } from 'src/app/app.config';
import { patientlist, personPatientlist } from '../../Models/Patientlist.model';
import { ApirequestService } from 'src/app/services/apirequest.service';
import { AuthenticationService } from 'src/app/services/authentication.service';
import { ErrorHandlerService } from 'src/app/services/error-handler.service';
import { HeaderService } from 'src/app/services/header.service';
import { SharedDataContainerService } from 'src/app/services/shared-data-container.service';
import { WebStorageService } from 'src/app/services/webstorage.service';
import { RbacService } from '../../services/rbac.service';
import { Subscription } from 'rxjs';
import { ResizeService } from 'src/app/services/resize.service';
import { RefWeightHeightComponent } from '../../ref-weight-height/ref-weight-height.component';
import { RecRefHeightComponent } from '../../rec-ref-height/rec-ref-height.component';
import { BsModalRef, BsModalService } from 'ngx-bootstrap/modal';
import { MeetingRendererService } from 'src/app/services/meeting-renderer.service';
import { filter, filterParams, filterparam, filters, orderbystatement, selectstatement } from 'src/app/Models/Filter.model';
import { GPConnectGetDataResponse, GPConnectService } from 'src/app/shared/gpconnect/gpconnect.service';
import { ToastrService } from 'ngx-toastr';
import { TooltipOptions } from 'ng2-tooltip-directive';
import { GPCONNECTPATIENTSYNCKEY, GPConnectPatientSyncState, GPConnectSyncStatus } from 'src/app/Models/GPConnect/gpconnect.model';
import { AudienceType } from 'src/app/notification/lib/notification.observable.util';
import { NotificationSenderData, publishMessageByTopic, publishSenderNotificationV2 } from 'src/app/notification/lib/notification.observable.util_v2';
import * as moment from 'moment';

@Component({
  selector: 'app-banner-actions',
  templateUrl: './banner-actions.component.html',
  styleUrls: ['./banner-actions.component.css'],
  providers: [GPConnectService]
})
export class BannerActionsComponent implements OnInit, OnDestroy {

  private resizeSubscription: Subscription;
  personLabelText: string = AppConfig.settings.personLabelText ? AppConfig.settings.personLabelText : "Patient";
  displayPort: string;
  selectedView: string = "collapsed";
  bsModalRef: BsModalRef;
  logedinUserID: string;
  personId: string;
  patientlistname: patientlist[] = [];
  showPatientdropdown: string = 'false';
  itemList = [];
  selectedItems = [];
  dropdownSettings = {};
  userId: string;
  postBody: string;
  showRemoveButton: boolean = false;
  showvideiocalling = false;
  otAssessment: any;
  isCurrentAppointment: boolean = false;
  isOutpatientAndFutureAppointment: boolean = false;
  //verifyButtonLabel: string = "Verify";
  encounterDate: Date;

  isVerifiedNHSNumber: boolean = false;

  onInitialLoad: boolean = false;

  basicNHSNumberValidation: boolean = false;

  isVerifyingNHSNumber: boolean = false;

  demographics: any;

  env: string = AppConfig.settings.env;

  showUserProfileForm: boolean = false;

  showPatientConsentForm: boolean = false;

  gpConnectSyncStatus: GPConnectSyncStatus = GPConnectSyncStatus.PDSVerificationFail;

  gpConnectSyncImgPath = 'assets/images/';
  gpConnectSyncImgSrc = `${this.gpConnectSyncImgPath}GPConnect_Sync_Unverified.svg`;

  gpConnectSyncDisabled = false;

  gpConnectSyncTooltipOptions: TooltipOptions = {
    maxWidth: '800px',
    zIndex: 1000000,
    contentType: 'html',
    showDelay: 1200,
  };
  gpConnectSyncMessages: string[]  = [];

  showGPConnectSyncCntrl = false;

  currentAppointmentPatientClass = '';

  hideGPConnectFeature = AppConfig.settings.GPConnectConfig.hideThisFeature;

  constructor(public modalService: BsModalService, private RbacService: RbacService, private webStorageService: WebStorageService, private httpClient: HttpClient, private reqService: ApirequestService, private headerService: HeaderService,
    private errorHandlerService: ErrorHandlerService, public meetingRenderer: MeetingRendererService,
    private toastrService: ToastrService,
    private authService: AuthenticationService, public sharedData: SharedDataContainerService, private resizeService: ResizeService, 
    private gpConnectService: GPConnectService) { }

  ngOnDestroy() {
    if (this.resizeSubscription) {
      this.resizeSubscription.unsubscribe();
    }
  }

  ngOnInit() {
    this.authService.onLogoutCallback = () => {
      this.webStorageService.removeSessionStorageItem(`${GPCONNECTPATIENTSYNCKEY}`);
    };
    this.resizeSubscription = this.resizeService.displayPort$.subscribe((value: any) => {
      this.displayPort = value;
    });
  }

  setGPConnectSyncPropByState(): void {
    this.sharedData.gpConnect.syncState = this.gpConnectSyncStatus;
    switch (this.gpConnectSyncStatus) {
      case GPConnectSyncStatus.Unverified:
      case GPConnectSyncStatus.GPCAPIError:
        this.gpConnectSyncImgSrc = `${this.gpConnectSyncImgPath}GPConnect_Sync_Unverified.svg`;
        break;
      case GPConnectSyncStatus.PDSVerificationFail:
        this.gpConnectSyncImgSrc = `${this.gpConnectSyncImgPath}GPConnect_Sync_Verification_Fail.svg`;
        break;
      case GPConnectSyncStatus.Success:
        this.gpConnectSyncImgSrc = `${this.gpConnectSyncImgPath}GPConnect_Sync_Verified.svg`;
        this.gpConnectSyncDisabled = true;
        //if blue badge - show to all users
        this.showGPConnectSyncCntrl = true;
        break;
      case GPConnectSyncStatus.Success_With_Warnings:
        this.gpConnectSyncImgSrc = `${this.gpConnectSyncImgPath}GPConnect_Sync_Partially_Verified.svg`;
        break;
      case GPConnectSyncStatus.UNKNOWNERROR:
        this.gpConnectSyncImgSrc = `${this.gpConnectSyncImgPath}GPConnect_Sync_Unverified.svg`;
        break;
      default:
        this.gpConnectSyncImgSrc = `${this.gpConnectSyncImgPath}GPConnect_Sync_Unverified.svg`;
        break;
    }
  }

  updateExpandbanner() {
    this.sharedData.showExpandedBanner = !this.sharedData.showExpandedBanner;
  }

  // Input and Output Parameters
  @Input() set value(value: string) {
    if (value) {
      this.dropdownSettings = {
        singleSelection: false,
        text: "Select Patient List",
        selectAllText: 'Select All',
        unSelectAllText: 'UnSelect All',
        enableSearchFilter: false,
        classes: "myclass custom-class"
      };

      // let UserdecodedToken = this.authService.decodeAccessToken(this.authService.user.access_token);
      // if (UserdecodedToken != null) {
      //   this.logedinUserID = UserdecodedToken.IPUId;
      // }

      this.personId = value;
      this.getUserId();
      this.getPatientlists();
      this.checkForPatientInMyPatients();
      this.getAssessmentForm();
      if(!this.hideGPConnectFeature){
        this.getAppointments();
      } 
      
      this.getDemographics().then((res)=> { 
        if(!this.hideGPConnectFeature) 
          this.replayGPConnectSyncData();
      });
    }
  };

  @Input() set view(view: string) {
    if (view) {
      this.selectedView = view;
    }
  };

  @Output() nhsVerifyEvent = new EventEmitter<any>();
  @Output() returnActionsResponse: EventEmitter<boolean> = new EventEmitter();
  @Output() gpconnectSyncEvent = new EventEmitter<any>();

  sendActionsResponse(value: boolean) {
    this.returnActionsResponse.emit(value);
  }
  // EndInput and Output Parameters

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
  openVideocall() {
    if (this.otAssessment) {
      this.meetingRenderer.RenderNewMeeting(this.otAssessment.formbuilderresponse_id);
    }
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
  getAssessmentForm() {
    this.selectedItems = [];
    let id: string = this.personId;
    this.reqService.getRequest(AppConfig.settings.apiServices.find(x => x.serviceName == 'GetAssessmentForms').serviceUrl + id)
      .then(
        (responce) => {
          this.otAssessment = JSON.parse(responce);
          if (this.otAssessment && this.otAssessment.formbuilderresponse_id) {
            this.showvideiocalling = true;
          }

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
    let decodedToken = this.authService.decodeAccessToken(this.authService.user.access_token);
    if (decodedToken != null)
      this.userId = decodedToken.IPUId.replace("\\", "\\\\");
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


  getCurrentAppointments(onComplete: any) {
    this.currentAppointmentPatientClass = '';
    this.encounterDate = null;
    this.reqService.postRequest(AppConfig.settings.apiServices.find(x => x.serviceName == 'GetCurrentAppointments').serviceUrl, this.createCurrentAppointmentFilter())
      .then((response) => {
        console.log('getCurrentAppointments', response);
        if (response && response.length > 0) {
          this.isCurrentAppointment = true;
          this.currentAppointmentPatientClass = response[0].patientclasscode;
          this.encounterDate = response[0].admitdatetime;
        } else {
          this.isCurrentAppointment = false;
        }
        if(onComplete){
          onComplete();
        }
        
        
      });
  }

  getAppointments(){
    this.getCurrentAppointments(()=>{
      if(!this.isCurrentAppointment){
        this.getOutpatientAndFutureAppointments(() => {
          this.canShowGPConnectSyncCntrl();
        })
      }
      else{
        this.canShowGPConnectSyncCntrl();
      }
    });
  }

  createCurrentAppointmentFilter() {
    let condition = "person_id = @person_id";

    let f = new filters()
    f.filters.push(new filter(condition));

    let pm = new filterParams();
    pm.filterparams.push(new filterparam("person_id", this.personId));

    let select = new selectstatement("SELECT *");

    let orderby = new orderbystatement("ORDER BY admitdatetime desc");

    let body = [];
    body.push(f);
    body.push(pm);
    body.push(select);
    body.push(orderby);

    return JSON.stringify(body);
  }

  onClickVerify() {
    //this.webStorage.setSessionStorageItem("isVerifyButtonClicked_" + this.personId, true);

    //Should show the UserProfile form before consent
    //this.showPatientConsentForm = true;

    this.onInitialLoad = false;

    this.showUserProfileForm = true;

    //Not required in case of GPConnect Sync
    // this.isVerifyingNHSNumber = true;

    // this.verifyNHSNumber(() => {
    //   this.isVerifyingNHSNumber = false;
    //   // if(this.webStorage.getSessionStorageItem("isVerifyButtonClicked_" + this.personId)){
    //   //   this.verifyButtonLabel = "Re-verify";
    //   // }
    //   // else{
    //   //   this.verifyButtonLabel = "Verify";
    //   // }
    // });

  }

  verifyNHSNumber(onVerificationComplete: any) {
    if (this.demographics.nhsnumber.length == 10) {
      this.reqService.getRequest(AppConfig.settings.apiServices.find(x => x.serviceName == 'GetPersonDemographicService').serviceUrl + '/' + this.demographics.nhsnumber)
        .then(
          (response) => {
            if (response) {
              this.isVerifiedNHSNumber = true;

              //this.webStorage.setSessionStorageItem("isVerifiedNHSNumber_" + this.personId, true);

              if (!this.onInitialLoad) {
                this.nhsVerifyEvent.emit({ "nhsNumberVerification": "Success", "message": null });
                //to refresh patient banner
                this.headerService.loadPatientBanner.next(this.personId);
              }
            }
            else {
              this.isVerifiedNHSNumber = false;

              //this.webStorage.setSessionStorageItem("isVerifiedNHSNumber_" + this.personId, false);

              if (response == null) { //status 204
                if (!this.onInitialLoad) {
                  this.nhsVerifyEvent.emit({ "nhsNumberVerification": "NotPresentInSynapse", "message": null });
                }

              }
              else { //Patient NHS number is invalid
                if (!this.onInitialLoad) {
                  this.nhsVerifyEvent.emit({ "nhsNumberVerification": "Error", "message": null });
                }
              }
            }
            if (onVerificationComplete) onVerificationComplete();
          }
        )
        .catch(
          (error) => {
            this.isVerifiedNHSNumber = false;

            //this.webStorage.setSessionStorageItem("isVerifiedNHSNumber_" + this.personId, false);

            if (error.status == 429) {
              if (!this.onInitialLoad) {
                let message: string = error.error ? error.error : 'You have exceeded the maximum number of tries for now. Please try again later';

                this.nhsVerifyEvent.emit({ "nhsNumberVerification": "Error", "message": message });
              }

            }
            else if (error.status == 500) {
              if (!this.onInitialLoad) {
                this.nhsVerifyEvent.emit({ "nhsNumberVerification": "ConnectivityError", "message": null });
              }
            }
            else {
              if (!this.onInitialLoad) {
                this.nhsVerifyEvent.emit({ "nhsNumberVerification": "ConnectivityError", "message": null });
              }
            }
            if (onVerificationComplete) onVerificationComplete();
          }
        );
    }

  }

  //Not required in case of GPConnect Sync
  // VerifyPatientNHSNumberInSynapse() {
  //   if (this.demographics.nhsnumber.length == 10) {
  //     this.reqService.getRequest(AppConfig.settings.apiServices.find(x => x.serviceName == 'GetPatientNHSNumberInSynapse').serviceUrl + '/' + this.demographics.nhsnumber)
  //       .then(
  //         (response) => {
  //           if (response) {
  //             this.isVerifiedNHSNumber = true;

  //             //this.webStorage.setSessionStorageItem("isVerifiedNHSNumber_" + this.personId, true);

  //           }
  //           else {
  //             this.isVerifiedNHSNumber = false;

  //             //this.webStorage.setSessionStorageItem("isVerifiedNHSNumber_" + this.personId, false);

  //             if (response == null) { //status 204
  //               //to capture no content scenario
  //             }
  //           }
  //         }
  //       )
  //       .catch(
  //         (error) => {
  //           this.isVerifiedNHSNumber = false;

  //           //this.webStorage.setSessionStorageItem("isVerifiedNHSNumber_" + this.personId, false);
  //         }
  //       );
  //   }

  // }

  async getDemographics() {
    await this.reqService.getRequest(AppConfig.settings.apiServices.find(x => x.serviceName == 'GetBannerMainDemographics').serviceUrl + '?synapseattributename=person_id&attributevalue=' + this.personId)
      .then(
        (response) => {
          if (response) {
            this.demographics = JSON.parse(response)[0];
            if (this.demographics.nhsnumber) {
              this.demographics.nhsnumber = this.demographics.nhsnumber.replace(/\s/g, "");

              if (this.demographics.nhsnumber.length == 10) {
                this.basicNHSNumberValidation = true;
              }
              else {
                this.basicNHSNumberValidation = false;
              }
              this.onInitialLoad = true;

              //Not required in case of GPConnect Sync
              //this.VerifyPatientNHSNumberInSynapse();
            }
          }
        }
      )
  }

  closeUserProfileForm(e: any) {
    this.showUserProfileForm = false;
    setTimeout(() => {
      if (e === true)
        this.showPatientConsentForm = true;
    });
  }

  async closePatientConsentForm(e: any) {
    console.log('getting the patient consent close action!!!', e);
    this.showPatientConsentForm = false;
    if (!e) return;

    await this.syncGPConnectData();
  }

  async syncGPConnectData() {
    //const { personId, encounterId } = this.sharedData;
    //this.demographics.nhsnumber = '9690937286';//'9690938118';//'9690937286';//'9690937294';//'9690937294';//'';//to test
    const nhsNumber = this.demographics?.nhsnumber;
    //const encounterId = await this.sharedData.getCurrentEncounterAsPromise();

    if (!nhsNumber) {
      this.toastrService.error('NHS Number is required to sync the GP Connect data.');
      return;
    }

    this.gpConnectSyncImgSrc = `${this.gpConnectSyncImgPath}GPConnect_Verification_Animation.gif`;
    this.gpConnectSyncDisabled = true;
    const response = await this.gpConnectService.syncGPConnectData(nhsNumber);

    this.sendNotificationForGPConnectSync(nhsNumber);

    if (response) {
      //invoke the get service to 
      //await this.getGPConnectData(nhsNumber, encounterId, false, true);
      if(response.statusCode == 100)
      {
        await this.getGPConnectData(nhsNumber, false, true);
      }
      else
      {
        this.toastrService.warning(response.errorMessage || 'Unable to sync the GP Connect data due to error.');
        this.setGPConnectSyncPropByState();
        this.gpConnectSyncDisabled = false;
      }
    } else {
      this.toastrService.error('Unable to sync the GP Connect data due to error.');
      this.gpConnectSyncStatus = GPConnectSyncStatus.UNKNOWNERROR;
      this.setGPConnectSyncPropByState();
      this.gpConnectSyncDisabled = false;
    }
  }
  sendNotificationForGPConnectSync(nhsNumber: string) {
    const { personId } = this.sharedData;
    let param: NotificationSenderData = { notificationTypeName: 'GPCONNECT_SYNC_COMPLETE', audienceType: AudienceType.ALL_USERS, data: JSON.stringify({ personId, nhsNumber }) };
    if (AppConfig.settings.enableWSConnection)
      publishSenderNotificationV2(param);
    else
      publishMessageByTopic('GPCONNECT_SYNC_COMPLETE', param);
  }

  // async getGPConnectData(nhsNumber: string, encounterId: string, isReplay: boolean = false, isPostSync: boolean = false) {
  //   this.gpConnectSyncImgSrc = `${this.gpConnectSyncImgPath}GPConnect_Verification_Animation.gif`;
  //   this.gpConnectSyncDisabled = true;
  //   this.gpConnectSyncMessages = [];
  //   const acuteMedicationsSinceInMonths = AppConfig.settings.GPConnectConfig.acuteMedicationsInMonths;
  //   const repeatMedicationsSinceInMonths = AppConfig.settings.GPConnectConfig.repeatMedicationsInMonths;

  //   const response: GPConnectGetDataResponse = await this.gpConnectService.getGPConnectData(nhsNumber, encounterId, acuteMedicationsSinceInMonths,repeatMedicationsSinceInMonths);
  //   console.log('gp connect api response===', response);
  //   this.gpConnectSyncStatus = GPConnectSyncStatus.Unverified;

  //   this.handleGPConnectResponse(response, isReplay);

  //   //If not post sync and the data from API is 'verification fail' - set to 'Unverified' 
  //   if(!isPostSync && this.gpConnectSyncStatus && this.gpConnectSyncStatus === GPConnectSyncStatus.PDSVerificationFail) {
  //     this.gpConnectSyncMessages = [];
  //     this.gpConnectSyncStatus = GPConnectSyncStatus.Unverified;
  //     this.sharedData.gpConnect.data = null;
  //   }

  //   this.gpConnectSyncDisabled = false;
    
  //   this.setGPConnectStatusForOPAndFutureAppointment(response?.data?.lastSyncDate, this.encounterDate);
  //   this.setGPConnectSyncPropByState();
    
  //   const responseData = response ? response.data: null;
    
  //   const gpConnectSyncState: GPConnectPatientSyncState = {msgs: this.gpConnectSyncMessages, patientNHSNumber: nhsNumber, encounterId: encounterId, syncStatus: this.gpConnectSyncStatus, data: responseData, acuteMedicationsSinceInMonths, repeatMedicationsSinceInMonths };

  //   this.webStorageService.setSessionStorageItem(`${GPCONNECTPATIENTSYNCKEY}_${nhsNumber}_${encounterId}`, gpConnectSyncState);
  //   const { personId } = this.sharedData;
  //   this.gpConnectObservable.publish({personId, nhsNumber, encounterId});
  //   //publishSenderNotificationWithParams('GPCONNECT_SYNC_COMPLETE111', null, JSON.stringify({personId, nhsNumber, encounterId}));
  // }


  async getGPConnectData(nhsNumber: string, isReplay: boolean = false, isPostSync: boolean = false) {
    this.gpConnectSyncImgSrc = `${this.gpConnectSyncImgPath}GPConnect_Verification_Animation.gif`;
    this.gpConnectSyncDisabled = true;
    this.gpConnectSyncMessages = [];
    const acuteMedicationsSinceInMonths = AppConfig.settings.GPConnectConfig.acuteMedicationsInMonths;
    const repeatMedicationsSinceInMonths = AppConfig.settings.GPConnectConfig.repeatMedicationsInMonths;

    const response: GPConnectGetDataResponse = await this.gpConnectService.getGPConnectData(nhsNumber, acuteMedicationsSinceInMonths, repeatMedicationsSinceInMonths);
    console.log('gp connect api response===', response);
    this.gpConnectSyncStatus = GPConnectSyncStatus.Unverified;

    this.handleGPConnectResponse(response, isReplay);

    //If not post sync and the data from API is 'verification fail' - set to 'Unverified' 
    if(!isPostSync && this.gpConnectSyncStatus && this.gpConnectSyncStatus === GPConnectSyncStatus.PDSVerificationFail) {
      this.gpConnectSyncMessages = [];
      this.gpConnectSyncStatus = GPConnectSyncStatus.Unverified;
      this.sharedData.gpConnect.data = null;
    }

    this.gpConnectSyncDisabled = false;
    
    if(!isPostSync){
      this.setGPConnectStatusByAppointment(response);
    }
    
    this.setGPConnectSyncPropByState();
    
    const responseData = response ? response.data: null;
    
    //const gpConnectSyncState: GPConnectPatientSyncState = {msgs: this.gpConnectSyncMessages, patientNHSNumber: nhsNumber, encounterId: encounterId, syncStatus: this.gpConnectSyncStatus, data: responseData, acuteMedicationsSinceInMonths, repeatMedicationsSinceInMonths };
    const gpConnectSyncState: GPConnectPatientSyncState = {msgs: this.gpConnectSyncMessages, patientNHSNumber: nhsNumber, syncStatus: this.gpConnectSyncStatus, data: responseData, acuteMedicationsSinceInMonths, repeatMedicationsSinceInMonths };

    //this.webStorageService.setSessionStorageItem(`${GPCONNECTPATIENTSYNCKEY}_${nhsNumber}`, gpConnectSyncState);
    let inSession = this.webStorageService.getSessionStorageItem(`${GPCONNECTPATIENTSYNCKEY}`);
    if(!inSession || !Object.keys(inSession).length)
      inSession  = {};
    inSession[nhsNumber] = gpConnectSyncState;
    this.webStorageService.setSessionStorageItem(`${GPCONNECTPATIENTSYNCKEY}`, inSession);
  }

  handleGPConnectResponse(response: GPConnectGetDataResponse, isReplay: boolean = false) {
    this.sharedData.gpConnect.data = null;
    if (!response || !response.data || (response.errorMessages && response.errorMessages.length)) {
      let msg = response && response.errorMessages?.join('. ',);
      msg = msg || 'UNKNOWN ERROR: No response returned from the GP Connect Synapse API';
      console.log(msg);
      // if (!isReplay)
      //   this.toastrService.error(msg);
      if (response && response.statusCode === 200) {
        this.gpConnectSyncMessages.push('Synchronize with GPConnect');
        this.gpConnectSyncStatus = GPConnectSyncStatus.Unverified;
      } else {
        this.gpConnectSyncMessages.push(msg);
        console.log(msg);
        this.gpConnectSyncStatus = GPConnectSyncStatus.UNKNOWNERROR;
      }
      this.setGPConnectSyncPropByState();
      this.gpConnectSyncDisabled = false;
      return;
    }
    this.sharedData.gpConnect.data = response.data;
    let msgCodesAdded = {};
    //there cannot be multiple syncstatus returned - but messages can be
    if (response.data.messages && response.data.messages.length) {
      let msgIndex = 0;
      for (const msg of response.data.messages) {
        if (!msg) continue;
        const { messageCode, messageText, messageCategory } = msg;
        if (msgIndex === 0) {
          const msgCodeAsInt = messageCode != null ? parseInt(messageCode) : 0;
          if (msgCodeAsInt === 1)
            this.gpConnectSyncStatus = GPConnectSyncStatus.PDSVerificationFail;
          else if (msgCodeAsInt === 2)
            this.gpConnectSyncStatus = GPConnectSyncStatus.Success_With_Warnings;
            else if (msgCodeAsInt === 0)
            this.gpConnectSyncStatus = GPConnectSyncStatus.Success;
        }

        this.gpConnectSyncMessages.push(messageText);
      }

    } else {
      this.gpConnectSyncStatus = GPConnectSyncStatus.Success;
    }
  }

  async replayGPConnectSyncData() {
    //this.demographics.nhsnumber = '9690937286';//'9690938118';//'9690937286';//'9690937294';//'9690937286';//to test

    const nhsNumber = this.demographics?.nhsnumber;
    //const encounterId = await this.sharedData.getCurrentEncounterAsPromise();

    //check if gpconnect data already exists in session, else get it from synapse
    //const doesExists = this.rePopulatePatientSyncDataFromSessionIfExists(nhsNumber, encounterId);
    const doesExists = this.rePopulatePatientSyncDataFromSessionIfExists(nhsNumber);

    if(doesExists) return;

    //if (!nhsNumber || !encounterId) {
    if (!nhsNumber) {
        // this.toastrService.error('NHS Number and Current Encounter details are required to sync the GP Connect data.');
        // return;
      this.toastrService.error('NHS Number is required to sync the GP Connect data.');
      return;
    }
    //else, try getting the data from gpconnect in synapse
    //await this.getGPConnectData(nhsNumber, encounterId, true);
    await this.getGPConnectData(nhsNumber, true);
  }

  // rePopulatePatientSyncDataFromSessionIfExists(nhsNumber: any, encounterId: string) {
  //   const gpConnectPatientSyncDataInSession: GPConnectPatientSyncState  = this.webStorageService.getSessionStorageItem(`${GPCONNECTPATIENTSYNCKEY}_${nhsNumber}_${encounterId}`);
  //   if(gpConnectPatientSyncDataInSession) {
  //     //if previous saved state in session is unverified - mark as verfied again
  //     if(gpConnectPatientSyncDataInSession.syncStatus === GPConnectSyncStatus.PDSVerificationFail) {
  //       this.gpConnectSyncMessages = [];
  //       this.gpConnectSyncStatus = GPConnectSyncStatus.Unverified;
  //       this.sharedData.gpConnect.data = null;
  //       this.setGPConnectSyncPropByState();
  //       return true;//exists but back to initial state
  //     }
  //     this.gpConnectSyncMessages = gpConnectPatientSyncDataInSession.msgs;
  //     this.gpConnectSyncStatus = gpConnectPatientSyncDataInSession.syncStatus;
  //     this.sharedData.gpConnect.data = gpConnectPatientSyncDataInSession.data;
  //     this.setGPConnectSyncPropByState();
  //   }

  //   return gpConnectPatientSyncDataInSession;
  // }

  rePopulatePatientSyncDataFromSessionIfExists(nhsNumber: any) {
    //const gpConnectPatientSyncDataInSession: GPConnectPatientSyncState  = this.webStorageService.getSessionStorageItem(`${GPCONNECTPATIENTSYNCKEY}_${nhsNumber}`);
    const inSessionGPCData  = this.webStorageService.getSessionStorageItem(`${GPCONNECTPATIENTSYNCKEY}`);
    const gpConnectPatientSyncDataInSession: GPConnectPatientSyncState = !inSessionGPCData ? null : inSessionGPCData[`${nhsNumber}`];
    if(gpConnectPatientSyncDataInSession) {

      const lastSyncDate = gpConnectPatientSyncDataInSession.data?.lastSyncDate;

      if(moment().format('YYYY-MM-DD') > moment(lastSyncDate).format('YYYY-MM-DD'))
      {
        return false;
      }
      //if previous saved state in session is unverified - mark as verfied again
      if(gpConnectPatientSyncDataInSession.syncStatus === GPConnectSyncStatus.PDSVerificationFail) {
        this.gpConnectSyncMessages = [];
        this.gpConnectSyncStatus = GPConnectSyncStatus.Unverified;
        this.sharedData.gpConnect.data = null;
        this.setGPConnectSyncPropByState();
        return true;//exists but back to initial state
      }
      this.gpConnectSyncMessages = gpConnectPatientSyncDataInSession.msgs;
      this.gpConnectSyncStatus = gpConnectPatientSyncDataInSession.syncStatus;
      this.sharedData.gpConnect.data = gpConnectPatientSyncDataInSession.data;
      this.setGPConnectSyncPropByState();
    }

    return gpConnectPatientSyncDataInSession;
  }

  canShowGPConnectSyncCntrl() {
    console.log('currentAppointmentPatientClass', this.currentAppointmentPatientClass);
    this.showGPConnectSyncCntrl = false;
    const hasRBAC = this.RbacService.authoriseAction('show_sync_link') && (this.isCurrentAppointment || this.isOutpatientAndFutureAppointment);
    //ony for inpatient and outpatients
    this.showGPConnectSyncCntrl = this.currentAppointmentPatientClass && ['I', 'IP', 'O', 'OP', 'W', 'WL', 'T', 'TCI'].includes(this.currentAppointmentPatientClass) && hasRBAC;
  }

  getOutpatientAndFutureAppointments(onComplete: any) {
    this.currentAppointmentPatientClass = '';
    this.encounterDate = null;
    this.reqService.postRequest(AppConfig.settings.apiServices.find(x => x.serviceName == 'GetOutpatientAndFutureAppointments').serviceUrl, this.createCurrentAppointmentFilter())
      .then((response) => {
        //console.log('getCurrentAppointments', response);
        if (response && response.length > 0) {
          this.isOutpatientAndFutureAppointment = true;
          this.currentAppointmentPatientClass = response[0].patientclasscode;
          this.encounterDate = response[0].admitdatetime;
        } else {
          this.isOutpatientAndFutureAppointment = false;
        }
        if(onComplete){
          onComplete();
        }
        
      });
  }

  setGPConnectStatusByAppointment(gpConnectResponse: any){

    if(this.isOutpatientAndFutureAppointment){
      this.gpConnectSyncMessages.push('Synchronize with GPConnect');
      this.gpConnectSyncStatus = GPConnectSyncStatus.Unverified;
      return;
    }

    if(!this.isCurrentAppointment)
      return;
    
      if(!gpConnectResponse || !gpConnectResponse.data || !gpConnectResponse.data.lastSyncDate)
        return;
      
        const lastSyncDate = new Date(gpConnectResponse.data.lastSyncDate);

        if(this.encounterDate && lastSyncDate){
          const encounterDt = moment(this.encounterDate).format('YYYY-MM-DD');
          const lastSyncDt = moment(gpConnectResponse.data.lastSyncDate).format('YYYY-MM-DD');

          if (lastSyncDt < encounterDt) {
            this.gpConnectSyncMessages.push('Synchronize with GPConnect');
            this.gpConnectSyncStatus = GPConnectSyncStatus.Unverified;
          }
        }
  }
}






