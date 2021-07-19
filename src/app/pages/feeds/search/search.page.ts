import { Component, OnInit,ViewChild,NgZone} from '@angular/core';
import { FeedService } from '../../../services/FeedService';
import { PopoverController,IonRefresher,IonSearchbar} from '@ionic/angular';
import { NativeService } from '../../../services/NativeService';
import { ThemeService } from '../../../services/theme.service';
import { UtilService } from '../../../services/utilService';
import { PopupProvider } from '../../../services/popup';
import { HttpService } from '../../../services/HttpService';
import { ApiUrl } from '../../../services/ApiUrl';
import { StorageService } from '../../../services/StorageService';
import { IntentService } from '../../../services/IntentService';
import { Events } from 'src/app/services/events.service';
import { ViewHelper } from 'src/app/services/viewhelper.service';
import { TranslateService } from "@ngx-translate/core";
import { TitleBarComponent } from 'src/app/components/titlebar/titlebar.component';
import { TitleBarService } from 'src/app/services/TitleBarService';

import * as _ from 'lodash';
@Component({
  selector: 'app-search',
  templateUrl: './search.page.html',
  styleUrls: ['./search.page.scss'],
})


export class SearchPage implements OnInit {
  @ViewChild(TitleBarComponent, { static: true }) titleBar: TitleBarComponent;
  @ViewChild(IonRefresher,{static:true}) ionRefresher:IonRefresher;
  @ViewChild('searchbar', {static: false}) searchbar:IonSearchbar;

  public connectionStatus = 1;
  public nodeStatus: any = {};
  public popover:any = "";
  public curAddingItem = {};
  public addingChanneList = [];
  public searchAddingChanneList = [];
  public isSearch:string ="";
  public searchfeedsList = [];
  public discoverSquareList = [];
  public pageNum:number = 1;
  public pageSize:number = 5;
  public totalNum:number = 0;
  public isLoading:boolean =true;
  public developerMode:boolean =  false;
  public searchSquareList = [];
  public followedList = [];
  public httpAllData = [];
  public unfollowedFeed = [];
  public searchUnfollowedFeed = [];
  public scanServiceStyle ={"right":""};
  public curtotalNum:number = 0;
  // {
  //   "nodeId": "8Dsp9jkTg8TEfCkwMoXimwjLeaRidMczLZYNWbKGj1SF",
  //   "did": "did:elastos:ibfZa4jQ1QgDRP9rpfbUbZWpXgbd9z7oKF",
  //   "carrierAddress": "GsfYTr2bTBSppVxMYwj2e8gPpx4CRAZVd2NjehUmRAWYeuiLWmaH",
  //   "feedId": 4,
  //   "feedName": "feeds_testing 4",
  //   "feedUrl": "feeds://did:elastos:ibfZa4jQ1QgDRP9rpfbUbZWpXgbd9z7oKF/GsfYTr2bTBSppVxMYwj2e8gPpx4CRAZVd2NjehUmRAWYeuiLWmaH/4",
  //   "serverUrl": "feeds://did:elastos:ibfZa4jQ1QgDRP9rpfbUbZWpXgbd9z7oKF/GsfYTr2bTBSppVxMYwj2e8gPpx4CRAZVd2NjehUmRAWYeuiLWmaH",
  //   "status": 7,
  //   "friendState": 2,
  //   "avatar":"./assets/images/profile-1.svg",
  //   "follower": 5
  // }
  constructor(
    private feedService: FeedService,
    private events: Events,
    private zone: NgZone,
    private native: NativeService,
    public theme:ThemeService,
    private popoverController: PopoverController,
    private popupProvider: PopupProvider,
    private httpService: HttpService,
    private intentService: IntentService,
    public  storageService: StorageService,
    private translate: TranslateService,
    private viewHelper: ViewHelper,
    private titleBarService: TitleBarService
  ) {
  }

