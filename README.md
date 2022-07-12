# InterneuronTerminus v1.3

This project was generated with Angular CLI version 13.

## Development server

Run `ng serve` for a dev server. Navigate to `http://localhost:4200/`. The app will automatically reload if you change any of the source files.

## Code scaffolding

Run `ng generate component component-name` to generate a new component. You can also use `ng generate directive|pipe|service|class|guard|interface|enum|module`.

## Build

Run `ng build` to build the project. The build artifacts will be stored in the `dist/` directory. Use the `--prod` flag for a production build.

## Running unit tests

Run `ng test` to execute the unit tests via [Karma](https://karma-runner.github.io).

## Running end-to-end tests

Run `ng e2e` to execute the end-to-end tests via [Protractor](http://www.protractortest.org/).

## Further help

To get more help on the Angular CLI use `ng help` or go check out the [Angular CLI README](https://github.com/angular/angular-cli/blob/master/README.md).

# Terminus-Framework

## Introduction

This Read Me is provided to give guidance on the installation and configuration of Terminus-Framework 

## Prerequisites

Following prerequisites are required for Terminus-Framework. 

- Node.js 10.x +
- Angular CLI 7.x +
- IIS 7 + / Kestrel / Nginx / Azure required for deployment of Terminus
- [Configure IIS](https://docs.microsoft.com/en-us/aspnet/core/host-and-deploy/iis/?view=aspnetcore-3.1#iis-configuration)
- Visual Studio Community Edition / Visual Studio Code / or any other IDE required for building and publishing Terminus-Framework
- URL Rewrite Module for IIS 7 +

## Other Synapse Project Dependencies

Following Synapse Projects have to be installed and configured first before installing and configuring Terminus-Framework.

- Synapse Identity Server
- Synapse Dynamic API

## Installation and Configuration

This section guides you through the configuration and deployment of Terminus-Framework.

### Terminus-Framework 

1. Download and install Node package manager on this link [NPM](https://www.npmjs.com/get-npm).
2. Follow the instructions on this link to install [Angular CLI](https://angular.io/cli).
3. Download the Terminus-Framework source code from repos.
4. Open the source code folder in any IDE of your choice. 
5. In the terminal / command prompt window of IDE / OS go to the source code folder and run following command.
```shell
npm install
```
*The above command will install the required packages to run the Terminus-Framework.*

4. Go to `config.json` file in `src\assets\config` folder and just replace the `DYNAMIC_API_URL` with your  Synapse Dynamic API domain name in the following service URL's.

```json
{
    "serviceName": "PostPatientList",
    "serviceUrl": "https://DYNAMIC_API_URL/List/GetListDataByPost/"
},
{
    "serviceName": "GetUserPersona",
    "serviceUrl": "https://DYNAMIC_API_URL/Metadata/GetUserPersona"
},
{
    "serviceName": "GetMyPatientList",
    "serviceUrl": "https://DYNAMIC_API_URL/List/GetListDataByPost/d365889c-e76a-44ab-8e4a-81878273dc69"
},
{
    "serviceName": "GetApplications",
    "serviceUrl": "https://DYNAMIC_API_URL/GetList/meta/application"
},
{
    "serviceName": "GetApplicationList",
    "serviceUrl": "https://DYNAMIC_API_URL/GetList/meta/applicationlist"
},
{
    "serviceName": "PostPatientSearch",
    "serviceUrl": "https://DYNAMIC_API_URL/GetBaseViewListByPost/terminus_patientsearch"
},
{
    "serviceName": "GetModulesList",
    "serviceUrl": "https://DYNAMIC_API_URL/GetBaseViewListByAttribute/meta_modulelist"
},
{
    "serviceName": "PostMyPatients",
    "serviceUrl": "https://DYNAMIC_API_URL/PostObject?synapsenamespace=terminus&synapseentityname=mypatients"
},
{
    "serviceName": "DeleteMyPatient",
    "serviceUrl": "https://DYNAMIC_API_URL/DeleteObject?synapsenamespace=terminus&synapseentityname=mypatients&id="
},
{
    "serviceName": "CheckMyPatient",
    "serviceUrl": "https://DYNAMIC_API_URL/GetObject?synapsenamespace=terminus&synapseentityname=mypatients&id="
}
```
4. In the same file make changes to `OIDCConfig` section.
```json
"OIDCConfig": {
    "authority": "IDENTITY_SERVER_URL",
    "client_id": "terminus-framework",
    "client_secret": "secret",
    "redirect_uri": "https://TERMINUS_DOMAIN/oidc-callback",
    "post_logout_redirect_uri": "https://TERMINUS_DOMAIN/oidc-logout?oidccallback=true",
    "response_type": "id_token token",
    "scope": "openid profile dynamicapi.read",
    "automaticSilentRenew": true,
    "silent_redirect_uri": "https://TERMINUS_DOMAIN/assets/silent-refresh.html",
    "accessTokenExpiringNotificationTime": 60
  }
```
- Replace `IDENTITY_SERVER_URL` with the URL of your Synapse Identity Server URL. 
- Replace `TERMINUS_DOMAIN` with your Terminus-Framework domain name.

#### Environment Identification

Below section of code in `config.json` file helps in identifying or distinguishing between which environment you are working on

```json
"ENVIdentificationTemplate": [
    {
      "environment": "dev",
      "colour": "#bc0b56"
    },
    {
      "environment": "test",
      "colour": "#87CEEB"
    },
    {
      "environment": "stage",
      "colour": "#cd5c5c"
    },
    {
      "environment": "training",
      "colour": "#FFA500"
    },
    {
      "environment": "preproduction",
      "colour": "#82cbde"
    },
    {
      "environment": "production",
      "colour": "#f6f2f2"
    }
  ]
```
Depending upon your working environment you can set the `currentEnvironment` variable accordingly in `config.json` file.
```json
"currentEnvironment": "dev"
```

*For example above code with `currentEnvironment` variable set to `dev` gives Purple Heart colour to the header bar in the Terminus-Framework.*

If your source system identifies patient by any internal number such as hospital number, MRN, etc. and you have any acronym for such identification numbering system then you can set it in the `config.json` file by setting `mrnTypeCode` variable as shown in the below code.

```json
"mrnTypeCode": "MRN"
```

If your source system identifies patient by any national number as well such as NHS, etc and you have any acronym for such identification numbering system then you can set it in the `config.json` file by setting `empiTypeCode` variable as shown in the below code.   

```json
"empiTypeCode": "NHS"
```

5. Once these configuration changes are done, run the below command to build and run the application in the terminal / command prompt window.
```shell
ng serve
```
6. If there are no build errors and code has compiled successfully then open Google Chrome browser and navigate to http://localhost:4200 URL in it.

7. To deploy the Terminus application on IIS 7 +/ Kestrel / Azure run following command in terminal / command prompt window.
```shell
npm run prod-build
```
*Above command will package the code into fewer files and these files will be placed in your Terminus source code `dist` folder.*

8. In `dist` folder search for `index.html` file. Open `index.html` file in IDE and search for `<base href="/">` line and replace it with `<base href="/terminus/">` line and save the file.

9. In `dist` folder search for `web.config` file. Open `web.config` file in IDE and search for `<action type="Rewrite" url="/index.html" />` line and replace it with `<action type="Rewrite" url="terminus/index.html" />` line and save the file.

10. If you have not already created Interneuron sites in IIS, kindly follow the below procedure to create the sites

    a. Locate and copy the Interneuron-AppPools.xml and Interneuron-Sites.xml in Sample/IISSettings folder.

    b. Open command prompt in administrator mode and execute the below commands.

```shell
%windir%\system32\inetsrv\appcmd add apppool /in < "path to Interneuron-AppPools.xml"
       
%windir%\system32\inetsrv\appcmd add site /in < "path to Interneuron-Sites.xml"
```

11. Copy all the files and folder from the `dist` folder into the Terminus websites physical path for deployment.

## Issues and Feedback

We are currently working on our documentation, but if you have any feedback or issues please do drop us a line at open@interneuron.org.

## Author

* GitHub: [Interneuron CIC](https://github.com/InterneuronCIC)

## License

Interneuron Terminus
Copyright(C) 2021  Interneuron CIC

This program is free software: you can redistribute it and/or modify it under the terms of the GNU General Public License as published by the Free Software Foundation, either version 3 of the License, or (at your option) any later version.

This program is distributed in the hope that it will be useful, but WITHOUT ANY WARRANTY; without even the implied warranty of MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.

See the GNU General Public License for more details.

You should have received a copy of the GNU General Public License along with this program. If not, see <http://www.gnu.org/licenses/>.
