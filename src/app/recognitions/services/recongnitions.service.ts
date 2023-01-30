import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { map, catchError} from 'rxjs/operators';
import { IdentificationRequest, IdentificationResponse } from '../interface/identification.interface';
import { CompareFaceRequst, CompareFaceResponse } from '../interface/face.interface';
import { SaveBDRequest, SaveBDResponse, SaveS3Request, SaveS3Response, SpoofRequest, SpoofResponse } from '../interface/person.interface';
import { Helper } from '../../config/config';

@Injectable({
  providedIn: 'root'
})
export class RecongnitionsService {

  public resultados!: IdentificationResponse;

  private baseUrl: string = 'https://8zj2l9ycrg.execute-api.us-east-1.amazonaws.com/prometeo/recognition'
  private baseUrlSpoof: string = 'https://uhbby2jtxl.execute-api.us-east-1.amazonaws.com'

  constructor( private http: HttpClient) { }

  check_user(identificationRequest: IdentificationRequest): Observable<IdentificationResponse> {

    const url = `${ this.baseUrl }/check_user`;
    // return this.http.post<IdentificationResponse>(url , identificationRequest, Helper.buildHeaders());
    return this.http.post(url, identificationRequest, Helper.buildHeaders())
      .pipe(
        map((this.extractData),
        catchError(this.handleError))
      );
  }

  campare_spoof(spoofRequest: SpoofRequest): Observable<SpoofResponse> {
    const url = `${ this.baseUrlSpoof }`;
    // return this.http.post<SpoofResponse>(url, spoofRequest);
    return this.http.post(url, spoofRequest, Helper.buildHeaders())
      .pipe(
        map((this.extractData),
        catchError(this.handleError))
      );
  }

  compare_faces(compareFaceRequst: CompareFaceRequst): Observable<CompareFaceResponse> {
    const url = `${ this.baseUrl }/compare_faces`;
    // return this.http.post<CompareFaceResponse>(url, compareFaceRequst);
    return this.http.post(url, compareFaceRequst, Helper.buildHeaders())
      .pipe(
        map((this.extractData),
        catchError(this.handleError))
      );
  }

  save_s3(saveS3Request: SaveS3Request): Observable<SaveS3Response> {
    const url = 'https://skbilp645i.execute-api.us-east-1.amazonaws.com/s3-image';
    // return this.http.post<SaveS3Response>(url, saveS3Request);
    return this.http.post(url, saveS3Request, Helper.buildHeaders())
      .pipe(
        map((this.extractData),
        catchError(this.handleError))
      );
  }

  save_bd(saveBDRequest: SaveBDRequest): Observable<SaveBDResponse> {
    const url = 'https://fhi7bo984d.execute-api.us-east-1.amazonaws.com/items';
    // return this.http.put<SaveBDResponse>(url, saveBDRequest);
    return this.http.put(url, saveBDRequest, Helper.buildHeaders())
      .pipe(
        map((this.extractData),
        catchError(this.handleError))
      );
  }

  private extractData(response: any) {
    const body = response
    return body;
  }

  private handleError(err: any) {
    return throwError(() => new Error(err));
  }


}
