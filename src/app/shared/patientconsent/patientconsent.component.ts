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
import { Component, EventEmitter, Input, OnInit, Output, TemplateRef, ViewChild, ElementRef } from '@angular/core';
import { PatientConsent } from './patientconsent';
import { ModalDirective, ModalOptions } from 'ngx-bootstrap/modal';
import { NgForm } from '@angular/forms';
import { ApirequestService } from 'src/app/services/apirequest.service';
import { AppConfig } from 'src/app/app.config';
import { SharedDataContainerService } from 'src/app/services/shared-data-container.service';
import { BsModalService, BsModalRef } from 'ngx-bootstrap/modal';
import { ToastrService } from "ngx-toastr";
import { AuthenticationService } from 'src/app/services/authentication.service';
import { v4 as uuidv4 } from 'uuid';
import { TooltipOptions } from 'ng2-tooltip-directive';
import * as $ from 'jquery';

@Component({
  selector: 'app-patientconsent',
  templateUrl: './patientconsent.component.html',
  styleUrls: ['./patientconsent.component.css']
})
export class PatientconsentComponent implements OnInit {

  patientConsent: PatientConsent = new PatientConsent();

  modalRef: BsModalRef;

  demographics: any;
  loggedInUser: string;

  patientDataTooltip = "<pre style='text-align: justify; text-justify: inter-word; padding: 5px;'><b>Direct care</b> is defined as a clinical, social or public health activity concerned <br />with the prevention, investigation and treatment of illness and the alleviation <br />of suffering of individuals (all activities that directly contribute to the <br />diagnosis, care and treatment of an individual). It includes <ul><li>supporting individuals' ability to function and improve their <br />participation in life and society; </li><li>the local audit/assurance of the quality of care provided;</li><li>the management of untoward or adverse incidents;</li><li>the measurement of outcomes undertaken by one or more registered <br />and regulated health or social care professionals and their team with <br />whom the individual has a legitimate relationship for their care</li></ul>It does not include research, teaching, financial audit, service management <br />activities or risk stratification (see note below on borderline cases).<br /> <br /> <br /><b>Indirect care</b> is defined as activities that contribute to the overall provision <br />of services to a population as a whole or a group of patients with a particular <br />condition, but which fall outside the scope of direct care. It covers health <br />services management, preventative medicine, and medical research. <br />Examples of indirect care activities include risk prediction and stratification <br />service evaluation, needs assessment, and financial audit.</pre>";

  _showPatientConsentForm: boolean = false;

  tooltipOptions: TooltipOptions = {
    maxWidth: '800px',
    zIndex: 1000000,
    placement: 'top',
    contentType: 'html',
    showDelay: 1200,
  };

  @ViewChild("patientConsentModal") patientConsentModal?: ModalDirective;
  @ViewChild("patientConsentForm") patientConsentForm: NgForm;
  @ViewChild("disclaimerTemplate") disclaimerTemplate?: TemplateRef<any>;
  @ViewChild("errorTemplate") errorTemplate?: TemplateRef<any>;
  @ViewChild('patientConsentBtn') patientConsentBtn: ElementRef | undefined;
  
  @Input() set showPatientConsentForm(value: boolean) {
    if (value){
      this._showPatientConsentForm = true;
      setTimeout(()=>{
        this.patientConsentBtn.nativeElement.click();
      });
    } 
  }

  @Output() onClose: EventEmitter<boolean | null> = new EventEmitter();

  constructor(
    private reqService: ApirequestService, 
    private sharedData: SharedDataContainerService, 
    private modalService: BsModalService, 
    private toastrService: ToastrService, 
    private authService: AuthenticationService) {}

  ngOnInit(): void {
    $('#patientConsentModal').appendTo('body');
    this.patientConsent.useofpatientdata = "direct_patient_care";
    this.patientConsent.relationshipwithpatientaccessdata = "legitimate_relationship";
    this.patientConsent.permissiontoaccessgpconnectdata = "implied";
    this.patientConsent.isrequestforwardedtogpconnect = false;
    this.getDemographics();
    this.getUserId();
  }

  hideModal(): void {
    this.insertPatientConsentData(false, "close");
    //this.patientConsentModal?.hide();
    this.onHidden();
  }

  getDemographics() {
    this.reqService.getRequest(AppConfig.settings.apiServices.find(x => x.serviceName == 'GetBannerMainDemographics').serviceUrl + '?synapseattributename=person_id&attributevalue=' + this.sharedData.personId)
      .then(
        (response) => {
          if (response) {
            console.log(response);
            this.demographics = JSON.parse(response)[0];
            if (this.demographics.nhsnumber) {
              this.demographics.nhsnumber = this.demographics.nhsnumber.replace(/\s/g, "");
            }
          }
        }
      )
  }

