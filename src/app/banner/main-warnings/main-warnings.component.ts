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
import { BannerMainWarnings } from 'src/app/Models/banner/banner.mainwarnings';
import { BrowserModel } from 'src/app/Models/browser.model';
import { ApirequestService } from 'src/app/services/apirequest.service';
import { HeaderService } from 'src/app/services/header.service';
import { ResizeService } from 'src/app/services/resize.service';
import { UserAgentService } from 'src/app/services/user-agent.service';


@Component({
  selector: 'app-main-warnings',
  templateUrl: './main-warnings.component.html',
  styleUrls: ['./main-warnings.component.css']
})

export class MainWarningsComponent implements OnInit, OnDestroy {
  subscriptions: Subscription = new Subscription();
  mainWarnings: BannerMainWarnings[];
  personId: string;

  warningGroups: Array<string> = [];

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


  @Output() returnWarningsResponse: EventEmitter<boolean> = new EventEmitter();

  sendWarningsResponse(value: boolean) {
    this.returnWarningsResponse.emit(value);
  }



  async getData() {
      await this.reqService.getRequest(AppConfig.settings.apiServices.find(x => x.serviceName == 'GetBannerMainWarnings').serviceUrl + '?synapseattributename=person_id&attributevalue=' + this.personId)
        .then(
          (response) => {
            if(response) {
              this.mainWarnings = JSON.parse(response);
              this.sendWarningsResponse(true);

              for(var i = 0; i < this.mainWarnings.length; i++)
              {
                if(this.warningGroups.indexOf(this.mainWarnings[i].warninggroup) === -1) {
                  this.warningGroups.push(this.mainWarnings[i].warningdisplaygroup);
              }

              }


            }
          }

        ).catch
        {
          this.sendWarningsResponse(false);
        };
  }

  resolveModule(module: string) {

    switch(module.toUpperCase()) {
      case "VTE":
        this.headerService.loadSecondaryModule.next("app-assessments-module");
        break;
        case "ALLERGIES":
          this.headerService.loadSecondaryModule.next("app-terminus-allergies");
          break;
          case "ALLERGIES OVERRIDDEN":
            this.headerService.loadSecondaryModule.next("app-terminus-allergies");
            break;
        case "WEIGHT":
            this.headerService.moduleAction.next("RECORD_WEIGHT");
            break;
    }


  }

}