  ngOnInit() {
    this.scanServiceStyle["right"] = screen.width*7.5/100+5+"px";
  }

  initTile(){
    let title = this.translate.instant("FeedsPage.tabTitle4");
    this.titleBarService.setTitle(this.titleBar, title);
    this.titleBarService.setTitleBarMoreMemu(this.titleBar);
  }

  initSubscribe(){

    this.events.subscribe(FeedsEvent.PublishType.updateTitle,()=>{
      this.initTile();
    });

    this.events.subscribe(FeedsEvent.PublishType.connectionChanged,(status)=>{
      this.zone.run(() => {
        this.connectionStatus = status;
      });
    });

    this.events.subscribe(FeedsEvent.PublishType.friendConnectionChanged, (friendConnectionChangedData: FeedsEvent.FriendConnectionChangedData)=>{
      this.zone.run(()=>{
        let nodeId = friendConnectionChangedData.nodeId;
        let connectionStatus = friendConnectionChangedData.connectionStatus;
        this.nodeStatus[nodeId] = connectionStatus;
      });
    });

    this.events.subscribe(FeedsEvent.PublishType.subscribeFinish, (subscribeFinishData: FeedsEvent.SubscribeFinishData)=> {
      this.zone.run(() => {
        let nodeId = subscribeFinishData.nodeId;
        let channelId = subscribeFinishData.channelId;
        this.unfollowedFeed = this.getUnfollowedFeed() || [];
        this.searchUnfollowedFeed = _.cloneDeep(this.unfollowedFeed);
        let status = this.checkServerStatus(nodeId);
        this.nodeStatus[nodeId] = status;
        this.addingChanneList = this.feedService.getToBeAddedFeedsList() || [];
        this.searchAddingChanneList = _.cloneDeep(this.addingChanneList);
        this.handleSearch();
      });
    });

    this.events.subscribe(FeedsEvent.PublishType.addFeedStatusChanged,(addFeedStatusChangedData: FeedsEvent.AddFeedStatusChangedData)=>{
      this.zone.run(() => {
        this.addingChanneList = this.feedService.getToBeAddedFeedsList() || [];
        this.searchAddingChanneList = _.cloneDeep(this.addingChanneList);
        this.discoverSquareList = this.filterdiscoverSquareList(this.discoverSquareList);
      });
    });

    this.events.subscribe(FeedsEvent.PublishType.addFeedStatusChanged,(addFeedStatusChangedData: FeedsEvent.AddFeedStatusChangedData)=>{
      this.zone.run(() => {
        this.discoverSquareList = this.filterdiscoverSquareList(this.discoverSquareList);
      });
    });
  }

  removeSubscribe(){
    let value =  this.popoverController.getTop()["__zone_symbol__value"] || "";
    if(value!=""){
      this.popoverController.dismiss();
      this.popover = "";
    }
    this.events.unsubscribe(FeedsEvent.PublishType.updateTitle);
    this.events.unsubscribe(FeedsEvent.PublishType.connectionChanged);
    this.events.unsubscribe(FeedsEvent.PublishType.friendConnectionChanged);
    this.events.unsubscribe(FeedsEvent.PublishType.subscribeFinish);
    this.events.unsubscribe(FeedsEvent.PublishType.addFeedStatusChanged);
  }

  ionViewWillEnter() {
    this.events.subscribe(FeedsEvent.PublishType.search, ()=>{
      this.initTile();
      this.init();
  });
    this.initTile();
    this.init();
  }

  initTitleBar(){
    let title = this.translate.instant("SearchPage.title");
    this.titleBarService.setTitle(this.titleBar, title);
    this.titleBarService.setTitleBarMoreMemu(this.titleBar);
  }

