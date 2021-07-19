import { Component, OnInit,ViewChild,NgZone} from '@angular/core';
import { TranslateService } from "@ngx-translate/core";
import { TitleBarService } from 'src/app/services/TitleBarService';
import { TitleBarComponent } from 'src/app/components/titlebar/titlebar.component';
import { Events } from 'src/app/services/events.service';
import { FeedService} from 'src/app/services/FeedService';
import { NativeService } from 'src/app/services/NativeService';
import { IntentService } from 'src/app/services/IntentService';

@Component({
  selector: 'app-subscriptions',
  templateUrl: './subscriptions.page.html',
  styleUrls: ['./subscriptions.page.scss'],
})
export class SubscriptionsPage implements OnInit {
  @ViewChild(TitleBarComponent, { static: true }) titleBar: TitleBarComponent;
  public followingList:any = [];
  public nodeStatus:any = {};
  public isShowUnfollow:boolean = false;
  public isShowQrcode:boolean = false;
  public isShowTitle:boolean = false;
  public isShowInfo:boolean = false;
  public isPreferences:boolean = false;
  public shareNodeId:string = "";
  public shareFeedId:string = "";
  public curItem:any = {};
  public qrCodeString:string = null;
  public feedName:string = null;
  public hideSharMenuComponent:boolean = false;
  constructor(
    private titleBarService: TitleBarService,
    private translate: TranslateService,
    private events:Events,
    private feedService:FeedService,
    private zone:NgZone,
    private native:NativeService,
    private intentService:IntentService
  ) { }

  ngOnInit() {
  }

  ionViewWillEnter() {
    this.initTitle();
    this.addEvents();
    this.initFolling();
  }

  addEvents(){
    this.events.subscribe(FeedsEvent.PublishType.friendConnectionChanged, (friendConnectionChangedData: FeedsEvent.FriendConnectionChangedData)=>{
      this.zone.run(()=>{
        let nodeId = friendConnectionChangedData.nodeId;
        let connectionStatus = friendConnectionChangedData.connectionStatus;
        this.nodeStatus[nodeId] = connectionStatus;
      });
    });

    this.events.subscribe(FeedsEvent.PublishType.unfollowFeedsFinish, () => {
      this.zone.run(() => {
        this.initFolling();
      });
    });


    this.events.subscribe(FeedsEvent.PublishType.refreshPage,()=>{
      this.zone.run(() => {
          this.initFolling();
      });
    });


  }

  removeEvents(){

    this.events.unsubscribe(FeedsEvent.PublishType.friendConnectionChanged);
    this.events.unsubscribe(FeedsEvent.PublishType.unfollowFeedsFinish);
    this.events.unsubscribe(FeedsEvent.PublishType.refreshPage);
    this.events.unsubscribe(FeedsEvent.PublishType.friendConnectionChanged);

  }

  initTitle(){
    this.titleBarService.setTitle(this.titleBar, this.translate.instant('ProfilePage.following'));
    this.titleBarService.setTitleBarBackKeyShown(this.titleBar, true);
    this.titleBarService.setTitleBarMoreMemu(this.titleBar);
  }

  ionViewWillLeave(){
    this.hideSharMenuComponent = false;
    this.removeEvents();
    this.events.publish(FeedsEvent.PublishType.addProflieEvent);
  }

  showMenuMore(item:any){
    this.curItem = item;
    this.isShowTitle = true;
    this.isShowInfo = true;
    this.isShowQrcode = true;
    this.isPreferences = false;
    this.isShowUnfollow = true;
    this.feedName = item.channelName;
    this.qrCodeString = this.getQrCodeString(item);
    this.hideSharMenuComponent = true;
  }

  toPage(eventParm:any){
    let nodeId = eventParm["nodeId"];
    let channelId = eventParm["channelId"];
    let postId = eventParm["postId"] || "";
    let page = eventParm["page"];

    if(postId!=""){
      this.native.getNavCtrl().navigateForward([page,nodeId,channelId,postId]);
    }else{
      this.native.getNavCtrl().navigateForward([page,nodeId,channelId]);
    }
  }

