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
import { HttpClient, HttpResponse } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { GetSynapseStructuredRecordByAttributesDTO } from "src/app/Models/GPConnect/gpconnect.model";
import { AppConfig } from "src/app/app.config";
import { ApirequestService } from "src/app/services/apirequest.service";

@Injectable()
export class GPConnectService {

    constructor(private reqService: ApirequestService)  { }

    // async syncGPConnectData(nhsNumber, encounterId) : Promise<boolean | null> {
    //     if(!nhsNumber || !encounterId) return null; 
    //     const req = { nhsNumber, encounterId };
    //     try {
    //         const apiResponse =  await this.reqService.postRequest(AppConfig.settings.apiServices.find(x => x.serviceName == 'SyncFromGPConnect').serviceUrl,
    //             JSON.stringify(req));
    //         return apiResponse;
    //     } catch (err) {
    //         console.error('Error in Syncing the GP Connect data.');
    //     }
    //     return null;
    // }

    async syncGPConnectData(nhsNumber, userId) : Promise<GPConnectSyncDataResponse | null> {
        if(!nhsNumber  || !userId) return null; 

        const req = { nhsNumber, practitionerIdentifier: userId };
        const gpConnectSyncDataResponse: GPConnectSyncDataResponse = {errorMessage : '', statusCode : 100};
        try {
            const apiResponse =  await this.reqService.postRequest(AppConfig.settings.apiServices.find(x => x.serviceName == 'SyncFromGPConnect').serviceUrl, JSON.stringify(req));
            return gpConnectSyncDataResponse;
        } catch (err) {
            console.log('Error in Syncing the GP Connect data.', err);
            gpConnectSyncDataResponse.statusCode = 1;
            gpConnectSyncDataResponse.errorMessage = err.status == 409 ? err.error.msg : '';
        }
        return gpConnectSyncDataResponse;
    }

    // async getGPConnectData(nhsNumber: string, encounterId: string, acuteMedicationsSinceInMonths: number | null, 
    //     repeatMedicationsSinceInMonths: number | null): Promise<GPConnectGetDataResponse | null> {
    //     //if(!nhsNumber || !encounterId) return null;
    //     if(!nhsNumber) return null;
    //     const req = {
    //         nhsNumber, 
    //         encounterId, 
    //         includeAllergies: true,
    //         acuteMedicationsSinceInMonths: acuteMedicationsSinceInMonths ?? 0, 
    //         repeatMedicationsSinceInMonths: repeatMedicationsSinceInMonths ?? 0
    //     };

    //     try {
    //         let response: GPConnectGetDataResponse = await this.reqService.postRequest(AppConfig.settings.apiServices.find(x => x.serviceName == 'GetGPConnectData').serviceUrl,
    //             JSON.stringify(req));
    //             console.log(response)
    //         if (!response) {
    //             console.error('UNKNOWN ERROR: No response returned from the API');
    //             return response;
    //         }
    //         return response;
    //     } catch (err) {
    //         console.error('Error in Syncing the GP Connect data.', err);
    //     }
    //     return null;
    // }

    async getGPConnectData(nhsNumber: string, acuteMedicationsSinceInMonths: number | null, 
        repeatMedicationsSinceInMonths: number | null): Promise<GPConnectGetDataResponse | null> {
        //if(!nhsNumber || !encounterId) return null;
        if(!nhsNumber) return null;
        const req = {
            nhsNumber, 
            includeAllergies: true,
            acuteMedicationsSinceInMonths: acuteMedicationsSinceInMonths ?? 0, 
            repeatMedicationsSinceInMonths: repeatMedicationsSinceInMonths ?? 0
        };

        try {
            let response: GPConnectGetDataResponse = await this.reqService.postRequest(AppConfig.settings.apiServices.find(x => x.serviceName == 'GetGPConnectData').serviceUrl,
                JSON.stringify(req));
                console.log(response)
            if (!response) {
                console.error('UNKNOWN ERROR: No response returned from the API');
                return response;
            }
            return response;
        } catch (err) {
            console.error('Error in Syncing the GP Connect data.', err);
        }
        return null;
    }
}  

export class GPConnectGetDataResponse {
    data?: GetSynapseStructuredRecordByAttributesDTO | null;
    errorMessages?: string[] | null;
    statusCode : number;
    statusMessage?: string | null;
}

export class GPConnectSyncDataResponse {
    errorMessage?: string | null;
    statusCode : number;
}