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
import { Injectable } from '@angular/core';
import { PutObjectCommand, S3Client, GetObjectCommand, DeleteObjectCommand, HeadObjectCommand, ListObjectVersionsCommand } from "@aws-sdk/client-s3";
import { Observable, from, fromEvent, Subject } from 'rxjs';
import { AppConfig } from '../app.config';

@Injectable({
  providedIn: 'root'
})
export class AwsS3ServiceService {

  bucket = AppConfig.settings.AWSS3Config.bucket;
  bucketRegion = AppConfig.settings.AWSS3Config.bucketRegion;
  accessKeyId = AppConfig.settings.AWSS3Config.accessKeyId;
  secretAccessKey = AppConfig.settings.AWSS3Config.secretAccessKey;

  config;
  client: S3Client;
  constructor() {
    if (AppConfig.settings.AWSS3Config.enabled)
      this.InitS3Client();
  }

  InitS3Client() {
    const creds = {
      accessKeyId: this.accessKeyId,
      secretAccessKey: this.secretAccessKey,
    };
    this.client = new S3Client({
      region: this.bucketRegion,
      credentials: creds
    });
  }

  async UploadMedia(key, data) {

    const command = new PutObjectCommand({
      Bucket: this.bucket,
      Key: key,
      Body: data,
    });

    try {
      const response = await this.client.send(command);
      console.log(response);
      return response;
    } catch (err) {
      console.error(err);
    }
  }

  async DownloadMedia(key) {

    const command = new GetObjectCommand({
      Bucket: this.bucket,
      Key: key,
    });

    try {
      const response = await this.client.send(command);
      if (response && response.Body)
        return response.Body.transformToString();
    } catch (err) {
      console.error(err);
    }
  }

  DownloadMediaAsync(keys: Array<string>) {

    return new Promise((resolve) => {
      let i = 0;
      let results = [];
      for (const key of keys) {
        const command = new GetObjectCommand({
          Bucket: this.bucket,
          Key: key,
          ResponseCacheControl: "no-cache"
        });
        this.client.send(command).then(
          (resp) => {
            resp.Body.transformToString().then((b64) => {
              i++;
              results.push({ "key": key, "data": b64 });
              if (i == keys.length)
                resolve(results);
            })

          }
        ).catch((error) => {
          i++;
          if (i == keys.length)
            resolve(results);
        });
      }
    })
  }

  DownloadMediaAsync_Versioned(keys) {
    return new Promise((resolve) => {
      let i = 0;
      let results = [];
      for (const key of keys) {
        let awskey = key.key;
        let versionid = key.versionid;

        const command = new GetObjectCommand({
          Bucket: this.bucket,
          Key: awskey,
          VersionId: versionid,
        });
        this.client.send(command).then(
          (resp) => {
            resp.Body.transformToString().then((b64) => {
              i++;
              results.push({ "key": key, "data": b64 });
              if (i == keys.length)
                resolve(results);
            })
          }
        ).catch((error) => {
          i++;
          if (i == keys.length)
            resolve(results);
        });
      }
    })
  }

  UploadMediaAsync(media: Array<S3Media>) {
    return new Promise((resolve) => {
      let i = 0;
      let results = [];
      for (const m of media) {
        const command = new PutObjectCommand({
          Bucket: this.bucket,
          Key: m.key,
          Body: m.body,
        });
        this.client.send(command).then(
          (resp) => {
            const hoc = new ListObjectVersionsCommand({
              Bucket: this.bucket,
              Prefix: m.key
            });
            this.client.send(hoc).then(
              (hr) => {
                console.log(hr);
                i++;
                results.push({ "key": m.key, "data": resp, "versionid": hr.Versions[0].VersionId });
                if (i == media.length)
                  resolve(results);
              });


          }
        ).catch((error) => {
          i++;
          if (i == media.length)
            resolve(results);
        });
      }
    })
  }

  async DeleteMedia(key) {
    const command = new DeleteObjectCommand({
      Bucket: this.bucket,
      Key: key,
    });

    try {
      const response = await this.client.send(command);
      console.log(response);
    } catch (err) {
      console.error(err);
    }
  }


  DeleteMediaAsync(keys: Array<string>) {
    return new Promise((resolve) => {
      let i = 0;
      let results = [];
      for (const key of keys) {
        const command = new DeleteObjectCommand({
          Bucket: this.bucket,
          Key: key,
        });
        this.client.send(command).then(
          (resp) => {
            i++;
            results.push({ "key": key, "data": resp });
            if (i == keys.length)
              resolve(results);
          }
        ).catch((error) => {
          i++;
          if (i == keys.length)
            resolve(results);
        });
      }
    })
  }




  // onst config = {
  //   bucketName: 'bucket_name',
  //   dirName: 'photos', /* optional */
  //   region: 'eu-west-2',
  //   accessKeyId: 'access_key',
  //   secretAccessKey: 'secret_key',
  //   s3Url: 'https://bucket_name.s3.eu-west-2.amazonaws.com/', /* optional */
}



class AwsAccessKey {
  constructor(public aws_access_key_id?, public aws_secret_access_key?, public region?) {

  }
}

class S3Media {
  constructor(public key, public body) {

  }
}
