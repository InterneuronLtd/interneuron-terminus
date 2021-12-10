//BEGIN LICENSE BLOCK 
//Interneuron Terminus

//Copyright(C) 2021  Interneuron CIC

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
import { Component, EventEmitter, Input, OnDestroy, OnInit, Output } from '@angular/core';
import { async } from '@angular/core/testing';
import { Subscription } from 'rxjs';
import { AppConfig } from 'src/app/app.config';
import { BannerMainEncounter } from 'src/app/Models/banner/banner.mainencounter';
import { ApirequestService } from 'src/app/services/apirequest.service';
import { ResizeService } from 'src/app/services/resize.service';

@Component({
  selector: 'app-main-encounter',
  templateUrl: './main-encounter.component.html',
  styleUrls: ['./main-encounter.component.css']
})
export class MainEncounterComponent implements OnInit, OnDestroy {
  subscriptions: Subscription = new Subscription();
  mainEncounter: BannerMainEncounter;
  personId: string;

  private resizeSubscription: Subscription;
  displayPort: string;


  constructor(private reqService: ApirequestService, private resizeService: ResizeService) { }

  ngOnInit() {
    this.resizeSubscription = this.resizeService.displayPort$.subscribe((value:any) => {
      this.displayPort = value;
    });
  }


  ngOnDestroy() {
    if (this.resizeSubscription) {
      this.resizeSubscription.unsubscribe();
    }
  }

  @Input() set value(value: string) {
      if(value) {
        this.personId = value;
        this.getData();
      }
  };


  @Output() returnDemographicsResponse: EventEmitter<boolean> = new EventEmitter();

  sendDemographicsResponse(value: boolean) {
    this.returnDemographicsResponse.emit(value);
  }



  async getData() {
      await this.reqService.getRequest(AppConfig.settings.apiServices.find(x => x.serviceName == 'GetBannerMainEncounter').serviceUrl + '?synapseattributename=person_id&attributevalue=' + this.personId)
        .then(
          (response) => {
            if(response) {
              this.mainEncounter = JSON.parse(response)[0];
              console.log('MainEncounter', this.mainEncounter);
              this.sendDemographicsResponse(true);
            }
          }

        ).catch
        {
          this.sendDemographicsResponse(false);
        };
  }

}
