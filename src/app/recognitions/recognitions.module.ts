import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { ReactiveFormsModule } from '@angular/forms';
import { RecognitionsRoutingModule } from './recognitions-routing.module';
import { WebcamModule } from 'ngx-webcam';
import { NgbToastModule } from '@ng-bootstrap/ng-bootstrap';

import { IdentificationComponent } from './identification/identification.component';
import { CameraComponent } from './camera/camera.component';
import { HomeComponent } from './home/home.component';
import { CheckSuccessfulComponent } from './check-successful/check-successful.component';
import { CheckFailedComponent } from './check-failed/check-failed.component';
import { CheckAgainComponent } from './check-again/check-again.component';


@NgModule({
  declarations: [
    HomeComponent,
    IdentificationComponent,
    CameraComponent,
    CheckSuccessfulComponent,
    CheckFailedComponent,
    CheckAgainComponent,
  ],
  exports: [
    HomeComponent,
    IdentificationComponent
  ],
  imports: [
    CommonModule,
    ReactiveFormsModule,
    NgbToastModule,
    WebcamModule,
    RecognitionsRoutingModule,
  ]
})
export class RecognitionsModule { }
