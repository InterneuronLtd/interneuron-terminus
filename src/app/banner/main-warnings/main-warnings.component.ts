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
import { Subscription } from 'rxjs';
import { AppConfig } from 'src/app/app.config';
import { BannerMainWarnings } from 'src/app/Models/banner/banner.mainwarnings';
import { ApirequestService } from 'src/app/services/apirequest.service';
import { ResizeService } from 'src/app/services/resize.service';


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
              console.log("MainWarnings", this.mainWarnings);
              this.sendWarningsResponse(true);

              for(var i = 0; i < this.mainWarnings.length; i++)
              {
                if(this.warningGroups.indexOf(this.mainWarnings[i].warninggroup) === -1) {
                  console.log('Warning Group: ', this.mainWarnings[i].warninggroup);
                  this.warningGroups.push(this.mainWarnings[i].warninggroup);
              }

              }


            }
          }

        ).catch
        {
          this.sendWarningsResponse(false);
        };
  }



}
