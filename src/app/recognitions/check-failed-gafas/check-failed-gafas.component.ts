import { Component, OnInit } from '@angular/core';

import { Router } from '@angular/router';

@Component({
  selector: 'app-check-failed-gafas',
  templateUrl: './check-failed-gafas.component.html',
  styles: [
  ]
})
export class CheckFailedGafasComponent implements OnInit {

  constructor( private router: Router ) { }

  ngOnInit(): void {
  }

  initial(){
    this.router.navigate(['/check_user']);
  }

}
