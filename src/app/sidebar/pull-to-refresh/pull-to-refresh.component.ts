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
import { Component, OnInit } from '@angular/core';
import { LoadNotifyService } from '../../services/load-notify.service';
import { Observable } from 'rxjs/Observable'
import 'rxjs/add/observable/of';
import 'rxjs/add/observable/fromEvent';
import 'rxjs/add/observable/timer';
import 'rxjs/add/observable/merge';
import 'rxjs/add/observable/defer';
import 'rxjs/add/operator/switchMap';
import 'rxjs/add/operator/withLatestFrom';
import 'rxjs/add/operator/takeUntil';
import 'rxjs/add/operator/startWith';
import 'rxjs/add/operator/concat';
import 'rxjs/add/operator/take';
import 'rxjs/add/operator/takeWhile';
import 'rxjs/add/operator/repeat';
import 'rxjs/add/operator/map';
import 'rxjs/add/operator/do';

@Component({
  selector: 'app-pull-to-refresh',
  templateUrl: './pull-to-refresh.component.html',
  styleUrls: ['./pull-to-refresh.component.css']
})
export class PullToRefreshComponent implements OnInit {

  constructor(private LoadNotifyService: LoadNotifyService) { }

  ngOnInit() {
  }

  domItem = document.getElementById('dvLeftSidebar');

  currentPos = 0;

  completeAnimation = this.LoadNotifyService.loadComplete
    .map(() => this.currentPos)
    .switchMap(currentPos => this.tweenObservable(currentPos, 0, 200))

  touchstart = Observable.fromEvent<TouchEvent>(this.domItem, 'touchstart')
  touchend = Observable.fromEvent<TouchEvent>(this.domItem, 'touchend')
  touchmove = Observable.fromEvent<TouchEvent>(this.domItem, 'touchmove')

  returnPosition = Observable.timer(0, 10).take(20)

  drag = this.touchstart
    .switchMap(start => {
      let pos = 0
      return this.touchmove
        .map(move => move.touches[0].pageY - start.touches[0].pageY)
        .do(p => pos = p)
        .takeUntil(this.touchend)
        .concat(Observable.defer(() => this.tweenObservable(pos, 0, 200)))
    })
    .do(p => {
      if (p >= window.innerHeight / 2) {
        this.LoadNotifyService.requestLoad.next()
      }
    })
    .takeWhile(p => p < window.innerHeight / 2)
    .repeat()

  position: Observable<number> = this.drag
    .merge(this.completeAnimation) 
    .startWith(0)
    .do(pos => this.currentPos = pos)

  positionTranslate3d: Observable<string> = this.position.map(p => 'translate3d(0, ${p - 70}px, 0)')

  //// Start rotating when a request is made and spin until it completes
  //rotate: Observable<number> = this.LoadNotifyService.requestLoad
  //  .switchMap(() => {
  //    let rot = 0
  //    return this.tweenObservable(0, 360, 500)
  //      .repeat()
  //      .do(r => rot = r)
  //      .takeUntil(this.LoadNotifyService.loadComplete)
  //      .concat(Observable.defer(() => this.tweenObservable(rot, 360, 360 - rot)))
  //  })

  //rotateTransform: Observable<string> = this.rotate.map(r => 'rotate(${r}deg)')

  private tweenObservable(start, end, time) {
    const emissions = time / 10
    const step = (start - end) / emissions

    return Observable.timer(0, 10)
      .map(x => start - step * (x + 1))
      .take(emissions)
  }

}
