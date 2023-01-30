export class CompareFaceRequst {
  constructor(
    public target?: string,
    public persona?: string
  ){}
}


export interface CompareFaceResponse {
  faceComparison: FaceComparison;
  landmarks:      Landmarks;
}

export interface FaceComparison {
  msg:        string;
  code:       number;
  match:      boolean;
  confidence: number;
}

export interface Landmarks {
  target:  Persona[];
  persona: Persona[];
}

export interface Persona {
  Type: string;
  X:    number;
  Y:    number;
}
