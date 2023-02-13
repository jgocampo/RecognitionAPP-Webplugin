export class IdentificationRequest {
  constructor(
    public identificacion?: string
  ){}
}

export interface IdentificationResponse {
  esCliente:         boolean;
  fotoRegistroCivil: string;
  error:             boolean;
  statusCode:        number;
  msg:               string;
  operationID:       string;
  intentos:          string;
  codigoDactilar:    string;
}