  init(){
    let discoverfeeds = this.feedService.getDiscoverfeeds();
    if(discoverfeeds.length === 0){
        this.pageNum =1;
        this.initData("",true);
    }else{
      this.httpAllData = _.cloneDeep(discoverfeeds);
      this.discoverSquareList = _.cloneDeep(discoverfeeds);
    }
    this.developerMode = this.feedService.getDeveloperMode();
    this.connectionStatus = this.feedService.getConnectionStatus();
    this.unfollowedFeed = this.getUnfollowedFeed();
    this.discoverSquareList = this.filterdiscoverSquareList(this.discoverSquareList);
    this.initSubscribe();
    this.handleSearch();
  }

  ionViewWillLeave(){
    this.removeSubscribe();
    this.curAddingItem="";
    this.events.unsubscribe(FeedsEvent.PublishType.search);
  }

  subscribe(nodeId: string, id: number){
    if(this.feedService.getConnectionStatus() != 0){
      this.native.toastWarn('common.connectionError');
      return;
    }

    if(this.checkServerStatus(nodeId) != 0){
      this.native.toastWarn('common.connectionError1');
      return;
    }

    this.feedService.subscribeChannel(nodeId, id);
  }

  getItems(events:any){

    this.isSearch = events.target.value || "";
   if((events && (events.keyCode === 13) || (events.keyCode===8&&this.isSearch===""))){
    if(this.checkFeedUrl(this.isSearch)){
      this.addFeedUrl(this.isSearch);
      return;
    }
    if(this.isSearch == ""){
      this.ionRefresher.disabled = false;
      this.addingChanneList = this.feedService.getToBeAddedFeedsList() || [];
      this.unfollowedFeed = this.getUnfollowedFeed() || [];
      let discoverfeeds = this.feedService.getDiscoverfeeds() || [];
      if(discoverfeeds.length>0){
        this.discoverSquareList = this.filterdiscoverSquareList(discoverfeeds);
      }
      this.searchAddingChanneList = _.cloneDeep(this.addingChanneList);
      return;
    }
    this.ionRefresher.disabled = true;
      this.handleSearch();
    }
  }

  ionClear(){
    this.isSearch = "";
    if(this.checkFeedUrl(this.isSearch)){
      this.addFeedUrl(this.isSearch);
      return;
    }
    if(this.isSearch == ""){
      this.ionRefresher.disabled = false;
      this.addingChanneList = this.feedService.getToBeAddedFeedsList() || [];
      this.unfollowedFeed = this.getUnfollowedFeed() || [];
      let discoverfeeds = this.feedService.getDiscoverfeeds() || [];
      if(discoverfeeds.length>0){
        this.discoverSquareList = this.filterdiscoverSquareList(discoverfeeds);
      }
      this.searchAddingChanneList = _.cloneDeep(this.addingChanneList);
      return;
    }
    this.ionRefresher.disabled = true;
    this.handleSearch();
  }
  handleSearch(){
    if(this.isSearch===""){
        return;
    }
    this.addingChanneList = this.searchAddingChanneList.filter(
      channel=>channel.feedName.toLowerCase().indexOf(this.isSearch.toLowerCase()) > -1
    );

    this.unfollowedFeed = this.searchUnfollowedFeed.filter(
      feed=>feed.name.toLowerCase().indexOf(this.isSearch.toLowerCase()) > -1
    );

    this.discoverSquareList = this.searchSquareList.filter(
      feed=>feed.name.toLowerCase().indexOf(this.isSearch.toLowerCase()) > -1
    );


  }

  doRefresh(event) {
    let sid = setTimeout(() => {
      this.feedService.updateSubscribedFeed();
      //this.discoverSquareList = [];
      this.feedService.setDiscoverfeeds([]);
      this.curtotalNum = 0;
      this.pageNum = 1;
      this.initData(event,false);
      event.target.complete();
      clearTimeout(sid);
    }, 2000);
  }

  navTo(nodeId:string, channelId:number){
    this.removeSubscribe();
    this.native.navigateForward(['/channels', nodeId, channelId],"");
  }

  parseChannelAvatar(avatar: string): string{
    return this.feedService.parseChannelAvatar(avatar);
  }

