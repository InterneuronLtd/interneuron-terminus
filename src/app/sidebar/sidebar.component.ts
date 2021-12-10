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

import { Component, OnInit, OnDestroy } from '@angular/core';
import { HeaderService } from '../services/header.service';
import { ErrorHandlerService } from '../services/error-handler.service';
import { PersonaContext } from '../Models/personaContext.model';

@Component({
  selector: 'app-sidebar',
  templateUrl: './sidebar.component.html',
  styleUrls: ['./sidebar.component.css']
})
export class SidebarComponent implements OnInit, OnDestroy {
 
  show: boolean = false;
  personaContext:PersonaContext = new PersonaContext();
  selectedApplicationPatientlist:string="";
  setDisplay(){
    let styles={
      'display':this.show? 'none':'block'
    }
    return styles;
  }
  constructor(private headerService: HeaderService, private errorHandlerService: ErrorHandlerService) {
    this.showHideSidebarOnMyPatientList();
  }

  ngOnInit() {

    this.headerService.selectedApplicationPatientlistName.subscribe(
      (selectedApplicationPatientlist: string) => {
        if(selectedApplicationPatientlist=="")
        {
          this.selectedApplicationPatientlist="Please select a list. "
        }
        else{
        this.selectedApplicationPatientlist=selectedApplicationPatientlist;
        }
      },
      error => this.errorHandlerService.handleError(error)
    );

    this.headerService.selectedPersonaContext.subscribe(
      (personaContext: PersonaContext) => {
        this.personaContext = personaContext;
       
      },
      error => this.errorHandlerService.handleError(error)
    );
  }

  showHideSidebarOnMyPatientList() {
    this.headerService.myPatient.subscribe(
      (show: boolean) => {
        this.show = show;
        this.headerService.PatientListHeaderDisplay.next(this.personaContext.displayname);
      },
      error => this.errorHandlerService.handleError(error)
    );
  }

  ngOnDestroy(){
    this.headerService.selectedPersonaContext.unsubscribe();
  }


}