  openModal() {
    if (!this.patientConsentForm.valid) {
      this.patientConsentForm.form.markAllAsTouched();
      this.toastrService.error("Please fill the required details.");
      return;
    }

    let template:TemplateRef<any>;

    if(this.patientConsent.useofpatientdata == "direct_patient_care" && this.patientConsent.relationshipwithpatientaccessdata == "legitimate_relationship" && (this.patientConsent.permissiontoaccessgpconnectdata == "implied" || this.patientConsent.permissiontoaccessgpconnectdata == "explicit")){
      template = this.disclaimerTemplate;
    }
    else{
      template = this.errorTemplate;
    }

    let config: ModalOptions = {
      backdrop: 'static',
      class: 'modal-sm modal-dialog-centered'
    }

    this.modalRef = this.modalService.show(template, config);
  }
 
  confirm(): void {
    this.insertPatientConsentData(true, "submit");
    this.onHidden(true);
  }
 
  decline(): void {
    this.insertPatientConsentData(false, "cancel");
    //this.modalRef.hide();
    this.onHidden(true);
  }

  dismiss(): void {
    this.insertPatientConsentData(false, "dismiss");
    //this.modalRef.hide();
    this.onHidden(true);
  }

  getUserId() {
    let decodedToken = this.authService.decodeAccessToken(
      this.authService.user.access_token
    );
    if (decodedToken != null) {
      this.loggedInUser = decodedToken.IPUId.replace("\\", "\\\\");
    }
    else{
      this.loggedInUser = null;
    }
  }

  getDateTime(): string {
    var date = new Date();

    let year = date.getFullYear();
    let month = (date.getMonth() + 1);
    let day = date.getDate();
    let hrs = date.getHours();
    let mins = date.getMinutes();
    let secs = date.getSeconds();
    let msecs = date.getMilliseconds();

    let returndate = (year + "-" + (month < 10 ? "0" + month : month) + "-" + (day < 10 ? "0" + day : day) +
      "T" + (hrs < 10 ? "0" + hrs : hrs) + ":" + (mins < 10 ? "0" + mins : mins) + ":" + (secs < 10 ? "0" + secs : secs) + "." + (msecs < 10 ? "00" + msecs : (msecs < 100 ? "0" + msecs : msecs)));

    return returndate;
  }

  onHidden(isCloseEventHandled = false): void {
    this._showPatientConsentForm = false;
    this.patientConsent = new PatientConsent();
    this.patientConsent.useofpatientdata = "direct_patient_care";
    this.patientConsent.relationshipwithpatientaccessdata = "legitimate_relationship";
    this.patientConsent.permissiontoaccessgpconnectdata = "implied";
    this.patientConsent.isrequestforwardedtogpconnect = false;
    this.patientConsentBtn.nativeElement.click();
    if(!isCloseEventHandled)
      this.onClose?.emit(null);
    $('#patientConsentModal').remove();
  }

  insertPatientConsentData(requestForwarded: boolean, buttonClicked: string){
    let datetime = this.getDateTime();

    if(buttonClicked == 'close' && (this.patientConsent.iscorrectpatient == 'no' || this.patientConsent.iscorrectpatient == undefined)){
      this.patientConsent.useofpatientdata = null;
      this.patientConsent.relationshipwithpatientaccessdata = null;
      this.patientConsent.permissiontoaccessgpconnectdata = null;
    }

    let consentDetails = {
      "correct_patient": this.patientConsent.iscorrectpatient,
      "patientData": this.patientConsent.useofpatientdata,
      "patient_data_other": this.patientConsent.otheruseofpatientdata,
      "relationship": this.patientConsent.relationshipwithpatientaccessdata,
      "rel_patient_access_data_other": this.patientConsent.otherrelationshipwithpatientaccessdata,
      "permission": this.patientConsent.permissiontoaccessgpconnectdata,
      "prmsn_access_gp_con_other": this.patientConsent.otherpermissiontoaccessgpconnectdata,
      "button_clicked": buttonClicked
    }

    let body = {
      "patientconsent_id": uuidv4(),
      "person_id": this.sharedData.personId,
      "loggedinuser": this.loggedInUser,
      "lastupdateddatetime": datetime,
      "consentdetails": JSON.stringify(consentDetails),
      "isrequestforwardedtogpconnect": requestForwarded
    };

    this.reqService.postRequest(AppConfig.settings.apiServices.find(x => x.serviceName == 'PostPatientConsent').serviceUrl, JSON.stringify(body))
    .then((response) => {
      this.modalRef?.hide();
      //this.patientConsentModal?.hide();
      
      //start gpconnect sync
      if (response && response.length && response[0].isrequestforwardedtogpconnect) {
        this.onClose?.emit(true);
      }
      else {
        this.onClose?.emit(null);
      }
    });
  }

}