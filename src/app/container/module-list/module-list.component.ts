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

import { Component, OnInit } from '@angular/core';
import { ApirequestService } from '../../services/apirequest.service';
import { AppConfig } from '../../app.config';
import { ErrorHandlerService } from '../../services/error-handler.service';
import { HeaderService } from '../../services/header.service';
import { Application, Module } from '../../Models/application.model';
import { filters, filterParams, filterparam, filter, selectstatement, orderbystatement, Rbacobject } from '../../Models/Filter.model';
import { RbacService } from "../../services/rbac.service";
import { AuthenticationService } from '../../services/authentication.service';
import  {jwtDecode} from "jwt-decode";
import { SharedDataContainerService } from 'src/app/services/shared-data-container.service';

@Component({
  selector: 'app-module-list',
  templateUrl: './module-list.component.html',
  styleUrls: ['./module-list.component.css']
})

export class ModuleListComponent implements OnInit {

  moduleList: Module[] = [];
  selectedModule: string = "";
  Rbacmodule: Rbacobject[] = [];
  applicationId: string;


  constructor(private apiCaller: ApirequestService, private RbacService: RbacService, private authService: AuthenticationService, private errorHandlerService: ErrorHandlerService, private headerService: HeaderService, private sharedData: SharedDataContainerService) {
    this.getApplicationId();

    //Read Selected Module from Header Service
    this.headerService.selectedModule.subscribe(
      (value: any) => {
        this.selectedModule = value;
      },
      (error) => {
        //
      }
    );
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
    let decodedToken = this.authService.decodeAccessToken(this.authService.user.access_token);
    if (decodedToken != null) {
      this.GetRoleBaseddata(decodedToken);

      this.getAllModules();
    }
  }
  decodeAccessToken(token: string): any {
    try {
      return jwtDecode(token);
    }
    catch (Error) {
      return null;
    }
  }
  notifySelectedModule(e: any) {
    //console.log(e);
    this.selectedModule = e.modulename;
    this.headerService.selectedModule.next(e)
  }

  GetRoleBaseddata(decodedToken: any) {
    this.RbacService.GetRoleBaseddata(decodedToken, 'GetRBACmodule')
      .then(
        (response: Rbacobject[]) => {
          this.Rbacmodule = response;
        },

      )

  }

  createRoleFilter(decodedToken: any) {

    let condition = "";
    let pm = new filterParams();

    if (!Array.isArray(decodedToken.SynapseRoles)) {
      condition = "rolename = @rolename";
      pm.filterparams.push(new filterparam("rolename", decodedToken.SynapseRoles));
    }
    else
      for (var i = 0; i < decodedToken.SynapseRoles.length; i++) {
        condition += "or rolename = @rolename" + i + " ";
        pm.filterparams.push(new filterparam("rolename" + i, decodedToken.SynapseRoles[i]));
      }
    condition = condition.replace(/^\or+|\or+$/g, '');
    let f = new filters();
    f.filters.push(new filter(condition));


    let select = new selectstatement("SELECT *");

    let orderby = new orderbystatement("ORDER BY 1");

    let body = [];
    body.push(f);
    body.push(pm);
    body.push(select);
    body.push(orderby);


    return JSON.stringify(body);
  }
  getModules() {
    this.apiCaller.getRequest(AppConfig.settings.apiServices.find(x => x.serviceName == 'GetModulesList').serviceUrl + "?synapseattributename=application_id&attributevalue=" + this.applicationId)
      .then(
        (response) => {
          this.moduleList = []
          let responseArray = JSON.parse(response);

          let hasdefaultmodule: boolean = false;


          for (let r of responseArray) {
            let length = this.Rbacmodule.filter(x => x.objectname.toLowerCase() == r.modulename.toLowerCase()).length;
            if (length > 0) {
              if (r.isdefaultmodule) {

                hasdefaultmodule = true;
                this.headerService.selectedModule.next(r);
                this.selectedModule = r.modulename;
              }
              //console.log(r);
              this.moduleList.push(<Module>r);
            }
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

  getAllModules() {
    this.apiCaller.getRequest(AppConfig.settings.apiServices.find(x => x.serviceName == 'GetAllModulesList').serviceUrl)
      .then(
        (response) => {
          this.sharedData.allModules = []
          let responseArray = JSON.parse(response);
          for (let r of responseArray) {
            this.sharedData.allModules.push(<Module>r);
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
