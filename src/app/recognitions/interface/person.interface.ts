export class SaveBDRequest {
  constructor(
    public PersonID?: string,
    public id?: string,
    public codigoDactilar?: string,
    public result?: string,
    public selfie?: string,
    public date?: string,
  ){}
}

export interface SaveBDResponse {
  put:     string;
}

export class SaveS3Request {
  constructor(
    public image_base64?: string,
    public id?: string,
    public uuid?: string,
  ){}
}

export interface SaveS3Response {
  message: string;
}


export class SpoofRequest {
  constructor(
    public image_data?: string
  ){}
}

export interface SpoofResponse {
  x1:         number;
  y1:         number;
  x2:         number;
  y2:         number;
  score:      number;
  class_name: string;
}
