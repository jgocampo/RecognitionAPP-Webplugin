import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { map, catchError} from 'rxjs/operators';
import { IdentificationRequest, IdentificationResponse } from '../interface/identification.interface';
import { CompareFaceRequst, CompareFaceResponse } from '../interface/face.interface';
import { SaveBDRequest, SaveBDResponse, SaveS3Request, SaveS3Response, SpoofRequest, SpoofResponse, UpdateStateRequest } from '../interface/person.interface';
import { Helper } from '../../config/config';

@Injectable({
  providedIn: 'root'
})
export class RecongnitionsService {

  public resultados!: IdentificationResponse;

  private baseUrl: string = 'https://8zj2l9ycrg.execute-api.us-east-1.amazonaws.com/prometeo/recognition';
  private baseUrlSpoof: string = 'https://uhbby2jtxl.execute-api.us-east-1.amazonaws.com';
  private baseUrlSaveS3: string = 'https://skbilp645i.execute-api.us-east-1.amazonaws.com/s3-image';
  private baseUrlSaveBd: string = 'https://fhi7bo984d.execute-api.us-east-1.amazonaws.com/items';
  private baseUrlUpdateState: string = 'https://fhi7bo984d.execute-api.us-east-1.amazonaws.com/prometeo/recognition/actualizar_estado_operacion';

  constructor( private http: HttpClient) { }

  check_user(identificationRequest: IdentificationRequest): Observable<IdentificationResponse> {

    const url = `${ this.baseUrl }/consultar_cliente_existe`;
    return this.http.post<IdentificationResponse>(url , identificationRequest);
    // return this.http.post(url, identificationRequest, Helper.buildHeaders())
    //   .pipe(
    //     map((this.extractData),
    //     catchError(this.handleError))
    //   );
  }

  campare_spoof(spoofRequest: SpoofRequest): Observable<SpoofResponse> {
    const url = `${ this.baseUrlSpoof }`;
    return this.http.post<SpoofResponse>(url, spoofRequest);
  }

  compare_faces(compareFaceRequst: CompareFaceRequst): Observable<CompareFaceResponse> {
    const url = `${ this.baseUrl }/compare_faces`;
    return this.http.post<CompareFaceResponse>(url, compareFaceRequst);
  }

  save_s3(saveS3Request: SaveS3Request): Observable<SaveS3Response> {
    const url = `${ this.baseUrlSaveS3 }`;
    return this.http.post<SaveS3Response>(url, saveS3Request);
  }

  save_bd(saveBDRequest: SaveBDRequest): Observable<SaveBDResponse> {
    const url = `${ this.baseUrlSaveBd }`;
    return this.http.put<SaveBDResponse>(url, saveBDRequest);
    // return this.http.put(url, saveBDRequest, Helper.buildHeaders())
    //   .pipe(
    //     map((this.extractData),
    //     catchError(this.handleError))
    //   );
  }

  update_state(updateStateRequest: UpdateStateRequest): Observable<SaveBDResponse> {
    const url = `${ this.baseUrlUpdateState }`;
    return this.http.put<SaveBDResponse>(url, updateStateRequest);
  }

  private extractData(response: any) {
    const body = response
    return body;
  }

  private handleError(err: any) {
    return throwError(() => new Error(err));
  }


}
