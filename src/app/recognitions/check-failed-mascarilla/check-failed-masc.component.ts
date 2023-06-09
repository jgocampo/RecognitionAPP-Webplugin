import { Component, OnInit } from '@angular/core';

import { Router } from '@angular/router';

@Component({
  selector: 'app-check-failed-mascarilla',
  templateUrl: './check-failed-masc.component.html',
  styles: [
  ]
})
export class CheckFailedMascComponent implements OnInit {

  constructor( private router: Router ) { }

  ngOnInit(): void {
  }

  initial(){
    this.router.navigate(['/check_user']);
  }

}
