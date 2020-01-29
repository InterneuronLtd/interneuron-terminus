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
import { HeaderService } from '../../services/header.service';
import { Persona } from '../../Models/Persona.model';
import { ErrorHandlerService } from '../../services/error-handler.service';
import { AppConfig } from '../../app.config';
import { ApirequestService } from '../../services/apirequest.service';
import { AuthenticationService } from '../../services/authentication.service';
import { WebStorageService } from "../../services/webstorage.service"
import * as jwt_decode from "jwt-decode";
import { $ } from 'protractor';

@Component({
  selector: 'app-personas',
  templateUrl: './personas.component.html',
  styleUrls: ['./personas.component.css']
})
export class PersonasComponent implements OnInit {

  personas: Persona[];
  selectedPersona: string;
  logedinUserID: string;
  constructor(private headerService: HeaderService,
    private errorHandlerService: ErrorHandlerService,
    private reqService: ApirequestService,
    private authService: AuthenticationService,
    private webStorageService: WebStorageService

  ) { }

  ngOnInit() {


    let decodedToken = this.decodeAccessToken(this.authService.user.access_token);
    if (decodedToken != null) {

      this.logedinUserID = decodedToken.IPUId;
    }
    this.getPersonaData();
  }
  decodeAccessToken(token: string): any {
    try {
      return jwt_decode(token);
    }
    catch (Error) {
      return null;
    }
  }


  getPersonaData() {
    this.reqService.getRequest(AppConfig.settings.apiServices.find(x => x.serviceName == 'GetUserPersona').serviceUrl)
      .then(
        (personas) => {
          this.personas = <Persona[]>JSON.parse(personas);
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
