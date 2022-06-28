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


import { Component } from '@angular/core';
import { AuthenticationService } from './services/authentication.service';
import * as $ from 'jquery';
import { HeaderService } from './services/header.service';
import { Module } from './Models/application.model';
import { SharedDataContainerService } from './services/shared-data-container.service';
import { WebStorageService } from './services/webstorage.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {


  showSecondaryModule: boolean = false;
  secondaryModuleSelector: string;
  secondaryModuleName: string;
  appHeaderCSSClass: string = "app-header navbar";
  appBodyCSSClass: string = "app-body"

  title = 'interneuron-terminus';

  constructor(
    private authService: AuthenticationService,
    private headerService: HeaderService,
    private sharedData: SharedDataContainerService,
    private webStorage: WebStorageService
  )
  {
   this.subscribeEvents();
  }


  subscribeEvents() {

    this.headerService.loadSecondaryModule.subscribe(e => {
      this.showSecondaryModuleLoader(<string>e);
    });

    this.headerService.hideSecondaryModule.subscribe(e => {
      this.hideSecondaryModuleLoader();
    });


  }


  ngOnInit() {
    $(document).ready(function(){
      // $('#btnToggleNav').click(function(){

      //   if ( $('body').is('.sidebar-show') ) {
      //     $( "body" ).removeClass( "sidebar-show" );
      //   }
      //   else {
      //     $( "body" ).addClass( "sidebar-show" );
      //   }
      // });
    });
  }

  isLoggedIn() {
    return this.authService.user != null;
  }



  showSecondaryModuleLoader(moduleSelector: string) {
    this.secondaryModuleSelector = moduleSelector;
    this.secondaryModuleName = this.getSecondaryModuleName(moduleSelector);
    this.showSecondaryModule = true;
    this.appHeaderCSSClass = "app-header-hidden";
    this.appBodyCSSClass = "app-body-hidden";
  }


  hideSecondaryModuleLoader() {
    this.headerService.loadPatientBanner.next(this.webStorage.getSessionStorageItem("terminus:personcontext"));
    this.headerService.moduleAction.next("RELOAD_BANNER_WARNINGS")
    this.secondaryModuleSelector = undefined;
    this.showSecondaryModule = false;
    this.appHeaderCSSClass = "app-header navbar";
    this.appBodyCSSClass = "app-body";
  }

  getSecondaryModuleName(moduleSelector: string) {
    let module = <Module>this.sharedData.allModules.find(x => x.domselector.indexOf(moduleSelector) != -1);
    if(module) {
      return module.modulename;
    }
    else {
      return "Invalid Module selected";
    }

  }

}
