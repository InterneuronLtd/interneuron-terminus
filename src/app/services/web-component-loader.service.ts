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


import { Injectable } from '@angular/core';
import { HeaderService } from './header.service';
import { ErrorHandlerService } from './error-handler.service';
import { Module } from '../Models/application.model';
import { WebStorageService } from './webstorage.service';
import { ApirequestService } from './apirequest.service';
import { Subject } from 'rxjs';
import { PatientListService } from './patient-list.service';
import { AuthenticationService } from 'src/app/services/authentication.service';
import { SharedDataContainerService } from './shared-data-container.service';
import { ModuleDataContract } from '../Models/ModuleDataContract.model';


@Injectable({
  providedIn: 'root'
})
export class WebComponentLoaderService {

  prevComponent: string = "";

  logedinUserID: string;

  constructor(private headerService: HeaderService, private errorHandlerService: ErrorHandlerService, private webStorage: WebStorageService, private apiCaller: ApirequestService
    , private patientListService: PatientListService, private authService: AuthenticationService, private sharedData: SharedDataContainerService) {
    this.headerService.myPatientSelected.subscribe(
      (patientid: string) => {
        //console.log("loading componenet");
        webStorage.setSessionStorageItem("terminus:personcontext", patientid);
        let selector = webStorage.getSessionStorageItem("terminus:currentmodule");

        let decodedToken = this.authService.decodeAccessToken(this.authService.user.access_token);
        if (decodedToken != null) {

          this.logedinUserID = decodedToken.IPUId;
        }

        if (webStorage.getLocalStorageItem("Terminus:" + this.logedinUserID + ":Contexts") != null) {
          let contexts = webStorage.getLocalStorageItem("Terminus:" + this.logedinUserID + ":Contexts");

          let personContext = contexts[0].person_id;

          if (personContext == patientid) {
            webStorage.setSessionStorageItem("terminus:contexts", contexts);
          }
          else {
            webStorage.removeSessionStorageItem("terminus:contexts");
          }
        }
        else {
          webStorage.removeSessionStorageItem("terminus:contexts");
        }


        if (selector)
        // document.querySelector(selector)["personid"] = patientid; // this will be extended to a complex type
        {
          //remove component from dom and add again
          this.renderComponent(selector)

        }
      },
      error => this.errorHandlerService.handleError(error)
    );
  }

  loadComponent(module: Module) {
    if (module != null) {
      var isFound = false;
      var scripts = document.getElementsByTagName("script")
      for (var i = 0; i < scripts.length; ++i) {
        if (scripts[i].getAttribute('src') != null && scripts[i].getAttribute('src').includes(module.jsurl)) {
          isFound = true;
        }
      }
      if (!isFound) {
        let node = document.createElement('script');
        //console.log(module.jsurl);
        node.src = module.jsurl + "?V" + Math.random();
        node.type = 'text/javascript';
        node.async = false;
        node.charset = 'utf-8';
        try {
          document.getElementsByTagName('head')[0].appendChild(node).addEventListener("load", () => {
            this.renderComponent(module.domselector);
          });
        } catch (error) {
          console.warn("error loading module:" + error)
        }
      }
      else {
        this.renderComponent(module.domselector);
      }
    }
    else {
      let wrappingDiv = document.getElementById("componentLoader");
      wrappingDiv.innerHTML = "";
      this.webStorage.removeSessionStorageItem("terminus:currentmodule");
    }
  }

  handleFrameworkActionfromComponent(action) {
    //console.log(action.detail);
    if (action.detail == "UPDATE_EWS") {
      this.patientListService.getList("");
    }
    else if (action.detail == "UPDATE_HEIGHT_WEIGHT") {
      this.headerService.loadPatientBanner.next(this.webStorage.getSessionStorageItem("terminus:personcontext"));
    }
    else if (action.detail == "COLLAPSE_PATIENT_LIST"){
      this.headerService.collapsePatientList.next();
    }
  }

  renderComponent(module: string) {
    //element.addEventListener('unloaded', msg => this.handleMessage(msg));
    let dataContract = new ModuleDataContract();
    dataContract.unload = new Subject();

    let element = document.createElement(module);
    dataContract.personId = this.webStorage.getSessionStorageItem("terminus:personcontext");
    dataContract.apiService = this.apiCaller;

    element["personid"] = dataContract.personId;
    element["apiservice"] = dataContract.apiService;
    element["unload"] = dataContract.unload;

    if (this.webStorage.getSessionStorageItem("terminus:contexts") != null) {
      let contexts = this.webStorage.getSessionStorageItem("terminus:contexts");
      if (contexts) {
        dataContract.contexts = contexts;
        element["contexts"] = dataContract.contexts;
      }
      else {
        let jsonString: string = "[{\"person_id\":\"" + dataContract.personId + "\"}]";
        dataContract.contexts = JSON.parse(jsonString);
        element["contexts"] = dataContract.contexts;
      }
    }
    else {
      let jsonString: string = "[{\"person_id\":\"" + dataContract.personId + "\"}]";
      dataContract.contexts = JSON.parse(jsonString);
      element["contexts"] = dataContract.contexts;
    }

    element["datacontract"] = dataContract;

    element.id = "ID" + Math.round(Math.random() * 100)
    element.addEventListener("frameworkAction", (msg) => this.handleFrameworkActionfromComponent(msg))

    const wrappingDiv = document.getElementById("componentLoader");

    var un = dataContract.unload.subscribe((e) => {
      //un.unsubscribe();
      //console.log("unload worked");
      let currComponent = this.webStorage.getSessionStorageItem("terminus:currentmodule");
      //render component from here only if reloading same module
      if (currComponent == e)
        this.renderComponent(currComponent);
    });


    var component = document.getElementsByTagName(module);
    if (component.length > 0) {
      //console.log("component found");
      wrappingDiv.innerHTML = "";
    }
    else {
      //console.log("inside else, not loaded yet");
      wrappingDiv.innerHTML = "";
      wrappingDiv.appendChild(element);
    }

    //setTimeout(() => {
    //  wrappingDiv.appendChild(element);
    //}, 500)

    this.webStorage.setSessionStorageItem("terminus:currentmodule", module);
    //let personid = this.webStorage.getSessionStorageItem("terminus:personcontext");
    //setTimeout(() => {
    //  element["personid"] = personid;
    //  element["apiservice"] = this.apiCaller;
    //}, 0)

  }

  ngOnDestroy() {
    this.headerService.myPatientSelected.unsubscribe();
  }
}
