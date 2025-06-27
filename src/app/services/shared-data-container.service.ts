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
import { Injectable } from '@angular/core';
import { Application, Module } from '../Models/application.model';
import { Persona } from '../Models/Persona.model';
import { PersonaContext } from '../Models/personaContext.model';
import { Observation, Observationscaletype } from '../Models/person.model';
import { AdditionalInfo } from '../Models/ModuleDataContract.model';
import { AppConfig } from '../app.config';
import { ApirequestService } from './apirequest.service';
import { AuthenticationService } from './authentication.service';
import { BannerMainWarnings } from '../Models/banner/banner.mainwarnings';
import { filter, filterParams, filterparam, filters, orderbystatement, selectstatement } from '../Models/Filter.model';
import { BannerMainAllergies } from '../Models/banner/banner.mainallergies';
import { GPConnectSyncStatus } from '../Models/GPConnect/gpconnect.model';

@Injectable({
  providedIn: 'root'
})
export class SharedDataContainerService {

  constructor(private apiRequest: ApirequestService, private authService: AuthenticationService,) { }

  public personId: string = "";
  public encounterId: string;
  public applications: Application[];
  public modules: Module[];
  public personas: Persona[];
  public personaContexts: PersonaContext[];
  public currentApplicaiton: Application;
  public currentPersona: Persona;
  public currentPersonaContext: PersonaContext;
  public mainAllergies: BannerMainAllergies;
  public contexts: any;
  public contextField: string = "";
  public contextValue: string = "";

  public allModules: Module[];

  public ShoModuleLoader = false;
  public mainWarnings: BannerMainWarnings[];
  public obsScales: Array<Observationscaletype> = [];
  public observation: Array<Observation> = [];
  public currentEWSScale: string;
  public refWeightValue: number;
  public refHeightValue: number;
  public componentLoaderAdditionalInfo: Array<AdditionalInfo> = [];
  public showsecondaryBanner=true;
  public showClinicInformation=false;
  public showExpandedBanner=false;
  public gpConnect : { data?: any | null, msgs?: any[] | null, syncState?: GPConnectSyncStatus | null } = {};
  createEncounterFilter() {

    let condition = "person_id=@person_id";
    let f = new filters()
    f.filters.push(new filter(condition));

    let pm = new filterParams();

    pm.filterparams.push(new filterparam("person_id", this.personId));

    let select = new selectstatement("SELECT person_id, encounter_id, admitdatetime, dischargedatetime, patientclasscode, episodestatuscode");

    let orderby = new orderbystatement("ORDER BY admitdatetime desc");

    let body = [];
    body.push(f);
    body.push(pm);
    body.push(select);
    body.push(orderby);

    return JSON.stringify(body);
  }

  getCurrentEncounterAsPromise(): Promise<string | null> {
    return new Promise((resolve, reject)=> {
      this.getCurrentEncounter((encounterId: string | null)=>{
        resolve(encounterId);
      });
    });
  }

  getCurrentEncounter(cb: any) {
    if (AppConfig.settings.env == "social_care") {
      cb(null)
    }
    else {
      //let url = `${this.appService.moduleConfig.apiEndpoints.dynamicApiURI}/GetBaseViewListByPost/bv_core_inpatientappointments`;
      this.apiRequest.postRequest(AppConfig.settings.apiServices.find(x => x.serviceName == 'GetCurrentEncounter').serviceUrl, this.createEncounterFilter())
        .then(
          encList => {
            if (encList && Array.isArray(encList) && encList.length > 0) {


              let activeInpatientEncounter = encList.filter(rec => rec.patientclasscode && (rec.patientclasscode.toLowerCase() == 'ip' || rec.patientclasscode.toLowerCase() == 'i')
                && rec.dischargedatetime == null
                && rec.episodestatuscode && rec.episodestatuscode.toLowerCase() != 'cancelled');



              if (activeInpatientEncounter && activeInpatientEncounter.length > 0) {
                cb(activeInpatientEncounter[0].encounter_id);
              }
              else{
                cb(null)
              }

            }
            else {
              cb(null)

            }

          });
    }
  }
}
