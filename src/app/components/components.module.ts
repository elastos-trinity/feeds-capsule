import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { TranslateModule } from '@ngx-translate/core';
import { FormsModule } from '@angular/forms';
import { QRCodeModule } from 'angularx-qrcode';

import { ServerpromptComponent} from './serverprompt/serverprompt.component';
import { PaypromptComponent } from './payprompt/payprompt.component';
import { NftdialogComponent } from './../components/nftdialog/nftdialog.component';
import { TipdialogComponent} from './tipdialog/tipdialog.component';
import { MorenameComponent} from './morename/morename.component';

import {ConfirmdialogComponent} from './confirmdialog/confirmdialog.component';
import {AlertdialogComponent} from './alertdialog/alertdialog.component';

import { MyfeedsComponent} from './myfeeds/myfeeds.component';
import { FollowingComponent} from './following/following.component';
import { LikesComponent} from './likes/likes.component';
import { CommentComponent } from './comment/comment.component';
import { SwitchfeedComponent } from './switchfeed/switchfeed.component';
import { PreviewqrcodeComponent } from './previewqrcode/previewqrcode.component';
import { SharemenuComponent } from './sharemenu/sharemenu.component';
import { RoundloadingComponent } from './roundloading/roundloading.component';
import { PercentageloadingComponent } from './percentageloading/percentageloading.component';
import { AddassetComponent } from './addasset/addasset.component';
import { AssetitemComponent } from './assetitem/assetitem.component';
import { NewassetitemComponent } from './newassetitem/newassetitem.component';
import { ChannelcardComponent } from './channelcard/channelcard.component';

import { VideofullscreenComponent } from './videofullscreen/videofullscreen.component';

import { VgCoreModule } from '@videogular/ngx-videogular/core';
import { VgControlsModule } from '@videogular/ngx-videogular/controls';
import { VgOverlayPlayModule } from '@videogular/ngx-videogular/overlay-play';
import { VgBufferingModule } from '@videogular/ngx-videogular/buffering';

import { ShareModule } from 'src/app/share/share.module';

import { TitleBarComponent } from './titlebar/titlebar.component';
import { TitlebarmenuitemComponent } from './titlebarmenuitem/titlebarmenuitem.component';
import {RoundProgressModule} from 'angular-svg-round-progressbar';


@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    VgCoreModule,
    VgControlsModule,
    VgOverlayPlayModule,
    VgBufferingModule,
    TranslateModule,
    IonicModule,
    ShareModule,
    QRCodeModule,
    RoundProgressModule
  ],

  declarations: [
    AlertdialogComponent,
    ConfirmdialogComponent,
    MorenameComponent,
    TipdialogComponent,
    PaypromptComponent,
    NftdialogComponent,
    PreviewqrcodeComponent,
    ServerpromptComponent,
    MyfeedsComponent,
    FollowingComponent,
    LikesComponent,
    CommentComponent,
    SwitchfeedComponent,
    SharemenuComponent,
    VideofullscreenComponent,
    RoundloadingComponent,
    PercentageloadingComponent,
    TitleBarComponent,
    TitlebarmenuitemComponent,
    AddassetComponent,
    AssetitemComponent,
    NewassetitemComponent,
    ChannelcardComponent
  ],
  exports: [
    AlertdialogComponent,
    ConfirmdialogComponent,
    MorenameComponent,
    TipdialogComponent,
    PaypromptComponent,
    NftdialogComponent,
    PreviewqrcodeComponent,
    ServerpromptComponent,
    MyfeedsComponent,
    FollowingComponent,
    LikesComponent,
    CommentComponent,
    SwitchfeedComponent,
    SharemenuComponent,
    VideofullscreenComponent,
    RoundloadingComponent,
    PercentageloadingComponent,
    TitleBarComponent,
    AddassetComponent,
    AssetitemComponent,
    NewassetitemComponent,
    ChannelcardComponent
  ],

  providers: [
  ],
  entryComponents: [VideofullscreenComponent,AlertdialogComponent,ConfirmdialogComponent,MorenameComponent,TipdialogComponent,ServerpromptComponent,
    PaypromptComponent,NftdialogComponent,PreviewqrcodeComponent],
})
export class ComponentsModule { }
