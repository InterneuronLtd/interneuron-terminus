//BEGIN LICENSE BLOCK 
//Interneuron Terminus

//Copyright(C) 2022  Interneuron CIC

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
import { Subject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class HeaderService {

  patientMessage = new Subject();

  applicationId = new Subject();

  persona = new Subject();

  selectedPersona = new Subject();

  selectedPersonaID = new Subject();

  personaContext = new Subject();

  selectedPersonaContext = new Subject();

  myPatient = new Subject();

  myPatientSelected = new Subject();

  applicationListId = new Subject();

  MyPatientTabularData = new Subject();

  wardPatientTabularData = new Subject();

  PatientListsTabularData = new Subject();

  PatientListUpdated = new Subject();

  selectedModule = new Subject();

  PatientListHeaderDisplay = new Subject();

  componentLoaded = new Subject();

  selectedApplicationPatientlist = new Subject();

  selectedApplicationPatientlistName = new Subject();

  changedMyPatients = new Subject();

  loadPatientBanner = new Subject();

  collapsePatientList = new Subject();

  expandPatientList = new Subject();

  loadSecondaryModule = new Subject();

  hideSecondaryModule = new Subject();

  lastSelectedDisplayPort = new Subject();

  selectedApplication = new Subject();

  selectedList = new Subject();

  selectedPesonaContext = new Subject();
  moduleAction = new Subject();

  constructor() { }


}
