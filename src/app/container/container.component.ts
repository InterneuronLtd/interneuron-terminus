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

import { Component, OnInit, OnDestroy } from '@angular/core';
import { HeaderService } from '../services/header.service';
import { ErrorHandlerService } from '../services/error-handler.service';
import { WebComponentLoaderService } from '../services/web-component-loader.service';
import { DataRow } from '../Models/dataRow.model';
import { Module } from '../Models/application.model';
import { PersonaContext } from '../Models/personaContext.model';


@Component({
  selector: 'app-container',
  templateUrl: './container.component.html',
  styleUrls: ['./container.component.css']
})
export class ContainerComponent implements OnInit, OnDestroy {

  show: boolean = false;
  showPatientList: boolean = false;
  filter: string = '';
  patientListHeader: string = '';
  dataRows: DataRow[] = [];
  selectedPatientvalue: string;
  constructor(private headerService: HeaderService,
    private errorHandlerService: ErrorHandlerService,
    private moduleLoader: WebComponentLoaderService) {
    this.subscribeEvents();
  }

  ngOnInit() { }

  subscribeEvents() {
    //Subscribe to show or hide patient detail popup from Mypatient and sideBar
    this.headerService.myPatient.subscribe(
      (show: boolean) => {
        this.show = show;
      },
      error => this.errorHandlerService.handleError(error)
    );

    //Load data from  SideBar patient List PatientListsTabularData
    this.headerService.PatientListsTabularData.subscribe(
      (DataRow: DataRow[]) => {
        if (this.patientListHeader != "My Patients") {
          this.dataRows = DataRow;
          this.showPatientList = this.dataRows.length > 0 ? true : false;
        }
      },
      error => this.errorHandlerService.handleError(error)
    );
    //Load data from patient list
    this.headerService.wardPatientTabularData.subscribe(
      (DataRow: DataRow[]) => {
        if (this.patientListHeader != "My Patients") {
          this.dataRows = DataRow;
          this.showPatientList = this.dataRows.length > 0 ? true : false;
        }
      },
      error => this.errorHandlerService.handleError(error)
    );
    //Load data from  My favorite patient List 
    this.headerService.MyPatientTabularData.subscribe(
      (DataRow: DataRow[]) => {
        this.dataRows = DataRow;
        this.showPatientList = this.dataRows.length > 0 ? true : false;
        this.patientListHeader = "My Patients";
      },
      error => this.errorHandlerService.handleError(error)
    );
    // subscribe to dropdown personacontext 
    this.headerService.PatientListHeaderDisplay.subscribe(
      (headerText: string) => {
        this.patientListHeader = headerText;

      },
      error => this.errorHandlerService.handleError(error)
    );
    this.headerService.selectedModule.subscribe(
      (module: Module) => {
        try {
          this.moduleLoader.loadComponent(module);
        } catch (error) {
          //console.log("error loading component:" + error)
        }
      },
      error => this.errorHandlerService.handleError(error)
    );

    this.headerService.applicationId.subscribe(
      (applicationId: string) => {
        this.moduleLoader.loadComponent(null);
      },
      error => this.errorHandlerService.handleError(error)
    )
    this.headerService.myPatientSelected.subscribe(
      (myPatientSelected: string) => {

        this.selectedPatientvalue = myPatientSelected;
      },
      error => this.errorHandlerService.handleError(error)
    );

  }

  hideMyPatientList() {
    this.filter = "";
    this.headerService.myPatient.next(false);
  }

  ngOnDestroy() {
    this.headerService.myPatient.unsubscribe();
    this.headerService.MyPatientTabularData.unsubscribe();
    this.headerService.wardPatientTabularData.unsubscribe();
    this.headerService.selectedModule.unsubscribe();
  }



  selectedPatient(person: DataRow) {
    if (person) {
      this.headerService.myPatientSelected.next(person.columns[0].matchedcontext);
      this.headerService.myPatient.next(false);
    }
  }
}
