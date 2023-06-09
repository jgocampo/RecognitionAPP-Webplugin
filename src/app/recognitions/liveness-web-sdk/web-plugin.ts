import { Component, OnInit } from '@angular/core';

import { Router } from '@angular/router';

declare var OzLiveness: any;

@Component({
  selector: 'app-web-plugin',
  templateUrl: './web-plugin.html',
  styles: [
  ]
})
export class WebPlugin implements OnInit {

  constructor( private router: Router ) { }

  ngOnInit() : void{

  }

  initial(){
    OzLiveness.open({
      lang: 'en',
      action: [
        'photo_id_front', // solicitud de imagen del frente de la identificación
        'video_selfie_blank' // solicitud de video de autenticación pasiva
      ],
      meta: { 
        'transaction_id': '<your_transaction_id>', // tu identificador único para encontrar esta carpeta en la API de Oz
        'iin': '<your_client_iin>', // puedes agregar iin si planeas agrupar las transacciones por el identificador de la persona
        'meta_key': 'meta_value', // otros datos meta
      },
      on_complete: function (result: any) {
        // Esta función de devolución de llamada se invoca cuando el análisis está completo
        // Se recomienda comenzar la transacción en tu backend usando transaction_id para encontrar la carpeta en la API de Oz y obtener los resultados
        console.log('on_complete', result);
      },
      on_capture_complete: function (result: any) {
        // Maneja los datos capturados aquí si es necesario
        console.log('on_capture_complete', result);
      }
    });
  }

}
