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
import { HeaderService } from '../../services/header.service';
import { Persona } from '../../Models/Persona.model';
import { ErrorHandlerService } from '../../services/error-handler.service';
import { AppConfig } from '../../app.config';
import { ApirequestService } from '../../services/apirequest.service';
import { AuthenticationService } from '../../services/authentication.service';
import { WebStorageService } from "../../services/webstorage.service"
import { RbacService } from "../../services/rbac.service"
import { Rbacobject } from '../../Models/Filter.model';
import { Application, Module } from 'src/app/Models/application.model';

@Component({
  selector: 'app-personas',
  templateUrl: './personas.component.html',
  styleUrls: ['./personas.component.css']
})
export class PersonasComponent implements OnInit {

  personas: Persona[];
  selectedPersona: string;
  logedinUserID: string;
  RbacPersona: Rbacobject[] = [];


  constructor(private headerService: HeaderService,
    private RbacService: RbacService,
    private errorHandlerService: ErrorHandlerService,
    private reqService: ApirequestService,
    private authService: AuthenticationService,
    private webStorageService: WebStorageService

  )
  {
  }

  ngOnInit() {


    let decodedToken = this.authService.decodeAccessToken(this.authService.user.access_token);
    if (decodedToken != null) {
      this.GetRoleBaseddata(decodedToken);
      this.logedinUserID = decodedToken.IPUId;
    }

  }

  GetRoleBaseddata(decodedToken: any) {
    this.RbacService.GetRoleBaseddata(decodedToken, 'GetRBACpersona')
      .then(
        (response: Rbacobject[]) => {
          this.RbacPersona = response;
          this.getPersonaData();
        },

      )


  }
  getPersonaData() {
    this.reqService.getRequest(AppConfig.settings.apiServices.find(x => x.serviceName == 'GetUserPersona').serviceUrl)
      .then(
        (personas) => {
          this.personas = [];

          let allpersona = <Persona[]>JSON.parse(personas);

          for (var i = 0; i < allpersona.length; i++) {
            let length = this.RbacPersona.filter(x => x.objectname.toLowerCase() == allpersona[i].personaName.toLowerCase()).length;

            if (length > 0) {
              this.personas.push(allpersona[i]);
            }
          }
          if (this.personas.length > 0) {
            if (this.webStorageService.getLocalStorageItem("Terminus:" + this.logedinUserID + ":Persona") == null) {

              this.personaSelection(this.personas[0]);
              this.selectedPersona = this.personas[0].displayName;
              this.webStorageService.setLocalStorageItem("Terminus:" + this.logedinUserID + ":Persona", this.personas[0]);
            }
            else {
              let checkApplicationExits = this.personas.find(x => x.persona_id == this.webStorageService.getLocalStorageItem("Terminus:" + this.logedinUserID + ":Persona").persona_id);

              if (checkApplicationExits == null) {
                this.personaSelection(this.personas[0]);
                this.selectedPersona = this.personas[0].displayName;
                this.webStorageService.setLocalStorageItem("Terminus:" + this.logedinUserID + ":Persona", this.personas[0]);
              }
              else {
                this.personaSelection(checkApplicationExits);
                this.selectedPersona = checkApplicationExits.displayName;
              }
            }
          }
        },
        error => this.errorHandlerService.handleError(error)
      );
  }

  personaSelection(persona: Persona) {
    //console.log("persona.displayName:" + this.selectedPersona);
    if (persona) {
      if (document.getElementById('personaDropdownMenu').innerHTML != persona.displayName) {
        document.getElementById('personaDropdownMenu').innerHTML = persona.displayName;
        document.getElementById('personaContextDropdownMenu').innerHTML = 'Persona Context';

        this.selectedPersona = persona.displayName;
        //console.log("persona.displayName1:" + this.selectedPersona);
        this.headerService.selectedPersona.next(persona.displayName);
        this.headerService.selectedPersonaID.next(persona.persona_id);
        this.headerService.persona.next(persona.personaContext);
        this.webStorageService.setLocalStorageItem("Terminus:" + this.logedinUserID + ":Persona", persona);

      }
    }
  }

}
