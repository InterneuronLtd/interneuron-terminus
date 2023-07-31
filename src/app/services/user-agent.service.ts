//BEGIN LICENSE BLOCK 
//Interneuron Terminus

//Copyright(C) 2023  Interneuron Holdings Ltd

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
import { BrowserModel } from '../Models/browser.model';

@Injectable({
  providedIn: 'root'
})
export class UserAgentService {

  browser : BrowserModel;

  constructor() {
    this.browser = this.getBrowser();
  }

  getUserAgent(): string {
    return navigator.userAgent;
  }


getBrowser():BrowserModel {

  var browser = new BrowserModel();

  var ua=navigator.userAgent,tem,M=ua.match(/(opera|chrome|safari|firefox|msie|trident(?=\/))\/?\s*(\d+)/i) || [];

  if(/trident/i.test(M[1])) {
      tem=/\brv[ :]+(\d+)/g.exec(ua) || [];
      browser.name = 'IE';
      browser.version = (tem[1]||'');
  }
  else if(M[1]==='Chrome') {
      tem=ua.match(/\bOPR|Edge\/(\d+)/)
      if(tem!=null)   {
        browser.name = 'Chrome / Opera';
        browser.version = tem[1];
      }
  }
  else {
    M=M[2]? [M[1], M[2]]: [navigator.appName, navigator.appVersion, '-?'];
    if((tem=ua.match(/version\/(\d+)/i))!=null) {M.splice(1,1,tem[1]);} {
      browser.name = M[0];
      browser.version = M[1];
    }
  }

  return browser;

}

checkIfLatestAndGreatest(): boolean {

  if(this.browser.name == 'IE'){
    return false;
  }
  else if(this.browser.name == "Safari") {
    //return false;
    if(this.browser.version == '1') {
      return false;
    }
    else if(this.browser.version == '2') {
      return false;
    }
    else if(this.browser.version == '3') {
      return false;
    }
    else if(this.browser.version == '4') {
      return false;
    }
    else if(this.browser.version == '5') {
      return false;
    }
    else if(this.browser.version == '6') {
      return false;
    }
    else if(this.browser.version == '7') {
      return false;
    }
    else if(this.browser.version == '8') {
      return false;
    }
    else if(this.browser.version == '9') {
      return false;
    }
    else if(this.browser.version == '10') {
      return false;
    }
    else if(this.browser.version == '11') {
      return false;
    }
    else if(this.browser.version == '12') {
      return false;
    }
  }

  return true;
}


}
