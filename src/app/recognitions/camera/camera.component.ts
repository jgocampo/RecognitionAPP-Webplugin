import { Component, OnInit, EventEmitter, Output, NgZone } from '@angular/core';
import { Observable, Subject } from 'rxjs';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';

import { Router } from '@angular/router';

import { WebcamImage, WebcamInitError, WebcamUtil } from 'ngx-webcam';
import { RecongnitionsService } from '../services/recongnitions.service';
import { CompareFaceRequst, FaceComparison } from '../interface/face.interface';
import { SaveBDRequest, SaveS3Request, UpdateStateRequest } from '../interface/person.interface';
import { IdentificationResponse } from '../interface/identification.interface';

declare var OzLiveness: any;

@Component({
  selector: 'app-camera',
  templateUrl: '../liveness-web-sdk/web-plugin.html',
  styles: [
  ]
})
export class CameraComponent implements OnInit {

  @Output()
  public pictureTaken = new EventEmitter<WebcamImage>();

  // toggle webcam on/off
  public showWebcam = true;
  public allowCameraSwitch = false;
  public multipleWebcamsAvailable = false;
  public deviceId: string = '';
  public videoOptions: MediaTrackConstraints = {
    // width: {ideal: 350},
    // height: {ideal: 100}
  };
  public errors: WebcamInitError[] = [];

  // webcam snapshot trigger
  private trigger: Subject<void> = new Subject<void>();
  // switch to next / previous / specific webcam; true/false: forward/backwards, string: deviceId
  private nextWebcam: Subject<boolean|string> = new Subject<boolean|string>();


  show = false;
  autohide = true;

  selfieBase64: string = '';
  messageSerivce: string = '';
  resultSpoof: string = '';

  userModel!: IdentificationResponse;
  triesValue: number = 0;
  confidence: number = 0;
  gafas: boolean = false;
  mascarilla: boolean = false;
  image_url: string = '';
  livenessResult: string = '';
  liveness_media: string = '';
  liveness_image_url: string = '';
  liveness_image_base64: string = '';

  picture: string = '';
  webCamView:  boolean = true;
  pictureView: boolean = false;

  constructor( private recongnitionsService: RecongnitionsService,
    private router: Router,
    private modalService: NgbModal,
    private ngZone: NgZone
  ) { }

  ngOnInit() {
    this.userModel = JSON.parse(localStorage.getItem('UserInfo')!);
    this.triesValue = Number(this.userModel.intentos);
    WebcamUtil.getAvailableVideoInputs()
      .then((mediaDevices: MediaDeviceInfo[]) => {
        this.multipleWebcamsAvailable = mediaDevices && mediaDevices.length > 1;
      });
  }

  public initial() {
    OzLiveness.open({
      lang: 'en',
      action: ['video_selfie_scan'],
      meta: {
        'transaction_id': this.userModel.operationID,
        'iin': localStorage.getItem('PersonID')?.toString(),
        'meta_key': 'meta_value',
      },
      on_complete: (result: any) => { // Utiliza una función de flecha aquí
        console.log('on_complete', result);
        console.log(result.analyses.quality.resolution);
        //console.log(result.analyses.quality.result_json.source_media);
        this.livenessResult = result.analyses.quality.resolution;
        this.liveness_media = result.analyses.quality.result_json.source_media;
  
        if (Array.isArray(this.liveness_media) && this.liveness_media.length > 0) {
          const image_array = this.liveness_media[0].images;
          if (Array.isArray(image_array) && image_array.length > 1) {
            const image_data = image_array[1];
            const original_url = image_data.original_url;
            fetch(original_url)
              .then(response => response.blob())
              .then(blob => {
                const reader = new FileReader();
                reader.onloadend = () => {
                  const base64data = reader.result;
                  if (typeof base64data === 'string') {
                    const base64ImageData = base64data.substring(base64data.indexOf(',') + 1);
                    this.liveness_image_base64 = base64ImageData;
                    if(this.livenessResult === "success"){
                      console.log("Spoof superado. Comenzando comparacion");
                      this.compareFace(base64ImageData);
                    }else{
                      console.log("Spoof detectado");
                      this.updateState(false);
                    }
                    //console.log(this.liveness_image_base64);
                  } else {
                    console.log('Error: los datos de la imagen no están en el formato esperado');
                  }
                };
                reader.readAsDataURL(blob);
              })
              .catch(error => {
                console.log('Error al obtener la imagen:', error);
              });
          } else {
            console.log('Error: la propiedad images no existe o no tiene suficientes elementos');
          }
        } else {
          console.log('Error: la propiedad source_media no es un arreglo o está vacía');
        }
        
        this.ngZone.run(() => {
          this.router.navigate(['/loading']);
        });
  
        
      },
      on_capture_complete: function (result: any) {
        console.log('Captura completada');
      }
    });
    
  }
  

