import { Injectable } from '@angular/core';
import { Subject } from 'rxjs/Subject';

@Injectable({
  providedIn: 'root'
})
export class LoadNotifyService {

  constructor() { }

  requestLoad = new Subject<any>();
  loadComplete = new Subject<any>();
}