  checkServerStatus(nodeId: string){
    return this.feedService.getServerStatusFromId(nodeId);
  }

 moreName(name:string){
  return UtilService.moreNanme(name)
 }

 pressName(channelName:string){
  let name =channelName || "";
  if(name != "" && name.length>15){
    this.viewHelper.createTip(name);
  }
 }

  discover(){
    if(this.feedService.getConnectionStatus() !== 0){
      this.native.toastWarn('common.connectionError');
      return;
    }
    this.native.go("discoverfeed");
  }

  handleStatus(item:any){
    let status = item["status"] || 0;
    let keyString ="SearchPage.status";
    return keyString+status;
  }

  handeleStatus(addingchannel:any){
    this.curAddingItem = addingchannel;
    this.popover = this.popupProvider.ionicConfirm(
      this,
      "SearchPage.confirmTitle",
      "SearchPage.des1",
      this.cancel,
      this.confirm1,
      './assets/images/tskth.svg',
    );
  }

  confirm1(that:any){
    if(this.popover!=null){
      this.popover.dismiss();
      let nodeId = that.curAddingItem["nodeId"];
      let srcfeedId = that.curAddingItem["feedId"];
      that.feedService.removeTobeAddedFeeds(nodeId,srcfeedId).then(()=>{
        that.zone.run(() => {
          that.addingChanneList = that.feedService.getToBeAddedFeedsList() || [];
          that.searchAddingChanneList = _.cloneDeep(that.addingChanneList);
          let feedlist =_.filter(that.httpAllData,(feed)=>{
            let  feedNodeId = feed["nodeId"]
            let feedUrl = feed["url"];
            let feedId = feedUrl.split("/")[4];
                return feedNodeId==nodeId&&feedId==srcfeedId;
          });
          if(feedlist.length>0){
            let feed = feedlist[0];
            that.discoverSquareList.push(feed);
          }
          that.searchSquareList = _.cloneDeep(that.discoverSquareList);
        });
      });
    }
  }

  cancel(that:any){
    if(this.popover!=null){
      this.popover.dismiss();
      let nodeId = that.curAddingItem["nodeId"];
      let feedId = that.curAddingItem["feedId"];
      let carrierAddress: string = that.curAddingItem["carrierAddress"];
      that.feedService.continueAddFeeds(nodeId, feedId, carrierAddress);
    }
  }

  scanService(){

    if(this.feedService.getConnectionStatus() != 0){
      this.native.toastWarn('common.connectionError');
      return;
    }
    this.handleJump("scanService")
  }

  async handleJump(clickType:string){
    if(clickType === "scanService"){
      let scannedContent = await this.intentService.scanQRCode() || "";
      this.checkValid(scannedContent);
      return;
    }
  }

  checkValid(result: string){
    if (result.length < 54 ||
        !result.startsWith('feeds://')||
        !result.indexOf("did:elastos:")){
          this.native.toastWarn("AddServerPage.tipMsg");
          return ;
      }

    let splitStr = result.split("/")
      if (splitStr.length!=5||
        splitStr[4] == ""){
          this.native.toastWarn("AddServerPage.tipMsg");
          return ;
    }

    this.feedService.addFeed(result,"",0,"", "", "").then((isSuccess)=>{
        if (isSuccess){
          this.native.pop();
          return;
        }
      });
  }

  loadData(events:any){
    this.pageNum =this.pageNum+1;
     this.httpService.ajaxGet(ApiUrl.listPage+"?pageNum="+this.pageNum+"&pageSize="+this.pageSize,false).then((result)=>{
      if(result["code"] === 200){
         this.totalNum = result["data"]["total"];
         let arr = result["data"]["result"] || [];
         if(arr.length === 0){
          return;
         }
         this.curtotalNum = this.curtotalNum+arr.length;
         this.handleCache(arr);
         let discoverSquareList = this.feedService.getDiscoverfeeds();
         this.httpAllData = _.cloneDeep(discoverSquareList);
         this.discoverSquareList = this.filterdiscoverSquareList(discoverSquareList);
      }

      if(this.curtotalNum>=this.totalNum){
        return;
      }
        if(this.curtotalNum<this.totalNum){
           this.loadData(null);
      }
    }).catch((err)=>{
    });
   }

