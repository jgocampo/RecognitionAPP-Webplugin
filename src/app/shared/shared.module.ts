import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ErrorPageComponent } from './error-page/error-page.component';



@NgModule({
  declarations: [
    ErrorPageComponent
  ],
  exports: [
    ErrorPageComponent
  ],
  imports: [
    CommonModule
  ]
})
export class SharedModule { }
