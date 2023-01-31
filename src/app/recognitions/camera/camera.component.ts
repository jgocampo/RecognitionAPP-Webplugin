import { Component, OnInit, EventEmitter } from '@angular/core';
import { Observable, Subject } from 'rxjs';
import {v4 as uuidv4} from 'uuid';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';

import { Router } from '@angular/router';

import { WebcamImage, WebcamInitError, WebcamUtil } from 'ngx-webcam';
import { RecongnitionsService } from '../services/recongnitions.service';
import { CompareFaceRequst, FaceComparison } from '../interface/face.interface';
import { SaveBDRequest, SaveS3Request, SpoofRequest } from '../interface/person.interface';

@Component({
  selector: 'app-camera',
  templateUrl: './camera.component.html',
  styles: [
  ]
})
export class CameraComponent implements OnInit {

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
  uuidPerson: string = '';
  messageSerivce: string = '';
  resultSpoof: string = '';

  constructor( private recongnitionsService: RecongnitionsService,
    private router: Router,
    private modalService: NgbModal
  ) { }

  ngOnInit() {
    this.uuidPerson = uuidv4()
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
    this.pictureTaken.emit(webcamImage);
    this.compareSpoof(newImgBas64);
  }

  public cameraWasSwitched(deviceId: string): void {
    // console.log('active device: ' + deviceId);
    this.deviceId = deviceId;
  }

  public get triggerObservable(): Observable<void> {
    return this.trigger.asObservable();
  }

  public get nextWebcamObservable(): Observable<boolean|string> {
    return this.nextWebcam.asObservable();
  }


  public compareSpoof (imgBase64: string){
    this.selfieBase64 = imgBase64;
    // Consumir servicio de comparar spoof
    const request = new SpoofRequest(imgBase64);
    // console.log(request);
    this.recongnitionsService.campare_spoof(request)
      .subscribe( spoof => {
        console.log(spoof);
        this.resultSpoof = spoof.class_name;
        if (spoof.class_name == 'Real' ){
          console.log('real')
          this.compareFace(imgBase64);
        }
        else {
          console.log('spoof');
          this.modalService.dismissAll();
          this.router.navigate(['/check_again']);
        }
      },
        (err) => {
          console.log(err);
          this.modalService.dismissAll();
          this.router.navigate(['/check_again']);
        }
      );
  }

  public compareFace(imgBase64: string){
    this.selfieBase64 = imgBase64;
    // Consumir servicio de comparar rosotros
    const request = new CompareFaceRequst(localStorage.getItem('checkUserImage')?.toString(), imgBase64);
    // console.log(request);
    this.recongnitionsService.compare_faces(request)
      .subscribe( compare => {
        console.log(compare);
        if (compare.faceComparison.match ){
          this.saveS3();
        }
        else {
          this.modalService.dismissAll();
          this.router.navigate(['/check_again']);
        }
      },
        (err) => {
          console.log(err);
          this.modalService.dismissAll();
          this.router.navigate(['/check_again']);
        }
      );
  }

  public saveS3() {
    const request = new SaveS3Request(this.selfieBase64, localStorage.getItem('PersonID')?.toString(), this.uuidPerson);
    console.log(request);
    this.recongnitionsService.save_s3(request)
      .subscribe( saveS3 => {
        console.log(saveS3);
        if (saveS3.message == 'Image uploaded successfully' ){
          this.saveBD();
        }
        else {
          this.modalService.dismissAll();
          this.router.navigate(['/check_again']);
        }
      },
        (err) => {
          console.log(err);
          this.modalService.dismissAll();
          this.router.navigate(['/check_again']);
        }
      );
  }

  public saveBD() {
    const date = new Date();
    const request = new SaveBDRequest(localStorage.getItem('PersonID')?.toString(), this.uuidPerson, localStorage.getItem('codigoDactilar')?.toString(), this.resultSpoof, this.selfieBase64, date.toISOString());
    console.log(request);
    this.recongnitionsService.save_bd(request)
      .subscribe( saveBD => {
        console.log(saveBD);
      },
        (err) => {
          console.log(err);
          this.modalService.dismissAll();
          this.router.navigate(['/check_again']);
        }
      );
  }


}
