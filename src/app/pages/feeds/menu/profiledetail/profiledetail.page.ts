import { Component, OnInit, NgZone } from '@angular/core';
import { Events } from '@ionic/angular';
import { FeedService } from 'src/app/services/FeedService';
import { NativeService } from 'src/app/services/NativeService';
import { ThemeService } from 'src/app/services/theme.service';
import { TranslateService } from "@ngx-translate/core";
declare let titleBarManager: TitleBarPlugin.TitleBarManager;

@Component({
  selector: 'app-profiledetail',
  templateUrl: './profiledetail.page.html',
  styleUrls: ['./profiledetail.page.scss'],
})
export class ProfiledetailPage implements OnInit {
  public connectionStatus = 1;
  public avatar = "";
  public name = "";
  public description = "";
  public did = "";
  public gender = "";
  public telephone = "";
  public email = "";
  public location = "";
  public ownChannelSourceDid = "";


  constructor(
    private zone: NgZone,
    private native: NativeService,
    private feedService:FeedService,
    public  theme:ThemeService,
    private translate:TranslateService,
    private events: Events) {
      let signInData = feedService.getSignInData();
      this.name = signInData.name;
      this.description = signInData.description;
      // this.description = "Designer for Tuum Technologies and helps with the elastOS project and all Tuum Technology projects.Loves Mountain Biking. "
      this.did = signInData.did;
      this.telephone = signInData.telephone;
      this.email = signInData.email;
      this.location = signInData.location;

      let bindingServer = this.feedService.getBindingServer();
      if (bindingServer != null && bindingServer != undefined)
        this.ownChannelSourceDid = bindingServer.did;
    }

  ngOnInit() {
    this.connectionStatus = this.feedService.getConnectionStatus();
  }

  ionViewWillEnter() {
    this.events.subscribe('feeds:connectionChanged',(status)=>{
      this.zone.run(() => {
        this.connectionStatus = status;
      });
    });

    this.events.subscribe("feeds:updateTitle",()=>{
      this.initTitle();
    });
  
  }

  ionViewDidEnter(){
    this.initTitle();
    this.native.setTitleBarBackKeyShown(true);
  }

  initTitle(){
    titleBarManager.setTitle(this.translate.instant('ProfiledetailPage.profileDetails'));
  }

  ionViewWillUnload(){
  }

  ionViewWillLeave(){
    this.events.unsubscribe("feeds:connectionChanged");
    this.events.unsubscribe("feeds:updateTitle");
  }
  

}
