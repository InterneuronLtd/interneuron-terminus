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

export class Person {
  person_id: string;
  fullname: string;
  firstname: string;
  middlename: string;
  familyname: string;
  dateofbirth: string;
  mrn: string;
  mrntypecode: string;
  empi: string;
  empitypecode: string;
}

export class Observationevent {
  constructor(
    public observationevent_id: string,
    public person_id: string,
    public datestarted: any,
    public datefinished: any,
    public addedby: string,
    public encounter_id: string,
    public isamended: boolean,
    public observationfrequency: number,
    public observationscaletype_id: string,
    public escalationofcare: boolean,
    public reasonforamend: string,
    public _createdby: string,  
   
    public isnews2: boolean,  
    public isdeleted: boolean,
    public deletedby: string,
    public deletedreason: string,
    public deletedreasonothertext: string,
  
    public eventcorrelationid?: string,
    public incomplete?: boolean,
    public reasonforincompleteobservations?: string,
    public reasonfordelete?: string,
    public observationtypetext?: string,
    public reasonforamendother?: string,
    public patientrefused?:boolean,
    public reasonforpatientrefused?:string
    
  ) { }
}


export class Observation {
  constructor(
    public observation_id?: string,
    public units?: string,
    public symbol?: string,
    public timerecorded?: any,
    public observationevent_id?: string,
    public observationtype_id?: string,
    public observationtypemeasurement_id?: string,
    public value?: string,
    public hasbeenammended?: boolean,
    public _createdby?: string,
    public eventcorrelationid?: string,
    public method?: string
  ) { }
}

export class Observationscaletype {

  observationscaletype_id: string
  scaletypename: string
  scaletypedescription: string
}

export class PersonObservationScale {
  personobservationscale_id: string;
  person_id: string;
  observationscaletype_id: string;

}

export class Posturalbloodpressure
	{
    constructor(
			 public  posturalbloodpressure_id :string,
			 public  personid  :string,
			 public  encounterid  :string,
			 public  createdby  :string,
			 public  obsevationeventstanding  :string,
			 public  obsevationeventsitting   :string,
			 public  datestarted :any,
			 public  sbpstanding : number,
			 public  sbpsitting  : number,
			 public  dbpstanding  : number,
			 public  dbpsitting  : number,
			 public  resonforchange  :string,
			 public  isdeleted :boolean,
			 public  changevalue : number,
			 public  eventcorrelationid  :string,
       public modifiedon :any
      ) { }
      
		}

    export class ObservationEventMonitoring {
      constructor(
        public observationeventmonitoring_id: string,
        public observationevent_id: string,
        public observationfrequency: number,
        public escalationofcare: boolean,
        public ispatientsick: string,
        public concernsaboutpatient: string,
        public couldbeinfection: string,
        public escalatedtowhom?: string,
        public reasonfornotescalating?: string,
        public monitoringcomments?: string,
        public eventcorrelationid?: string,
        public hasbeenammended?: boolean,
        public isobservationfrequencyamended?: boolean,
        public isescalationofcareamended?: boolean,
        public frequency_entered?: string,
        public frequencyunit_entered?: string,
        public frequency_reason?: string,
        public frequency_reason_other?: string,
        public ispause?: boolean,
        public isstop?: boolean,
        public isnewstwosuggestestedfreq?: boolean,
        public observationtype_id?: string,
        public observationtypetext?: string,
        public isdeleted?: boolean,
        public deletedby?: string,
        public deletedreasonothertext?: string,
        public monitoringnotrequired?: boolean
      ) { }
    }

    
