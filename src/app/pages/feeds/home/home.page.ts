import { Component, OnInit, NgZone, ViewChild,ElementRef} from '@angular/core';
import { IonContent,ModalController,Platform,PopoverController} from '@ionic/angular';
import { IonTabs } from '@ionic/angular';
import { Events } from 'src/app/services/events.service';
import { FeedService } from 'src/app/services/FeedService';
import { MenuService } from 'src/app/services/MenuService';
import { FeedsPage } from '../feeds.page'
import { ThemeService } from 'src/app/services/theme.service';
import { UtilService } from 'src/app/services/utilService';
import { TranslateService } from "@ngx-translate/core";
import { NativeService } from 'src/app/services/NativeService';
import { IonInfiniteScroll } from '@ionic/angular';
import { AppService } from 'src/app/services/AppService';
import { LogUtils } from 'src/app/services/LogUtils';
import { ViewHelper } from 'src/app/services/viewhelper.service';
import { PopupProvider } from 'src/app/services/popup';
import { TitleBarComponent } from 'src/app/components/titlebar/titlebar.component';
import { TitleBarService } from 'src/app/services/TitleBarService';
import { StorageService } from 'src/app/services/StorageService';
// import { Web3Service } from '../../../services/Web3Service';
import { HttpService } from '../../../services/HttpService';
import { ApiUrl } from '../../../services/ApiUrl';
import { NFTContractControllerService } from 'src/app/services/nftcontract_controller.service';

import _ from 'lodash';
let TAG: string = "Feeds-home";
@Component({
  selector: 'app-home',
  templateUrl: './home.page.html',
  styleUrls: ['./home.page.scss'],
})

export class HomePage implements OnInit {
  @ViewChild(TitleBarComponent, { static: true }) titleBar: TitleBarComponent;
  @ViewChild(IonContent,{static:true}) content: IonContent;
  @ViewChild(IonInfiniteScroll,{static:true}) infiniteScroll: IonInfiniteScroll;

  myScrollContainer!: HTMLElement;

  public connectionStatus = 1;
  public postList: any = [];
  public nodeStatus:any={};
  public startIndex = 0;
  public pageNumber = 8;
  public totalData = [];
  public images = {};
  //public curPost:any = {};
  public styleObj:any = {width:""};

  public hideComment = true;

  // For comment component
  public postId = null;
  public nodeId = null;
  public channelId = null
  public channelAvatar = null;
  public channelName = null;
  public onlineStatus = null;

  public clientHeight:number = 0;
  public isLoadimage:any ={};

  public isLoadVideoiamge:any = {};
  public videoIamges:any ={};

  public postgridindex:number =0;

  public cacheGetBinaryRequestKey = "";
  public cachedMediaType = "";

  public maxTextSize = 240;

  public fullScreenmodal:any = "";

  //public curPostId:string = "";


  public popover:any = "";

  public curNodeId:string = "";

  public hideDeletedPosts:boolean = false;

  public isPress:boolean = false;

   /**
   * imgPercentageLoading
   */
    public isImgPercentageLoading:any = {};
    public imgPercent:number = 0;
    public imgRotateNum:any = {};
    /**
     * imgloading
     */
    public isImgLoading:any = {};
    public imgloadingStyleObj:any = {};
    public imgDownStatus:any = {};
    public imgDownStatusKey:string ="";
    public imgCurKey:string = "";


      /**
   * videoPercentageLoading
   */
    public isVideoPercentageLoading:any = {};
    public videoPercent:number = 0;
    public videoRotateNum:any = {};
       /**
        * videoloading
        */
    public isVideoLoading:any = {};
    public videoloadingStyleObj:any = {};
    public videoDownStatus:any = {};
    public videoDownStatusKey:string ="";
    public videoCurKey:string = "";

    public roundWidth:number = 40;

    public isAndroid:boolean = true;

    public tabType:string ="feeds";

    public pasarList:any = [];

    public menuType:string = "CollectionsPage.onSale";

  constructor(
    private platform: Platform,
    private elmRef: ElementRef,
    private feedspage: FeedsPage,
    private tabs: IonTabs,
    private events: Events,
    private zone: NgZone,
    private feedService :FeedService,
    public theme:ThemeService,
    private translate:TranslateService,
    private native:NativeService,
    private menuService: MenuService,
    public appService:AppService,
    public modalController: ModalController,
    private logUtils: LogUtils,
    public popupProvider:PopupProvider,
    public popoverController:PopoverController,
    private viewHelper: ViewHelper,
    private titleBarService: TitleBarService,
    private storageService:StorageService,
    // private web3Service:Web3Service,
    private httpService:HttpService,
    private nftContractControllerService: NFTContractControllerService) {
    }

  initPostListData(scrollToTop:boolean){
        this.infiniteScroll.disabled =false;
        this.startIndex = 0;
        this.totalData = this.sortPostList();
        if (this.totalData.length - this.pageNumber > 0){
          this.postList = this.totalData.slice(0,this.pageNumber);
          this.startIndex++;
          this.infiniteScroll.disabled =false;
         } else {
          this.postList =  this.totalData;
          this.infiniteScroll.disabled =true;
        }
        if(scrollToTop){
          this.scrollToTop(1);
        }
        this.isLoadimage ={};
        this.isLoadVideoiamge ={};
        this.refreshImage(0);
        this.initnodeStatus(this.postList);
  }

  sortPostList(){
   let postList = this.feedService.getPostList() || [];
   this.hideDeletedPosts = this.feedService.getHideDeletedPosts();
   if(!this.hideDeletedPosts){
    postList = _.filter(postList ,(item:any)=> { return item.post_status != 1; });
   }
   return postList;
  }

  refreshPostList(){
    if(this.startIndex === 0){
      this.initPostListData(false);
      return;
    }
    this.totalData = this.sortPostList();
    if (this.totalData.length - this.pageNumber*this.startIndex > 0){
      this.postList = this.totalData.slice(0,(this.startIndex)*this.pageNumber);
      this.infiniteScroll.disabled =false;
     } else {
      this.postList =  this.totalData;
      this.infiniteScroll.disabled =true;
    }
    this.isLoadimage ={};
    this.isLoadVideoiamge ={};
    this.refreshImage(0);
    this.initnodeStatus(this.postList);
  }

  addConnectionChangedEvent(){
    this.events.subscribe(FeedsEvent.PublishType.connectionChanged,(status)=>{
      this.zone.run(() => {
        this.connectionStatus = status;
      });
    });
  }

