import { Component, OnInit } from '@angular/core';

import { Router } from '@angular/router';

@Component({
  selector: 'app-check-failed',
  templateUrl: './check-failed.component.html',
  styles: [
  ]
})
export class CheckFailedComponent implements OnInit {

  constructor( private router: Router ) { }

  ngOnInit(): void {
  }

  initial(){
    // this.router.navigate(['/check_user']);
    window.location.href = "https://wa.me/14437852449";
  }

}
