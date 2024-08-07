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
import { SidebarComponent } from './sidebar.component';
import { FeedbackComponent } from './feedback/feedback.component';
import { PatientlistComponent } from './patientlist/patientlist.component';
import { AppnavComponent } from './appnav/appnav.component';
import { RightsidebarComponent } from './rightsidebar/rightsidebar.component';
import { HeaderComponent } from '../header/header.component';
import { HeaderModule } from '../header/header.module';


@NgModule({
  declarations: [SidebarComponent, FeedbackComponent, PatientlistComponent, AppnavComponent, RightsidebarComponent],
  imports: [
    CommonModule, HeaderModule
  ],
  exports: [SidebarComponent, FeedbackComponent]
})
export class SidebarModule { }