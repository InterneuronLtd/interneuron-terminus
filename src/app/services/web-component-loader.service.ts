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
// Interneuron Terminus
// Copyright(C) 2023  Interneuron Holdings Ltd
// This program is free software: you can redistribute it and/or modify
// it under the terms of the GNU General Public License as published by
// the Free Software Foundation, either version 3 of the License, or
// (at your option) any later version.
// This program is distributed in the hope that it will be useful,
// but WITHOUT ANY WARRANTY; without even the implied warranty of
// MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.
// See the
// GNU General Public License for more details.
// You should have received a copy of the GNU General Public License
// along with this program.If not, see<http://www.gnu.org/licenses/>.

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
import { AdditionalInfo, ModuleDataContract } from '../Models/ModuleDataContract.model';
import { MeetingRendererService } from './meeting-renderer.service';
import { AwsS3ServiceService } from './aws-s3-service.service';
import { RefWeightHeightComponent } from '../ref-weight-height/ref-weight-height.component';
import { BsModalService } from 'ngx-bootstrap/modal';
import { RecRefHeightComponent } from '../rec-ref-height/rec-ref-height.component';


@Injectable({
  providedIn: 'root'
})
export class WebComponentLoaderService {

  prevComponent: string = "";

  logedinUserID: string;
  bsModalRef: any;

  constructor(private headerService: HeaderService, private errorHandlerService: ErrorHandlerService, private webStorage: WebStorageService, private apiCaller: ApirequestService
    , private patientListService: PatientListService, private authService: AuthenticationService, private sharedData: SharedDataContainerService, private meetingRenderer: MeetingRendererService,public modalService: BsModalService,
    public aws: AwsS3ServiceService) {
    this.headerService.myPatientSelected.subscribe(
      (patientid: string) => {
        //console.log("loading componenet");
        webStorage.setSessionStorageItem("terminus:personcontext", patientid);
        let selector = webStorage.getSessionStorageItem("terminus:currentmodule");
        let modulename = webStorage.getSessionStorageItem("terminus:currentmodulename");

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
          this.renderComponent(selector, modulename)

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
          this.sharedData.ShoModuleLoader = true;
          document.getElementsByTagName('head')[0].appendChild(node).addEventListener("load", () => {
            this.sharedData.ShoModuleLoader = false;
            this.renderComponent(module.domselector, module.modulename);
          });
        } catch (error) {
          this.sharedData.ShoModuleLoader = false;
          console.warn("error loading module:" + error)
        }
      }
      else {
        this.renderComponent(module.domselector, module.modulename);
      }
    }
    else {
      let wrappingDiv = document.getElementById("componentLoader");
      wrappingDiv.innerHTML = "";
      this.webStorage.removeSessionStorageItem("terminus:currentmodule");
      this.webStorage.removeSessionStorageItem("terminus:currentmodulename");

    }
  }

  handleFrameworkActionfromComponent(action) {
    console.log("Framework action called:", action);
    //console.log(action.detail);
    if (action.detail == "REFRESH_LIST") {
      //Refreshes the selected snapshot and expanded list
      this.patientListService.getList("");
    }
    else if (action.detail == "REFRESH_BANNER") {
      //Reloads the person banner
      this.headerService.loadPatientBanner.next(this.webStorage.getSessionStorageItem("terminus:personcontext"));
    }
    else if (action.detail == "COLLAPSE_PATIENT_LIST") {
      //Collapses the snapshot list
      this.headerService.collapsePatientList.next();
    }
    else if (action.detail == "EXPAND_PATIENT_LIST") {
      //Collapses the snapshot list
      this.headerService.expandPatientList.next();
    }
    else if (action.detail.indexOf("LOAD_SECONDARY_MODULE_") != -1) {
      //Load secondary module
      let module = action.detail.replace("LOAD_SECONDARY_MODULE_", "");
      this.headerService.loadSecondaryModule.next(module);
    }
    else if (action.detail == "HIDE_SECONDARY_MODULE") {
      //Hide secondary module
      this.headerService.hideSecondaryModule.next();
    }
    // LEGACY ACTIONS
    else if (action.detail == "UPDATE_EWS") {
      //Refreshes the selected snapshot and expanded list
      this.patientListService.getList("");
    }
    else if (action.detail == "UPDATE_HEIGHT_WEIGHT") {
      //Reloads the person banner
      this.headerService.loadPatientBanner.next(this.webStorage.getSessionStorageItem("terminus:personcontext"));
    }
    else if (action.detail.includes("SEARCH_CLIENT")) {
      //Reloads the person banner
      this.headerService.hideSecondaryModule.next();
      let arraystring = action.detail.split('_')
      let clientid = arraystring[2];
      this.headerService.searchClient.next(clientid);
    }
    else if (action.detail == "OPEN_W3W") {
      this.headerService.w3w.next("OPEN_W3W");
    }
    else if (action.detail == "OPEN_HEIGHT") {
      this.openRecordHeightModal("");
    }
    else if (action.detail == "OPEN_WEIGHT") {
      this.openRecordWeightModal("")
    }
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
  renderComponent(module: string, moduleName: string) {

    //element.addEventListener('unloaded', msg => this.handleMessage(msg));
    let dataContract = new ModuleDataContract();
    dataContract.unload = new Subject();

    let element = document.createElement(module);
    dataContract.personId = this.webStorage.getSessionStorageItem("terminus:personcontext");
    dataContract.apiService = this.apiCaller;
    dataContract.additionalInfo.push(new AdditionalInfo("currentmodule", moduleName));
    dataContract.additionalInfo.push(new AdditionalInfo("meetingrenderer", this.meetingRenderer));
    dataContract.additionalInfo.push(new AdditionalInfo("awsS3Client", this.aws));

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

    dataContract.moduleAction = this.headerService.moduleAction;
    element["datacontract"] = dataContract;

    element.id = "ID" + Math.round(Math.random() * 100)
    element.addEventListener("frameworkAction", (msg) => this.handleFrameworkActionfromComponent(msg))

    const wrappingDiv = document.getElementById("componentLoader");

    var un = dataContract.unload.subscribe((e) => {
      //un.unsubscribe();
      //console.log("unload worked");
      let currComponent = this.webStorage.getSessionStorageItem("terminus:currentmodule");
      let currentComponentname = this.webStorage.getSessionStorageItem("terminus:currentmodulename");
      //render component from here only if reloading same module
      if (currComponent == e)
        this.renderComponent(currComponent, currentComponentname);
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
    this.webStorage.setSessionStorageItem("terminus:currentmodulename", moduleName)

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