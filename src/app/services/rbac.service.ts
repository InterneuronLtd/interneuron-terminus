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
import { AppConfig } from '../app.config';
import { ApirequestService } from '../services/apirequest.service';
import { filters, filterParams, filterparam, filter, selectstatement, orderbystatement, Rbacobject } from '../Models/Filter.model';
import { isArray } from 'util';

@Injectable({
  providedIn: 'root'
})
export class RbacService {
  public roleActions: Rbacobject[] = [];
  constructor(    private reqService: ApirequestService) { }


  public authoriseAction(action: string): boolean {
    return this.roleActions.filter(x => x.actionname.toLowerCase() == action.toLowerCase()).length > 0;
  }



  public GetRoleBaseddata(decodedToken: any,Url:string)
  {
   return this.reqService.postRequest(AppConfig.settings.apiServices.find(x => x.serviceName == Url).serviceUrl, this.createRoleFilter(decodedToken));
   
    

  } 
  public GetRoleBasedAction(decodedToken: any)
  {
    this.reqService.postRequest(AppConfig.settings.apiServices.find(x => x.serviceName == 'GetRBACAction').serviceUrl, this.createRoleFilter(decodedToken))
    .then(
      (response: Rbacobject[]) => {
        this.roleActions=response;
      },
     
    )
    

  } 

  createRoleFilter(decodedToken: any) {

    let condition = "";
    let pm = new filterParams();

    if (!isArray(decodedToken.SynapseRoles)) {
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

}
