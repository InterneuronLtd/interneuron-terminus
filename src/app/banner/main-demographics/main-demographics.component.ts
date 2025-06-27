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
import { Component, ElementRef, EventEmitter, HostListener, Input, OnInit, Output } from '@angular/core';
import { fromEvent, Observable, Subscription } from 'rxjs';
import { AppConfig } from 'src/app/app.config';
import { ApirequestService } from 'src/app/services/apirequest.service';
import { ResizeService } from 'src/app/services/resize.service';
import { BannerMainDemographics } from '../../Models/banner/banner.maindemographics';
import { WebStorageService } from 'src/app/services/webstorage.service';
import { HeaderService } from 'src/app/services/header.service';

@Component({
  selector: 'app-main-demographics',
  templateUrl: './main-demographics.component.html',
  styleUrls: ['./main-demographics.component.css']
})
export class MainDemographicsComponent implements OnInit {


  private resizeSubscription: Subscription;
  displayPort: string;

  subscriptions: Subscription = new Subscription();
  mainDemographics: BannerMainDemographics;
  personId: string;
  demographicsReturned: boolean = false;
  hospitalNumberLabel: string = "Hospital No";
  nhsNumberLabel: string = "NHS No";
  bornLabel: string = "Born";
  genderLabel: string = "Gender";
  personLabelText: string = AppConfig.settings.personLabelText ? AppConfig.settings.personLabelText : "Patient";
  env:string = AppConfig.settings.env;
  clientIdentifier:any;

  // verifyButtonLabel: string = "Verify";

  // isVerifiedNHSNumber:boolean = false;

  // onInitialLoad: boolean = false;

  // basicNHSNumberValidation: boolean = false;

  // isVerifyingNHSNumber: boolean = false;

  constructor(private reqService: ApirequestService, private resizeService: ResizeService, private webStorage: WebStorageService, private headerService: HeaderService) {



  }


  ngOnInit() {
   // alert("Main Demographics called");
    this.resizeSubscription = this.resizeService.displayPort$.subscribe((value:any) => {
      this.displayPort = value;
    });

    // if(this.webStorage.getSessionStorageItem("isVerifyButtonClicked_" + this.personId)){
    //   this.verifyButtonLabel = "Re-verify";
    // }
    // else{
    //   this.verifyButtonLabel = "Verify";
    // }

    // if(this.webStorage.getSessionStorageItem("isVerifiedNHSNumber_" + this.personId)){
    //   this.isVerifiedNHSNumber = true;
    // }
    // else{
    //   this.isVerifiedNHSNumber = false;
    // }
    
  }



  ngOnDestroy() {
    if (this.resizeSubscription) {
      this.resizeSubscription.unsubscribe();
    }
  }

  @Input() set value(value: string) {

      if(value) {
        this.personId = value;
        this.getData();
        if(this.env == 'social_care'){
          this.getClientIdentifier();
        }
      }

  };


  @Output() returnDemographicsResponse: EventEmitter<boolean> = new EventEmitter();

  //@Output() nhsVerifyEvent = new EventEmitter<any>();
  @Output()getmainCarer= new EventEmitter<string>();
  sendDemographicsResponse(value: boolean,responsibleCare) {
    this.returnDemographicsResponse.emit(value);
    this.getmainCarer.emit(responsibleCare);
  }



  async getData() {
      await this.reqService.getRequest(AppConfig.settings.apiServices.find(x => x.serviceName == 'GetBannerMainDemographics').serviceUrl + '?synapseattributename=person_id&attributevalue=' + this.personId)
        .then(
          (response) => {
            if(response) {
              this.mainDemographics = JSON.parse(response)[0];
              // if(this.mainDemographics.nhsnumber){
              //   this.mainDemographics.nhsnumber = this.mainDemographics.nhsnumber.replace(/\s/g, "");
              // //  this.mainDemographics.mainresponsible=" qwqw qwqwqw <br/> zX xzcxzc <br/> zxxxx zzzzzzzzzzzz";
              //   if(this.mainDemographics.nhsnumber.length == 10){
              //     this.basicNHSNumberValidation = true;
              //   }
              //   else{
              //     this.basicNHSNumberValidation = false;
              //   }
              //   this.onInitialLoad = true;

              //   this.VerifyPatientNHSNumberInSynapse();
              // }
              //console.log('MainDemographics', this.mainDemographics);
              this.sendDemographicsResponse(true,this.mainDemographics.mainresponsible);
              this.demographicsReturned=true;
            }
            else{
              this.sendDemographicsResponse(false,"");
            }
          }

        ).catch
        {
          this.sendDemographicsResponse(false,"");
          this.demographicsReturned=false;
        };
  }


