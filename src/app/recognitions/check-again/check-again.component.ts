import { Component, OnInit } from '@angular/core';

import { Router } from '@angular/router';

@Component({
  selector: 'app-check-again',
  templateUrl: './check-again.component.html',
  styles: [
  ]
})
export class CheckAgainComponent implements OnInit {

  constructor( private router: Router ) { }

  ngOnInit(): void {
  }

  initial(){
    this.router.navigate(['/check_user']);
  }

}
