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
export class SecondaryComponentLoaderService {

  constructor(private headerService: HeaderService, private errorHandlerService: ErrorHandlerService, private webStorage: WebStorageService, private apiCaller: ApirequestService
    , private patientListService: PatientListService, private authService: AuthenticationService, private sharedData: SharedDataContainerService) {
  }

  public loadComponent(module: Module) {

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
            this.renderComponent(module.domselector, module.modulename);
          });
        } catch (error) {
          console.warn("error loading module:" + error)
        }
      }
      else {
        this.renderComponent(module.domselector, module.modulename);
      }
    }
    else {
      let wrappingDiv = document.getElementById("secondaryComponentLoader");
      wrappingDiv.innerHTML = "";
    }
  }

  renderComponent(module: string, moduleName: string) {
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

    const wrappingDiv = document.getElementById("secondaryComponentLoader");
    var component = document.getElementsByTagName(module);
    if (component.length > 0) {
      //console.log("component found");
      wrappingDiv.innerHTML = "<h3 class='text-danger'>The " + moduleName + " module is already loaded</h3><h4 class='text-danger'>Please close this view and access the " + moduleName + " module.</h4>";
    }
    else {
      //console.log("inside else, not loaded yet");
      wrappingDiv.innerHTML = "";
      wrappingDiv.appendChild(element);
    }
  }

  ngOnDestroy() {

  }
}
