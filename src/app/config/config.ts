import { HttpHeaders } from "@angular/common/http";


export class Helper {

  static buildHeaders(): any {
    let headers = new HttpHeaders({
      'Content-type': 'application/json'
    });
    const httpOptions = {
      headers: headers
    };
    return httpOptions;
  }
}
