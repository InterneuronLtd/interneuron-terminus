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
import { Injectable } from "@angular/core";
import { ToastrService } from "ngx-toastr";
import { AppConfig } from "src/app/app.config";
import { RTNotificationsHandlerParams, subscribeToReceivedNotification, RTNoificationUtilService, subscribeToShowNotificationMessage } from "../lib/notification.observable.util";

@Injectable({
    providedIn: 'root'
})
export class TerminusNotificationHandlerService {

    constructor(private toastrService: ToastrService) {
        //this.displayModuleAgnosticRTNotifications();

        const paramData: RTNotificationsHandlerParams = {
            //toastrService: this.toastrService,
            getAppSettings: () => AppConfig.settings,
        };
        subscribeToReceivedNotification('TERMINUS_ALLMSG_TRERMINUS_HANDLER', (res) => new RTNoificationUtilService().rtNotificationsModuleAgnosticMessageHandler(paramData, res));

        subscribeToShowNotificationMessage('TERMINUS_SHOW_MSG_HANDLER', (data: { msg: string, title?: string, options?: any }) => {
            const defaultOptions = { onActivateTick: true, timeOut: 50, extendedTimeOut: 500, disableTimeOut: 'timeOut', closeButton: true };
            let { msg, title, options } = data;
            options = options || {};
            options = { ...defaultOptions, ...options };
            this.toastrService.error(msg, title || 'Notification', options);
        });
    }

    /*
        displayModuleAgnosticRTNotifications() {
    
            subscribeToReceivedNotification((response: NotificationReceivedResponse)=> {
                
                console.log('received notification in terminus handler', response);
        
                if (!response || !response.notificationTypeName) return;
    
            
                let personIdKV = response.clientContexts.find(rec => rec.name === 'personId');
                let encounterIdKV = response.clientContexts.find(rec => rec.name === 'encounterId');
                const currentPersonId = response.clientContexts.find(rec => rec.name === 'current_person_id');
                const currentModule = response.clientContexts.find(rec => rec.name === 'current_module');
                const isModuleAgnosticKV = response.clientContexts.find(rec => rec.name === 'is_module_agnostic');
                const isPersonAgnosticKV = response.clientContexts.find(rec => rec.name === 'is_person_agnostic');
                const msgKeyParamOrMsgKV = response.clientContexts.find(rec => rec.name === 'msgPropNameOrMsg');
    
                if(!isModuleAgnosticKV || !isModuleAgnosticKV.value || !(isModuleAgnosticKV.value.toLowerCase() == 'true'))
                    return;
                console.log('received notification with conditions in terminus handler satisfied-Step 1 - Module agnostic');
    
                if (isPersonAgnosticKV && isPersonAgnosticKV.value && (isPersonAgnosticKV.value.toLowerCase() == 'true')) {
                    const isSamePersonIdInContext = personIdKV && personIdKV.value == currentPersonId?.value;
                    if (!isSamePersonIdInContext) return;
                }
    
                console.log('received notification with conditions in terminus handler satisfied-Step 2 - Same patient or ignored');
    
                let msg = response.notificationTypeName;
                if (msgKeyParamOrMsgKV && msgKeyParamOrMsgKV.value){
                    msg = AppConfig.settings[msgKeyParamOrMsgKV.value] || msgKeyParamOrMsgKV.value;
                }
    
                msg = msg || response.notificationTypeName;
                this.toastrService.error(msg, 'Notification', { onActivateTick: true, timeOut: 50, extendedTimeOut: 500, disableTimeOut: 'timeOut', closeButton: true });
            });
        }
        */
}