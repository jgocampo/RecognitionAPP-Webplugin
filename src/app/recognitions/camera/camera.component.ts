import { Component, OnInit, EventEmitter, Output } from '@angular/core';
import { Observable, Subject } from 'rxjs';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';

import { Router } from '@angular/router';

import { WebcamImage, WebcamInitError, WebcamUtil } from 'ngx-webcam';
import { RecongnitionsService } from '../services/recongnitions.service';
import { CompareFaceRequst, FaceComparison } from '../interface/face.interface';
import { SaveBDRequest, SaveS3Request, SpoofRequest, UpdateStateRequest } from '../interface/person.interface';
import { IdentificationResponse } from '../interface/identification.interface';

@Component({
  selector: 'app-camera',
  templateUrl: './camera.component.html',
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

  picture: string = '';
  webCamView:  boolean = true;
  pictureView: boolean = false;

  constructor( private recongnitionsService: RecongnitionsService,
    private router: Router,
    private modalService: NgbModal
  ) { }

  ngOnInit() {
    this.userModel = JSON.parse(localStorage.getItem('UserInfo')!);
    this.triesValue = Number(this.userModel.intentos);
    WebcamUtil.getAvailableVideoInputs()
      .then((mediaDevices: MediaDeviceInfo[]) => {
        this.multipleWebcamsAvailable = mediaDevices && mediaDevices.length > 1;
      });
  }

  public triggerSnapshot(content: any): void {
    this.openVerticallyCentered(content);
    this.trigger.next();
  }

  public openVerticallyCentered(content: any) {
    this.modalService.open(content, {
      backdrop: 'static',
      centered: true,
      windowClass: 'modalClass',
      keyboard: false
    });
  }

  public toggleWebcam(): void {
    this.showWebcam = !this.showWebcam;
  }

  public handleInitError(error: WebcamInitError): void {
    this.errors.push(error);
  }

  public showNextWebcam(directionOrDeviceId: boolean|string): void {
    // true => move forward through devices
    // false => move backwards through devices
    // string => move to device with given deviceId
    this.nextWebcam.next(directionOrDeviceId);
  }

  public handleImage(webcamImage: WebcamImage): void {
    // console.info('received webcam image', webcamImage);
    const newImgBas64 = webcamImage.imageAsDataUrl.replace('data:image/jpeg;base64,', '')
    this.picture = webcamImage.imageAsDataUrl;
    this.webCamView = false;
    this.pictureView = true;
    this.pictureTaken.emit(webcamImage);
    this.compareSpoof(newImgBas64);
  }

  public cameraWasSwitched(deviceId: string): void {
    this.deviceId = deviceId;
  }

  public get triggerObservable(): Observable<void> {
    return this.trigger.asObservable();
  }

  public get nextWebcamObservable(): Observable<boolean|string> {
    return this.nextWebcam.asObservable();
  }

  public compareSpoof (imgBase64: string){
    console.log('compareSpoof');
    this.selfieBase64 = imgBase64;
    // Consumir servicio de comparar spoof
    const request = new SpoofRequest(imgBase64);
    console.log(request);
    this.recongnitionsService.campare_spoof(request)
      .subscribe({
        next: (spoof) => {
          console.log(spoof);
          this.resultSpoof = spoof.class_name;
          if (spoof.class_name.toUpperCase() == 'REAL' ){
            console.log('real');
            this.compareFace(imgBase64);
          }
          else {
            console.log('spoof');
            this.updateState(false);
          }
        },
        error: (e) => {
          console.log(e);
          this.updateState(false);
        }
      });
  }

  public compareFace(imgBase64: string){
    console.log('compareFace');
    this.selfieBase64 = imgBase64;
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
            this.confidence = compare.faceComparison.confidence;
            this.saveS3();
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
      this.selfieBase64,
      localStorage.getItem('PersonID')?.toString(),
      this.userModel.operationID + ' - ' + (this.triesValue + 1).toString()
    );
    console.log(request);
    this.recongnitionsService.save_s3(request)
      .subscribe({
        next: (saveS3) => {
          console.log(saveS3);
          if (saveS3.message == 'Image uploaded successfully' ){
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
      this.resultSpoof,
      this.selfieBase64,
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
    const date = new Date();
    let completedTrie = completed;
    if ((this.triesValue + 1) == 3)
      completedTrie = true;
    const request = new UpdateStateRequest(
      localStorage.getItem('PersonID')?.toString(),
      this.userModel.operationID,
      this.userModel.codigoDactilar,
      date.toISOString(),
      this.resultSpoof,
      this.selfieBase64,
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
          if (completed)
            this.router.navigate(['/check_successful']);
          else
            if ((this.triesValue + 1) >= 3)
              this.router.navigate(['/check_failed']);
            else
              this.router.navigate(['/check_again']);
        },
        error: (e) => {
          console.log(e);
          this.modalService.dismissAll();
          this.router.navigate(['/check_again']);
        }
      });
  }

}
