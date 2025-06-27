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
export class RTNotificationRequest {
    //notificationTypeName: NotificationType //RTNotificationType;
    //context: string;
    //data?: string;//to be evolved
    messageCorrelationId?: string;
    //notificationTypeName: NotificationType;
    notificationTypeName: string;
    clientContexts?: ClientContext[];
    data?: string;
    audienceType: string;
    audiences: Audience[];
}


export class ClientContext {
    name : string
    value: string
}

export class Audience {
    name?: string;
    userId?: string;
    email: string;
    phoneNo?: string;
}

export class RTNotificationResponse {
    //notificationTypeName: NotificationType;
    notificationTypeName: string;
    clientContexts?: ClientContext[];
    data: string;//to be evolved
}

/*
Keep it dynamic
export enum NotificationType {
    OBSERVATION_PUBLISHED = 'observation_published',
    OBSERVATION_PUBLISHED_SEND_TO_RT = 'observation_published_send_to_rt'
   };
*/