  initFolling(){
    this.followingList = this.feedService.getFollowedChannelList();
    this.initnodeStatus(this.followingList);
    this.feedService.updateSubscribedFeed();
  }

  initnodeStatus(list:any){
    list = list || [];
     for(let index =0 ;index<list.length;index++){
            let nodeId = list[index]['nodeId'];
            let status = this.checkServerStatus(nodeId);
            this.nodeStatus[nodeId] = status;
     }
  }

  checkServerStatus(nodeId: string){
    return this.feedService.getServerStatusFromId(nodeId);
  }

  doRefresh(event:any){
    let sId =  setTimeout(() => {
          this.initFolling();
          event.target.complete();
          clearTimeout(sId);
    },500);
  }

  getQrCodeString(feed:any){
    let nodeId = feed["nodeId"];
    this.shareNodeId = nodeId;
    let serverInfo = this.feedService.getServerbyNodeId(nodeId);
    let feedsUrl = serverInfo['feedsUrl'] || null;
    let feedId = feed["channelId"] || "";
    this.shareFeedId = feedId;
    feedsUrl = feedsUrl+"/"+feedId;
    let feedsName = feed["channelName"] || "";
    return feedsUrl +"#"+encodeURIComponent(feedsName);
  }

  hideShareMenu(objParm:any){
    let buttonType = objParm["buttonType"];
    let nodeId = objParm["nodeId"];
    let feedId = objParm["feedId"];
     switch(buttonType){
       case "unfollow":
        if(this.feedService.getConnectionStatus() != 0){
          this.native.toastWarn('common.connectionError');
          return;
        }
        if(this.checkServerStatus(nodeId) != 0){
          this.native.toastWarn('common.connectionError1');
          return;
        }

      this.feedService.unsubscribeChannel(nodeId,feedId);
        this.qrCodeString = null;
        this.hideSharMenuComponent = false;
         break;
       case "share":
          let content = this.getQrCodeString(this.curItem);
          this.intentService.share("", content);
          this.hideSharMenuComponent = false;
         break;
       case "info":
         this.clickAvatar(nodeId,feedId);
         break;
       case "preferences":

        if(this.feedService.getConnectionStatus() != 0){
          this.native.toastWarn('common.connectionError');
          return;
        }

         this.native.navigateForward(['feedspreferences'],{
           queryParams:{
              nodeId:this.shareNodeId,
              feedId:this.shareFeedId
           }});
        this.hideSharMenuComponent = false;
         break;
       case "cancel":
        this.qrCodeString = null;
        this.hideSharMenuComponent = false;
         break;
     }
  }

  clickAvatar(nodeId:string,feedId:number){
    let feed = this.feedService.getChannelFromId(nodeId,feedId);
    let followStatus = this.checkFollowStatus(nodeId,feedId);
    let feedName = feed.name;
    let feedDesc = feed.introduction;
    let feedSubscribes = feed.subscribers;
    let feedAvatar = this.feedService.parseChannelAvatar(feed.avatar);
    if(feedAvatar.indexOf("data:image")>-1){
     this.feedService.setSelsectIndex(0);
     this.feedService.setProfileIamge(feedAvatar);
    }else if(feedAvatar.indexOf("assets/images")>-1){
     let index = feedAvatar.substring(feedAvatar.length-5,feedAvatar.length-4);
     this.feedService.setSelsectIndex(index);
     this.feedService.setProfileIamge(feedAvatar);
    }

   this.feedService.setChannelInfo(
     {
       "nodeId":nodeId,
       "channelId":feedId,
       "name":feedName,
       "des":feedDesc,
       "followStatus":followStatus,
       "channelSubscribes":feedSubscribes
     });
    this.native.navigateForward(['/feedinfo'],"");
   }

   checkFollowStatus(nodeId: string, channelId: number){
    let channelsMap = this.feedService.getChannelsMap();
    let nodeChannelId = this.feedService.getChannelId(nodeId,channelId);
    if (channelsMap[nodeChannelId] == undefined || !channelsMap[nodeChannelId].isSubscribed){
          return false;
    }
    else{
           return true;
    }
  }

}
