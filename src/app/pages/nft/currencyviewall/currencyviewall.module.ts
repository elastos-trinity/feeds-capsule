import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Routes, RouterModule } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import { IonicModule } from '@ionic/angular';
import { ComponentsModule } from '../../../components/components.module';

import { CurrencyviewallPage } from './currencyviewall.page';

const routes: Routes = [
  {
    path: '',
    component: CurrencyviewallPage
  }
];

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    TranslateModule,
    ComponentsModule,
    IonicModule,
    RouterModule.forChild(routes)
  ],
  declarations: [CurrencyviewallPage]
})
export class CurrencyviewallPageModule {}