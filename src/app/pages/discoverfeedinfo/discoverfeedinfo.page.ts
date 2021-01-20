import { Component, OnInit, NgZone } from '@angular/core';
import { Events,PopoverController} from '@ionic/angular';
import { ActivatedRoute } from '@angular/router';
import { NativeService } from '../../services/NativeService';
import { FeedService } from '../../services/FeedService';
import { ThemeService } from '../../services/theme.service';
import { HttpService } from '../../services/HttpService';
import { MenuService } from '../../services/MenuService';
import { TranslateService } from "@ngx-translate/core";
import { PopupProvider } from '../../services/popup';
import * as _ from 'lodash';
declare let titleBarManager: TitleBarPlugin.TitleBarManager;

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
    private menuService: MenuService) {}

  ngOnInit() {

    this.acRoute.queryParams.subscribe((data) => {
      this.feedInfo = _.cloneDeep(data)["params"];
    });

  }

  ionViewWillEnter() {
    this.channelSubscribes = this.feedInfo["followers"];
    this.feedsUrl = this.feedInfo['url'] || "";
    this.qrcodeString = this.feedsUrl+"#"+this.feedInfo["name"] || null;
    this.status = this.getChannelStatus(this.feedInfo);
    this.initTitle();
    this.native.setTitleBarBackKeyShown(true);

    this.connectionStatus = this.feedService.getConnectionStatus();
    this.events.subscribe('feeds:connectionChanged',(status)=>{
      this.zone.run(() => {
        this.connectionStatus = status;
      });
    });

    this.events.subscribe("feeds:updateServerList",()=>{
      this.zone.run(() => {
      //this.native.navigateForward('discoverfeeds',"");
      //this.getNodeId();
      });
    });

    this.events.subscribe('feeds:login_finish',  () => {
      this.zone.run(() => {

      });
    });

    this.events.subscribe("feeds:updateTitle",()=>{
      this.initTitle();
    });

    this.events.subscribe("feeds:unsubscribeFinish",()=>{
      this.zone.run(() => {
          this.status = '1';
      });
    });

    this.events.subscribe("feeds:subscribeFinish",()=>{
      this.zone.run(() => {
         this.status = '2';
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
    this.events.unsubscribe("feeds:updateServerList");
    this.events.unsubscribe("feeds:serverConnectionChanged");
    this.events.unsubscribe("feeds:updateTitle");
    this.events.unsubscribe("feeds:unsubscribeFinish");
    this.events.unsubscribe("feeds:subscribeFinish");
  }

  initTitle(){
    titleBarManager.setTitle(this.translate.instant('DiscoverfeedinfoPage.title'));
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
    let feedUrl = this.feedInfo["url"];
    let avatar = this.feedInfo["feedsAvatar"];
    let followers = this.feedInfo["followers"];
    let feedName = this.feedInfo["name"];

    this.feedService.addFeed(feedUrl, avatar, followers, feedName).then((isSuccess)=>{
      if (isSuccess){
        this.native.pop();
        return;
      }
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
}
