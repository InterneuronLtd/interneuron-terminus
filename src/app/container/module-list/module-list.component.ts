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

import { Component, OnInit } from '@angular/core';
import { ApirequestService } from '../../services/apirequest.service';
import { AppConfig } from '../../app.config';
import { ErrorHandlerService } from '../../services/error-handler.service';
import { HeaderService } from '../../services/header.service';
import { Module } from '../../Models/application.model';

@Component({
  selector: 'app-module-list',
  templateUrl: './module-list.component.html',
  styleUrls: ['./module-list.component.css']
})

export class ModuleListComponent implements OnInit {

  moduleList: Module[] = [];
  selectedModule: string = "";

  applicationId: string;
  constructor(private apiCaller: ApirequestService, private errorHandlerService: ErrorHandlerService, private headerService: HeaderService) {
    this.getApplicationId();
  }

  getApplicationId() {
    this.headerService.applicationId.subscribe(
      (applicationId: string) => {
        this.applicationId = applicationId;
        this.getModules();
      },
      error => this.errorHandlerService.handleError(error)
    )
  }

  ngOnInit() {
  }

  notifySelectedModule(e: any) {
    //console.log(e);
    this.selectedModule = e.modulename;
    this.headerService.selectedModule.next(e)
  }

  getModules() {
    this.apiCaller.getRequest(AppConfig.settings.apiServices.find(x => x.serviceName == 'GetModulesList').serviceUrl + "?synapseattributename=application_id&attributevalue=" + this.applicationId)
      .then(
        (response) => {
          this.moduleList = []
          let responseArray = JSON.parse(response);
          let hasdefaultmodule: boolean = false;


          for (let r of responseArray) {
            if (r.isdefaultmodule) {

              hasdefaultmodule = true;
              this.headerService.selectedModule.next(r);
              this.selectedModule = r.modulename;
            }
            //console.log(r);
            this.moduleList.push(<Module>r);
          }
          if (!hasdefaultmodule && this.moduleList.length > 0) {
            this.headerService.selectedModule.next(this.moduleList[0])
            this.moduleList[0].isdefaultmodule = true;
            this.selectedModule = this.moduleList[0].modulename;
          }
        },
        error => this.errorHandlerService.handleError(error)
      );
  }

  ngOnDestroy() {
    this.headerService.applicationId.unsubscribe();
  }

  myjson: any = JSON;

}
