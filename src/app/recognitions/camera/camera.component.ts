import { Component, OnInit, EventEmitter, Output, NgZone } from '@angular/core';
import { Observable, Subject } from 'rxjs';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';

import { Router } from '@angular/router';

import { WebcamImage, WebcamInitError, WebcamUtil } from 'ngx-webcam';
import { RecongnitionsService } from '../services/recongnitions.service';
import { SaveBDRequest, SaveS3Request, UpdateStateRequest } from '../interface/person.interface';
import { IdentificationResponse } from '../interface/identification.interface';
import { HttpClient, HttpHeaders } from '@angular/common/http';


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
  folder_id: string = '';
  analyse_id: string = '';
  accessToken: string = '';

  picture: string = '';
  webCamView:  boolean = true;
  pictureView: boolean = false;

  constructor( private recongnitionsService: RecongnitionsService,
    private router: Router,
    private modalService: NgbModal,
    private ngZone: NgZone,
    private http: HttpClient
  ) { }

  ngOnInit() {
    this.getToken();
    this.userModel = JSON.parse(localStorage.getItem('UserInfo')!);
    this.triesValue = Number(this.userModel.intentos);
    WebcamUtil.getAvailableVideoInputs()
      .then((mediaDevices: MediaDeviceInfo[]) => {
        this.multipleWebcamsAvailable = mediaDevices && mediaDevices.length > 1;
      });
  }

  public getToken() {
    const apiUrl = 'https://api2-asia.ozforensics.com/api/authorize/auth';
    const body = {
      credentials: {
        email: 'ricardo.macias.y@gmail.com',
        password: '1s8zTugnxZdN'
      }
    };
  
    this.http.post(apiUrl, body).subscribe(
      (response: any) => {
        this.accessToken = response.access_token;
        console.log('Token de acceso obtenido:');
      },
      error => {
        console.error('Error al obtener el token de acceso:', error);
        this.router.navigate(['/check_again']);
        


      }
    );
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
        //console.log(result.analyses.quality.result_json.folder_id);
        this.folder_id = result.analyses.quality.result_json.folder_id;
        const apiUrl_media = `https://api2-asia.ozforensics.com/api/folders/${this.folder_id}/media/`;
        const apiUrl_analyses = `https://api2-asia.ozforensics.com/api/folders/${this.folder_id}/analyses/`;

        const headers = {
          'X-Forensic-Access-Token': this.accessToken
        };
        const body = {
          analyses: [
            { type: 'biometry' }
          ]
        };

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
                  } else {
                    console.log('Error: los datos de la imagen no están en el formato esperado');
                  }
                };
                reader.readAsDataURL(blob);
              })
              .catch(error => {
                console.log('Error al obtener la imagen:', error);
                this.router.navigate(['/check_again']);
              });
          } else {
            console.log('Error: la propiedad images no existe o no tiene suficientes elementos');
          }
        } else {
          console.log('Error: la propiedad source_media no es un arreglo o está vacía');
        }

        
        const base64ToBlob = (base64: string, type: string = 'image/jpeg'): Blob => {
          const byteCharacters = atob(base64);
          const byteArrays = [];
        
          for (let offset = 0; offset < byteCharacters.length; offset += 1024) {
            const slice = byteCharacters.slice(offset, offset + 1024);
            const byteNumbers = new Array(slice.length);
        
            for (let i = 0; i < slice.length; i++) {
              byteNumbers[i] = slice.charCodeAt(i);
            }
        
            const byteArray = new Uint8Array(byteNumbers);
            byteArrays.push(byteArray);
          }
        
          return new Blob(byteArrays, { type });
        };
        
        const imageBlob = base64ToBlob(this.userModel.fotoRegistroCivil);

        

        if(this.livenessResult === "success"){
          const formData = new FormData();
          formData.append('media', imageBlob, 'imagen.jpeg');

          // Envía la solicitud a la API utilizando HttpClient
          this.http.post(apiUrl_media, formData, { headers }).subscribe(
            (response: any) => { // Ajuste del tipo de parámetro a 'any'
              if (Array.isArray(response) && response.length > 0) {
                const mediaId = response[0].media_id;
                console.log('media_id:', mediaId);
                console.log('Imagen para comparación subida');
                this.http.post(apiUrl_analyses, body, { headers }).subscribe(
                  (response_analyses: any) => { // Ajuste del tipo de parámetro a 'any'
                    if (Array.isArray(response_analyses) && response_analyses.length > 0) {
                      this.analyse_id = response_analyses[0].analyse_id;
                      console.log(this.analyse_id);
                      console.log('Analisis biométrico iniciado')
                      this.saveS3();
                      
                    } else {
                      console.log('No se encontraron elementos en la respuesta.');
                      this.router.navigate(['/check_again']);
                    }
                  },
                  error => {
                    console.error(error);
                    this.router.navigate(['/check_again']);
                  }
                );
              } else {
                console.log('No se encontraron elementos en la respuesta.');
                this.router.navigate(['/check_again']);
              }
            },
            error => {
              console.error(error);
              this.router.navigate(['/check_again']);
            }
          );

        }else{
          console.log("Spoof detectado");
          this.updateState(false);
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
  

  public compareFace(){

    const headers = {
      'X-Forensic-Access-Token': this.accessToken
    };

    this.http.get(`https://api2-asia.ozforensics.com/api/analyses/${this.analyse_id}`, { headers }).subscribe(
      (response_analyse_result: any) => { // Ajuste del tipo de parámetro a 'any'
        console.log(response_analyse_result);
        console.log(response_analyse_result.resolution);
        console.log('Analisis biométrico terminado')
                          
        if(response_analyse_result.resolution === "SUCCESS"){
          this.confidence = response_analyse_result.results_data.max_confidence;
          this.updateState(true);
        }else{
          console.log('Falló prueba biométrica')
          this.updateState(false);
        }
                          
      },
      error => {
        console.error(error);
        this.router.navigate(['/check_again']);
      }
    );
    
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
            this.compareFace();
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
      this.userModel.codigoEmpresa,
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
            this.ngZone.run(() => {
              this.router.navigate(['/check_successful']);
            });
          } else if ((this.triesValue + 1) >= 3) {
            this.ngZone.run(() => {
              this.router.navigate(['/check_failed']);
            });
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