  ionViewWillEnter() {
    if(this.platform.is("ios")){
        this.isAndroid = false;
    }
    this.pasarList = this.feedService.getPasarList();
    this.pasarList = _.sortBy(this.pasarList,(item:any)=> {
      return - Number(item.createTime);
    });
    this.connectionStatus = this.feedService.getConnectionStatus();
    this.styleObj.width = (screen.width - 105)+'px';
    this.clientHeight =screen.availHeight;
    this.initPostListData(true);
    this.refreshImage(0);
    this.initnodeStatus(this.postList);

    this.events.subscribe(FeedsEvent.PublishType.addConnectionChanged,()=>{
           this.addConnectionChangedEvent();
    });

    this.events.subscribe(FeedsEvent.PublishType.addRpcRequestError,()=>{
          this.events.subscribe(FeedsEvent.PublishType.rpcRequestError,()=>{
            this.native.hideLoading();
          })
    });


    this.events.subscribe(FeedsEvent.PublishType.addRpcResponseError,()=>{
      this.events.subscribe(FeedsEvent.PublishType.rpcResponseError,()=>{
        this.native.hideLoading();
      })
});

    this.events.subscribe(FeedsEvent.PublishType.unfollowFeedsFinish, () => {
      this.zone.run(() => {
          this.hideDeletedPosts = this.feedService.getHideDeletedPosts();
          this.refreshPostList();
      });
    });

    this.events.subscribe(FeedsEvent.PublishType.clearHomeEvent,()=>{
            this.events.unsubscribe(FeedsEvent.PublishType.hideDeletedPosts);
            this.events.unsubscribe(FeedsEvent.PublishType.createpost);
            this.events.unsubscribe(FeedsEvent.PublishType.addBinaryEvevnt);
            this.events.unsubscribe(FeedsEvent.PublishType.updateTab);
            this.events.unsubscribe(FeedsEvent.PublishType.unfollowFeedsFinish);
            this.clearData();
            this.events.unsubscribe(FeedsEvent.PublishType.clearHomeEvent);
            this.events.unsubscribe(FeedsEvent.PublishType.addConnectionChanged);
            this.events.unsubscribe(FeedsEvent.PublishType.addRpcRequestError);
            this.events.unsubscribe(FeedsEvent.PublishType.addRpcResponseError);
    });

   this.events.subscribe(FeedsEvent.PublishType.updateTab,(isInit)=>{
    this.zone.run(()=>{
      this.hideDeletedPosts = this.feedService.getHideDeletedPosts();
      if(isInit){
        this.initPostListData(true);
        return;
      }
      this.refreshPostList();
     });
    });

 this.events.subscribe(FeedsEvent.PublishType.createpost,()=>{
          this.clearData();
 });

 this.events.subscribe(FeedsEvent.PublishType.hideDeletedPosts,()=>{
  this.zone.run(()=>{
   this.hideDeletedPosts = this.feedService.getHideDeletedPosts();
   this.refreshPostList();
  });
});

 this.addCommonEvents();

 this.addBinaryEvevnt();
 this.events.subscribe(FeedsEvent.PublishType.addBinaryEvevnt, ()=>{
      if(this.tabType === "pasar"){
        this.pasarList = this.feedService.getPasarList();
        this.pasarList = _.sortBy(this.pasarList,(item:any)=> {
          return - Number(item.createTime);
        });
      }
      this.addCommonEvents();
      this.addBinaryEvevnt();
 });
}

addCommonEvents(){

  this.events.subscribe(FeedsEvent.PublishType.nftCancelOrder,(assetItem)=>{
    let saleOrderId = assetItem.saleOrderId;
    let sellerAddr = assetItem.sellerAddr;
    console.log("=======sellerAddr======"+sellerAddr);
    console.log("=======typeof(sellerAddr)====="+typeof(sellerAddr));
    this.pasarList =  _.filter(this.pasarList,(item)=>{
      console.log("=======item.sellerAddr=value====="+item.sellerAddr);
      console.log("=======item.sellerAddr======"+typeof(item.sellerAddr));

      return !(item.saleOrderId===saleOrderId&&item.sellerAddr===sellerAddr)}
    );
    this.feedService.setPasarList(this.pasarList);
    this.feedService.setData("feed.nft.pasarList",JSON.stringify(this.pasarList));


    let createAddr = this.nftContractControllerService.getAccountAddress();
    if(sellerAddr === createAddr){
      //add created
      assetItem["fixedAmount"] = "";
      let allCreatedList = this.feedService.getOwnCreatedList();
      let clist = allCreatedList[createAddr] || [];
          clist.push(assetItem)
      this.feedService.setOwnCreatedList(allCreatedList);
      this.feedService.setData("feed.nft.own.created.list",JSON.stringify(allCreatedList));

      let allOnSaleList = this.feedService.getOwnOnSaleList();
      let oList = allOnSaleList[createAddr] || [];
      oList =  _.filter(oList,(item)=>{
        return item.saleOrderId!=saleOrderId; }
      );
      this.feedService.setOwnOnSaleList(allOnSaleList);
      this.feedService.setData("feed.nft.own.onSale.list",JSON.stringify(allOnSaleList));
    }



  });
  this.events.subscribe(FeedsEvent.PublishType.updateTitle,()=>{
    this.initTitleBar();
  });

  this.addConnectionChangedEvent();

  this.events.subscribe(FeedsEvent.PublishType.friendConnectionChanged, (friendConnectionChangedData: FeedsEvent.FriendConnectionChangedData)=>{
    this.zone.run(()=>{
      let nodeId = friendConnectionChangedData.nodeId;
      let connectionStatus = friendConnectionChangedData.connectionStatus;
      this.nodeStatus[nodeId] = connectionStatus;
    });
  });

 this.events.subscribe(FeedsEvent.PublishType.editPostFinish,()=>{
  this.zone.run(()=>{
    this.refreshPostList();
  });
 });

 this.events.subscribe(FeedsEvent.PublishType.deletePostFinish,()=>{
  this.zone.run(()=>{
    this.native.hideLoading();
    this.refreshPostList();
  });
 });

  this.events.subscribe(FeedsEvent.PublishType.rpcRequestError, () => {
    this.native.hideLoading();
  });

  this.events.subscribe(FeedsEvent.PublishType.rpcResponseError, () => {
    this.zone.run(() => {
      this.native.hideLoading();
    });
  });

 this.events.subscribe(FeedsEvent.PublishType.rpcRequestSuccess, () => {
  this.zone.run(() => {
    this.refreshPostList();
    this.hideComponent(null);
    this.native.hideLoading();
    this.native.toast_trans("CommentPage.tipMsg1");
  });
 });
}

addBinaryEvevnt(){
  this.events.subscribe(FeedsEvent.PublishType.streamGetBinaryResponse, () => {
    this.zone.run(() => {
    });
  });

  this.events.subscribe(FeedsEvent.PublishType.getBinaryFinish, (getBinaryData: FeedsEvent.GetBinaryData) => {
    this.zone.run(() => {
      let key = getBinaryData.key;
      let value = getBinaryData.value;
      this.processGetBinaryResult(key, value);
    });
  });

  this.events.subscribe(FeedsEvent.PublishType.streamGetBinarySuccess, (getBinaryData: FeedsEvent.GetBinaryData) => {
    this.zone.run(() => {
      let nodeId = getBinaryData.nodeId;
      let key = getBinaryData.key;
      let value = getBinaryData.value;
      this.curNodeId = "";
      this.feedService.closeSession(nodeId);
      this.processGetBinaryResult(key, value);
    });
  });

  this.events.subscribe(FeedsEvent.PublishType.streamError, (streamErrorData: FeedsEvent.StreamErrorData) => {
    this.zone.run(() => {
      let nodeId = streamErrorData.nodeId;
      let error = streamErrorData.error;
      this.isImgPercentageLoading[this.imgDownStatusKey] = false;
      this.isImgLoading[this.imgDownStatusKey] = false;
      this.imgDownStatus[this.imgDownStatusKey] ="";

      this.isVideoPercentageLoading[this.videoDownStatusKey] = false;
      this.isVideoLoading[this.videoDownStatusKey] = false;
      this.videoDownStatus[this.videoDownStatusKey] = "";

      this.pauseAllVideo();
      this.feedService.handleSessionError(nodeId, error);
      this.curNodeId = "";
    });
  });

  this.events.subscribe(FeedsEvent.PublishType.streamProgress,(streamProgressData: FeedsEvent.StreamProgressData)=>{
    this.zone.run(() => {
      let progress = streamProgressData.progress;
      if(this.cachedMediaType ==='video'&&this.videoDownStatus[this.videoDownStatusKey]==="1"){
        this.videoPercent = progress;
        if(progress<100){
          this.videoRotateNum["transform"] = "rotate("+(18/5)*progress+"deg)";
         }else{
         if(progress === 100){
          this.videoRotateNum["transform"] = "rotate("+(18/5)*progress+"deg)";
         }
        }
        return;
      }

      if(this.cachedMediaType ==='img'&&this.imgDownStatus[this.imgDownStatusKey]==="1"){
        this.imgPercent = progress;
        if(progress<100){
          this.imgRotateNum["transform"] = "rotate("+(18/5)*progress+"deg)";
         }else{
         if(progress === 100){
          this.imgRotateNum["transform"] = "rotate("+(18/5)*progress+"deg)";
         }
        }
      }
    });
  })

  this.events.subscribe(FeedsEvent.PublishType.streamOnStateChangedCallback, (streamStateChangedData: FeedsEvent.StreamStateChangedData) => {
    this.zone.run(() => {
      let nodeId = streamStateChangedData.nodeId;
      let state = streamStateChangedData.streamState;

      if (this.cacheGetBinaryRequestKey == "")
        return;

      if (state === FeedsData.StreamState.CONNECTED){
        this.feedService.getBinary(nodeId, this.cacheGetBinaryRequestKey,this.cachedMediaType);
      }
    });
  });

  this.events.subscribe(FeedsEvent.PublishType.openRightMenu,()=>{

        this.isImgPercentageLoading[this.imgDownStatusKey] = false;
        this.isImgLoading[this.imgDownStatusKey] = false;
        this.imgDownStatus[this.imgDownStatusKey] ="";

        this.isVideoPercentageLoading[this.videoDownStatusKey] = false;
        this.isVideoLoading[this.videoDownStatusKey] = false;
        this.videoDownStatus[this.videoDownStatusKey] = "";

         this.hideFullScreen();
         this.pauseAllVideo();
         if(this.curNodeId!=""){
          this.feedService.closeSession(this.curNodeId);
          this.curNodeId = "";
         }
  });

  this.events.subscribe(FeedsEvent.PublishType.streamClosed,(nodeId)=>{

    this.isImgPercentageLoading[this.imgDownStatusKey] = false;
    this.isImgLoading[this.imgDownStatusKey] = false;
    this.imgDownStatus[this.imgDownStatusKey] ="";

    this.isVideoPercentageLoading[this.videoDownStatusKey] = false;
    this.isVideoLoading[this.videoDownStatusKey] = false;
    this.videoDownStatus[this.videoDownStatusKey] = "";

    let mNodeId = nodeId || "";
    this.pauseAllVideo();
    this.curNodeId = "";
    if (mNodeId != ""){
      this.feedService.closeSession(mNodeId);
    }
  });
}

