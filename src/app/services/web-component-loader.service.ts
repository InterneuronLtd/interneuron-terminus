// Interneuron Terminus
// Copyright(C) 2019  Interneuron CIC
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


@Injectable({
  providedIn: 'root'
})
export class WebComponentLoaderService {

  prevComponent: string = "";
  constructor(private headerService: HeaderService, private errorHandlerService: ErrorHandlerService, private webStorage: WebStorageService, private apiCaller: ApirequestService
    , private patientListService: PatientListService) {
    this.headerService.myPatientSelected.subscribe(
      (patientid: string) => {
        //console.log("loading componenet");
        webStorage.setSessionStorageItem("terminus:personcontext", patientid);
        let selector = webStorage.getSessionStorageItem("terminus:currentmodule");
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

  }

  renderComponent(module: string) {
    //element.addEventListener('unloaded', msg => this.handleMessage(msg));
    let subject = new Subject();
    let element = document.createElement(module);
    let personid = this.webStorage.getSessionStorageItem("terminus:personcontext");
    element["personid"] = personid;
    element["apiservice"] = this.apiCaller
    element["unload"] = subject;
    element.id = "ID" + Math.round(Math.random() * 100)
    element.addEventListener("frameworkAction", (msg) => this.handleFrameworkActionfromComponent(msg))

    const wrappingDiv = document.getElementById("componentLoader");

    var un = subject.subscribe((e) => {
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
