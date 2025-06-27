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
import { ModuleListComponent } from '../container/module-list/module-list.component';
import { AboutComponent } from './about/about.component';
import { SharedModule } from '../shared/shared.module';

@NgModule({
  declarations: [
    ApplicationsComponent,
    ListsComponent,
    MyPatientsComponent,
    PatientSearchComponent,
    PersonaContextsComponent,
    PersonasComponent,
    HeaderComponent,
    ModuleListComponent,
    AboutComponent
  ],
  imports: [
    CommonModule,
    FormsModule,
    SharedModule
  ],
  exports: [ApplicationsComponent,
    ListsComponent,
    MyPatientsComponent,
    PatientSearchComponent,
    PersonaContextsComponent,
    PersonasComponent,
    HeaderComponent
  ],
  providers: [
  ]
})
export class HeaderModule { }
