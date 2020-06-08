import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Routes, RouterModule } from '@angular/router';

import { IonicModule } from '@ionic/angular';

import { IssuecredentialPage } from './issuecredential.page';

const routes: Routes = [
  {
    path: '',
    component: IssuecredentialPage
  }
];

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    RouterModule.forChild(routes)
  ],
  declarations: [IssuecredentialPage]
})
export class IssuecredentialPageModule {}
