//BEGIN LICENSE BLOCK 
//Interneuron Terminus

//Copyright(C) 2024  Interneuron Limited

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

import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { UserProfileComponent } from './userprofile/userprofile.component';
import { UserProfilePictureComponent } from './userprofile/profile-picture/userprofile-picture.component';
import { HttpClientModule } from '@angular/common/http';
import { ModalModule } from 'ngx-bootstrap/modal';
import { PatientconsentComponent } from './patientconsent/patientconsent.component';
import { TooltipModule, TooltipOptions } from 'ng2-tooltip-directive';
import { CustomTooltipOptions } from './tooltip-options';


@NgModule({
  declarations: [
    UserProfileComponent,
    UserProfilePictureComponent,
    PatientconsentComponent
  ],
  imports: [
    CommonModule,
    FormsModule,
    HttpClientModule,
    ModalModule.forRoot(),
    TooltipModule.forRoot(CustomTooltipOptions as TooltipOptions)
  ],
  exports: [
    UserProfileComponent,
    UserProfilePictureComponent,
    PatientconsentComponent
  ],
  providers: [
  ]
})
export class SharedModule { }