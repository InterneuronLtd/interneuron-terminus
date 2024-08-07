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
import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { HeaderService } from '../services/header.service';
import { ComponentModuleData } from '../directives/whatthreewords-loader.directive';
import { ApirequestService } from '../services/apirequest.service';

@Component({
  selector: 'app-what-three-words',
  templateUrl: './what-three-words.component.html',
  styleUrls: ['./what-three-words.component.css']
})
export class WhatThreeWordsComponent implements OnInit {

  w3wComponentModuleData: ComponentModuleData;

  constructor(private headerService: HeaderService,private apiCaller: ApirequestService) {
    this.subscribeEvents();
   }

  subscribeEvents() {
    this.headerService.w3w.subscribe((e) => {
      if (e == "OPEN_W3W") {
        this.OpenWhatThreeWords();
      }
    });

  }

  ngOnInit(): void {

    this.SetW3wComponentModuleData();
  }

  @ViewChild('open_wtw') open_wtw: ElementRef;
  @ViewChild('close_wtw') close_wtw: ElementRef;

  SetW3wComponentModuleData() {
    this.w3wComponentModuleData = new ComponentModuleData();
    this.w3wComponentModuleData.elementTag = "app-whatthreewords"
    this.w3wComponentModuleData.moduleContext.apiService = this.apiCaller;
    this.w3wComponentModuleData.moduleContext.refreshonload = true;
    this.w3wComponentModuleData.url = "./assets/whatthreewords/whatthreewords.js";
  }

  OnWhatThreeWordsUnLoad(event) {
    //console.log("Called1");

  }
  OnWhatThreeWordsLoadComplete(event) {
    // console.log("Called2");

  }
  WhatThreeWordsUnloadWithResult(event) {
    let input=  <HTMLInputElement>document.getElementsByName('what3words_3wa')[0];
    if(input) {
      input.value='';
    }
    this.headerService.moduleAction.next({ "type": "w3w", "data": event });
    this.CloseWhatThreeWords();
  }

  OpenWhatThreeWords() {
  
    this.open_wtw.nativeElement.click();
  }
  CloseWhatThreeWords() {
    this.close_wtw.nativeElement.click();
  }

}