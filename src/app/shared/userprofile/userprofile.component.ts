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
import {
  Component,
  ElementRef,
  EventEmitter,
  Input,
  OnInit,
  Output,
  ViewChild,
} from "@angular/core";
import { ModalDirective } from "ngx-bootstrap/modal";
import { User } from "oidc-client";
import { AppConfig } from "src/app/app.config";
import { ApirequestService } from "src/app/services/apirequest.service";
import { AuthenticationService } from "src/app/services/authentication.service";
import { UserProfileDetail } from "./userprofile";
import { ToastrService } from "ngx-toastr";
import { NgForm } from "@angular/forms";
import { v4 as uuidv4 } from "uuid";
import * as $ from 'jquery';

@Component({
  selector: "app-userprofile",
  templateUrl: "./userprofile.component.html",
  styleUrls: ["./userprofile.component.css"],
})
export class UserProfileComponent implements OnInit {

  @Input()
  set showUserProfileForm(val: boolean) {
    // if(!this._showByDefault)
    //   this._showUserProfileForm = val;
    this._isProfileSaved = false;
    if (val) this.populateUserProfile();
  }

  //set this if it has to be displayed always.
  //Else use 'showUserProfileForm'
  @Input()
  set showUserProfileFormAnyways(val: boolean) {
    this._isProfileSaved = false;
    this._showAnyways = val;
    if (val) this.populateUserProfile();
  }

  @Output() onClose: EventEmitter<boolean | null> = new EventEmitter();
  @ViewChild("userProfileModal", { static: false })
  _userProfileModal?: ModalDirective;
  @ViewChild("userProfileForm") _userProfileForm: NgForm;
  @ViewChild('userProfileBtn') userProfileBtn: ElementRef | undefined;

  _currentUser: User = null;
  _loggedInUserId = "";
  _loggedInUserName = "";
  _isSaving = false;
  _userProfileDetail: UserProfileDetail = new UserProfileDetail();
  _showUserProfileForm = false;//set to true for test
  //_showByDefault = false;//to be set to true if selfcontained
  _loadingUserProfile = false;
  _isProfileSaved = false;
  _showAnyways = false;
  _isEditMode = false;

  constructor(
    private authService: AuthenticationService,
    private reqService: ApirequestService,
    private toastrService: ToastrService
  ) { }
  // showModal(): void {
  //   this.isModalShown = true;
  // }
  // maxGrade1: string = "";

  ngOnInit(): void {
    //hack to fix the issue of userprofile displying under header
    $('#userProfileModal').appendTo('body');

    if (!this._loggedInUserId) {
      this.populateAuthUser();
      //this.populateUserProfile();//uncomment to test
    }
    // this.authService.getUser().then((user: User) => {
    //   console.log(user);
    //   this._currentUser = user;
    //   this.getUserId();
    //   //this.populateUserProfile();//uncomment to test
    // });
  }

  async populateAuthUser() {
    if (!this._loggedInUserId) {
      const user = await this.authService.getUser();
      console.log(user);
      this._currentUser = user;
      this.getUserId();
    }
  }

  async populateUserProfile() {
    await this.populateAuthUser();
    //check in the synapse first, if not get from AD and populate
    const userProfileInSynapse = await this.getUserProfileFromSynapseIfExists();

    if (userProfileInSynapse) {
      //If has in synapse - no need to show the form as it is already saved
      //console.log('userProfileInSynapse1111', userProfileInSynapse, userProfileInSynapse.isverified);
      this._isProfileSaved = true;
      //this.onHidden();//comment to test
      if (!this._showAnyways)
        this.onHidden(true);//comment to test
      //to test - set to true
      //Uncomment to test
      //this._userProfileDetail = userProfileInSynapse;
      //uncomment to test
      //setTimeout(()=> this._showUserProfileForm = true, 100);
      if (this._showAnyways)
        setTimeout(() => {
          this._showUserProfileForm = true;
          this._userProfileDetail = userProfileInSynapse;
          this.userProfileBtn.nativeElement.click();
        }, 100);
      /*
      if(!userProfileInSynapse.isverified && this._showByDefault) {
        this._showUserProfileForm = true;
      }
      this._userProfileDetail = userProfileInSynapse;
      //this._isSaving = userProfileInSynapse.isverified;
      */

    } else if (AppConfig.settings.userProfile.defaultProvider === 'AD') {//else get it from AD (if configured)
      this.populateUserProfileFromProfileProvider();
      this._showUserProfileForm = true;

      this.userProfileBtn.nativeElement.click();
      //this._isSaving = false;
    }
    else {//a final fallback
      this.populateFromLoggedInUserProfile();
      this._showUserProfileForm = true;
      this.userProfileBtn.nativeElement.click();
      //console.log("this._userProfileDetail1111==", this._userProfileDetail);
    }
  }
  populateFromLoggedInUserProfile() {
    this._userProfileDetail = new UserProfileDetail();
    this._userProfileDetail.useruniqueid = this._loggedInUserId;
    if (this._loggedInUserName) {
      const fnLn = this._loggedInUserName.split(" ");
      this._userProfileDetail.firstname = fnLn[0];
      this._userProfileDetail.lastname = fnLn.length > 1 ? fnLn[1] : "";
      this._userProfileDetail.employer = AppConfig.settings.userProfile.defaultEmployer;
    }
  }

