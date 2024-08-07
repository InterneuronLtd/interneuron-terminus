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
export interface SynapseStructuredRecordMessage {
    messageCode: string | null;
    messageCategory: string | null;
    messageText: string | null;
}

export interface GetSynapseStructuredRecordByAttributesDTO {
    lastSyncDate?: string | null;
    messages?: SynapseStructuredRecordMessage[] | null;
    currentRepeatMedications?: SynapseStructuredRepeatMedicationDTO[] | null;
    currentAcuteMedications?: SynapseStructuredAcuteMedicationDTO[] | null;
    allergies?: SynapseStructuredAllergyDTO[] | null;
}

export interface SynapseStructuredAllergyDTO {
    id: string;
    startDate: string;
    endDate: string;
    clinicalStatus: string;
    reactions: SynapseStructuredAllergyReactionDTO[];
    text: string;
    categories: string[];
    verificationStatus: string;
    lastOccurrence: string;
    allergyCodes: CodeableConceptDTO[];
}

export interface SynapseStructuredAllergyReactionDTO {
    id: string;
    severity: string;
    description: string;
    exposureRoute: string;
    manifestations: string[];
}

export interface SynapseStructuredRepeatMedicationDTO {
    id: string;
    medicationType: string;
    medicationStartDate: string;
    medicationItem: CodeableConceptDTO[];
    dosageInstruction: string;
    quantity: string;
    lastIssuedDate: string;
    numberOfPrescriptionsIssued: string;
    maxIssues: string;
    reviewDate: string;
    additonalInformation: string;
    authorisationExpiryDate: string;
}

export interface SynapseStructuredAcuteMedicationDTO {
    id: string;
    medicationType: string;
    medicationStartDate: string;
    medicationItem: CodeableConceptDTO[];
    dosageInstruction: string;
    quantity: string;
    scheduledEndDate: string;
    daysDuration: string;
    additonalInformation: string;
    authorisationExpiryDate: string;
}

export interface CodeableConceptDTO {
    code: string;
    text: string;
    system: string;
}

export enum GPConnectSyncStatus {
    Unverified = 0,
    PDSVerificationFail = 1,
    GPCAPIError = 2,
    Success = 3,
    Success_With_Warnings = 4,
    UNKNOWNERROR = 5,
  }

  export class GPConnectPatientSyncState {
    msgs: string[] = [];
    syncStatus: GPConnectSyncStatus;
    patientNHSNumber: string;
    //encounterId: string | null;
    data?: any;
    acuteMedicationsSinceInMonths? : number;
    repeatMedicationsSinceInMonths? : number;
  }

  export const GPCONNECTPATIENTSYNCKEY = 'banneractions_gpconnectpatientsynckey';