 ionViewWillLeave(){
   this.events.unsubscribe(FeedsEvent.PublishType.addConnectionChanged);
   this.events.unsubscribe(FeedsEvent.PublishType.addRpcRequestError);
   this.events.unsubscribe(FeedsEvent.PublishType.addRpcResponseError);
   this.events.unsubscribe(FeedsEvent.PublishType.hideDeletedPosts);
   this.events.unsubscribe(FeedsEvent.PublishType.createpost);
   this.events.unsubscribe(FeedsEvent.PublishType.unfollowFeedsFinish);
   this.clearData();
}

clearData(){

  let value =  this.popoverController.getTop()["__zone_symbol__value"] || "";
  if(value!=""){
    this.popoverController.dismiss();
    this.popover = null;
  }

  if(this.curNodeId!=""){
    this.feedService.closeSession(this.curNodeId);
  }
   this.events.unsubscribe(FeedsEvent.PublishType.nftCancelOrder);
   this.events.unsubscribe(FeedsEvent.PublishType.updateTitle);
   this.events.unsubscribe(FeedsEvent.PublishType.connectionChanged);
   this.events.unsubscribe(FeedsEvent.PublishType.friendConnectionChanged);
   this.events.unsubscribe(FeedsEvent.PublishType.editPostFinish);
   this.events.unsubscribe(FeedsEvent.PublishType.deletePostFinish);

   this.events.unsubscribe(FeedsEvent.PublishType.getBinaryFinish);

   this.events.unsubscribe(FeedsEvent.PublishType.streamGetBinaryResponse);
   this.events.unsubscribe(FeedsEvent.PublishType.streamGetBinarySuccess);
   this.events.unsubscribe(FeedsEvent.PublishType.streamError);
   this.events.unsubscribe(FeedsEvent.PublishType.streamOnStateChangedCallback);
   this.events.unsubscribe(FeedsEvent.PublishType.streamProgress);
   this.events.unsubscribe(FeedsEvent.PublishType.streamClosed);

   this.events.unsubscribe(FeedsEvent.PublishType.rpcRequestError);
   this.events.unsubscribe(FeedsEvent.PublishType.rpcResponseError);
   this.events.unsubscribe(FeedsEvent.PublishType.rpcRequestSuccess);
   this.events.unsubscribe(FeedsEvent.PublishType.openRightMenu);

   this.removeImages();
   this.removeAllVideo();
   this.isLoadimage ={};
   this.isLoadVideoiamge ={};
   this.curNodeId = "";
   this.isImgPercentageLoading[this.imgDownStatusKey] = false;
   this.isImgLoading[this.imgDownStatusKey] = false;
   this.imgDownStatus[this.imgDownStatusKey] ="";
   this.imgPercent = 0;
   this.imgRotateNum["transform"] = "rotate(0deg)";

   this.isVideoPercentageLoading[this.videoDownStatusKey] = false;
   this.isVideoLoading[this.videoDownStatusKey] = false;
   this.videoDownStatus[this.videoDownStatusKey] = "";
   this.videoPercent = 0;
   this.videoRotateNum["transform"] = "rotate(0deg)";


   this.hideFullScreen();
   this.native.hideLoading();
}

  ionViewDidLeave() {
    this.events.unsubscribe(FeedsEvent.PublishType.addBinaryEvevnt);
    this.events.unsubscribe(FeedsEvent.PublishType.updateTab);
  }

  ionViewWillUnload() {
  }

  getChannel(nodeId:string, channelId:number):any{
    return this.feedService.getChannelFromId(nodeId,channelId);
  }

  getContentText(content: string): string{
    return this.feedService.parsePostContentText(content);
  }

  getContentShortText(post:any): string{
    let   content = post.content;
    let  text = this.feedService.parsePostContentText(content) || "";
    return text.substring(0,180)+"...";
  }

  getPostContentTextSize(content:string){
   let text = this.feedService.parsePostContentText(content);
   let size = UtilService.getSize(text);
   return size;
  }

  getContentImg(content: any): string{
    return this.feedService.parsePostContentImg(content);
  }

  getChannelOwnerName(nodeId, channelId): string{
    let channel = this.getChannel(nodeId, channelId) || "";
    if (channel === "") {
      return "";
    } else {
      return UtilService.moreNanme(channel["owner_name"],40);
    }
  }

  ngOnInit() {
    this.myScrollContainer = this.elmRef.nativeElement.querySelector('#my-scroll-container');
  }

