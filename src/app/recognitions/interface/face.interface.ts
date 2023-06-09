export class CompareFaceRequst {
  constructor(
    public target?: string,
    public persona?: string
  ){}
}


export interface CompareFaceResponse {
  faceComparison: FaceComparison;
}

export interface FaceComparison {
  msg:        string;
  code:       number;
  match:      boolean;
  gafas:      boolean;
  mascarilla: boolean; 
  confidence: number;
  landmarks:  Landmarks;
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
