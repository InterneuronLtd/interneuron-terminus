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

import { Component, OnInit, OnDestroy } from '@angular/core';
import { HeaderService } from '../../services/header.service';
import { PersonaContext } from '../../Models/personaContext.model';
import { ErrorHandlerService } from '../../services/error-handler.service';
import { AuthenticationService } from '../../services/authentication.service';
import { WebStorageService } from "../../services/webstorage.service"
import * as jwt_decode from "jwt-decode";
@Component({
  selector: 'app-persona-contexts',
  templateUrl: './persona-contexts.component.html',
  styleUrls: ['./persona-contexts.component.css']
})
export class PersonaContextsComponent implements OnInit, OnDestroy {
  personaContexts: PersonaContext[];
  selectedPersonaContext: PersonaContext = new PersonaContext();
  isChanged: boolean = false;
  logedinUserID: string;

  constructor(private headerService: HeaderService,
     private errorHandlerService: ErrorHandlerService,
     private authService: AuthenticationService,
     private webStorageService: WebStorageService
     ) { }

  ngOnInit() {
    let decodedToken = this.authService.decodeAccessToken(this.authService.user.access_token);
    if (decodedToken != null) {

      this.logedinUserID = decodedToken.IPUId;
    }
    this.getPersonaContextData();
  }
 
  getPersonaContextData() {
    this.headerService.persona.subscribe(
      (personaContexts: PersonaContext[]) => {
        this.personaContexts = personaContexts;
        if (this.personaContexts.length > 0) {
          if (this.webStorageService.getLocalStorageItem("Terminus:" + this.logedinUserID + ":PersonaContext") == null) {

            this.personaContextSelection(this.personaContexts[0]);
            this.selectedPersonaContext = this.personaContexts[0];
            this.webStorageService.setLocalStorageItem("Terminus:" + this.logedinUserID + ":PersonaContext", this.personaContexts[0]);
          }
          else {
            let checkApplicationExits = this.personaContexts.find(x => x.personacontext_id == this.webStorageService.getLocalStorageItem("Terminus:" + this.logedinUserID + ":PersonaContext").personacontext_id);

            if (checkApplicationExits == null) {
              this.personaContextSelection(this.personaContexts[0]);
              this.selectedPersonaContext = this.personaContexts[0];
              this.webStorageService.setLocalStorageItem("Terminus:" + this.logedinUserID + ":PersonaContext", this.personaContexts[0]);
            }
            else {
              this.personaContextSelection(this.webStorageService.getLocalStorageItem("Terminus:" + this.logedinUserID + ":PersonaContext"));
              this.selectedPersonaContext = this.webStorageService.getLocalStorageItem("Terminus:" + this.logedinUserID + ":PersonaContext");
            }
          }
        }
      },
      error => this.errorHandlerService.handleError(error)
    );
  }

  personaContextSelection(personaContext: PersonaContext) {
    if (personaContext) {
      document.getElementById('personaContextDropdownMenu').innerHTML = personaContext.displayname;
      this.headerService.personaContext.next(personaContext);
      this.headerService.wardPatientTabularData.next([]);//Empty Sidebar list before  geting new list
      this.headerService.selectedPersonaContext.next(personaContext);

      this.selectedPersonaContext = personaContext;

      this.webStorageService.setLocalStorageItem("Terminus:" + this.logedinUserID + ":PersonaContext", personaContext);
    }
  }

  ngOnDestroy() {
    this.headerService.persona.unsubscribe();
  }

}
