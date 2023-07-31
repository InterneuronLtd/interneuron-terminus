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


import {
  AfterViewInit,
  Component,
  ElementRef,
  HostListener,
  OnDestroy,
  OnInit,
  ViewChild,
} from "@angular/core";
import { AuthenticationService } from "../services/authentication.service";
import { AppConfig } from "../app.config";
import { UserIdleService } from "angular-user-idle";
import { Router } from "@angular/router";
import * as $ from "jquery";
import { RbacService } from "../services/rbac.service";
import { HeaderService } from "../services/header.service";
import { Subscription } from "rxjs";
import { ResizeService } from "../services/resize.service";
import { Application, Module } from "../Models/application.model";


@Component({
  selector: "app-header",
  templateUrl: "./header.component.html",
  styleUrls: ["./header.component.css"]
})
export class HeaderComponent implements OnInit, OnDestroy, AfterViewInit {
  desktopDisplayClass = "display-desktop";
  mobileDisplayClass = "hide-mobile";

  private resizeSubscription: Subscription;

  displayPort: string;
  selectedDisplayPort: string;
  selectedApplication: Application;
  selectedList: String;
  selectedModule: Module;
  selectedPersona: string;
  selectedPersonaContext: string;

  timeout: number = 0;
  showTimeoutModal: boolean = false;
  @ViewChild("openTimeoutModal") openTimeoutModalButton: ElementRef;

  @ViewChild("applicationstemplate_desktop") applicationstemplate_desktop: ElementRef;
  @ViewChild("applicationstemplate_mobile") applicationstemplate_mobile: ElementRef;
  @ViewChild("applicationstemplate") applicationstemplate: ElementRef;

  @ViewChild("personatemplate_desktop") personatemplate_desktop: ElementRef;
  @ViewChild("personatemplate_mobile") personatemplate_mobile: ElementRef;
  @ViewChild("personatemplate") personatemplate: ElementRef;

  @ViewChild("personacontexttemplate_desktop") personacontexttemplate_desktop: ElementRef;
  @ViewChild("personacontexttemplate_mobile") personacontexttemplate_mobile: ElementRef;
  @ViewChild("personacontexttemplate") personacontexttemplate: ElementRef;

  @ViewChild("liststemplate_desktop") liststemplate_desktop: ElementRef;
  @ViewChild("liststemplate_mobile") liststemplate_mobile: ElementRef;
  @ViewChild("liststemplate") liststemplate: ElementRef;

  @ViewChild("modulestemplate_desktop") modulestemplate_desktop: ElementRef;
  @ViewChild("modulestemplate_mobile") modulestemplate_mobile: ElementRef;
  @ViewChild("modulestemplate") modulestemplate: ElementRef;


  username: string = "";
  headertemplatecolour: string = "#f6f2f2";
  constructor(
    private RbacService: RbacService,
    private authService: AuthenticationService,
    private router: Router,
    private userIdle: UserIdleService,
    private headerService: HeaderService,
    private resizeService: ResizeService
  ) {

    //Read lastDisplayPortSize from Header Service
    this.headerService.lastSelectedDisplayPort.subscribe(
      (value: string) => {
        this.displayPort = value;
      },
      (error) => {
        //
      }
    );

    //Read Selected Application from Header Service
    this.headerService.selectedApplication.subscribe(
      (value: any) => {
        this.selectedApplication = value;
      },
      (error) => {
        //
      }
    );

    //Read Selected Module from Header Service
    this.headerService.selectedModule.subscribe(
      (value: any) => {
        this.selectedModule = value;
      },
      (error) => {
        //
      }
    );

    //Read Selected List from Header Service
    this.headerService.selectedList.subscribe(
      (value: any) => {
        this.selectedList = value;
      },
      (error) => {
        //
      }
    );

    //Read Selected Persona from Header Service
    this.headerService.selectedPersona.subscribe(
      (value: any) => {
        this.selectedPersona = value;
      },
      (error) => {
        //
      }
    );

    //Read Selected Persona Context from Header Service
    this.headerService.selectedPersonaContext.subscribe(
      (value: any) => {
        this.selectedPersonaContext = value.displayname;
      },
      (error) => {
        //
      }
    );

    if (performance.navigation.type != 1) {
      location.reload();
    }

    this.headerService.collapsePatientList.subscribe(() => {
      if ($("body").is(".sidebar-show")) {
        this.togglePatientList();
      }
    });

    this.headerService.expandPatientList.subscribe(() => {
      if (!$("body").is(".sidebar-show")) {
        this.togglePatientList();
      }
    });
  }

  ngAfterViewInit(): void {
  }

  renderTemplates(src, dest) {
    this[dest].nativeElement.append(this[src].nativeElement);
  }

  // Hide sidebar when printing
  sidebarStatusBeforePrint: string;
  @HostListener("window:afterprint")
  onafterprint() {
    if (this.sidebarStatusBeforePrint != "hide") {
      this.togglePatientList();
    }
  }
  @HostListener("window:beforeprint")
  onbeforeprint() {
    if ($("body").is(".sidebar-show")) {
      this.sidebarStatusBeforePrint = "show";
    } else {
      this.sidebarStatusBeforePrint = "hide";
    }
    this.hidePatientList();
  }

  ngOnDestroy() {
    if (this.resizeSubscription) {
      this.resizeSubscription.unsubscribe();
    }
  }

  ngOnInit() {
    this.resizeSubscription = this.resizeService.displayPort$.subscribe(
      (value: any) => {
        this.displayPort = value;
        if (this.displayPort === "Mobile") {
          this.desktopDisplayClass = "hide-desktop";
          this.mobileDisplayClass = "show-mobile";
          this.hidePatientList();
        } else {
          this.desktopDisplayClass = "display-desktop";
          this.mobileDisplayClass = "hide-mobile";
          this.showPatientList();
        }
      }
    );

    if (typeof AppConfig.settings.currentEnvironment !== "undefined") {
      this.headertemplatecolour =
        AppConfig.settings.ENVIdentificationTemplate.find(
          (x) => x.environment == AppConfig.settings.currentEnvironment
        ).colour;
    }

    let decodedToken = this.authService.decodeAccessToken(
      this.authService.user.access_token
    );
    if (decodedToken != null) {
      this.RbacService.GetRoleBasedAction(decodedToken);
      this.username = decodedToken.name
        ? Array.isArray(decodedToken.name)
          ? decodedToken.name[0]
          : decodedToken.name
        : decodedToken.IPUId;
    }
    //set uer idle session timeout settings from config.
    this.userIdle.stopWatching();
    this.userIdle.setConfigValues(AppConfig.settings.userIdle);
    this.userIdle.startWatching();
    this.userIdle.onTimerStart().subscribe((counter) => {
      if (!this.showTimeoutModal) {
        this.openTimeoutModalButton.nativeElement.click();
        this.showTimeoutModal = true;
      }
      this.timeout = AppConfig.settings.userIdle.timeout - counter;
    });

    this.userIdle.onTimeout().subscribe((count) => {
      if (this.authService.user) {
        this.authService.logout();
      }
    });
  }

  oidcLogout() {
    this.authService.logout();
  }

  continueSession() {
    this.userIdle.resetTimer();
    this.showTimeoutModal = false;
  }

  togglePatientList() {
    if ($("body").is(".sidebar-show")) {
      $("body").removeClass("sidebar-show");
    } else {
      $("body").addClass("sidebar-show");
    }
  }

  hidePatientList() {
    $("body").removeClass("sidebar-show");
  }

  showPatientList() {
    $("body").addClass("sidebar-show");
  }
}