  like(nodeId:string, channelId:number, postId:number){
    if(this.feedService.getConnectionStatus() != 0){
      this.native.toastWarn('common.connectionError');
      return;
    }

    if(this.checkServerStatus(nodeId) != 0){
      this.native.toastWarn('common.connectionError1');
      return;
    }

    let post = this.feedService.getPostFromId(nodeId, channelId, postId);
    if (!this.feedService.checkPostIsAvalible(post))
      return;

    if (this.checkMyLike(nodeId,channelId,postId)){
      this.feedService.postUnlike(nodeId,Number(channelId),Number(postId),0);
      return ;
    }

    this.feedService.postLike(nodeId,Number(channelId),Number(postId),0);
  }

  navTo(nodeId:string, channelId:number,postId:number){
    this.pauseVideo(nodeId+"-"+channelId+"-"+postId);
    this.clearData();
    this.native.getNavCtrl().navigateForward(['/channels', nodeId, channelId]);

  }

  navToPostDetail(nodeId:string, channelId:number, postId:number,event?:any){
    let post = this.feedService.getPostFromId(nodeId, channelId, postId);
    if (!this.feedService.checkPostIsAvalible(post))
      return;

    if(this.isPress){
       this.isPress =false;
      return;
    }
    event = event || "";
    if(event!=""){
     let e = event||window.event; //兼容IE8
     let target = e.target||e.srcElement;  //判断目标事件
     if(target.tagName.toLowerCase()=="span"){
      let url = target.textContent || target.innerText;
      this.native.clickUrl(url,event);
      return;
     }
    }
    this.pauseVideo(nodeId+"-"+channelId+"-"+postId);
    this.clearData();
    this.native.getNavCtrl().navigateForward(['/postdetail',nodeId, channelId,postId]);
  }

  checkMyLike(nodeId: string, channelId: number, postId: number){
    return this.feedService.checkMyLike(nodeId, channelId, postId);
  }

  exploreFeeds(){
    this.tabs.select("search");
    this.feedspage.search();
  }

  parseAvatar(nodeId: string, channelId: number): string{
    let channel = this.getChannel(nodeId, channelId);
    if (channel == null || channel == undefined)
      return "";
    return this.feedService.parseChannelAvatar(channel.avatar);
  }

  handleDisplayTime(createTime:number){
    let obj = UtilService.handleDisplayTime(createTime);
    if(obj.type === 's'){
       return this.translate.instant('common.just');
    }
    if(obj.type==='m'){
      if(obj.content === 1){
        return obj.content+this.translate.instant('HomePage.oneminuteAgo');
      }
      return obj.content+this.translate.instant('HomePage.minutesAgo');
    }
    if(obj.type==='h'){
      if(obj.content === 1){
        return obj.content+this.translate.instant('HomePage.onehourAgo');
      }
      return obj.content+this.translate.instant('HomePage.hoursAgo');
    }

    if(obj.type === 'day'){
      if(obj.content === 1){
        return this.translate.instant('common.yesterday');
      }
      return obj.content +this.translate.instant('HomePage.daysAgo');
    }
    return  obj.content;
  }

  menuMore(post:FeedsData.Post){
    if (!this.feedService.checkPostIsAvalible(post))
      return;
    let channel = this.getChannel(post.nodeId, post.channel_id);
    if (channel == null || channel == undefined)
      return ;
    let channelName = channel.name;
    this.pauseAllVideo();

    let isMine = this.checkChannelIsMine(post.nodeId, post.channel_id);
      if(isMine === 0 && post.post_status != 1){
        this.menuService.showHomeMenu(post.nodeId, Number(post.channel_id),channelName,Number(post.id));
      }else{
        this.menuService.showChannelMenu(post.nodeId, Number(post.channel_id),channelName,Number(post.id));
      }
  }

  getChannelName(nodeId: string, channelId: number): string{
    let channel = this.getChannel(nodeId, channelId) || "";
    if (channel == "")
       return "";
    return UtilService.moreNanme(channel.name);
  }

  checkServerStatus(nodeId: string){
    return this.feedService.getServerStatusFromId(nodeId);
  }

  initnodeStatus(arr){
    for(let index =0 ;index<arr.length;index++){
      let nodeId = arr[index]['nodeId'];
      let status = this.checkServerStatus(nodeId);
      this.nodeStatus[nodeId] = status;

      let post = arr[index];
      //this.getImage(post.nodeId, post.channel_id, post.id);
      this.feedService.readChannel(post.nodeId+post.channel_id);
    }
  }

  moreName(name:string){
    return UtilService.moreNanme(name);
  }

  loadData(event){
   let sId = setTimeout(() => {
      let arr = [];
       if(this.totalData.length - this.pageNumber*this.startIndex>0){
        arr = this.totalData.slice(this.startIndex*this.pageNumber,(this.startIndex+1)*this.pageNumber);
        this.startIndex++;
        this.zone.run(()=>{
        let len =this.postList.length-1;
        this.postList = this.postList.concat(arr);
        this.refreshImage(len);
        this.initnodeStatus(arr);
        event.target.complete();
        });

       }else{
        arr = this.totalData.slice(this.startIndex*this.pageNumber,this.totalData.length);
        this.zone.run(()=>{
            let len =this.postList.length-1;
            this.postList = this.postList.concat(arr);
            this.refreshImage(len-1);
            this.infiniteScroll.disabled =true;
            this.initnodeStatus(arr);
            event.target.complete();
        });

       }
      clearTimeout(sId);
    }, 500);
  }

  doRefresh(event){
    switch(this.tabType){
      case "feeds":
        let sId =  setTimeout(() => {
          this.images = {};
          this.infiniteScroll.disabled =false;
          this.startIndex = 0;
          this.totalData = this.sortPostList();
          if(this.totalData.length - this.pageNumber > 0){
            this.zone.run(()=>{
              this.postList = this.totalData.slice(0,this.pageNumber);
              this.startIndex++;
              this.infiniteScroll.disabled =false;
              this.isLoadimage ={};
              this.isLoadVideoiamge ={};
              this.refreshImage(0);
              this.initnodeStatus(this.postList);
              if(event!=null)
              event.target.complete();
            })

           }else{
             this.zone.run(()=>{
              this.postList = this.totalData;
              this.infiniteScroll.disabled =true;
              this.isLoadimage ={};
              this.isLoadVideoiamge ={};
              this.refreshImage(0);
              this.initnodeStatus(this.postList);
              if(event!=null)
              event.target.complete();
             })

          }
          clearTimeout(sId);
        },500);
        break;
      case "pasar":
        let sId1 = setTimeout(()=>{
          //let paserList = this.feedService.getPasarList();
           this.getPaserList();
          event.target.complete();
          clearTimeout(sId1);
        },500)
        break;
    }

  }

  scrollToTop(int) {
   let sid = setTimeout(() => {
      this.content.scrollToTop(1);
      clearTimeout(sid)
    }, int);
  }

  checkChannelIsMine(nodeId:string,channelId:number){
    if (this.feedService.checkChannelIsMine(nodeId,channelId))
      return 0;

    return 1;
  }

