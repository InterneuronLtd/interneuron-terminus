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
import { Component, EventEmitter, Input, OnDestroy, OnInit, Output } from '@angular/core';
import { Subscription } from 'rxjs';
import { AppConfig } from 'src/app/app.config';
import { BannerMainAllergies } from 'src/app/Models/banner/banner.mainallergies';
import { BrowserModel } from 'src/app/Models/browser.model';
import { ApirequestService } from 'src/app/services/apirequest.service';
import { HeaderService } from 'src/app/services/header.service';
import { ResizeService } from 'src/app/services/resize.service';
import { UserAgentService } from 'src/app/services/user-agent.service';

@Component({
  selector: 'app-main-allergies',
  templateUrl: './main-allergies.component.html',
  styleUrls: ['./main-allergies.component.css']
})
export class MainAllergiesComponent implements OnInit, OnDestroy {
  subscriptions: Subscription = new Subscription();
  mainAllergies: BannerMainAllergies;
  personId: string;

  private resizeSubscription: Subscription;
  displayPort: string;

  browser: BrowserModel;
  isLatestAndGreatest: Boolean = false;

  selectedView: string = "collapsed";

  constructor(private reqService: ApirequestService, private resizeService: ResizeService, private headerService: HeaderService, private userAgentService: UserAgentService) { }

  ngOnInit() {
    this.resizeSubscription = this.resizeService.displayPort$.subscribe((value:any) => {
      this.displayPort = value;
    });

    this.browser = this.userAgentService.getBrowser();
    this.isLatestAndGreatest = this.userAgentService.checkIfLatestAndGreatest();


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

  @Input() set view(view: string) {
    if(view) {
      this.selectedView = view;
    }
  };


  @Output() returnAllergiesResponse: EventEmitter<boolean> = new EventEmitter();

  sendAllergiesResponse(value: boolean) {
    this.returnAllergiesResponse.emit(value);
  }



  async getData() {
      await this.reqService.getRequest(AppConfig.settings.apiServices.find(x => x.serviceName == 'GetBannerMainAllergies').serviceUrl + '?synapseattributename=person_id&attributevalue=' + this.personId)
        .then(
          (response) => {
            if(response) {
              this.mainAllergies = JSON.parse(response)[0];
              this.sendAllergiesResponse(true);
            }
          }

        ).catch
        {
          this.sendAllergiesResponse(false);
        };
  }


  resolveModule() {
          this.headerService.loadSecondaryModule.next("app-terminus-allergies");
    }



}
