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
import { AuthenticationService } from "../../services/authentication.service";
import * as signalR from "@microsoft/signalr"
import { SharedDataContainerService } from "../../services/shared-data-container.service";
import { Subject } from "rxjs";

import { AudienceType, NotificationSenderData, publishReceivedNotification, subscribeToSenderNotification }
    from "../lib/notification.observable.util";
import { RTNotificationRequest, RTNotificationResponse } from "./models/rt.notification.service.model";

import { WebStorageService } from "../../services/webstorage.service";
import { ToastrService } from "ngx-toastr";
import { AppConfig } from "src/app/app.config";
import { __publishReceivedNotificationV2 } from "../lib/notification.observable.util_v2";

@Injectable({
    providedIn: 'root'
})
export class RTNotificationService {
    private hubConnection: signalR.HubConnection;

    public RTMessageReceived = new Subject();

    constructor(private authService: AuthenticationService, private sharedDataService: SharedDataContainerService, private webStorageService: WebStorageService, private toastrService: ToastrService) {

        if (AppConfig.settings.enableWSConnection) {
            subscribeToSenderNotification('TERMINUS_SENDER_CALL', async (data: NotificationSenderData) => {
                const req = new RTNotificationRequest();
                req.audienceType = data.audienceType;
                req.audiences = data.audiences;
                req.clientContexts = data.clientContexts;
                req.data = data.data;
                req.notificationTypeName = data.notificationTypeName;
                await this.sendNotification(req);
            });
        }
    }

    async establishConnection(onConnect: any) {
        await this.startConnection(onConnect);

        if (this.hubConnection) {

            this.hubConnection.onreconnecting(() => {
                this.toastrService.info('Connection to notification hub is lost. Trying to re-connect again...');
                console.warn('Trying to re-connect to the server.');
            });

            this.hubConnection.onreconnected(() => {
                this.toastrService.success('Successfully re-connected to the notification hub again.');
                console.warn('Successfully reconnected to the server.');
            });

            this.hubConnection.onclose(async (error) => {
                //await this.startConnection(onConnect);
                this.toastrService.error(`Could not connect\\re-connect to the notification hub due to error. Please refresh the page to try again.`, 'Notificaton', { timeOut: 50, extendedTimeOut: 500, disableTimeOut: 'timeOut', closeButton: true });
                console.error(`Connection to RT service is lost due to error.`, error)
            });
        }
    }
    closeConnection() {
        if (!this.hubConnection) {
            this.toastrService.warning('Unable to establish connection to the notification hub. Connection might have been closed already.');
            console.warn('Unable to establish server connection to stop.');
        }

        try {
            this.hubConnection.stop();
            this.toastrService.info('Closing connection to the notification hub.');
            console.log('Stopped connection to RT service');
        } catch (e) {
            this.toastrService.info('Unable to close connection to the notification hub due to error.');
            console.error('Unable to stop connection to RT service.', e);
        }
    }
    async startConnection(onConnect: any) {
        let user = null;
        user = await this.authService.getUser();

        console.log(user);

        if (!user) {
            this.toastrService.error('Unable to connect to the notification hub as logged-in user information is not available.');
            console.error('Not able to connect to RT service as logged-in user details not available.')
            return;
        }
        if (user.expired) {
            user = this.authService.renewToken();
        }
        if (!user) {
            this.toastrService.error('Failed renewing token. Not able to connect to notification hub as logged-in user details not available.');
            console.error('Failed renewing token. Not able to connect to RT service as logged-in user details not available.');
            return;
        }
        //Issue:
        //https://stackoverflow.com/questions/59543816/signalr-asp-netcore-and-angular-websocket-is-not-in-the-open-state-disconnect
        //https://github.com/aspnet/SignalR/issues/2389#issuecomment-393601202
        Object.defineProperty(WebSocket, 'OPEN', { value: 1, });

        this.hubConnection = new signalR.HubConnectionBuilder()
            //.withUrl('https://webnotifier.dev.interneuron.io/hub/notificationhub', {
            .withUrl(AppConfig.settings.WSHubURL, {
                //.withUrl('https://web-notifier.interneuron.io/hub/notificationhub', {
                skipNegotiation: true,//No need of sticky session configuration
                transport: signalR.HttpTransportType.WebSockets,
                //withCredentials: true,
                accessTokenFactory: () => {
                    //return "Authorization", user.access_token;
                    return '' + user.access_token;
                    //return user.access_token;
                }
            })
            //.withAutomaticReconnect()
            .withAutomaticReconnect({
                nextRetryDelayInMilliseconds: retryContext => {
                    if (retryContext.elapsedMilliseconds < 180000) {
                        // If we've been reconnecting for less than 180 seconds so far,
                        // wait between 0 and 10 seconds before the next reconnect attempt.
                        return Math.random() * 10000;
                    } else {
                        // If we've been reconnecting for more than 60 seconds so far, stop reconnecting.
                        return null;
                    }
                }
            })
            .build();

        try {
            try {
                await this.hubConnection.start();
            } catch (e) {
                this.toastrService.error('Error connecting to the Notification Hub. Please try refreshing the page.', 'Notificaton', { timeOut: 50, extendedTimeOut: 500, disableTimeOut: 'timeOut', closeButton: true });
                console.log('Error connecting to Notification Hub.');
                console.error(e);
                //setTimeout(() => this.startConnection(onConnect), 5000);
                return;
            }

            this.toastrService.success('Application is connected to the notification hub.');

            console.log('User Registered to RT Hub');

            this.onMessageReceived();

            //this.testSend();

            //this.onNotified();

            if (onConnect) {
                onConnect(this.hubConnection);
            }
        } catch (e) {
            this.toastrService.error('Error connecting to the notification hub. Please try refreshing the page.', 'Notificaton', { timeOut: 50, extendedTimeOut: 500, disableTimeOut: 'timeOut', closeButton: true });
            console.log('Error connecting to Notification Hub.');
            console.error(e);
        }
    }

