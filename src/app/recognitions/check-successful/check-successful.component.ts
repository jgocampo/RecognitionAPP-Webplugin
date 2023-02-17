import { Component, OnInit } from '@angular/core';

import { Router } from '@angular/router';

@Component({
  selector: 'app-check-successful',
  templateUrl: './check-successful.component.html',
  styles: [
  ]
})
export class CheckSuccessfulComponent implements OnInit {

  constructor( private router: Router ) { }

  ngOnInit(): void {
  }

  initial(){
    // this.router.navigate(['/check_user']);
    window.location.href = "https://wa.me/14437852449";
  }

}
