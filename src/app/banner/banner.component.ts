//BEGIN LICENSE BLOCK 
//Interneuron Terminus

//Copyright(C) 2021  Interneuron CIC

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
import { HttpClient } from '@angular/common/http';
import * as jwt_decode from "jwt-decode";
import { patientlist, personPatientlist } from '../Models/Patientlist.model';
import { PatientBanner, Column, MainBannerData } from '../Models/patientBanner.model';
import { PatientBannerColumnLabelData } from '../Models/patientBannerColumnLabelData.model';
import { ApirequestService } from '../services/apirequest.service';
import { ErrorHandlerService } from '../services/error-handler.service';
import { HeaderService } from '../services/header.service';
import { AppConfig } from '../app.config';
import { AuthenticationService } from '../services/authentication.service';
import { WebStorageService } from '../services/webstorage.service';
import { RbacService } from '../services/rbac.service';
import { SharedDataContainerService } from '../services/shared-data-container.service';
import { Persona } from '../Models/Persona.model';
import { Person } from '../Models/person.model';
import { ResizeService } from '../services/resize.service';
import { Subscription } from 'rxjs';


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

  showPatientBanner: boolean = false;
  demographicsReturned: boolean = false;
  unableToLoadPatient: boolean = false;


  constructor(private RbacService: RbacService, private webStorageService: WebStorageService, private httpClient: HttpClient, private reqService: ApirequestService, private headerService: HeaderService,
    private errorHandlerService: ErrorHandlerService, private authService: AuthenticationService, private sharedData: SharedDataContainerService, private resizeService: ResizeService) {



    this.headerService.myPatientSelected.subscribe(
      (myPatientSelected: string) => {
        if (myPatientSelected != "") {
          this.passedInPersonId = myPatientSelected;
          console.log("New patient loaded");
          this.demographicsReturned = false;
          this.showPatientBanner = false;
          this.unableToLoadPatient = false;
          this.personId = myPatientSelected;
          this.webStorageService.setLocalStorageItem("Terminus:" + this.logedinUserID + ":Patient", myPatientSelected);
          this.sharedData.personId = myPatientSelected;

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

    let apiResponse: any;
    this.showPatientBanner = false;

    var getPersonURL = AppConfig.settings.apiServices.find(x => x.serviceName == 'GetPerson').serviceUrl + '&id=' + myPatientSelected;
    console.log("serviceUrl", getPersonURL);

      await this.reqService.getRequest(AppConfig.settings.apiServices.find(x => x.serviceName == 'GetPerson').serviceUrl + '&id=' + myPatientSelected)
        .then(
          (response) => {

            if(response) {


              this.person = JSON.parse(response);
              console.log("Person Response: ", myPatientSelected);


              if(this.passedInPersonId === myPatientSelected) {

                this.showPatientBanner = true;

              }
              else {
                this.showPatientBanner = false;
                this.unableToLoadPatient = true;
              }

            }



          }
        );



  }



  ngOnInit() {

    this.resizeSubscription = this.resizeService.displayPort$.subscribe((value:any) => {
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




}
