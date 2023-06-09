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
  isPageReloaded = true;

  validedUser: IdentificationResponse | undefined;

  msgCliente: string = '';

  userForm: FormGroup = this.fb.group({
    identification: [, [Validators.required, Validators.minLength(10), Validators.maxLength(10) ] ]
  })

  constructor(
    private recongnitionsService: RecongnitionsService,
    private router: Router,
    private fb: FormBuilder,
    private modalService: NgbModal,
  ) { }

  ngOnInit(): void {
    this.userForm.reset({
      identification: '', // 0704437003
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
      .subscribe({
        next: (userChecked) => {
          console.log(userChecked);
          this.validedUser = userChecked;
          if (this.validedUser.esCliente ){
            localStorage.setItem('UserInfo', JSON.stringify(this.validedUser));
            localStorage.setItem('PersonID', identification_value);
            this.router.navigate(['/camera']);
            // if (this.validedUser.intentos >= '3')
            //   this.router.navigate(['/check_failed']);
            // else
            //   this.router.navigate(['/camera']);
          }
          else {
            this.msgCliente = userChecked.msg;
            this.show = true;
          }
          this.userForm.reset();
          this.modalService.dismissAll();
        },
        error: (e) => {
          this.msgCliente = 'Lo sentimos al consultar el servicio, intentelo mas tarde.';
          this.show = true;
          this.userForm.reset();
          this.modalService.dismissAll();
        }
      });

      
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
