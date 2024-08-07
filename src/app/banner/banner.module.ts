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
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BannerActionsComponent } from './banner-actions/banner-actions.component';
import { BannerComponent } from './banner.component';
import { ExtendedBannerComponent } from './extended-banner/extended-banner.component';
import { MainAllergiesComponent } from './main-allergies/main-allergies.component';
import { MainBadgesComponent } from './main-badges/main-badges.component';
import { MainDemographicsComponent } from './main-demographics/main-demographics.component';
import { MainEncounterComponent } from './main-encounter/main-encounter.component';
import { MainWarningsComponent } from './main-warnings/main-warnings.component';
import { HttpClientModule } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
import { BrowserModule } from '@angular/platform-browser';
import { ModalModule, BsModalRef } from 'ngx-bootstrap/modal';
import { BsDatepickerConfig, BsDatepickerModule } from 'ngx-bootstrap/datepicker';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { AngularWebStorageModule } from 'angular-web-storage';
import { RecRefHeightComponent } from '../rec-ref-height/rec-ref-height.component';
import { RefWeightHeightComponent } from '../ref-weight-height/ref-weight-height.component';
import { SharedModule } from '../shared/shared.module';
import { TooltipModule, TooltipOptions } from 'ng2-tooltip-directive';
import { RefWaistcircumferenceComponent } from '../ref-waistcircumference/ref-waistcircumference.component';
@NgModule({
  declarations: [
    BannerComponent,
    MainDemographicsComponent,
    MainEncounterComponent,
    MainAllergiesComponent,
    MainBadgesComponent,
    MainWarningsComponent,
    BannerActionsComponent,
    ExtendedBannerComponent,
    RecRefHeightComponent,
    RefWeightHeightComponent,
    RefWaistcircumferenceComponent

  ],
  imports: [
    CommonModule,
    BrowserModule,
    HttpClientModule,
    ModalModule.forRoot(),
    BsDatepickerModule.forRoot(),
    FormsModule,
    AngularWebStorageModule,
    FontAwesomeModule,
    SharedModule,
    TooltipModule
  ],
  exports: [
    BannerComponent,
    MainDemographicsComponent,
    MainEncounterComponent,
    MainAllergiesComponent,
    MainBadgesComponent,
    MainWarningsComponent,
    BannerActionsComponent,
    ExtendedBannerComponent
  ],
  providers: [
 
    BsDatepickerConfig
 
  ],
})
export class BannerModule { }