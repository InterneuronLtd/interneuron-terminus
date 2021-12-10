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


import { Component } from '@angular/core';
import { AuthenticationService } from './services/authentication.service';
import * as $ from 'jquery';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {


  title = 'interneuron-terminus';
  constructor(private authService: AuthenticationService) {
  }

  ngOnInit() {
    $(document).ready(function(){
      // $('#btnToggleNav').click(function(){

      //   if ( $('body').is('.sidebar-show') ) {
      //     $( "body" ).removeClass( "sidebar-show" );
      //   }
      //   else {
      //     $( "body" ).addClass( "sidebar-show" );
      //   }
      // });
    });
  }

  isLoggedIn() {
    return this.authService.user != null;
  }

  
}
