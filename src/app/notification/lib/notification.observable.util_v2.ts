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
import { Observable } from 'windowed-observable';
export const INTERNAL_NOTIFICATION_SEND: string = 'send_notification';
export const INTERNAL_NOTIFICATION_RECEIVE: string = 'receive_notification';



export class NotificationClientContext {
    name: string
    value: string
}

export class NotificationAudience {
    name?: string;
    userId?: string;
    email: string;
    phoneNo?: string;
}

export class NotificationReceivedResponse {
    notificationTypeName: string;
    clientContexts?: NotificationClientContext[];
    data: string;//to be evolved
}

export enum AudienceType {
    ALL_USERS = 'all_users',
    SPECIFIED_USERS = 'specified_users',
    ALL_USERS_EXCEPT_SENDER = 'all_users_except_sender',
    ONLY_TO_SENDER = 'only_to_sender',
    ALL_SESSIONS_EXCEPT_CURRENT_SESSION = 'all_sessions_except_current_session',
    ONLY_TO_SENDER_SESSION = 'only_to_sender_session'
}

export class NotificationSenderData {
    notificationTypeName: string;
    clientContexts?: NotificationClientContext[];
    data?: string;
    audienceType?: AudienceType;
    audiences?: NotificationAudience[];//Required only for 'Specifc users' - audience type
    isModuleAgnostic?: boolean;
    isPersonAgnostic?: boolean;
    msgPropNameOrMsg?: string;
}

//Internal fn
export const __getSenderObservable = (): Observable => {
    if (!window[`${INTERNAL_NOTIFICATION_SEND}_OBS`])
        window[`${INTERNAL_NOTIFICATION_SEND}_OBS`] = new Observable(INTERNAL_NOTIFICATION_SEND);
    return window[`${INTERNAL_NOTIFICATION_SEND}_OBS`];
}

//Internal fn
export const __getReceiverObservable = (): Observable => {
    if (!window[`${INTERNAL_NOTIFICATION_RECEIVE}_OBS`])
        window[`${INTERNAL_NOTIFICATION_RECEIVE}_OBS`] = new Observable(INTERNAL_NOTIFICATION_RECEIVE);
    return window[`${INTERNAL_NOTIFICATION_RECEIVE}_OBS`];
}

//Util fns
//To be used by external
export const publishSenderNotificationV2 = (data: NotificationSenderData) => {
    if (!data.clientContexts)
        data.clientContexts = [];

    data.clientContexts.push({ name: 'is_module_agnostic', value: data.isModuleAgnostic ? 'true' : 'false' });
    data.clientContexts.push({ name: 'is_person_agnostic', value: data.isPersonAgnostic ? 'true' : 'false' });
    data.clientContexts.push({ name: 'msgPropNameOrMsg', value: data.msgPropNameOrMsg ?? '' });

    __getSenderObservable().publish(data);
}

/*
To be used by Internally only
Params:
uniqueRegistryKey : To avoid registering multiple times. Note: Register with a different key if need to subscribe - happens when this fn is called multiple times in callee
*/
export const subscribeToSenderNotification = (uniqueRegistryKey: string, cb: (data: NotificationSenderData) => void) => {
    if (!cb || !uniqueRegistryKey) return;
    // @ts-ignore
    if (window[`SENDER_${uniqueRegistryKey}`]) return;//ignore if already registered
    window[`SENDER_${uniqueRegistryKey}`] = true;
    __getSenderObservable().subscribe(cb);
}

//Internal Use only
export const __publishReceivedNotificationV2 = (data: NotificationReceivedResponse) => {
    __getReceiverObservable().publish(data);
}

/*
To be used by external
Params:
uniqueRegistryKey : To avoid registering same subscribers multiple times. Note: Register with a different key if need to subscribe - happens when this fn is called multiple times in callee
notificationTypeName : 'notificationTypeName' to be subscribed for. Pass 'any' if need to subscribe for all notificationtypenames
*/
export const registerSubscribers = (uniqueRegistryKey: string, notificationTypeName: string, cb: (data: NotificationReceivedResponse) => void, overrideCb: boolean = true) => {
    if (!cb || !uniqueRegistryKey || !notificationTypeName) return;
    // @ts-ignore
    if (window[`REGS_${uniqueRegistryKey}`] && !overrideCb) return;//ignore if already registered
    window[`REGS_${uniqueRegistryKey}`] = true;
    console.log(`registering subscriber for: ${uniqueRegistryKey}`);

    if (!window['NOTIFICATION_RECE_SUBS_REG'] || !Object.keys(window['NOTIFICATION_RECE_SUBS_REG']).length)
        window['NOTIFICATION_RECE_SUBS_REG'] = {};

    if (window['NOTIFICATION_RECE_SUBS_REG'][notificationTypeName] && window['NOTIFICATION_RECE_SUBS_REG'][notificationTypeName].length) {
        if (overrideCb) deleteCbRegisteredIfExists(uniqueRegistryKey, notificationTypeName);
        window['NOTIFICATION_RECE_SUBS_REG'][notificationTypeName].push({ key: uniqueRegistryKey, callback: cb });
    }
    else
        window['NOTIFICATION_RECE_SUBS_REG'][notificationTypeName] = [{ key: uniqueRegistryKey, callback: cb }];
}

