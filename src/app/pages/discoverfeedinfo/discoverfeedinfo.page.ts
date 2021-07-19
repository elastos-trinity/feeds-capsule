import { Component, OnInit, NgZone, ViewChild } from '@angular/core';
import { PopoverController} from '@ionic/angular';
import { ActivatedRoute } from '@angular/router';
import { NativeService } from '../../services/NativeService';
import { FeedService } from '../../services/FeedService';
import { ThemeService } from '../../services/theme.service';
import { HttpService } from '../../services/HttpService';
import { MenuService } from '../../services/MenuService';
import { TranslateService } from "@ngx-translate/core";
import { PopupProvider } from '../../services/popup';
import { AppService } from '../../services/AppService';
import { Events } from 'src/app/services/events.service';
import { ViewHelper } from 'src/app/services/viewhelper.service';
import { TitleBarService } from 'src/app/services/TitleBarService';
import { TitleBarComponent } from 'src/app/components/titlebar/titlebar.component';

import * as _ from 'lodash';

@Component({
  selector: 'app-discoverfeedinfo',
  templateUrl: './discoverfeedinfo.page.html',
  styleUrls: ['./discoverfeedinfo.page.scss'],
})

// let obj = {
//   "did":this.serverInfo['did'],
//   "name":this.name,
//   "description":this.des,
//   "url":this.feedsUrl,
//   "feedsUrlHash":feedsUrlHash,
//   "feedsAvatar":this.channelAvatar,
//   "followers":followers,
//   "ownerName":this.serverInfo["owner"]
// };

export class DiscoverfeedinfoPage implements OnInit {
  @ViewChild(TitleBarComponent, { static: true }) titleBar: TitleBarComponent;
  public developerMode:boolean =  false;
  public  connectionStatus = 1;
  public feedInfo:any = {};
  public popover:any = "";
  public qrcodeString:string = null;
  public feedsUrl:string = null;
  public status:string ="";
  public channelSubscribes: number = 0;
  public followStatus: boolean = false;
  constructor(
    private events: Events,
    private zone: NgZone,
    private native: NativeService,
    private acRoute: ActivatedRoute,
    private feedService: FeedService,
    public theme:ThemeService,
    private translate:TranslateService,
    public httpService:HttpService,
    private popoverController: PopoverController,
    public popupProvider:PopupProvider,
    private menuService: MenuService,
    private appService:AppService,
    private titleBarService: TitleBarService,
    private viewHelper: ViewHelper
    ) {}

  ngOnInit() {
    this.acRoute.queryParams.subscribe((data) => {
      this.feedInfo = _.cloneDeep(data)["params"];
      this.feedsUrl = this.feedInfo['url'] || "";
      this.qrcodeString = this.feedsUrl+"#"+encodeURIComponent(this.feedInfo["name"]) || null;
    });

  }

  ionViewWillEnter() {
    this.developerMode = this.feedService.getDeveloperMode();
    this.channelSubscribes = this.feedInfo["followers"];
    this.status = this.getChannelStatus(this.feedInfo);
    this.initTitle();

    this.connectionStatus = this.feedService.getConnectionStatus();
    this.events.subscribe(FeedsEvent.PublishType.connectionChanged,(status)=>{
      this.zone.run(() => {
        this.connectionStatus = status;
      });
    });

    this.events.subscribe(FeedsEvent.PublishType.updateServerList,()=>{
      this.zone.run(() => {
      //this.native.navigateForward('discoverfeeds',"");
      //this.getNodeId();
      });
    });

    this.events.subscribe(FeedsEvent.PublishType.updateTitle,()=>{
      this.initTitle();
    });

    this.events.subscribe(FeedsEvent.PublishType.unsubscribeFinish,(unsubscribeData: FeedsEvent.unsubscribeData)=>{
      this.zone.run(() => {
        let nodeId = unsubscribeData.nodeId;
        let channelId = unsubscribeData.channelId;
        let feedNodeId = this.feedInfo["nodeId"]
        let feedUrl = this.feedInfo["url"];
        let feedId = feedUrl.split("/")[4];
        if(feedNodeId === nodeId && feedId == channelId){
           this.status = '1';
        }
      });
    });

    this.events.subscribe(FeedsEvent.PublishType.subscribeFinish,(subscribeFinishData: FeedsEvent.SubscribeFinishData)=>{
      this.zone.run(() => {
        let nodeId = subscribeFinishData.nodeId;
        let channelId = subscribeFinishData.channelId;
        let feedNodeId = this.feedInfo["nodeId"]
        let feedUrl = this.feedInfo["url"];
        let feedId = feedUrl.split("/")[4];
        if(feedNodeId === nodeId && feedId == channelId){
          this.status = '2';
        }
      });
    });

  }