  showComment(nodeId:string,channelId:number, postId:number) {

    if(this.feedService.getConnectionStatus() != 0){
      this.native.toastWarn('common.connectionError');
      return;
    }

    if(this.checkServerStatus(nodeId) != 0){
      this.native.toastWarn('common.connectionError1');
      return;
    }

    let post = this.feedService.getPostFromId(nodeId, channelId, postId);
    if (!this.feedService.checkPostIsAvalible(post))
      return;

    this.pauseVideo(nodeId+"-"+channelId+"-"+postId);


    this.postId = postId;
    this.channelId = channelId;
    this.nodeId = nodeId;
    this.channelAvatar = this.parseAvatar(nodeId, channelId);
    this.channelName = this.getChannelName(nodeId, channelId);
    this.onlineStatus = this.nodeStatus[nodeId];
    this.hideComment = false;
  }

  hideComponent(event) {
    this.postId = null;
    this.channelId = null;
    this.nodeId = null;
    this.channelAvatar = null;
    this.channelName = null;
    this.onlineStatus = null;
    this.hideComment = true;
  }

  setVisibleareaImage(startPos:number){
    let postgridList = document.getElementsByClassName("post-grid");
    let postgridNum = document.getElementsByClassName("post-grid").length;
    for(let postgridindex=0;postgridindex<postgridNum;postgridindex++){
      let srcId = postgridList[postgridindex].getAttribute("id") || '';
      if(srcId!=""){
        let arr = srcId.split("-");
        let nodeId = arr[0];
        let channelId = arr[1];
        let postId = arr[2];
        let mediaType = arr[3];
        let id = nodeId+"-"+channelId+"-"+postId;
        //postImg
        if(mediaType === '1'){
          this.handlePsotImg(id,srcId,postgridindex);
        }
         if(mediaType === '2'){
          //video
          this.hanldVideo(id,srcId,postgridindex);
          }
      }
    }
  }

  ionViewDidEnter() {
    this.initTitleBar();
  }

  initTitleBar(){
    let title = this.translate.instant("FeedsPage.tabTitle1");
    this.titleBarService.setTitle(this.titleBar, title);
    this.titleBarService.setTitleBarMoreMemu(this.titleBar);
  }

  showBigImage(nodeId:string,channelId:number,postId:number){
    this.pauseAllVideo();
    this.zone.run(()=>{
        let imagesId = nodeId+"-"+channelId+"-"+postId+"postimg";
        let imagesObj = document.getElementById(imagesId);
        let  imagesWidth = imagesObj.clientWidth;
        let  imagesHeight = imagesObj.clientHeight;
        this.imgloadingStyleObj["position"] = "absolute";
        this.imgloadingStyleObj["left"] = (imagesWidth-this.roundWidth)/2+"px";
        this.imgloadingStyleObj["top"] = (imagesHeight-this.roundWidth)/2+"px";
        this.imgCurKey = nodeId+"-"+channelId+"-"+postId;
        this.isImgLoading[this.imgCurKey] = true;

        let contentVersion = this.feedService.getContentVersion(nodeId,channelId,postId,0);
        let thumbkey= this.feedService.getImgThumbKeyStrFromId(nodeId,channelId,postId,0,0);
        let key = this.feedService.getImageKey(nodeId,channelId,postId,0,0);
        if(contentVersion == "0"){
             key = thumbkey;
        }
        this.feedService.getData(key).then((realImg)=>{
          let img = realImg || "";
          if(img!=""){
            this.isImgLoading[this.imgCurKey] = false;
            this.viewHelper.openViewer(this.titleBar, realImg,"common.image","FeedsPage.tabTitle1",this.appService);
          }else{

            if(this.checkServerStatus(nodeId) != 0){
              this.isImgLoading[this.imgCurKey] = false;
              this.native.toastWarn('common.connectionError1');
              return;
            }

            if(this.isExitDown()){
              this.isImgLoading[this.imgCurKey] = false;
              this.openAlert();
              return;
            }

            this.imgDownStatusKey = nodeId+"-"+channelId+"-"+postId;
            this.cachedMediaType = "img";
            this.feedService.processGetBinary(nodeId, channelId, postId, 0, 0, FeedsData.MediaType.containsImg, key,
              (transDataChannel)=>{
                if (transDataChannel == FeedsData.TransDataChannel.SESSION){
                  this.cacheGetBinaryRequestKey = key;
                  this.imgDownStatus[this.imgDownStatusKey] = "1";
                  this.isImgLoading[this.imgDownStatusKey] = false;
                  this.isImgPercentageLoading[this.imgDownStatusKey] = true;
                  this.curNodeId = nodeId;
                  return;
                }

                if (transDataChannel == FeedsData.TransDataChannel.MESSAGE){
                  this.imgDownStatus[this.imgDownStatusKey] = "0";
                  this.curNodeId = "";
                  return;
                }
              },
              (err)=>{
                  this.isImgLoading[this.imgDownStatusKey] = false;
                  this.isImgPercentageLoading[this.imgDownStatusKey] = false;
                  this.imgDownStatus[this.imgDownStatusKey] = "";
                  this.curNodeId = "";
              });
          }
        });
    });
  }


 async handlePsotImg(id:string,srcId:string,rowindex:number){
    // 13 存在 12不存在
    let isload = this.isLoadimage[id] || "";
    let rpostimg = document.getElementById(id+"rpostimg");
    let postImage = document.getElementById(id+"postimg");
    try {
      if(id!=''&&postImage.getBoundingClientRect().top>=-100&&postImage.getBoundingClientRect().top<=this.clientHeight){
        if(isload === ""){
          //rpostimg.style.display = "none";
          this.isLoadimage[id] = "11";
          let arr = srcId.split("-");
          let nodeId =arr[0];
          let channelId:any = arr[1];
          let postId:any = arr[2];
         let key = this.feedService.getImgThumbKeyStrFromId(nodeId,channelId,postId,0,0);
         let nftOrdeId = this.isNftOrderId(nodeId, parseInt(channelId),parseInt(postId));
         let priceDes = "";
         let nftQuantity = "";
         if(nftOrdeId!=""){
          let nftOrder = await this.handlePrice(nftOrdeId);
          let price = "";
          if(nftOrder != null){
            nftQuantity = nftOrder[4];
            price = nftOrder[5];
          }
          if(price!=""){
            priceDes = this.nftContractControllerService.transFromWei(price.toString())+" ELA/ETHSC";
          }
         }

         this.feedService.getData(key).then((imagedata)=>{
              let image = imagedata || "";
              if(image!=""){
                this.isLoadimage[id] ="13";
                postImage.setAttribute("src",image);
                if(nftOrdeId != ""&&priceDes!=""){
                  let  imagesWidth = postImage.clientWidth;
                  let  homebidfeedslogo = document.getElementById(id+"homebidfeedslogo");
                  homebidfeedslogo.style.left=(imagesWidth-90)/2+"px";
                  homebidfeedslogo.style.display="block";

                  let homebuy =  document.getElementById(id+"homebuy");
                  let  homeNftPrice  = document.getElementById(id+"homeNftPrice");
                  let  homeNftQuantity  = document.getElementById(id+"homeNftQuantity");
                  homeNftPrice.innerText = priceDes;
                  homeNftQuantity.innerText = nftQuantity;
                  homebuy.style.display="block";
                }

                rpostimg.style.display = "block";

              }else{
                this.isLoadimage[id] ="12";
                rpostimg.style.display = 'none';
              }
            }).catch((reason)=>{
              rpostimg.style.display = 'none';
              this.logUtils.loge("Excute 'handlePsotImg' in home page is error , get image data error, error msg is "+JSON.stringify(reason),TAG);
            })
        }

      }else{
        let postImageSrc = postImage.getAttribute("src") || "";
         if(postImage.getBoundingClientRect().top<-100&&this.isLoadimage[id]==="13"&&postImageSrc!=""){
          this.isLoadimage[id] = "";
          postImage.setAttribute("src","assets/images/loading.png");
      }
      }
    } catch (error) {
        this.isLoadimage[id] = "";
    }
  }

