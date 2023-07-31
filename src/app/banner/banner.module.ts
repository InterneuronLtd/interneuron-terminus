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
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { AngularWebStorageModule } from 'angular-web-storage';

@NgModule({
  declarations: [
    BannerComponent,
    MainDemographicsComponent,
    MainEncounterComponent,
    MainAllergiesComponent,
    MainBadgesComponent,
    MainWarningsComponent,
    BannerActionsComponent,
    ExtendedBannerComponent

  ],
  imports: [
    CommonModule,
    BrowserModule,
    HttpClientModule,
    FormsModule,
    AngularWebStorageModule,
    FontAwesomeModule
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
  ]
})
export class BannerModule { }
