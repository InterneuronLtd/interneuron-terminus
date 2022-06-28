//BEGIN LICENSE BLOCK 
//Interneuron Terminus

//Copyright(C) 2022  Interneuron CIC

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
import { Observable, BehaviorSubject,fromEvent } from 'rxjs';
import { map } from 'rxjs/operators';

@Injectable()
export class ResizeService {

  height$: Observable<number>;
  width$: Observable<number>;
  displayPort$: Observable<string>;

  constructor() {
      let windowSize$ = new BehaviorSubject(getWindowSize());

      this.height$ = windowSize$.pipe(map(x => x.height));
      this.width$ = windowSize$.pipe(map(x => x.width));
      this.displayPort$ = windowSize$.pipe(map(x => x.displayPort));



      fromEvent(window, 'resize').
          pipe(map(getWindowSize))
          .subscribe(windowSize$);
  }

}

function getWindowSize() {
  var displayPortSize = "";
  if(window.innerWidth >= 1366) {
    displayPortSize= 'Desktop';
  }
  else if(window.innerWidth >= 1024) {
    displayPortSize= 'Tablet';
  }
  else {
    displayPortSize = 'Mobile';
  }
  return {
      height: window.innerHeight,
      width: window.innerWidth,
      displayPort: displayPortSize
  };
};
