//BEGIN LICENSE BLOCK 
//Interneuron Terminus

//Copyright(C) 2023  Interneuron Holdings Ltd

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


import { NgModule, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NgxPaginationModule } from 'ngx-pagination';
import { FormsModule } from '@angular/forms';
import { ContainerComponent } from './container.component';
import { StringFilterPipe } from '../utilities/string.filter.pipe';
import { EscapeHtmlPipe } from '../utilities/keep-html.pipe';
import { BannerModule } from '../banner/banner.module';


@NgModule({
  declarations: [
    ContainerComponent,
    StringFilterPipe,
    EscapeHtmlPipe
  ],
  imports: [
    CommonModule,
    NgxPaginationModule,
    FormsModule,
    BannerModule
  ],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  exports: [ContainerComponent]
})
export class ContainerModule { }