  hanldVideo(id:string,srcId:string,rowindex:number){

    let  isloadVideoImg  = this.isLoadVideoiamge[id] || "";
    let  vgplayer = document.getElementById(id+"vgplayer");
    let  video:any = document.getElementById(id+"video") || "";
    let  source:any = document.getElementById(id+"source") || "";
    let arr = srcId.split("-");
    let nodeId =arr[0];
    let channelId:any = arr[1];
    let postId:any = arr[2];
    let  downStatus = this.videoDownStatus[id] || "";
    if(id!=""&&source!=""&&downStatus===''){
       this.pauseVideo(id);
    }
    try {
      if(id!=''&&video.getBoundingClientRect().top>=-100&&video.getBoundingClientRect().top<=this.clientHeight){
        if(isloadVideoImg===""){
          this.isLoadVideoiamge[id] = "11";
          //vgplayer.style.display = "none";
          let arr = srcId.split("-");
          let nodeId =arr[0];
          let channelId:any = arr[1];
          let postId:any = arr[2];
          let key = this.feedService.getVideoThumbStrFromId(nodeId,channelId,postId,0);
          this.feedService.getData(key).then((imagedata)=>{
              let image = imagedata || "";
              if(image!=""){
                this.isLoadVideoiamge[id] = "13";
                video.setAttribute("poster",image);
                //vgplayer.style.display = "block";
                //video.
                this.setFullScreen(id);
                this.setOverPlay(id,srcId);
              }else{
                this.isLoadVideoiamge[id] = "12";
                video.style.display='none';
                vgplayer.style.display = 'none';
              }
            }).catch((reason)=>{
              video.style.display='none';
              vgplayer.style.display = 'none';
              this.isLoadVideoiamge[id] = "";
              this.logUtils.loge("Excute 'hanldVideo' in home page is error , get image data error, error msg is "+JSON.stringify(reason),TAG);
            });
        }

      }else{
        let postSrc =  video.getAttribute("poster") || "";
        if(video.getBoundingClientRect().top<-100&&this.isLoadVideoiamge[id]==="13"&&postSrc!="assets/images/loading.png"){
          video.setAttribute("poster","assets/images/loading.png");
          let sourcesrc =  source.getAttribute("src") || "";
          if(sourcesrc  != ""){
            //video.pause();
            source.removeAttribute("src");
          }
          this.isLoadVideoiamge[id]="";
        }
      }
    } catch (error) {
         this.isLoadVideoiamge[id]="";
    }
  }

  ionScroll(){
    this.native.throttle(this.setVisibleareaImage(this.postgridindex),200,this,true);
  }


  refreshImage(startPos:number){
    let sid = setTimeout(()=>{
        this.postgridindex = startPos;
        this.setVisibleareaImage(startPos);
        clearTimeout(sid);
     },0);
  }

  pauseVideo(id:string){

    let videoElement:any = document.getElementById(id+'video') || "";
    let source:any = document.getElementById(id+'source') || "";
    if(source!=""){
      if(!videoElement.paused){  //判断是否处于暂停状态
        videoElement.pause();
      }
    }
  }

  pauseAllVideo(){
    let videoids = this.isLoadVideoiamge;
    for(let id  in videoids){
      let value = videoids[id] || "";
      if(value === "13"){
        let  downStatus = this.videoDownStatus[id] || "";
        if(downStatus === ""){
          this.pauseVideo(id);
        }
      }
    }
  }

  removeAllVideo(){
    let videoids = this.isLoadVideoiamge;
    for(let id  in videoids){
      let value = videoids[id] || "";
      if(value === "13"){
        let videoElement:any = document.getElementById(id+'video') || "";
        if(videoElement!=""){
          //videoElement.setAttribute('poster',""); // empty source
        }
        let source:any = document.getElementById(id+'source') || "";
        if(source!=""){
          let sourcesrc =  source.getAttribute("src") || "";
          if(source!=""&&sourcesrc!=""){
            source.removeAttribute('src'); // empty source
            // let sid=setTimeout(()=>{
            //   videoElement.load();
            //   clearTimeout(sid);
            // },10)
          }
        }
      }
    }
  }

  removeClass(elem, cls){
    //if(hasClass(elem, cls)){
        var newClass = ' ' + elem.className.replace(/[\t\r\n]/g, '') + ' ';
        while(newClass.indexOf(' ' + cls + ' ') >= 0){
            newClass = newClass.replace(' ' + cls + ' ', ' ');
        }
        elem.className = newClass.replace(/^\s+|\s+$/g, '');
    //}
 }

  setFullScreen(id:string){
    let vgfullscreen = document.getElementById(id+"vgfullscreenhome");
    vgfullscreen.onclick=()=>{
      this.pauseVideo(id);
      let postImg:string = document.getElementById(id+"video").getAttribute("poster");
      let videoSrc:string = document.getElementById(id+"source").getAttribute("src");
      this.fullScreenmodal = this.native.setVideoFullScreen(postImg,videoSrc);
    }
 }

 hideFullScreen(){
   if(this.fullScreenmodal != ""){
     this.modalController.dismiss();
     this.fullScreenmodal = "";
   }
 }

 removeImages(){
  let iamgseids = this.isLoadimage;
  for(let id  in iamgseids){
    let value = iamgseids[id] || "";
    if(value === "13"){
      let imgElement:any = document.getElementById(id+'post-img') || "";
           if(imgElement!=""){
            imgElement.removeAttribute('src'); // empty source
           }
      }
    }
  }


  setOverPlay(id:string,srcId:string){
    let vgoverlayplay:any = document.getElementById(id+"vgoverlayplayhome") || "";
    let source:any = document.getElementById(id+"source") || "";
    if(vgoverlayplay!=""){
     vgoverlayplay.onclick = ()=>{
      this.zone.run(()=>{
        let sourceSrc = source.getAttribute("src") || "";
         if(sourceSrc === ""){
          this.getVideo(id,srcId);
         }
      });
     }
    }
  }