  async getUserProfileFromSynapseIfExists() {
    const serviceUrl =
      AppConfig.settings.apiServices.find((x) => x.serviceName == "GetUserProfileDetailByUserUniqueId"
      ).serviceUrl + this._loggedInUserId;

    try {
      const response = await this.reqService.getRequest(serviceUrl);
      console.log("response==", response, Array.isArray(response), response == "[]");

      if (!response || response == "[]") return null;
      return JSON.parse(response)[0];
    } catch (err) {
      console.error(err);
      return null;
    }
  }

  getUserId() {
    let decodedToken = this.authService.decodeAccessToken(
      this.authService.user.access_token
    );
    if (decodedToken != null) {
      this._loggedInUserId = decodedToken.IPUId.replace("\\", "\\\\");
      this._loggedInUserName = decodedToken.name
        ? Array.isArray(decodedToken.name)
          ? decodedToken.name[0]
          : decodedToken.name
        : null;
    }
  }

  hideModal(isSaved: boolean | undefined): void {
    this._isProfileSaved = (isSaved === true);//false;
    this._showAnyways = false;
    //this._userProfileModal?.hide();

    this.onHidden();
  }

  onHidden(isInCongruentTrigger = false): void {
    if(isInCongruentTrigger) {
      this.onClose?.emit(true);//since already saved and exists
      //hack to fix the issue of userprofile displying under header
      $('#userProfileModal').remove();
      return;
    }
    this._showUserProfileForm = false;
    this._showAnyways = false;
    this._userProfileDetail = new UserProfileDetail();
    this.userProfileBtn.nativeElement.click();
    this.onClose?.emit(this._isProfileSaved);
    //hack to fix the issue of userprofile displying under header
    $('#userProfileModal').remove();
  }

  saveUserProfile() {
    console.log("form", this._userProfileForm, this._userProfileForm.valid);
    this._isProfileSaved = false;
    if (!this._userProfileForm.valid) {
      this._userProfileForm.form.markAllAsTouched();
      this.toastrService.error("Please fill the required user details and with correct data.");
      this._isSaving = false;
      return;
    }
    this._isSaving = true;
    const isValidForm = this.validateUserProfileDetails();

    if (!isValidForm) {
      this.toastrService.error("Please fill the required user details.");
      this._isSaving = false;
      return;
    }

    this._userProfileDetail.userprofile_id = this._userProfileDetail.userprofile_id ?? uuidv4();
    this._userProfileDetail.isverified = true;

    const requestPayload = this._userProfileDetail;
    const serviceUrl = AppConfig.settings.apiServices.find((x) => x.serviceName == "PostUserProfileDetail").serviceUrl;
    this.reqService.postRequest(serviceUrl, JSON.stringify(requestPayload))
      .then((response) => {
        console.log("response", response);
        this._userProfileDetail = response;
        this._isSaving = false;
        this.toastrService.success('User profile saved successfully!!');
        this._isProfileSaved = true;
        //setTimeout(() => this._userProfileModal?.hide(), 100);
        setTimeout(() => this.hideModal(true), 100);
      }, err => {
        console.error(err);
        this._isSaving = false;
        this.toastrService.error('Error saving the user profile.');
      });
  }

  async populateUserProfileFromProfileProvider() {
    const serviceUrl =
      AppConfig.settings.apiServices.find((x) => x.serviceName == "GetUserProfileDetailByUsernameFromProfileProvider"
      ).serviceUrl + `/${encodeURIComponent(this._loggedInUserId.replace("\\\\", "\\"))}`;
    this._loadingUserProfile = true;
    try {
      const response = await this.reqService.getRequest(serviceUrl);
      console.log("response from AD==", response, Array.isArray(response), response == "[]");
      if (!response) {
        this._loadingUserProfile = false;
        return null;
      }

      const { description, displayName, distinguishedName, domain, emailAddress, employeeId, givenName, guid, middleName, name, samAccountName, surname, userPrincipalName, voiceTelephoneNumber, jobTitle, department } = response;
      const userProfileObj: UserProfileDetail = { emailid: emailAddress, firstname: givenName, lastname: surname, isverified: false, jobtitle: jobTitle, phonenumber: voiceTelephoneNumber, userdistinguishedname: distinguishedName, userprincipalname: userPrincipalName, usersamaccountname: samAccountName, department, employer: AppConfig.settings.userProfile.defaultEmployer, userprofile_id: uuidv4(), useruniqueid: this._loggedInUserId };

      this._userProfileDetail = userProfileObj;
      this._loadingUserProfile = false;
    } catch (err) {
      console.error(err);
      this._loadingUserProfile = false;
    }
  }

  validateUserProfileDetails() {
    if (!this._userProfileDetail) return false;
    if (
      !this._userProfileDetail.firstname ||
      !this._userProfileDetail.lastname ||
      //!this._userProfileDetail.emailid ||
      //!this._userProfileDetail.consultantcode ||
      !this._userProfileDetail.prefix ||
      !this._userProfileDetail.jobtitle
    )
      return false;

    return true;
  }
}