    public async sendNotification(request: RTNotificationRequest) {
        try {
            if(!this.hubConnection) {
                this.toastrService.info('No connection to notification hub. Please check whether it is enabled.');
                console.warn('No connection to notification hub. Please check whether it is enabled.');
                return;
            }

            let { personId, encounterId } = this.sharedDataService;

            const userUniqueId = await this.getUserUniqueId();

            if (!request)
                request = new RTNotificationRequest();
            if (!request.clientContexts)
                request.clientContexts = [];

            if (!request.audienceType)
                request.audienceType = AudienceType.ALL_USERS;
            
            const currentModule = this.webStorageService.getSessionStorageItem('terminus:currentmodule');

            request.clientContexts.push({ name: "personId", value: personId });
            request.clientContexts.push({ name: "encounterId", value: encounterId });
            request.clientContexts.push({ name: 'module', value: currentModule });

            request.clientContexts.push({ name: "user_unique_id", value: userUniqueId });//represents sender

            await this.hubConnection.invoke("SendMessage", request);
        } catch (err) {
            this.toastrService.error('Error sending the message to the notification hub');
            console.error(err);
        }
    }

    private async getUserUniqueId() {
        const loggedInUserInfo = await this.authService.getUser();
        if (!loggedInUserInfo) return null;

        let decodedToken = this.authService.decodeAccessToken(
            this.authService.user.access_token
        );
        if (decodedToken != null) {
            return decodedToken.IPUId ? decodedToken.IPUId : (decodedToken.name ?
                (Array.isArray(decodedToken.name) ? decodedToken.name[0] : decodedToken.name) : '');
        }
    }

    private onMessageReceived() {
        this.hubConnection.on('ReceiveMessage', async (response: RTNotificationResponse) => {
            console.log('data receivied:');
            console.log(response);
            const userUniqueId = await this.getUserUniqueId();

            this.RTMessageReceived.next(response);

            const currentPersonId = this.webStorageService.getSessionStorageItem('terminus:personcontext');
            const currentModule = this.webStorageService.getSessionStorageItem('terminus:currentmodule');

            if (!response.clientContexts)
                response.clientContexts = [];
            response.clientContexts.push({ name: 'current_person_id', value: currentPersonId });
            response.clientContexts.push({ name: 'current_module', value: currentModule });
            response.clientContexts.push({ name: 'current_user_id', value: userUniqueId });

            //publishReceivedNotification(response);
            //to test only
            __publishReceivedNotificationV2(response);
        });
    }
}