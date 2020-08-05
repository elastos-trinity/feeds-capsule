import { Component, OnInit, NgZone } from '@angular/core';
import { Events, Platform, LoadingController } from '@ionic/angular';
import { ActivatedRoute } from '@angular/router';
import { CarrierService } from 'src/app/services/CarrierService';
import { FeedService } from 'src/app/services/FeedService';
import { NativeService } from 'src/app/services/NativeService';
import { AppService } from 'src/app/services/AppService';
import { PopupProvider } from 'src/app/services/popup';
import { TranslateService } from "@ngx-translate/core";
declare let titleBarManager: TitleBarPlugin.TitleBarManager;
declare let appManager: AppManagerPlugin.AppManager;
@Component({
  selector: 'page-add-server',
  templateUrl: 'add-server.html',
  styleUrls: ['add-server.scss'],
})

export class AddServerPage implements OnInit {
  private connectStatus = 1;
  private address: string = '';
  
  private buttonDisabled = false;
  
  private name: string;
  private owner: string;
  private introduction: string;
  private did: string;
  private feedsUrl: string;

  constructor(
    private events: Events,
    private zone: NgZone,
    private acRoute: ActivatedRoute,
    private platform: Platform,
    private native: NativeService,
    private feedService: FeedService,
    private appService: AppService,
    private popup: PopupProvider,
    private loadingController: LoadingController,
    private carrier: CarrierService,
    private translate:TranslateService) {
      this.connectStatus = this.feedService.getConnectionStatus();
      // this.acRoute.params.subscribe(data => {
      //   this.address = data.address;
      //   if (this.address == null ||
      //     this.address == undefined||
      //     this.address == '')
      //     return;
      //     this.zone.run(()=>{
      //       this.presentLoading();
      //     });
      //   this.queryServer();
      // });

      this.events.subscribe('feeds:connectionChanged', connectionStatus => {
        this.zone.run(() => {
            this.connectStatus = connectionStatus;
        });
      });

      this.events.subscribe('feeds:updateServerList', ()=>{
        this.zone.run(() => {
            //this.native.pop();
            this.native.go('/menu/servers');
        });
      });
  }

  ngOnInit() {}

  ionViewDidEnter() {
    this.events.subscribe("feeds:updateTitle",()=>{
      this.initTitle();
    });
    this.initTitle();
    this.native.setTitleBarBackKeyShown(true);
  }

  ionViewWillUnload(){
    this.events.unsubscribe("feeds:updateTitle");
  }


  initTitle(){
    titleBarManager.setTitle(this.translate.instant('AddServerPage.title'));
  }

  navToBack() {
    this.native.pop();
  }



  scanCode(){
    appManager.sendIntent("scanqrcode", {}, {}, (res) => {
      let result: string = res.result.scannedContent;
      this.checkValid(result);
  }, (err: any) => {
      console.error(err);
  });
  }

  alertError(error: string){
    alert (error);
  }
  
  // onChange(){
  //   this.queryServer();
  // }

  confirm(){
    this.checkValid(this.address);
  }

  checkValid(result: string){
    if (result.length < 54 ||
      !result.startsWith('feeds://')||
      !result.indexOf("did:elastos:")){
        alert(this.translate.instant("AddServerPage.tipMsg"));
        return ;
    }
    this.native.getNavCtrl().navigateForward(['/menu/servers/server-info', result, "", false]);
  }



}