  async getClientIdentifier() {
    await this.reqService.getRequest(AppConfig.settings.apiServices.find(x => x.serviceName == 'GetClientIdentifier').serviceUrl + '?synapseattributename=person_id&attributevalue=' + this.personId)
      .then(
        (response) => {
          if(response) {
            this.clientIdentifier = JSON.parse(response)[0];
            
          }
        }

      ).catch
      {
        console.log('Error while getting identifier')
      };
}



// onClickVerify(){
//   //to be removed
//   this.showUserProfileForm = true;
//   return;
//   //to be removed
//   this.webStorage.setSessionStorageItem("isVerifyButtonClicked_" + this.personId, true);

//   this.onInitialLoad = false;

//   this.isVerifyingNHSNumber = true;

//   this.verifyNHSNumber(() =>{
//     this.isVerifyingNHSNumber = false;
//     if(this.webStorage.getSessionStorageItem("isVerifyButtonClicked_" + this.personId)){
//       this.verifyButtonLabel = "Re-verify";
//     }
//     else{
//       this.verifyButtonLabel = "Verify";
//     }
//   });

// }

// verifyNHSNumber(onVerificationComplete: any){
//   if(this.mainDemographics.nhsnumber.length == 10){
//     this.reqService.getRequest(AppConfig.settings.apiServices.find(x => x.serviceName == 'GetPersonDemographicService').serviceUrl + '/' + this.mainDemographics.nhsnumber)
//     .then(
//       (response) => {
//         if(response){
//           this.isVerifiedNHSNumber = true;

//           this.webStorage.setSessionStorageItem("isVerifiedNHSNumber_" + this.personId, true);
          
//           if(!this.onInitialLoad){
//             this.nhsVerifyEvent.emit({"nhsNumberVerification":"Success", "message": null});
//             //to refresh patient banner
//             this.headerService.loadPatientBanner.next(this.webStorage.getSessionStorageItem("terminus:personcontext"));
//           }
//         }
//         else{
//           this.isVerifiedNHSNumber = false;

//           this.webStorage.setSessionStorageItem("isVerifiedNHSNumber_" + this.personId, false);
  
//           if(response == null){ //status 204
//             if(!this.onInitialLoad){
//               this.nhsVerifyEvent.emit({"nhsNumberVerification":"NotPresentInSynapse", "message": null});
//             }
            
//           }
//           else { //Patient NHS number is invalid
//             if(!this.onInitialLoad){
//               this.nhsVerifyEvent.emit({"nhsNumberVerification":"Error", "message": null});
//             }
//           }
//         }
//         if(onVerificationComplete)onVerificationComplete();
//       }
//     )
//     .catch(
//       (error) => {
//         this.isVerifiedNHSNumber = false;

//         this.webStorage.setSessionStorageItem("isVerifiedNHSNumber_" + this.personId, false);

//         if(error.status == 429){
//           if(!this.onInitialLoad){
//             let message: string = error.error ? error.error : 'You have exceeded the maximum number of tries for now. Please try again later';

//             this.nhsVerifyEvent.emit({"nhsNumberVerification":"Error", "message": message});
//           }
          
//         }
//         else if(error.status == 500){
//           if(!this.onInitialLoad){
//             this.nhsVerifyEvent.emit({"nhsNumberVerification":"ConnectivityError", "message": null});
//           }
//         }
//         else {
//           if(!this.onInitialLoad){
//             this.nhsVerifyEvent.emit({"nhsNumberVerification":"ConnectivityError", "message": null});
//           }
//         }
//         if(onVerificationComplete)onVerificationComplete();
//       }
//     );
//   }
  
// }

// VerifyPatientNHSNumberInSynapse(){
//   if(this.mainDemographics.nhsnumber.length == 10){
//     this.reqService.getRequest(AppConfig.settings.apiServices.find(x => x.serviceName == 'GetPatientNHSNumberInSynapse').serviceUrl + '/' + this.mainDemographics.nhsnumber)
//     .then(
//       (response) => {
//         if(response){
//           this.isVerifiedNHSNumber = true;

//           this.webStorage.setSessionStorageItem("isVerifiedNHSNumber_" + this.personId, true);
          
//         }
//         else{
//           this.isVerifiedNHSNumber = false;

//           this.webStorage.setSessionStorageItem("isVerifiedNHSNumber_" + this.personId, false);
  
//           if(response == null){ //status 204
//             //to capture no content scenario
//           }
//         }
//       }
//     )
//     .catch(
//       (error) => {
//         this.isVerifiedNHSNumber = false;

//         this.webStorage.setSessionStorageItem("isVerifiedNHSNumber_" + this.personId, false);
//       }
//     );
//   }
  
// }


}