export const deleteCbRegisteredIfExists = (uniqueRegistryKey: string, notificationTypeName: string) => {
    if (!window['NOTIFICATION_RECE_SUBS_REG'][notificationTypeName] || !window['NOTIFICATION_RECE_SUBS_REG'][notificationTypeName].length) return;
    const objsToDelete = window['NOTIFICATION_RECE_SUBS_REG'][notificationTypeName].filter(cbInput => cbInput.key === uniqueRegistryKey);
    if(objsToDelete && objsToDelete.length) {
        objsToDelete.forEach(rec=> window['NOTIFICATION_RECE_SUBS_REG'][notificationTypeName].pop(rec));
    }
}

/*
To be used by internally only in the app component or root component only once
Note: This will be done in Terminus APP - So not needed in individual modules
*/
export const __registerNotifier = () => {
    console.log('registerNotifier executed');

    //Below check to ensure registered only once
    if (window['NOTIFER_REG']) return;
    window['NOTIFER_REG'] = true;
    __getReceiverObservable().subscribe((res: NotificationReceivedResponse) => {
        console.log('registerNotifier received', res, window['NOTIFICATION_RECE_SUBS_REG']);
        if (!res || !res.notificationTypeName) return;
        if (!window['NOTIFICATION_RECE_SUBS_REG'] || !Object.keys(window['NOTIFICATION_RECE_SUBS_REG']).length)
            return;

        if (window['NOTIFICATION_RECE_SUBS_REG']['any'] && window['NOTIFICATION_RECE_SUBS_REG']['any'].length) window['NOTIFICATION_RECE_SUBS_REG']['any'].forEach(cbInput => cbInput(res));

        if (window['NOTIFICATION_RECE_SUBS_REG'][res.notificationTypeName] && window['NOTIFICATION_RECE_SUBS_REG'][res.notificationTypeName].length) {
            window['NOTIFICATION_RECE_SUBS_REG'][res.notificationTypeName].forEach(cbInput => {
                if (cbInput && cbInput.callback)
                    cbInput.callback(res);
            });
        }
    });
}

//This to be used for inter-component communications only - No RT
export const publishMessageByTopic = (topicName: string, data: any) => {
    if (!topicName) return;
    new Observable(topicName).publish(data);
}

//This to be used for inter-component communications only - No RT
export const subscribeMessageByTopic = (uniqueRegistryKey: string, topicName: string, cb: (data: any) => void) => {
    // @ts-ignore
    if (window[`TOPIC_${uniqueRegistryKey}`]) return;//ignore if already registered
    window[`TOPIC_${uniqueRegistryKey}`] = true;
    new Observable(topicName).subscribe(cb);
}

// Ref only to be removed/*
// To be used by external
// Params:
// uniqueRegistryKey : To avoid registering multiple times. Note: Register with a different key if need to subscribe - happens when this fn is called multiple times in callee
// notificationTypeName : 'notificationTypeName' to be subscribed for. Pass 'any' if need to subscribe for all notificationtypenames
// */
// export const subscribeToReceivedNotification = (uniqueRegistryKey: string, notificationTypeName: string, cb: (data: NotificationReceivedResponse) => void) => {
//     if (!cb || !uniqueRegistryKey || !notificationTypeName) return;
//     // @ts-ignore
//     if (window[uniqueRegistryKey]) return;//ignore if already registered
//     window[uniqueRegistryKey] = true;
//     if(!window['NOTIFICATION_RECE_SUBS_REG'] || !Object.keys(window['NOTIFICATION_RECE_SUBS_REG']).length)
//         window['NOTIFICATION_RECE_SUBS_REG'] = {};

//     if (window['NOTIFICATION_RECE_SUBS_REG'][notificationTypeName] && window['NOTIFICATION_RECE_SUBS_REG'][notificationTypeName].length)
//         window['NOTIFICATION_RECE_SUBS_REG'][notificationTypeName].push(cb);
//     else
//         window['NOTIFICATION_RECE_SUBS_REG'][notificationTypeName] = [cb];

//     getReceiverObservable().subscribe((res: NotificationReceivedResponse) => {
//         if (!res || !res.notificationTypeName) return;
//         if (!window['NOTIFICATION_RECE_SUBS_REG'] || !Object.keys(window['NOTIFICATION_RECE_SUBS_REG']).length)
//             return;

//         if (window['NOTIFICATION_RECE_SUBS_REG']['any'] && window['NOTIFICATION_RECE_SUBS_REG']['any'].length) return;
//         window['NOTIFICATION_RECE_SUBS_REG']['any'].forEach(cbInput => cbInput(res));

//         if (window['NOTIFICATION_RECE_SUBS_REG'][res.notificationTypeName] && window['NOTIFICATION_RECE_SUBS_REG'][res.notificationTypeName].length) return;
//         window['NOTIFICATION_RECE_SUBS_REG'][res.notificationTypeName].forEach(cbInput => cbInput(res));
//     });
// }