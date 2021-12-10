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


import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApplicationsComponent } from './applications/applications.component';
import { ListsComponent } from './lists/lists.component';
import { MyPatientsComponent } from './my-patients/my-patients.component';
import { PatientSearchComponent } from './patient-search/patient-search.component';
import { PersonaContextsComponent } from './persona-contexts/persona-contexts.component';
import { PersonasComponent } from './personas/personas.component';
import { HeaderComponent } from './header.component';

@NgModule({
  declarations: [
    ApplicationsComponent,
    ListsComponent,
    MyPatientsComponent,
    PatientSearchComponent,
    PersonaContextsComponent,
    PersonasComponent,
    HeaderComponent
  ],
  imports: [
    CommonModule,
    FormsModule
  ],
  exports: [ApplicationsComponent,
    ListsComponent,
    MyPatientsComponent,
    PatientSearchComponent,
    PersonaContextsComponent,
    PersonasComponent,
    HeaderComponent
  ]
})
export class HeaderModule { }