   initData(events:any,isLoading:boolean=true){
    this.isLoading =true;
    this.httpService.ajaxGet(ApiUrl.listPage+"?pageNum="+this.pageNum+"&pageSize="+this.pageSize,isLoading).then((result)=>{
      if(events!=""){
        events.target.complete();
      }
      if(result["code"] === 200){
        this.isLoading =false;
         this.totalNum = result["data"]["total"];
         let discoverSquareList = result["data"]["result"] || [];
         this.curtotalNum = discoverSquareList.length;
         this.handleCache(discoverSquareList);
         discoverSquareList = this.feedService.getDiscoverfeeds();
         this.httpAllData = _.cloneDeep(discoverSquareList);

         this.discoverSquareList = this.filterdiscoverSquareList(discoverSquareList);
         this.searchSquareList =_.cloneDeep(this.discoverSquareList);
         if(this.curtotalNum<=this.totalNum){
             this.loadData(null);
         }

      }
    }).catch((err)=>{
      this.isLoading =false;
      if(events!=""){
        events.target.complete();
      }
    });
  }

  clickItem(feed:any){
    this.removeSubscribe();
    this.native.go("discoverfeedinfo",{
      params:feed
     });
  }

  handleShow(feed:any){

    let  feedNodeId = feed["nodeId"]
    let feedUrl = feed["url"];
    let feedId = feedUrl.split("/")[4];
    let followFeed = _.filter(this.followedList,(item:any)=>{
        return (feedNodeId==item["nodeId"]&&feedId==item["id"]);
    });

    if(followFeed.length>0){
        return false;
    }

    let addingFeed = _.filter(this.addingChanneList,(item:any)=>{
      return (feedNodeId==item["nodeId"]&&feedId==item["feedId"]);
    });

    if(addingFeed.length>0){
      return false;
    }

    let purpose = feed["purpose"] || "";
    if(purpose != "" && !this.developerMode){
        return false;
     }

    return true;
  }

  filterdiscoverSquareList(discoverSquare:any){
   this.developerMode = this.feedService.getDeveloperMode();
   this.initnodeStatus();
   this.followedList = this.feedService.getChannelsList() || [];
   this.addingChanneList = this.feedService.getToBeAddedFeedsList() || [];
   this.searchAddingChanneList = _.cloneDeep(this.addingChanneList);
   let discoverSquareList = [];
    discoverSquareList =  _.filter(discoverSquare,(feed:any)=>{
      return this.handleShow(feed);
    });
    this.searchSquareList =_.cloneDeep(discoverSquareList);
    return discoverSquareList;
  }

  getUnfollowedFeed(){
   let feedList = this.feedService.getChannelsList() || [];
   let unfollowedFeed =  _.filter(feedList,(feed)=>{
              return !feed["isSubscribed"];
   });
   this.searchUnfollowedFeed = _.cloneDeep(unfollowedFeed);
   return unfollowedFeed;
  }

  initnodeStatus(){
    _.each(this.unfollowedFeed,(feed)=>{
      let nodeId = feed['nodeId'];
      let status = this.checkServerStatus(nodeId);
      this.nodeStatus[nodeId] = status;
    });
  }

  discoverSubscribe(feedInfo:any){
    let feedUrl = feedInfo["url"];
    let avatar =  feedInfo["feedsAvatar"];
    let followers = feedInfo["followers"];
    let feedName = feedInfo["name"];
    let desc = feedInfo["description"];
    let ownerName = feedInfo["ownerName"];
    console.log("discoverSubscribe ", feedInfo);

    this.feedService.addFeed(feedUrl, avatar, followers, feedName, ownerName, desc).then((isSuccess)=>{
      if(isSuccess){
        this.zone.run(()=>{
          //this.init();
        });
      }
    }).catch((err)=>{
    });
  }

