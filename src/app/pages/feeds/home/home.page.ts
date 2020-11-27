import { Component, OnInit, NgZone, ViewChild,ElementRef} from '@angular/core';
import { IonContent,ModalController} from '@ionic/angular';
import { Events,IonTabs} from '@ionic/angular';
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
import { PopupProvider } from 'src/app/services/popup';
let TAG: string = "Feeds-home";
@Component({
  selector: 'app-home',
  templateUrl: './home.page.html',
  styleUrls: ['./home.page.scss'],
})

export class HomePage implements OnInit {

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
  public curPost:any = {};
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

  public downProgressObj ={};
  public curPostId:string = "";
  public downStatusObj = {};

  public popover:any = "";

  public curNodeId:string = "";
  
  constructor(
   
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
    public popupProvider:PopupProvider) {
      
    }

  initPostListData(){
        this.infiniteScroll.disabled =false;
        this.startIndex = 0;
        this.totalData = this.feedService.getPostList() || [];
        if (this.totalData.length - this.pageNumber > this.pageNumber){
          this.postList = this.totalData.slice(this.startIndex,this.pageNumber);
          this.startIndex++;
          this.infiniteScroll.disabled =false;
         } else {
          this.postList =  this.totalData.slice(0,this.totalData.length);
          this.infiniteScroll.disabled =true;
        }
        this.scrollToTop(1);
        this.isLoadimage ={};
        this.isLoadVideoiamge ={};
        this.refreshImage(0);
        this.initnodeStatus(this.postList);
  }

