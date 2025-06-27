//BEGIN LICENSE BLOCK 
//Interneuron Terminus

//Copyright(C) 2025  Interneuron Limited

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
import { Component, OnInit, Input, Output, EventEmitter, ViewChild, ElementRef, forwardRef } from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';

@Component({
    selector: 'user-profile-picture',
    templateUrl: './userprofile-picture.component.html',
    styleUrls: ['./userprofile-picture.component.css'],
    providers: [
        { 
          provide: NG_VALUE_ACCESSOR,
          useExisting: forwardRef(() => UserProfilePictureComponent),
          multi: true
        }
      ]
})
export class UserProfilePictureComponent implements OnInit, ControlValueAccessor {
    @ViewChild('fileInput') fileInput: ElementRef;

    @Input() editmode = true;

    @Input() urlOrData: any = null;

    @Output() urlChange = new EventEmitter();
    
    propagateChange = (urlOrData: string) => {};
    disabled: boolean = false;

    constructor() {

    }
    writeValue(obj: any): void {
        if (obj !== undefined) {
            this.urlOrData = obj;
        }
    }
    registerOnChange(fn: any): void {
        this.propagateChange = fn;
    }
    registerOnTouched(fn: any): void {
        
    }
    setDisabledState?(isDisabled: boolean): void {
        this.disabled = isDisabled;
    }

    fileToBase64 = async (file) =>
        new Promise((resolve, reject) => {
            const reader = new FileReader();
            if(!file) resolve('');
            reader.readAsDataURL(file);
            reader.onload = () => resolve(reader.result);
            reader.onerror = (e) => reject(e);
        });

    fileInputClick() {
        const el: HTMLElement = this.fileInput.nativeElement;
        el.click();
    }

    async fileChange(event: any): Promise<void> {
        const file = event.srcElement.files[0];
        console.log(file);
        try {
            const binaryData = await this.fileToBase64(file);
            if(binaryData) {
                this.urlOrData = binaryData;
                this.propagateChange(this.urlOrData);
            }
        } catch(e) {
            console.error(e);
        }
    }

    ngOnInit() {
    }

}