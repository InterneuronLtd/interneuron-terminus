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
import { Component, Input, OnInit } from '@angular/core';
import { AppConfig } from 'src/app/app.config';
import { Module } from 'src/app/Models/application.model';
import { Person } from 'src/app/Models/person.model';
import { ApirequestService } from 'src/app/services/apirequest.service';
import { AuthenticationService } from 'src/app/services/authentication.service';
import { ErrorHandlerService } from 'src/app/services/error-handler.service';
import { HeaderService } from 'src/app/services/header.service';
import { ResizeService } from 'src/app/services/resize.service';
import { SecondaryComponentLoaderService } from 'src/app/services/secondary-component-loader.service';
import { SharedDataContainerService } from 'src/app/services/shared-data-container.service';
import { WebComponentLoaderService } from 'src/app/services/web-component-loader.service';
import { WebStorageService } from 'src/app/services/webstorage.service';

@Component({
  selector: 'app-secondary-module-loader',
  templateUrl: './secondary-module-loader.component.html',
  styleUrls: ['./secondary-module-loader.component.css']
})
export class SecondaryModuleLoaderComponent implements OnInit {

  logedinUserID: string;
  personId: string;
  userId: string;
  person: Person;
  passedInPersonId: string;
  @Input("modulename") secondaryModuleName: string;

  showPatientBanner: boolean = false;
  demographicsReturned: boolean = false;
  unableToLoadPatient: boolean = false;

  constructor(private webStorageService: WebStorageService, private httpClient: HttpClient, private reqService: ApirequestService, private headerService: HeaderService,
    private errorHandlerService: ErrorHandlerService, private authService: AuthenticationService, private sharedData: SharedDataContainerService, private resizeService: ResizeService, public webComponentLoader: SecondaryComponentLoaderService) {
  }

  ngOnInit() {
    this.passedInPersonId = this.sharedData.personId;
    console.log("personSelected: ", this.passedInPersonId);
    this.showBannerIfPatientExists(this.passedInPersonId);

    if (this.secondaryModuleName) {
      let module = <Module>this.sharedData.allModules.find(x => x.domselector.indexOf(this.secondaryModuleName) != -1);
      if (module) {
        this.webComponentLoader.loadComponent(module);
      }
    }
  }

  async showBannerIfPatientExists(selectedPersonId: string) {

    let apiResponse: any;
    this.showPatientBanner = false;

    var getPersonURL = AppConfig.settings.apiServices.find(x => x.serviceName == 'GetPerson').serviceUrl + '&id=' + selectedPersonId;
    console.log("serviceUrl", getPersonURL);

    await this.reqService.getRequest(AppConfig.settings.apiServices.find(x => x.serviceName == 'GetPerson').serviceUrl + '&id=' + selectedPersonId)
      .then(
        (response) => {

          if (response) {


            this.person = JSON.parse(response);
            console.log("Person Response: ", selectedPersonId);


            if (this.passedInPersonId === selectedPersonId) {
              this.personId = selectedPersonId;
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

  receiveBannerDemographicResponse(value: boolean) {
    this.demographicsReturned = value;

    //console.log("receiveBannerDemographicResponse", value);
    //this.poaChange.emit(this.homePOA);
  }
}
