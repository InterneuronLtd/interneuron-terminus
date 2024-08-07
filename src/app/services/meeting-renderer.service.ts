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
import { Injectable } from '@angular/core';
import { AppConfig } from '../app.config';

@Injectable({
  providedIn: 'root'
})

export class MeetingRendererService {

  meetingUrl = null;
  meetingId: string = null;
  meetingStatus = false;
  meetingLaunched = false;
  meetingStarted = false;

  iframeId = "meetingIframe";
  // broserPermissions = "camera  " + AppConfig.settings.awsChimeSettings.url + "; microphone " + AppConfig.settings.awsChimeSettings.url;
  private msgReceivedCallbackRequests: Array<{ "name", "function" }> = [];
  constructor() {
    this.RegisterMessageListener()
  }

  private RegisterMessageListener() {
    if (AppConfig.settings.awsChimeSettings.enabled) {
      window.addEventListener('message', this.MessageListnerHandler.bind(this), false)
    }
  }

  private MessageListnerHandler(event) {
    if (event && event.data.source && event.data.source == "terminus-chime")
      if (event.data.data == "MEETING_LEFTMEETING") {
        this.CloseMeeting();
      }
      else if (event.data && event.data.type == "meeting_started_status") {
        if (+event.data.data > 0)
          this.meetingStarted = true
        else
          this.meetingStarted = false;
      }
      else {
        this.msgReceivedCallbackRequests.forEach(cb => {
          cb.function(event);
        });
      }
  }

  public RegisterCallback(cbname, cb) {
    if (!this.msgReceivedCallbackRequests.find(x => x.name == cbname))
      this.msgReceivedCallbackRequests.push({ "name": cbname, "function": cb })
  }

  public UnRegisterCallback(cbname) {
    if (this.msgReceivedCallbackRequests.find(x => x.name == cbname))
      this.msgReceivedCallbackRequests = this.msgReceivedCallbackRequests.filter(x => x.name != cbname);
  }

  PostMessageToChimeWindow(message: string) {
    var iframeElement = document.getElementById(this.iframeId);
    if (iframeElement) {
      (<HTMLIFrameElement>iframeElement).contentWindow.postMessage(message, "*"); // "http://127.0.0.1:8080" change * to parent url in confing
    }
    else console.log("cant send message, meeting is not running");
  }

  RenderNewMeeting(meetingId, overrideOngoing = false) {
    // this.UpdateMeetingStartedStatus();
    if (this.meetingLaunched == true) {
      if (this.meetingId == meetingId) {
        //same meeting is already running 
        return -1;
      }
      else if (this.meetingId != meetingId && this.meetingStarted && !overrideOngoing) {
        //other meeting is running
        return -1;
      }
      else {
        this.meetingLaunched = false;
        this.RenderNewMeeting(meetingId);
      }
    }
    else {
      this.meetingId = meetingId;
      this.GenerateMeetingUrl();
      this.meetingLaunched = true;
      this.meetingStatus = true; // backward compatibility. remove in next version. 
    }
  }

  UpdateMeetingStartedStatus() {
    //this.PostMessageToChimeWindow("MEETING_STARTED_STATUS");
  }

  GenerateMeetingUrl(meetingId?) {
    if (meetingId)
      this.meetingId = meetingId;

    //this.meetingUrl = "http://127.0.0.1:8080?m=" + this.meetingId;
    this.meetingUrl = AppConfig.settings.awsChimeSettings.url + "?m=" + this.meetingId;

  }

  CloseMeeting() {
    console.log("closing meeting")
    this.meetingId = null;
    this.meetingUrl = null;
    this.meetingLaunched = false;
    this.meetingStarted = false;
    this.meetingStatus = false;
    this.msgReceivedCallbackRequests = [];
  }

}