  ionViewDidEnter(){
  }

  ionViewWillLeave(){
    let value =  this.popoverController.getTop()["__zone_symbol__value"] || "";
    if(value!=""){
      this.popoverController.dismiss();
      this.popover = "";
    }
    this.native.hideLoading();
    this.events.unsubscribe(FeedsEvent.PublishType.updateServerList);
    this.events.unsubscribe(FeedsEvent.PublishType.updateTitle);
    this.events.unsubscribe(FeedsEvent.PublishType.unsubscribeFinish);
    this.events.unsubscribe(FeedsEvent.PublishType.subscribeFinish);
    this.events.unsubscribe(FeedsEvent.PublishType.connectionChanged);
    this.events.publish(FeedsEvent.PublishType.search);
  }

  initTitle(){
    this.titleBarService.setTitle(this.titleBar, this.translate.instant('DiscoverfeedinfoPage.title'));
    this.titleBarService.setTitleBarBackKeyShown(this.titleBar, true);
    this.titleBarService.setTitleBarMoreMemu(this.titleBar);
  }

  checkDid(type:string){
    let signInData = this.feedService.getSignInData() || {};
    let did = signInData["did"];
    this.feedService.checkDIDDocument(did).then((isOnSideChain)=>{
      if (!isOnSideChain){
        //show one button dialog
        //if click this button
        //call feedService.promptpublishdid() function
        this.openAlert();
        return;
      }

      if(this.feedService.getConnectionStatus() != 0){
        this.native.toastWarn('common.connectionError');
        return;
      }

      if(type === "subscribe"){
        this.subscribe();
        return;
      }

      if(type === "unsubscribe"){
        this.unsubscribe();
        return;
      }

    });
  }

  openAlert(){
    this.popover = this.popupProvider.ionicAlert(
      this,
      // "ConfirmdialogComponent.signoutTitle",
      "",
      "common.didnotrelease",
      this.confirm,
      'tskth.svg'
    );
  }

  confirm(that:any){
      if(this.popover!=null){
         this.popover.dismiss();
         that.feedService.promptpublishdid();
      }
  }

  subscribe(){
    //this.status = '0';
    let feedUrl = this.feedInfo["url"];
    let avatar = this.feedInfo["feedsAvatar"];
    let followers = this.feedInfo["followers"];
    let feedName = this.feedInfo["name"];

    this.feedService.addFeed(feedUrl, avatar, followers, feedName, "","").then((isSuccess)=>{
      if (isSuccess){
        this.native.pop();
        return;
      }
    }).catch((err)=>{
      this.status = '1';
    });
  }

  async unsubscribe(){
    let  nodeId = this.feedInfo["nodeId"]
    let feedUrl = this.feedInfo["url"];
    let channelId = feedUrl.split("/")[4];
    let feedName = this.feedInfo["name"];
    this.menuService.showUnsubscribeMenu(nodeId,Number(channelId),feedName);
  }

  getChannelStatus(item:any){
    let nodeId = item["nodeId"];
    let feedUrl = item["url"];
    let channelId = feedUrl.split("/")[4];
    if (this.feedService.checkIsTobeAddedFeeds(nodeId, channelId)){
          return "0";
    }

    let feeds = this.feedService.getChannelFromId(nodeId, channelId) || null;
    if (feeds == null || !feeds.isSubscribed){
          return "1";
    }
    if (feeds.isSubscribed)
          return "2";
    }

  tip(){
    this.native.toast("tip");
  }

  handleStatus(){
    let nodeId = this.feedInfo["nodeId"];
    let feedUrl = this.feedInfo["url"];
    let feedId = feedUrl.split("/")[4];

    if (this.feedService.checkIsTobeAddedFeeds(nodeId,feedId)){
      let feeds = this.feedService.getToBeAddedFeedsInfoByNodeFeedId(nodeId,feedId) || {};
      let status =  feeds["status"] || 0;
      let keyString ="SearchPage.status";
      return keyString+status;
    }
  }

  showPreviewQrcode(feedsUrl:string){
    this.viewHelper.showPreviewQrcode(this.titleBar, feedsUrl,"common.qRcodePreview","DiscoverfeedinfoPage.title","discoverfeedinfo",this.appService);
  }
}
