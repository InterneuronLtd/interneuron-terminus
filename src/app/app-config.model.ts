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

import { UserManagerSettings } from 'oidc-client';
import { UserIdleConfig } from 'angular-user-idle';

export interface IAppConfig {
  apiServices: [
    {
      serviceName: string;
      serviceUrl: string;
    }
  ],
  ENVIdentificationTemplate: [
    {
      environment: string;
      colour: string;
    }
  ],
  OIDCConfig: UserManagerSettings,
  userIdle: UserIdleConfig,
  currentEnvironment: string;
  mrnTypeCode: string;
  empiTypeCode: string;
  aboutScreen: {
    releaseNumber: string;
    buildNumber: string;
    SBOMPath: string;
    CALabelPath: string;
  },
  personLabelText: string;
  env: string;
  enableWSConnection: boolean;
  WSHubURL: string;
  can_send_notification: boolean;
  can_receive_notification: boolean;
  allergies_added_notif_msg: string;
  allergies_edited_notif_msg: string;
  hideSidebarOnLoad: any[];
  awsChimeSettings: {
    url: string;
    enabled: boolean;
  },
  AWSS3Config:{
    bucket:string;
    bucketRegion: string
    accessKeyId: string
    secretAccessKey: string
    enabled: boolean
  },
  userProfile: {
    defaultEmployer : string;
    defaultProvider: string;
  },
  GPConnectConfig : {
    repeatMedicationsInMonths: number;
    acuteMedicationsInMonths: number;
    hideThisFeature: boolean;
  },
  PersonaContextLists: [
    {
      PersonaContextId: string;
      Lists: string[];
    }
  ]
}