  ionViewWillEnter() {
    //this.refreshImage(); 
    this.styleObj.width = (screen.width - 105)+'px';
    this.clientHeight =screen.availHeight;
    this.startIndex = 0;
    this.totalData = this.feedService.getPostList() || [];
    this.connectionStatus = this.feedService.getConnectionStatus();
    if(this.totalData.length - this.pageNumber > this.pageNumber) {
      this.postList = this.totalData.slice(this.startIndex,this.pageNumber);
      this.startIndex++;
      this.infiniteScroll.disabled =false;
    } else {
      this.postList = this.totalData.slice(0,this.totalData.length);
      this.infiniteScroll.disabled =true;
    }
    // this.zone.run(()=>{
      this.refreshImage(0);
      //this.scrollToTop(1);
      this.initnodeStatus(this.postList);
    // })
   
   this.events.subscribe("update:tab",(isInit)=>{
    if(isInit){
      this.initPostListData();
      return;
    }
    this.totalData = this.feedService.getPostList() || [];
    if (this.totalData.length - this.pageNumber > this.pageNumber){
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

   });

 this.events.subscribe("feeds:tabsendpost",()=>{
  this.downProgressObj = {};
  this.pauseAllVideo();
 });

 this.addCommonEvents();

 this.addBinaryEvevnt();
 this.events.subscribe("addBinaryEvevnt",()=>{
    this.addCommonEvents();
    this.addBinaryEvevnt();
 });
}

addCommonEvents(){

  this.events.subscribe("feeds:updateTitle",()=>{
    if(this.menuService.postDetail!=null){
      this.menuService.hideActionSheet();
      this.menuMore(this.curPost);
    }
  });
 
  this.events.subscribe('feeds:connectionChanged',(status)=>{
    this.zone.run(() => {
      this.connectionStatus = status;
    });
  });

  this.events.subscribe("feeds:friendConnectionChanged", (nodeId, status)=>{
    this.zone.run(()=>{
      this.nodeStatus[nodeId] = status;
    });
  });

 this.events.subscribe("feeds:editPostFinish",()=>{
  this.zone.run(()=>{
    this.totalData = this.feedService.getPostList() || [];
    if (this.totalData.length - this.pageNumber > this.pageNumber){
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

  });
 });

 this.events.subscribe("feeds:deletePostFinish",()=>{
  this.zone.run(()=>{
    this.native.hideLoading();
    this.totalData = this.feedService.getPostList() || [];
    if (this.totalData.length - this.pageNumber > this.pageNumber){
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

  });
 });

  this.events.subscribe('rpcRequest:error', () => {
    this.native.hideLoading();
  });

  this.events.subscribe('rpcResponse:error', () => {
    this.zone.run(() => {
      this.native.hideLoading();
    });
  });

 this.events.subscribe('rpcRequest:success', () => {
  this.zone.run(() => {

    this.totalData = this.feedService.getPostList() || [];
    if (this.totalData.length - this.pageNumber > this.pageNumber){
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
    this.hideComponent(null);
    this.native.hideLoading();
    this.native.toast_trans("CommentPage.tipMsg1");
  });
 });
}

addBinaryEvevnt(){
  this.events.subscribe('stream:getBinaryResponse', () => {
    this.zone.run(() => {
    });
  });

  this.events.subscribe('feeds:getBinaryFinish', (nodeId, key: string, value:string) => {
    this.zone.run(() => {
      this.downProgressObj[this.curPostId] = 0;
      this.curNodeId = "";
      this.downStatusObj[this.curPostId] = "";
      this.processGetBinaryResult(key, value);
      this.native.hideLoading();
    });
  });


  this.events.subscribe('stream:getBinarySuccess', (nodeId, key: string, value:string) => {
    this.zone.run(() => {
      this.native.hideLoading();
      this.downProgressObj[this.curPostId] = 0;
      this.downStatusObj[this.curPostId] = "";
      this.curNodeId = "";
      this.feedService.closeSession(nodeId);
      this.processGetBinaryResult(key, value);
    });
  });

  this.events.subscribe('stream:error', (nodeId, error) => {
    this.zone.run(() => {
      this.feedService.handleSessionError(nodeId, error);
      this.pauseAllVideo();
      this.native.hideLoading();
      this.downStatusObj[this.curPostId] = "";
      this.curNodeId = "";
      this.downProgressObj[this.curPostId] = 0;
    });
  });

  this.events.subscribe('stream:progress',(nodeId,progress)=>{
    this.zone.run(() => {
      this.downStatusObj[this.curPostId] = "3";
      this.downProgressObj[this.curPostId] = progress;
      if(this.cachedMediaType==="img"&&this.downStatusObj[this.curPostId]!=''){
        this.native.updateLoadingMsg(this.translate.instant("common.downloading")+" "+progress+"%");
      }
    });
  })
 
  this.events.subscribe('stream:onStateChangedCallback', (nodeId, state) => {
    this.zone.run(() => {
      if (this.cacheGetBinaryRequestKey == "")
        return;

      if (state === FeedsData.StreamState.CONNECTED){
        this.downStatusObj[this.curPostId] = "2";
        this.feedService.getBinary(nodeId, this.cacheGetBinaryRequestKey,this.cachedMediaType);
        if(this.cachedMediaType==="img"&&this.downStatusObj[this.curPostId]!=''){
             this.native.updateLoadingMsg(this.translate.instant("common.downloading"));
        }
      }
    });
  });

  this.events.subscribe('feeds:openRightMenu',()=>{
         this.curPostId ="";
         this.curNodeId = "";
         this.downProgressObj ={};
         this.downStatusObj = {};
         this.feedService.closeSession(this.nodeId);
         this.native.hideLoading();
         this.hideFullScreen();
         this.pauseAllVideo();
  });
  
}

 ionViewWillLeave(){
    this.events.unsubscribe("feeds:updateTitle");
    this.events.unsubscribe("feeds:connectionChanged");
    this.events.unsubscribe("feeds:postDataUpdate");
    this.events.unsubscribe("feeds:friendConnectionChanged");
    this.events.unsubscribe("feeds:publishPostFinish");
    this.events.unsubscribe("feeds:editPostFinish");
    this.events.unsubscribe("feeds:deletePostFinish");

    this.events.unsubscribe("feeds:getBinaryFinish");

    this.events.unsubscribe("stream:getBinaryResponse");
    this.events.unsubscribe("stream:getBinarySuccess");
    this.events.unsubscribe("stream:error");
    this.events.unsubscribe("stream:onStateChangedCallback");
    this.events.unsubscribe("stream:progress");

    this.events.unsubscribe("rpcRequest:error");
    this.events.unsubscribe("rpcResponse:error");
    this.events.unsubscribe("rpcRequest:success");
    this.events.unsubscribe('feeds:openRightMenu');
    this.events.unsubscribe('feeds:tabsendpost');

    this.removeImages();
    this.removeAllVideo();
    this.isLoadimage ={};
    this.isLoadVideoiamge ={};
    this.curPost={};
    this.downProgressObj ={};
    this.downStatusObj = {};
    if(this.curNodeId!=""){
      this.feedService.closeSession(this.curNodeId);
    }
    this.curPostId = "";
    this.curNodeId = "";
    this.hideFullScreen();
    this.native.hideLoading();
}

  ionViewDidLeave() {
    this.events.unsubscribe("addBinaryEvevnt");
    this.events.unsubscribe("update:tab");
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
    return text.substring(0,180);
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

    if (this.checkMyLike(nodeId,channelId,postId)){
      this.feedService.postUnlike(nodeId,Number(channelId),Number(postId),0);
      return ;
    }

    this.feedService.postLike(nodeId,Number(channelId),Number(postId),0);
  }

  navTo(nodeId:string, channelId:number,postId:number){
    this.pauseVideo(nodeId+channelId+postId);
    this.native.getNavCtrl().navigateForward(['/channels', nodeId, channelId]);
  }

  navToPostDetail(nodeId:string, channelId:number, postId:number){
    this.pauseVideo(nodeId+channelId+postId);
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

  menuMore(post:any){
    this.curPost = post;
    let channel = this.getChannel(post.nodeId, post.channel_id);
    if (channel == null || channel == undefined)
      return ;
    let channelName = channel.name;
    this.pauseAllVideo();

    let isMine = this.checkChannelIsMine(post.nodeId, post.channel_id);
      if(isMine === 0 && post.post_status != 1){
        this.menuService.showHomeMenu(post.nodeId, Number(post.channel_id),channelName,Number(post.id));
      }else{
        this.menuService.showChannelMenu(post.nodeId, Number(post.channel_id),channelName);
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
       if(this.totalData.length - this.pageNumber*this.startIndex>this.pageNumber){
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
    let sId =  setTimeout(() => {
      this.images = {};
      this.infiniteScroll.disabled =false;
      this.startIndex = 0;
      this.totalData = this.feedService.getPostList() || [];
      if(this.totalData.length - this.pageNumber > this.pageNumber){
        this.zone.run(()=>{
          this.postList = this.totalData.slice(this.startIndex,this.pageNumber);
          this.startIndex++;
          this.infiniteScroll.disabled =false;
          this.isLoadimage ={};
          this.isLoadVideoiamge ={};
          this.refreshImage(0);
          this.initnodeStatus(this.postList);
          event.target.complete();
        })
       
       }else{
         this.zone.run(()=>{
          this.postList = this.totalData.slice(0,this.totalData.length);
          this.infiniteScroll.disabled =true;
          this.isLoadimage ={};
          this.isLoadVideoiamge ={};
          this.refreshImage(0);
          this.initnodeStatus(this.postList);
          event.target.complete();
         })
        
      }
      
      clearTimeout(sId);
    },500);
  }

  scrollToTop(int) {
   let sid = setTimeout(() => {
      this.content.scrollToTop(1);
      clearTimeout(sid)
    }, int);
  }

  pressName(nodeId:string,channelId: number){
    let name ="";
    let channel = this.getChannel(nodeId, channelId) || "";
    if (channel != ""){
      name = channel.name || "";
    }
    if(name != "" && name.length>15){
      this.native.createTip(name);
    }
  }

  pressOwnName(nodeId:string,channelId: number){

    let name ="";
    let channel = this.getChannel(nodeId, channelId) || "";
    if (channel != "") {
         name  =  channel["owner_name"] || "";
    }

    if(name != "" && name.length>40){
      this.native.createTip(name);
    }

  }

  checkChannelIsMine(nodeId:string,channelId:number){
    if (this.feedService.checkChannelIsMine(nodeId,channelId))
      return 0;
    
    return 1;
  }

  showCommentPage(nodeId:string, channelId:number, postId:number){
    if(this.feedService.getConnectionStatus() != 0){
      this.native.toastWarn('common.connectionError');
      return;
    }

    this.pauseVideo(nodeId+channelId+postId);
    this.native.navigateForward(["comment",nodeId,channelId,postId],"");
  }

  showComment(nodeId:string,channelId:number, postId:number) {

    if(this.feedService.getConnectionStatus() != 0){
      this.native.toastWarn('common.connectionError');
      return;
    }

    this.pauseVideo(nodeId+channelId+postId);

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
        let id = nodeId+channelId+postId;
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
   
  }


  showBigImage(nodeId:string,channelId:number,postId:number){
    this.curPostId = nodeId+channelId+postId;
    this.pauseAllVideo();
    this.zone.run(()=>{
      this.native.showLoading("common.waitMoment", 5*60*1000).then(()=>{
        let contentVersion = this.feedService.getContentVersion(nodeId,channelId,postId,0);
        let thumbkey= this.feedService.getImgThumbKeyStrFromId(nodeId,channelId,postId,0,0);
        let key = this.feedService.getImageKey(nodeId,channelId,postId,0,0);
        if(contentVersion == "0"){
             key = thumbkey;
        }
        this.feedService.getData(key).then((realImg)=>{
          let img = realImg || "";
          if(img!=""){
            this.curNodeId = "";
            this.downStatusObj[nodeId+channelId+postId] = "";
            this.native.hideLoading();
            this.native.openViewer(realImg,"common.image","FeedsPage.tabTitle1",this.appService);
          }else{
            this.cacheGetBinaryRequestKey = key;
            this.cachedMediaType = "img";

            this.feedService.processGetBinary(nodeId, channelId, postId, 0, 0, FeedsData.MediaType.containsImg, key,
              (transDataChannel)=>{
                if (transDataChannel == FeedsData.TransDataChannel.SESSION){
                  this.downStatusObj[nodeId+channelId+postId] = "1";
                  this.curNodeId = nodeId;
                  return;
                }

                if (transDataChannel == FeedsData.TransDataChannel.MESSAGE){
                  this.downStatusObj[nodeId+channelId+postId] = "";
                  this.curNodeId = "";
                  return;
                }
              },
              (err)=>{
                this.native.hideLoading();
              });
          }
        });
      }).catch(()=>{
        this.native.hideLoading();
      });
    });
  }


  handlePsotImg(id:string,srcId:string,rowindex:number){
    // 13 存在 12不存在
    let isload = this.isLoadimage[id] || "";
    let rpostimg = document.getElementById(id+"rpostimg");
    let postImage = document.getElementById(id+"postimg");
    try {
      if(id!=''&&postImage.getBoundingClientRect().top>=-this.clientHeight&&postImage.getBoundingClientRect().top<=this.clientHeight){
        // if(rowindex === 2){
        //  this.logUtils.logd("entry "+rowindex+"-"+JSON.stringify(postImage.getBoundingClientRect()),TAG);
        // }

        if(isload === ""){
          rpostimg.style.display = "none";
          this.isLoadimage[id] = "11";
          let arr = srcId.split("-");
          let nodeId =arr[0];
          let channelId:any = arr[1];
          let postId:any = arr[2];
         let key = this.feedService.getImgThumbKeyStrFromId(nodeId,channelId,postId,0,0);
         this.feedService.getData(key).then((imagedata)=>{
              let image = imagedata || "";
              if(image!=""){
                this.isLoadimage[id] ="13";
                rpostimg.style.display = "block";
                postImage.setAttribute("src",image);
              }else{
                this.isLoadimage[id] ="12";
                rpostimg.style.display = 'none'; 
              }
            }).catch((reason)=>{
              rpostimg.style.display = 'none';
              this.logUtils.loge("getImageData error:"+JSON.stringify(reason),TAG);
            })
        }
     
      }else{
        let postImageSrc = postImage.getAttribute("src") || "";
         if(postImage.getBoundingClientRect().top<-this.clientHeight&&this.isLoadimage[id]==="13"&&postImageSrc!=""){ 
          // this.logUtils.logd("remove error:"+rowindex+"-"+postImage.getBoundingClientRect().top,TAG);
          this.isLoadimage[id] = "";
          postImage.removeAttribute("src");
      }
      }
    } catch (error) {
    
    }
  }

  hanldVideo(id:string,srcId:string,rowindex:number){

    let  isloadVideoImg  = this.isLoadVideoiamge[id] || "";
    let  vgplayer = document.getElementById(id+"vgplayer");
    let  video:any = document.getElementById(id+"video") || "";
    let  source:any = document.getElementById(id+"source") || "";
    let  downStatus = this.downStatusObj[id] || "";
    if(id!=""&&source!=""&&downStatus===''){
       this.pauseVideo(id);
    }
    try {
      if(id!=''&&video.getBoundingClientRect().top>=-this.clientHeight&&video.getBoundingClientRect().top<=this.clientHeight){
        // this.logUtils.logd("entry "+rowindex+"==="+video.getBoundingClientRect().top,TAG);
        if(isloadVideoImg===""){
          this.isLoadVideoiamge[id] = "11";
          vgplayer.style.display = "none";
          let arr = srcId.split("-");
          let nodeId =arr[0];
          let channelId:any = arr[1];
          let postId:any = arr[2];
          let key = this.feedService.getVideoThumbStrFromId(nodeId,channelId,postId,0);
          this.feedService.getData(key).then((imagedata)=>{
              let image = imagedata || "";
              if(image!=""){
                this.isLoadVideoiamge[id] = "13";
                vgplayer.style.display = "block";
                video.setAttribute("poster",image);
                //video.
                this.setFullScreen(id);
                this.setOverPlay(id,srcId);
              }else{
                //this.logUtils.logd("rowindex "+rowindex, TAG);
                this.isLoadVideoiamge[id] = "12";
                video.style.display='none';
                vgplayer.style.display = 'none'; 
              }
            }).catch((reason)=>{
              vgplayer.style.display = 'none'; 
              this.logUtils.loge("getImageData error:"+JSON.stringify(reason),TAG);
            });
        }
     
      }else{
        // this.logUtils.logd("remove: index = "+rowindex+" top = "+video.getBoundingClientRect().top+" bottom = "+video.getBoundingClientRect().bottom,TAG);
        let postSrc =  video.getAttribute("poster") || "";
        if(video.getBoundingClientRect().top<-this.clientHeight&&this.isLoadVideoiamge[id]==="13"&&postSrc!=""){
          video.removeAttribute("poster");
          let sourcesrc =  source.getAttribute("src") || "";
          if(sourcesrc  != ""){
            //video.pause();
            source.removeAttribute("src");
          }
          this.isLoadVideoiamge[id]="";
        }
      }
    } catch (error) {
    
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
        this.pauseVideo(id);
      }
    }
  }

  removeAllVideo(){
    let videoids = this.isLoadVideoiamge;
    for(let id  in videoids){
      let value = videoids[id] || "";
      if(value === "13"){
        let videoElement:any = document.getElementById(id+'video') || "";
        let source:any = document.getElementById(id+'source') || "";
        videoElement.removeAttribute('poster'); // empty source
        let sourcesrc =  source.getAttribute("src") || "";
        if(sourcesrc!=""){
          source.removeAttribute('src'); // empty source
          let sid=setTimeout(()=>{
            videoElement.load();
            clearTimeout(sid);
          },10)
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
        if(this.isExitDown()){
          this.openAlert();
          this.pauseVideo(id);
          return;
        }
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
    this.curPostId = id;
    this.downProgressObj = {};
    this.downStatusObj = {};
    let key = this.feedService.getVideoKey(nodeId,channelId,postId,0,0);
    this.feedService.getData(key).then((videoResult:string)=>{
      this.zone.run(()=>{
        let videodata = videoResult || "";
        if (videodata == ""){
          this.cacheGetBinaryRequestKey = key;
          this.cachedMediaType = "video";
          this.feedService.processGetBinary(nodeId, channelId, postId, 0, 0, FeedsData.MediaType.containsVideo, key,
            (transDataChannel)=>{
              if (transDataChannel == FeedsData.TransDataChannel.SESSION){
                this.downProgressObj[id] = 0;
                this.downStatusObj[id] = "1";
                this.curNodeId = nodeId;
                return;
              }

              if (transDataChannel == FeedsData.TransDataChannel.MESSAGE){
                this.downStatusObj[id] = "";
                this.curNodeId = "";
                return;
              }
            },
            (err)=>{
            });
          return;
        }
        this.downStatusObj[id] = "";
        this.curNodeId = "";
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
    let vgbuffering:any = document.getElementById(id+"vgbufferinghome") || "";
    let vgoverlayplay:any = document.getElementById(id+"vgoverlayplayhome"); 
    let vgscrubbar:any = document.getElementById(id+"vgscrubbarhome"); 
    let vgcontrol:any = document.getElementById(id+"vgcontrolshome"); 

    let video:any = document.getElementById(id+"video");
    video.addEventListener('ended',()=>{
        vgbuffering.style.display ="none";
        vgoverlayplay.style.display = "block";
        vgscrubbar.style.display ="none";
        vgcontrol.style.display = "none";  
    });

    video.addEventListener('pause',()=>{
      vgbuffering.style.display ="none";
      vgoverlayplay.style.display = "block";
      vgscrubbar.style.display ="none";
      //vgcontrol.style.display = "none";  
   });

   video.addEventListener('play',()=>{
    vgscrubbar.style.display ="block";
    vgcontrol.style.display = "block";  
   });


   video.addEventListener('canplay',()=>{
        vgbuffering.style.display ="none";
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
      this.cacheGetBinaryRequestKey = "";
      this.native.hideLoading();
      this.native.openViewer(value,"common.image","FeedsPage.tabTitle1",this.appService);
    } else if (key.indexOf("video")>-1){
         let arr = this.cacheGetBinaryRequestKey.split("-");
         let nodeId =arr[0];
         let channelId:any = arr[1];
         let postId:any = arr[2];
         let id = nodeId+channelId+postId;
         this.cacheGetBinaryRequestKey = "";
         this.loadVideo(id,value);
    }
  }

  isExitDown(){

    if((JSON.stringify(this.downStatusObj) == "{}")){
          return false;
    }

    for(var key in this.downStatusObj) {
      if(this.downStatusObj[key] != ""){
            return true;
      }
    }

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

}