  checkFeedUrl(feedUrl: string): boolean{
    if (feedUrl == null || feedUrl == undefined || feedUrl == ""){
        return false;
    }
    if (feedUrl.length < 54 ||
      !feedUrl.startsWith('feeds://')||
      !feedUrl.indexOf("did:elastos:")){
        return false;
    }

    let splitStr = feedUrl.split("/")
    if (splitStr.length!=5||
      splitStr[4] == ""){
        return false;
    }
    return true;
  }

  addFeedUrl(result: string){
    this.feedService.addFeed(result,"",0,"","","").then((isSuccess)=>{
      if (isSuccess){
          this.zone.run(()=>{
            this.searchbar.value = "";
            this.isSearch ="";
            this.init();
          })
      }
    });
  }

  handleCache(addArr:any){
    let discoverfeeds = this.feedService.getDiscoverfeeds() || [];
    _.each(addArr,(feed:any)=>{
      if(this.isExitFeed(discoverfeeds,feed) === ""){
        discoverfeeds.push(feed);
      }
    });
    this.feedService.setDiscoverfeeds(discoverfeeds);
    this.storageService.set("feed:discoverfeeds",JSON.stringify(discoverfeeds));
  }

  isExitFeed(discoverfeeds:any,feed:any){
   return _.find(discoverfeeds,feed) || "";
  }

  getChannelOwner(nodeId:string,channelId:number){
   let channel = this.feedService.getChannelFromId(nodeId,channelId) || {};
   let ownerName:string = channel["owner_name"] || "";
   if(ownerName === ""){
       return "common.obtain";
   }
   return "@"+ownerName;
  }

  getChannelDes(nodeId:string,channelId:number){
    let channel = this.feedService.getChannelFromId(nodeId,channelId) || {};
    let channelDes:string = channel["introduction"] || "";
    if(channelDes === ""){
        return "";
    }
    return channelDes;
  }

  getAddingFeedOwner(addingchannel){
    console.log("getAddingFeedOwner addingchannel",addingchannel);
    let ownerName = "common.obtain";
    let feed = addingchannel||"";
    if (feed != "")
      ownerName = addingchannel["ownerName"]
    return "@"+ownerName;
  }

  getAddingFeedDes(addingchannel){
    let description = ""
    let feed = addingchannel||"";
    if (feed != "")
      description = addingchannel["feedDes"]
    return description;
  }


  createPost(){
    if(this.feedService.getConnectionStatus() != 0){
      this.native.toastWarn('common.connectionError');
      return;
    }

    let bindingServer = this.feedService.getBindingServer();
    if (bindingServer == null || bindingServer == undefined){
      this.native.navigateForward(['bindservice/learnpublisheraccount'],"");
      return ;
    }

    let nodeId = bindingServer["nodeId"];
    if(this.checkServerStatus(nodeId) != 0){
      this.native.toastWarn('common.connectionError1');
      return;
    }


    if (!this.feedService.checkBindingServerVersion(()=>{
      this.feedService.hideAlertPopover();
    })) return;

    this.removeSubscribe();

    if(this.feedService.getMyChannelList().length === 0){
      this.native.navigateForward(['/createnewfeed'],"");
      return;
    }

    let currentFeed = this.feedService.getCurrentFeed();
    if(currentFeed === null){
      let myFeed = this.feedService.getMyChannelList()[0];
      let currentFeed = {
        "nodeId": myFeed.nodeId,
        "feedId": myFeed.id
      }
      this.feedService.setCurrentFeed(currentFeed);
      this.storageService.set("feeds.currentFeed",JSON.stringify(currentFeed));
    }
    this.native.navigateForward(["createnewpost"],"");
  }

}