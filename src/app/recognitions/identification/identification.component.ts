import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { IdentificationRequest, IdentificationResponse } from '../interface/identification.interface';
import { RecongnitionsService } from '../services/recongnitions.service';

@Component({
  selector: 'app-identification',
  templateUrl: './identification.component.html',
  styles: [
  ]
})
export class IdentificationComponent implements OnInit {

  show = false;
  autohide = true;

  validedUser: IdentificationResponse | undefined;

  userForm: FormGroup = this.fb.group({
    identification: [, [Validators.required, Validators.minLength(10), Validators.maxLength(10) ] ]
  })

  constructor(
    private recongnitionsService: RecongnitionsService,
    private router: Router,
    private fb: FormBuilder,
    private modalService: NgbModal
  ) { }

  ngOnInit(): void {
    const date = new Date();
    console.log(date.toISOString());
    this.userForm.reset({
      identification: '0704437003', // 0704437003
    })
  }

  checkUser(content: any) {
    this.show = false;

    if (this.userForm.invalid ) {
      this.userForm.markAllAsTouched();
      return;
    }

    this.openVerticallyCentered(content);
    const identification_value = this.userForm.value['identification'];

    const request = new IdentificationRequest(this.userForm.value['identification']);

    this.recongnitionsService.check_user(request)
      .subscribe( userChecked => {
        console.log(userChecked);
        localStorage.setItem('checkUserImage', userChecked.idImage);
        localStorage.setItem('PersonID', identification_value);
        this.validedUser = userChecked;
        if (this.validedUser.client ){
          this.router.navigate(['/camera']);
        }
        else {
          console.log('no cliente');
          this.show = true;
        }
      });

      this.userForm.reset();
      this.modalService.dismissAll();
  }

  fieldIsValid( field: string ) {
    return this.userForm.controls[field].errors
      && this.userForm.controls[field].touched
  }

  public openVerticallyCentered(content: any) {
    this.modalService.open(content, {
      backdrop: 'static',
      centered: true,
      windowClass: 'modalClass',
      keyboard: false
    });
  }

}
