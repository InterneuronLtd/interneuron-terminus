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
export class UserProfileDetail {
  _tenant?: string;
  firstname?: string = '';
  lastname?: string;
  middlename?: string;
  fullname?: string;
  prefix?: string;
  suffix?: string;
  emailid?: string;
  phonenumber?: string;
  employer?: string;
  grade?: string;
  role?: string;
  notes?: string;
  providertypecode?: string;
  providertypetext?: string;
  statuscode?: string;
  statustext?: string;
  consultantcode?: string;
  jobtitle?: string;
  startdate?: string;
  enddate?: string;
  organisationid?: string;
  userprincipalname?: string;//from AD
  usersamaccountname?: string;
  userdistinguishedname?: string;
  useruniqueid?: string;//maps to ipuid
  userprofile_id: string;
  isverified: boolean;
  profileimagepath?: string;
  department?: string;
}