  getVideo(id:string,srcId:string){
    let arr = srcId.split("-");
    let nodeId =arr[0];
    let channelId:any = arr[1];
    let postId:any = arr[2];
    let videoId = nodeId+"-"+channelId+"-"+postId+"vgplayer";
    let videoObj = document.getElementById(videoId);
    let  videoWidth = videoObj.clientWidth;
    let  videoHeight = videoObj.clientHeight;
    this.videoloadingStyleObj["z-index"] = 999;
    this.videoloadingStyleObj["position"] = "absolute";
    this.videoloadingStyleObj["left"] = (videoWidth-this.roundWidth)/2+"px";
    this.videoloadingStyleObj["top"] = (videoHeight-this.roundWidth)/2+"px";
    this.videoCurKey = nodeId+"-"+channelId+"-"+postId;
    this.isVideoLoading[this.videoCurKey] = true;
    let key = this.feedService.getVideoKey(nodeId,channelId,postId,0,0);
    this.feedService.getData(key).then((videoResult:string)=>{
      this.zone.run(()=>{
        let videodata = videoResult || "";
        if (videodata == ""){

          if(this.checkServerStatus(nodeId) != 0){
            this.isVideoLoading[this.videoCurKey] = false;
            this.pauseVideo(id);
            this.native.toastWarn('common.connectionError1');
            return;
          }

          if(this.isExitDown()){
            this.isVideoLoading[this.videoCurKey] = false;
            this.pauseVideo(id);
            this.openAlert();
            return;
          }
          this.videoDownStatusKey = nodeId+"-"+channelId+"-"+postId;

          this.cachedMediaType = "video";
          this.feedService.processGetBinary(nodeId, channelId, postId, 0, 0, FeedsData.MediaType.containsVideo, key,
            (transDataChannel)=>{
              this.cacheGetBinaryRequestKey = key;
              if (transDataChannel == FeedsData.TransDataChannel.SESSION){
                this.videoDownStatus[this.videoDownStatusKey] = "1";
                this.isVideoLoading[this.videoDownStatus] = false;
                this.isVideoPercentageLoading[this.videoDownStatusKey] = true;
                this.curNodeId = nodeId;
                return;
              }

              if (transDataChannel == FeedsData.TransDataChannel.MESSAGE){
                this.videoDownStatus[this.videoDownStatusKey] = "0";
                //this.downStatusObj[id] = "1";
                //this.downProgressObj[id] = 0;
                this.curNodeId = "";
                return;
              }
            },
            (err)=>{
              this.videoDownStatus[this.videoDownStatusKey] = "";
              this.isVideoLoading[this.videoDownStatus] = false;
              this.isVideoPercentageLoading[this.videoDownStatusKey] = false;
              this.pauseVideo(id);
            });
          return;
        }
        this.isVideoLoading[this.videoCurKey] = false;
        this.loadVideo(id,videodata);
      })
    });
  }

  loadVideo(id:string,videodata:string){

    let source:any = document.getElementById(id+"source") || "";
    if(source === ""){
      return;
    }
    source.setAttribute("src",videodata);
    let vgoverlayplay:any = document.getElementById(id+"vgoverlayplayhome");
    let vgcontrol:any = document.getElementById(id+"vgcontrolshome");

    let video:any = document.getElementById(id+"video");
    video.addEventListener('ended',()=>{
       vgoverlayplay.style.display = "block";
       vgcontrol.style.display = "none";
    });

    video.addEventListener('pause',()=>{
      vgoverlayplay.style.display = "block";
      vgcontrol.style.display = "none";
   });

   video.addEventListener('play',()=>{
    vgcontrol.style.display = "block";
   });


   video.addEventListener('canplay',()=>{
        video.play();
   });
   video.load();
  }

  handleTotal(post:any){
    let videoThumbKey = post.content["videoThumbKey"] || "";
    let duration = 29;
    if(videoThumbKey != ""){
      duration = videoThumbKey["duration"] || 0;
    }
    return UtilService.timeFilter(duration);
  }

  processGetBinaryResult(key: string, value: string){
    if (key.indexOf("img")>-1){
      this.imgDownStatus[this.imgDownStatusKey] = "";
      this.isImgLoading[this.imgDownStatusKey] = false;
      this.isImgPercentageLoading[this.imgDownStatusKey] = false;
      this.imgPercent = 0;
      this.imgRotateNum["transform"] = "rotate(0deg)";
      this.cacheGetBinaryRequestKey = "";
      this.viewHelper.openViewer(this.titleBar, value, "common.image","FeedsPage.tabTitle1",this.appService);
    } else if (key.indexOf("video")>-1){
         this.videoDownStatus[this.videoDownStatusKey] = "";
         this.isVideoLoading[this.videoDownStatusKey] = false;
         this.isVideoPercentageLoading[this.videoDownStatusKey] = false;
         this.videoPercent = 0;
         this.videoRotateNum["transform"] = "rotate(0deg)";
         this.curNodeId="";
         let arr = this.cacheGetBinaryRequestKey.split("-");
         let nodeId =arr[0];
         let channelId:any = arr[1];
         let postId:any = arr[2];
         let id = nodeId+"-"+channelId+"-"+postId;
         this.cacheGetBinaryRequestKey = "";
         this.loadVideo(id,value);
    }
  }

  isExitDown(){

    if((JSON.stringify(this.videoDownStatus) == "{}")&&(JSON.stringify(this.imgDownStatus) == "{}")){
          return false;
    }

    for(let key in this.imgDownStatus) {
      if(this.imgDownStatus[key] != ""){
            return true;
      }
    }

    for(let key in this.videoDownStatus) {
      if(this.videoDownStatus[key] != ""){
            return true;
      }
    }

    return false;
  }

  openAlert(){
    this.popover = this.popupProvider.ionicAlert(
      this,
      // "ConfirmdialogComponent.signoutTitle",
      "",
      "common.downDes",
      this.cancel,
      'tskth.svg'
    );
  }

  cancel(that:any){
      if(this.popover!=null){
         this.popover.dismiss();
      }
  }

  pressContent(postContent:string){
    if(this.platform.is('ios')){
       this.isPress = true;
    }

    let text = this.feedService.parsePostContentText(postContent);
    this.native.copyClipboard(text).then(()=>{
      this.native.toast_trans("common.textcopied");
    }).catch(()=>{
    });
  }

  clickDashang(nodeId:string,channelId:number,postId:number){
    if(this.feedService.getConnectionStatus() != 0){
      this.native.toastWarn('common.connectionError');
      return;
    }

    let server = this.feedService.getServerbyNodeId(nodeId)|| {};
    let elaAddress = server["elaAddress"] || null;
    if (elaAddress == null){
      this.native.toast('common.noElaAddress');
      return;
    }
    this.pauseVideo(nodeId+"-"+channelId+"-"+postId);
    this.viewHelper.showPayPrompt(nodeId,channelId,elaAddress);
  }

  retry(nodeId: string, feedId: number, postId: number){
    this.feedService.republishOnePost(nodeId, feedId, postId);
  }

 async buy(post:any){
     this.native.showLoading("common.waitMoment").then(()=>{
          this.handleBuy(post);
     }).catch(()=>{
       this.native.hideLoading();
     })
  }

 async handleBuy(post:any){
    let nftOrderId = post.content.nftOrderId || "";
    if(nftOrderId != ""){
    //  let stickerContract = this.web3Service.getSticker();
    //  let pasarContract = this.web3Service.getPasar();
    //  let order = await pasarContract.methods.getOrderById(nftOrderId).call();
      let order = await this.nftContractControllerService.getPasar().getOrderById(nftOrderId);
      let tokenId = order[3];
      let tokenNum = order[4];
      // let tokenInfo = await stickerContract.methods.tokenInfo(tokenId).call();
      let tokenInfo = await this.nftContractControllerService.getSticker().tokenInfo(tokenId);
      let tokenUri = tokenInfo[3];
      let price = order[5];
      let saleOrderId = order[0];
      let orderState = order[2];
      let sellerAddr = order[7] || "";
      if(orderState==="1"){
        this.native.hideLoading();
        this.handleBuyNft(tokenUri,tokenId,saleOrderId,price,tokenNum,sellerAddr);
        return;
      }

      if(orderState==="2"){
        this.native.hideLoading();
        this.native.toast_trans("common.sold");
        return;
      }

      if(orderState==="3"){
        this.native.hideLoading();
        this.native.toast_trans("common.offTheShelf");
        return;
      }else{
        this.native.hideLoading();
      }
    }
  }

