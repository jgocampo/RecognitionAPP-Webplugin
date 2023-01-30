export class IdentificationRequest {
  constructor(
    public id?: string
  ){}
}

export interface IdentificationResponse {
  msg:     string;
  code:    number;
  client:  boolean;
  idImage: string;
}
