import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { CameraComponent } from './camera/camera.component';
import { HomeComponent } from './home/home.component';
import { IdentificationComponent } from './identification/identification.component';
import { CheckSuccessfulComponent } from './check-successful/check-successful.component';
import { CheckFailedComponent } from './check-failed/check-failed.component';
import { CheckAgainComponent } from './check-again/check-again.component';
import {CheckFailedGafasComponent } from './check-failed-gafas/check-failed-gafas.component'
import { CheckFailedMascComponent } from './check-failed-mascarilla/check-failed-masc.component'
import { Loading } from './loading/loading.component';
//import { WebPlugin } from './liveness-web-sdk/web-plugin'

const routes: Routes = [
  {
    path: '',
    component: HomeComponent,
    children: [
      { path: 'check_user', component: IdentificationComponent },
      { path: 'camera', component: CameraComponent },
      { path: 'check_successful', component: CheckSuccessfulComponent },
      { path: 'check_failed', component: CheckFailedComponent },
      { path: 'check_again', component: CheckAgainComponent },
      { path: 'check_failed_gafas', component:  CheckFailedGafasComponent },
      { path: 'check_failed_masc', component:  CheckFailedMascComponent },
      { path: 'loading', component:  Loading },
      //{ path: 'web_plugin', component:  WebPlugin },
      { path: '**', redirectTo: 'check_user'}
    ]
  }
];


@NgModule({
  imports: [
    RouterModule.forChild( routes )
  ],
  exports: [
    RouterModule
  ]
})
export class RecognitionsRoutingModule { }