  clickTab(type:string){
    this.tabType = type;
    switch(type){
     case "feeds":
      this.infiniteScroll.disabled = false;
      this.refreshPostList();
       break;
     case "pasar":
      this.infiniteScroll.disabled = true;
      let value =  this.popoverController.getTop()["__zone_symbol__value"] || "";
      if(value!=""){
        this.popoverController.dismiss();
        this.popover = null;
      }

      if(this.curNodeId!=""){
        this.feedService.closeSession(this.curNodeId);
      }

      this.removeImages();
      this.removeAllVideo();
      this.isLoadimage ={};
      this.isLoadVideoiamge ={};
      this.curNodeId = "";
      this.isImgPercentageLoading[this.imgDownStatusKey] = false;
      this.isImgLoading[this.imgDownStatusKey] = false;
      this.imgDownStatus[this.imgDownStatusKey] ="";
      this.imgPercent = 0;
      this.imgRotateNum["transform"] = "rotate(0deg)";

      this.isVideoPercentageLoading[this.videoDownStatusKey] = false;
      this.isVideoLoading[this.videoDownStatusKey] = false;
      this.videoDownStatus[this.videoDownStatusKey] = "";
      this.videoPercent = 0;
      this.videoRotateNum["transform"] = "rotate(0deg)";

      this.hideFullScreen();
      this.native.hideLoading();
      let plist = this.feedService.getPasarList();
      if(plist.length===0){
        this.getPaserList();
        return;
      }
      this.pasarList = plist;
      this.pasarList = _.sortBy(this.pasarList,(item:any)=> {
        return - Number(item.createTime);
      });
     break;
    }
  }

  create(){

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

    this.pauseAllVideo();
    this.clearData();

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

  createNft(){
    this.native.navigateForward(['mintnft'],{});
  }

 async getPaserList(){
  this.feedService.setPasarList([]);
  this.pasarList = [];
  // let stickerContract = this.web3Service.getSticker();
  // let pasarContract = this.web3Service.getPasar();
  // let openOrderCount =  await pasarContract.methods.getOpenOrderCount().call();
  let openOrderCount =  await this.nftContractControllerService.getPasar().getOpenOrderCount();
  if(openOrderCount === '0'){
    this.feedService.setData("feed.nft.pasarList",JSON.stringify(this.pasarList));
  }else{
    for(let index = 0;index<openOrderCount;index++){
      this.pasarList.push(null);
    }
    for(let pIndex = 0;pIndex<openOrderCount;pIndex++){
      this.getOpenOrderByIndex(pIndex);
    }
  }
}

async getOpenOrderByIndex(index:any){
  // let  openOrder =  await pasarContract.methods.getOpenOrderByIndex(index).call();
  let openOrder =  await this.nftContractControllerService.getPasar().getOpenOrderByIndex(index);
  let tokenId = openOrder[3];
  let saleOrderId = openOrder[0];
  let tokenNum = openOrder[4];
  let price = openOrder[5];
  let tokenInfo = await this.nftContractControllerService.getSticker().tokenInfo(tokenId);
  let tokenUri = tokenInfo[3];
  let createTime = tokenInfo[7];
  console.log("===createTime===="+createTime);
  let sellerAddr = openOrder[7];
  this.handleFeedsUrl(tokenUri,tokenId,saleOrderId,price,tokenNum,sellerAddr,index,createTime);
}

handleBuyNft(feedsUri:string,tokenId:any,saleOrderId:string,price:any,tokenNum:any,sellerAddr:any){
  feedsUri  = feedsUri.replace("feeds:json:","");
  this.httpService.ajaxGet(ApiUrl.nftGet+feedsUri,false).then((result)=>{
  let type = result["type"] || "single";
  let royalties = result["royalties"] || "1";
  let quantity = tokenNum;
  let thumbnail = result["thumbnail"] || "";
  if(thumbnail === ""){
    thumbnail = result["image"];
  }
  let item = {
      "saleOrderId":saleOrderId,
      "tokenId":tokenId,
      "asset":result["image"],
      "name":result["name"],
      "description":result["description"],
      "fixedAmount":price,
      "kind":result["kind"],
      "type":type,
      "royalties":royalties,
      "quantity":quantity,
      "thumbnail":thumbnail,
      "sellerAddr":sellerAddr
  }
  item["showType"] = "buy";
  console.log("==home==buy==="+JSON.stringify(item));
  this.native.navigateForward(['bid'],{queryParams:item});
  }).catch(()=>{

  });
}

handleFeedsUrl(feedsUri:string,tokenId:any,saleOrderId:string,price:any,tokenNum:any,sellerAddr:any,pIndex:any,createTime:any){
  feedsUri  = feedsUri.replace("feeds:json:","");
  this.httpService.ajaxGet(ApiUrl.nftGet+feedsUri,false).then((result)=>{
  let type = result["type"] || "single";
  let royalties = result["royalties"] || "1";
  let quantity = tokenNum;
  let thumbnail = result["thumbnail"] || "";
  if(thumbnail === ""){
    thumbnail = result["image"];
  }
  let item = {
      "saleOrderId":saleOrderId,
      "tokenId":tokenId,
      "asset":result["image"],
      "name":result["name"],
      "description":result["description"],
      "fixedAmount":price,
      "kind":result["kind"],
      "type":type,
      "royalties":royalties,
      "quantity":quantity,
      "thumbnail":thumbnail,
      "sellerAddr":sellerAddr,
      "createTime":createTime*1000,
  }
  try{
     this.pasarList.splice(pIndex,1,item);
     this.pasarList = _.sortBy(this.pasarList,(item:any)=> {
      return - Number(item.createTime);
    });
    this.feedService.setPasarList(this.pasarList);
    this.feedService.setData("feed.nft.pasarList",JSON.stringify(this.pasarList));
  }catch(err){
   console.log("====err===="+JSON.stringify(err));
  }
  }).catch(()=>{

  });
}

clickAssetItem(assetitem:any){
  assetitem["showType"] = "buy";
  console.log("====assItem===="+JSON.stringify(assetitem));
  this.native.navigateForward(['bid'],{queryParams:assetitem});
}

isNftOrderId(nodeId:string,channelId:number,postId:number){

 let post =   _.find(this.postList,(item)=>{
     return (item.nodeId===nodeId&&item.channel_id === channelId && item.id === postId )
  }) || {};

  let nftOrderId = post.content.nftOrderId || "";
  if(nftOrderId != ""){
    return nftOrderId;
  }
  return "";
}

async handlePrice(nftOrdeId:any){
  let nftOrder = null;
  if(nftOrdeId != ""){
    // let pasarContract = this.web3Service.getPasar();
    try{
      // let order = await pasarContract.methods.getOrderById(nftOrdeId).call();
      let order = await this.nftContractControllerService.getPasar().getOrderById(nftOrdeId);
      nftOrder = order;
    }catch(err){
    }
  }
  return nftOrder;
}

clickMore(parm:any){
  let type = parm["type"];
  console.log("===type==="+type);
  let asstItem = parm["assetItem"];
  let accountAddress = this.nftContractControllerService.getAccountAddress();
  if(asstItem["sellerAddr"] === accountAddress){
     this.handleOnSale(asstItem);
  }else{
     this.handleShareOnShare(asstItem);
  }
}

handleOnSale(asstItem:any){
  this.menuService.showOnSaleMenu(asstItem);
}

handleShareOnShare(asstItem:any){
  this.menuService.showShareOnSaleMenu(asstItem);
}

}
