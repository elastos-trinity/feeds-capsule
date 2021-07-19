import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Routes, RouterModule } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import { IonicModule } from '@ionic/angular';
import { SubscriptionsPage } from './subscriptions.page';
import { ComponentsModule } from 'src/app/components/components.module';
const routes: Routes = [
  {
    path: '',
    component: SubscriptionsPage
  }
];

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    TranslateModule,
    ComponentsModule,
    RouterModule.forChild(routes)
  ],
  declarations: [SubscriptionsPage]
})
export class SubscriptionsPageModule {}
