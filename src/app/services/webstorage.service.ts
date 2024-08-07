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

import { Injectable } from '@angular/core';
import { LocalStorageService, SessionStorageService } from 'angular-web-storage';


import { ApirequestService } from '../services/apirequest.service';


@Injectable({
  providedIn: 'root'
})
export class WebStorageService {

 
  constructor(private local: LocalStorageService,
    private reqService: ApirequestService,

    private session: SessionStorageService) {
  }

  setLocalStorageItem(key: string, value: any) {
    this.local.set(key, value);
  }
  setSessionStorageItem(key: string, value: any) {
    this.session.set(key, value);
  }
  getLocalStorageItem(key: string) {
    return this.local.get(key);
  }
  getSessionStorageItem(key: string) {
    return this.session.get(key);
  }
  removeLocalStorageItem(key: string) {
    this.local.remove(key);
  }
  removeSessionStorageItem(key: string) {
    this.session.remove(key);
  }
  
}