  public compareFace(imgBase64: string){
    console.log('compareFace');
    this.liveness_image_base64 = imgBase64;
    // Consumir servicio de comparar rosotros
    const request = new CompareFaceRequst(
      this.userModel.fotoRegistroCivil,
      imgBase64
    );
    console.log(request);
    this.recongnitionsService.compare_faces(request)
      .subscribe({
        next: (compare) => {
          console.log(compare);
          if (compare.faceComparison.match ){
            if(compare.faceComparison.gafas ){
              this.gafas = compare.faceComparison.gafas;
              this.confidence = compare.faceComparison.confidence;
              this.updateState(false);
            } else if (compare.faceComparison.mascarilla){
              this.mascarilla = compare.faceComparison.mascarilla;
              this.confidence = compare.faceComparison.confidence;
              this.updateState(false);
            } else{
              this.confidence = compare.faceComparison.confidence;
              this.saveS3();
              //this.compareSpoof(imgBase64);
            } 
          }
          else {
            this.updateState(false);
          }
        },
        error: (e) => {
          console.log(e);
          this.updateState(false);
        }
      });
  }

  public saveS3() {
    console.log('saveS3');
    const request = new SaveS3Request(
      this.liveness_image_base64,
      localStorage.getItem('PersonID')?.toString(),
      this.userModel.operationID + ' - ' + (this.triesValue + 1).toString()
    );
    console.log(request);
    this.recongnitionsService.save_s3(request)
      .subscribe({
        next: (saveS3) => {
          console.log(saveS3);
          if (saveS3.message == 'Image uploaded successfully' ){
            this.image_url = saveS3.image_url;
            this.updateState(true);
          }
          else {
            this.updateState(false);
          }
        },
        error: (e) => {
          console.log(e);
          this.router.navigate(['/check_again']);
        }
      });
  }

  public saveBD() {
    console.log('saveBD');
    const date = new Date();
    const request = new SaveBDRequest(
      localStorage.getItem('PersonID')?.toString(),
      '',
      localStorage.getItem('codigoDactilar')?.toString(),
      this.livenessResult,
      this.image_url,
      date.toISOString()
    );
    console.log(request);
    this.recongnitionsService.save_bd(request)
      .subscribe({
        next: saveBD => {
          console.log(saveBD);
        },
        error: (e) => {
          console.log(e);
          this.modalService.dismissAll();
          this.router.navigate(['/check_again']);
        }
      });
  }

  public updateState(completed: boolean) {
    console.log('updateState');
    const dateSend = this.formatDate(new Date());
    let completedTrie = completed;
    if (!completed)
      if ((this.triesValue + 1) == 3)
        completedTrie = true;
    const request = new UpdateStateRequest(
      localStorage.getItem('PersonID')?.toString(),
      this.userModel.operationID,
      this.userModel.codigoDactilar,
      dateSend.toString(),
      this.livenessResult,
      this.image_url,
      this.confidence.toString(),
      (this.triesValue + 1).toString(),
      completedTrie
    );
    console.log(request);
    this.recongnitionsService.update_state(request)
      .subscribe({
        next: saveBD => {
          console.log(saveBD);
          this.modalService.dismissAll();
          if (completed) {
            this.router.navigate(['/check_successful']);
          } else if ((this.triesValue + 1) >= 3) {
            this.router.navigate(['/check_failed']);
          } else if (this.gafas) {
            this.router.navigate(['/check_failed_gafas']);
          } else if (this.mascarilla) {
            this.router.navigate(['/check_failed_masc']);
          } else {
            this.ngZone.run(() => {
              this.router.navigate(['/check_again']);
            });
          }

        },
        error: (e) => {
          console.log(e);
          this.modalService.dismissAll();
          this.router.navigate(['/check_again']);
        }
      });
  }

  public formatDate(date: Date) {
    return (
      [
        date.getFullYear(),
        this.padTo2Digits(date.getMonth() + 1),
        this.padTo2Digits(date.getDate()),
      ].join('-') +
      ' ' +
      [
        this.padTo2Digits(date.getHours()),
        this.padTo2Digits(date.getMinutes()),
        this.padTo2Digits(date.getSeconds()),
      ].join(':')
    );
  }

  public padTo2Digits(num: number) {
    return num.toString().padStart(2, '0');
  }

}
