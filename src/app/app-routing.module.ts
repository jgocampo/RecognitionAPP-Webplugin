import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { ErrorPageComponent } from './shared/error-page/error-page.component';

const routes: Routes = [
  {
    path: 'prometeo',
    loadChildren: () => import('./recognitions/recognitions.module').then( m => m.RecognitionsModule )
  },
  {
    path: '**',
    redirectTo: 'prometeo'
  }
]

@NgModule({
  imports: [
    RouterModule.forRoot( routes )
  ],
  exports: [
    RouterModule
  ]
})
export class AppRoutingModule { }
