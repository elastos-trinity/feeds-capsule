import { Component, OnInit, NgZone,ViewChild,ElementRef} from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Events} from '@ionic/angular';
import { FeedService } from 'src/app/services/FeedService';
import { NativeService } from 'src/app/services/NativeService';
import { MenuService } from 'src/app/services/MenuService';
import { ThemeService } from 'src/app/services/theme.service';
import { TranslateService } from "@ngx-translate/core";
import { UtilService } from 'src/app/services/utilService';
import { IonInfiniteScroll,PopoverController} from '@ionic/angular';
import { EdittoolComponent } from '../../../../components/edittool/edittool.component';

import { SessionService } from 'src/app/services/SessionService';
import { VgFullscreenAPI} from 'ngx-videogular';
import { AppService } from 'src/app/services/AppService';



declare let titleBarManager: TitleBarPlugin.TitleBarManager;

@Component({
  selector: 'app-postdetail',
  templateUrl: './postdetail.page.html',
  styleUrls: ['./postdetail.page.scss'],
})
export class PostdetailPage implements OnInit {
  @ViewChild(IonInfiniteScroll,{static:true}) infiniteScroll: IonInfiniteScroll;
  public postImage:string = "";
  public connectionStatus:number = 1;
  public nodeStatus:any ={};
  public avatar: string = "";

  public channelAvatar:string = "";
  public channelName:string = "";
  public channelWName:string ="";
  public channelOwner:string = "";
  public channelWOwner:string = "";
  public postContent:string = "";
  public postTS:number = 0;
  public likesNum:number = 0;
  public commentsNum:number = 0;
  
  public commentList:any = [];

  public nodeId:string = "";
  public channelId:number = 0;
  public postId:number = 0;
  public startIndex:number = 0;
  public pageNumber:number = 5;
  public totalData:any = [];

  public popover: any;
  
  public postStatus = 0;
  public styleObj:any = {width:""};
  public dstyleObj:any = {width:""};

  public hideComment = true;
  
  //public videoObj:any ={};
  public videoPoster:string ="";
  public posterImg:string ="";
  public viedoObj:string ="";
  public videoisShow:boolean = false;


  constructor(
    private popoverController:PopoverController,
    private acRoute: ActivatedRoute,
    private events: Events,
    private zone: NgZone,
    private native: NativeService,
    private feedService :FeedService,
    public theme:ThemeService,
    private translate:TranslateService,
    public menuService: MenuService,
    private sessionService: SessionService,
    public vgFullscreenAPI:VgFullscreenAPI,
    public appService:AppService,
    public el:ElementRef) {
  }

  initData(){
    this.initnodeStatus();
    let channel = this.feedService.getChannelFromId(this.nodeId, this.channelId) || "";
    if (channel == "")
      return ;
    this.channelWName = channel["name"] || "";
    this.channelName = UtilService.moreNanme(channel["name"]);
    this.channelAvatar = this.feedService.parseChannelAvatar(channel["avatar"]);
    this.channelWOwner = channel["owner_name"] || "";
    this.channelOwner = UtilService.moreNanme(channel["owner_name"],40);

    let post = this.feedService.getPostFromId(this.nodeId, this.channelId, this.postId);
  
 
    this.postStatus = post.post_status || 0;

    this.postContent = post.content;
    this.postTS = post.created_at;
    this.likesNum = post.likes;
    this.commentsNum = post.comments;
    this.initRefresh();
  }

  initRefresh(){
    this.totalData = this.feedService.getCommentList(this.nodeId, this.channelId, this.postId) || [];
    if(this.totalData.length-this.pageNumber > this.pageNumber){
      this.commentList = this.totalData.slice(this.startIndex,this.pageNumber);
      this.startIndex++;
      this.infiniteScroll.disabled =false;
    }else{
      this.commentList = this.totalData.slice(0,this.totalData.length);
      this.infiniteScroll.disabled =true;
    }
  }
  
  ngOnInit() {
    this.acRoute.params.subscribe((data)=>{
      this.nodeId = data.nodeId;
      this.channelId = data.channelId;
      this.postId = data.postId;
    });
  }

  ionViewWillEnter() {
    this.getImage();
    this.getVideoPoster(this.nodeId+this.channelId+this.postId);
    this.initTitle();
    this.native.setTitleBarBackKeyShown(true);
    this.styleObj.width = (screen.width - 55)+'px';
    this.dstyleObj.width= (screen.width - 105)+'px';
    this.initData();
    this.connectionStatus = this.feedService.getConnectionStatus();
    this.feedService.refreshPostById(this.nodeId,this.channelId,this.postId);

    if (this.connectionStatus == 0)
      this.feedService.updateComment(this.nodeId, Number(this.channelId) ,Number(this.postId));

    this.events.subscribe('feeds:connectionChanged',(status)=>{
      this.zone.run(() => {
        this.connectionStatus = status;
      });
    });
  

    this.events.subscribe('feeds:commentDataUpdate',()=>{
      this.zone.run(() => {
        this.startIndex = 0;
        this.initData();
      });
    });
    
  
    this.events.subscribe("feeds:friendConnectionChanged", (nodeId, status)=>{
      this.zone.run(()=>{
        this.nodeStatus[nodeId] = status;
      });
    });
    this.events.subscribe("feeds:updateTitle",()=>{
      if(this.menuService.postDetail!=null){
        this.menuService.hideActionSheet();
        this.menuMore();
      }
      this.initTitle();
    });
  
    this.events.subscribe("feeds:refreshPostDetail", ()=>{
      this.zone.run(() => {
        let post = this.feedService.getPostFromId(this.nodeId, this.channelId, this.postId);
        this.postContent = post.content;
        this.postTS = post.created_at;
        this.likesNum = post.likes;
        this.commentsNum = post.comments;  
      });
    });

    this.events.subscribe('feeds:editPostFinish', () => {
      this.initData();
    });

    this.events.subscribe('feeds:deletePostFinish', () => {
      this.events.publish("update:tab");
      this.native.hideLoading();
      this.initData();
    });

    this.events.subscribe('feeds:editCommentFinish', () => {
      this.initData();
    });
     
    this.events.subscribe('feeds:deleteCommentFinish', () => {
      this.native.hideLoading();
      this.initData();
    });

    this.events.subscribe('rpcRequest:error', () => {
      this.zone.run(() => {
         this.native.hideLoading();
      });
    });



    this.events.subscribe('stream:getBinaryResponse', () => {
      this.zone.run(() => {
        console.log("result==stream:getBinaryResponse====>")
      });
    });

    this.events.subscribe('stream:getBinarySuccess', (nodeId, key) => {
      this.zone.run(() => {
        console.log("result==stream:getBinaryResponse====>")
        this.feedService.loadPostContentImg(key).then((image)=>{
          this.postImage = image||"";
        });
      });
    });

    this.events.subscribe('stream:error', (nodeId, response) => {
      this.zone.run(() => {

        if (response.code == -107){
          //TODO
          console.log("result==FileNotExist");
        }
        
        
        console.log("result==stream:error=nodeId===>"+nodeId);
        console.log("result==stream:error=code===>"+response.code)
        console.log("result==stream:error=message===>"+response.message)

      });
    });
   
    this.events.subscribe('stream:onStateChangedCallback', (nodeId, state) => {
      this.zone.run(() => {
        if (state === 4){
          let nodeChannelPostId = this.nodeId+this.channelId+this.postId;
          this.feedService.getBinary(this.nodeId, nodeChannelPostId);
        }
      });
    });
  }


  ionViewWillLeave(){//清楚订阅事件代码
    this.events.unsubscribe("feeds:connectionChanged");
    this.events.unsubscribe("feeds:commentDataUpdate");
    this.events.unsubscribe("feeds:friendConnectionChanged");
    this.events.unsubscribe("feeds:updateTitle");
    this.events.unsubscribe("feeds:refreshPostDetail");
    this.events.unsubscribe("feeds:editPostFinish");
    this.events.unsubscribe("feeds:deletePostFinish");
    this.events.unsubscribe("feeds:editCommentFinish");
    this.events.unsubscribe("feeds:deleteCommentFinish");
    this.events.unsubscribe("rpcRequest:error");

    this.postImage = "";

    this.events.unsubscribe("stream:getBinaryResponse");
    this.events.unsubscribe("stream:getBinarySuccess");
    this.events.unsubscribe("stream:error");
    this.events.unsubscribe("stream:onStateChangedCallback");

    this.menuService.hideActionSheet();
    if(this.popover!=null){
      this.popover.dismiss();
    }

    this.clearVideo();
  }

  ionViewDidEnter() {
    let sid = setTimeout(()=>{
      this.setFullScreen();
      this.setOverPlay();
      clearTimeout(sid);
    },0)
    
  }

  initTitle(){
    titleBarManager.setTitle(this.translate.instant("PostdetailPage.postview"));
  }

  getContentText(content: string): string{
    return this.feedService.parsePostContentText(content);
  }

  getContentImg(content: any): string{
    return this.feedService.parsePostContentImg(content);
  }

  indexText(text: string):string{
    return this.feedService.indexText(text,20,20);
  }

  showCommentPage(nodeId,channelId,postId){
    if(this.feedService.getConnectionStatus() != 0){
      this.native.toastWarn('common.connectionError');
      return;
    }
    this.native.navigateForward(["comment",nodeId,channelId,postId],"");
  }

  showComment() {
    this.pauseVideo();
    this.hideComment = false;
  }

  checkMyLike(){
    return this.feedService.checkMyLike(this.nodeId, Number(this.channelId), Number(this.postId));
  }

  checkLikedComment(commentId: number){
    return this.feedService.checkLikedComment(this.nodeId, Number(this.channelId), Number(this.postId), commentId);
  }

  like(){
    if(this.feedService.getConnectionStatus() != 0){
      this.native.toastWarn('common.connectionError');
      return;
    }

    if (this.checkMyLike()){
      this.feedService.postUnlike(this.nodeId,Number(this.channelId),Number(this.postId),0);
      return ;
    }

    this.feedService.postLike(this.nodeId,Number(this.channelId),Number(this.postId),0);
  }

  likeComment(commentId: number){
    if(this.feedService.getConnectionStatus() != 0){
      this.native.toastWarn('common.connectionError');
      return;
    }

    if (this.checkLikedComment(commentId)){
      this.feedService.postUnlike(this.nodeId,Number(this.channelId),Number(this.postId),commentId);
      return ;
    }

    this.feedService.postLike(this.nodeId,Number(this.channelId),Number(this.postId),commentId);
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

  menuMore(){
    let isMine = this.checkChannelIsMine();
    this.pauseVideo();
    if(isMine === 0 && this.postStatus != 1){
      this.menuService.showPostDetailMenu(this.nodeId, Number(this.channelId), this.channelName,this.postId);
    }else{
      this.menuService.showShareMenu(this.nodeId, Number(this.channelId), this.channelName,this.postId);
    }
  }

  showBigImage(content: any){
    this.native.openViewer(content,"common.image","PostdetailPage.postview",this.appService);
  }

  checkServerStatus(nodeId: string){
    return this.feedService.getServerStatusFromId(nodeId);
  }

  initnodeStatus(){
     let status = this.checkServerStatus(this.nodeId);
     this.nodeStatus[this.nodeId] = status;
  }

  getImage(){
    let nodeChannelPostId = this.nodeId+this.channelId+this.postId;
      this.feedService.loadPostContentImg(nodeChannelPostId).then((image)=>{
        this.postImage = image || "";
        if(this.postImage == ""){
          if (this.feedService.restoreSession(this.nodeId)){
            this.feedService.getBinary(this.nodeId,nodeChannelPostId);
          }
        }
      }).catch(()=>{
        console.log("getImageError");
      })
  }

  doRefresh(event:any){
    let sId =  setTimeout(() => {
      //this.postImage = "";
      this.startIndex = 0;
      this.initData();
      event.target.complete();
      clearTimeout(sId);
    },500);
  }

  loadData(event:any){
    let sId = setTimeout(() => {
      let arr = [];        
      if(this.totalData.length - this.pageNumber*this.startIndex>this.pageNumber){
       arr = this.totalData.slice(this.startIndex*this.pageNumber,(this.startIndex+1)*this.pageNumber);
       this.startIndex++;
       this.zone.run(()=>{
       this.commentList = this.commentList.concat(arr);
       });
       this.initnodeStatus();
       event.target.complete();
      }else{
       arr = this.totalData.slice(this.startIndex*this.pageNumber,this.totalData.length);
       this.zone.run(()=>{
           this.commentList = this.commentList.concat(arr);
       });
       this.infiniteScroll.disabled =true;
       this.initnodeStatus();
       event.target.complete();
       clearTimeout(sId);
      }
    },500);

  
  }

  pressName(){
    if(this.channelWName!= "" && this.channelWName.length>15){
      this.native.createTip(this.channelWName);
    }
  }

  pressOwnerName(){
    if(this.channelWOwner!= "" && this.channelWOwner.length>40){
      this.native.createTip(this.channelWOwner);
    }
  }

  userName(userName:string){

    let name = userName || "";

    if(name!=""){
      this.native.createTip(name);
    }

  }

  async openEditTool(ev:any,comment:any) {
    this.popover = await this.popoverController.create({
      mode: 'ios',
      cssClass:'editToolPopup',
      component: EdittoolComponent,
      componentProps: { nodeId:comment.nodeId,
                        channelId:Number(comment.channel_id),
                        postId:Number(comment.post_id),
                        commentById:Number(comment.comment_id),
                        commentId:Number(comment.id),
                        content:comment.content
                      },
      event: ev,
      translucent: true
    });

    this.popover.onWillDismiss().then(()=>{
         if(this.popover!=null){
           this.popover = null;
         }
          
    })
    return await this.popover.present();
  }


  handleCommentStatus(){
    let status = "(edit)"
    return status;
  }

  checkChannelIsMine(){
    if (this.feedService.checkChannelIsMine(this.nodeId, this.channelId))
      return 0;
    
    return 1;
  }

  navTo(nodeId:string, channelId:number){
    this.native.navigateForward(['/channels', nodeId, channelId],"");
  }

  checkCommentIsMine(comment:any){
    return this.feedService.checkCommentIsMine(comment.nodeId,Number(comment.channel_id),Number(comment.post_id),Number(comment.id));
  }

  hideComponent(event) {
    console.log('Hide comment component?', event);
    this.hideComment = true;
  }


  newSession(){
    
    // this.events.subscribe("stream:onStateChangedCallback",(nodeId, stateName)=>{

    // });
    this.sessionService.createSession(this.nodeId,(session,stream)=>{});
  }

  writeData(){
    let nodeChannelPostId = this.nodeId+this.channelId+this.postId;;
    console.log("image = "+this.postImage );

    // if (this.ready){
      // this.feedService.setBinary(this.nodeId,nodeChannelPostId,this.postImage);
      this.feedService.getBinary(this.nodeId,nodeChannelPostId);
    // }
    // this.sessionService.streamAddMagicNum(this.nodeId);
    // this.sessionService.streamAddVersion(this.nodeId);
    // let requestSize = this.sessionService.buildSetBinaryRequest("token","testKey");
    // this.sessionService.streamAddRequestHeadSize(this.nodeId, requ);
    // this.sessionService.streamAddData(this.nodeId, "hahahahaha");
  }

  closeSession(){
    // this.sessionService.sessionClose(this.nodeId);
    // let size = this.sessionService.streamAddRequestHeadSize(this.nodeId,0x9999);
  }

  getVideoPoster(id:string){
    this.feedService.loadVideoPosterImg(id).then((imagedata)=>{
      let image = imagedata || "";
      if(image!=""){
        this.zone.run(()=>{
           this.videoisShow = true;
            this.posterImg = imagedata;
            //this.getVideo(id);
        })
      }else{
        this.videoisShow = false;
      }
   }).catch((err)=>{

   })
  }

  getVideo(id:string){
    // let videosource:any = this.el.nativeElement.querySelector("source") || "";
    //   if(videosource===""){
        console.log("zzzzzzzzz");
        this.feedService.loadVideo(id).then((viedo:string)=>{
          this.zone.run(()=>{
            console.log("========="+viedo.substring(0,50));
            this.viedoObj = viedo;
            let vgbuffering:any = this.el.nativeElement.querySelector("vg-buffering");
                vgbuffering.style.display ="none";
            let video:any = this.el.nativeElement.querySelector("video");
            video.addEventListener('ended',()=>{
                console.log("==========ended============")
                let vgoverlayplay:any = this.el.nativeElement.querySelector("vg-overlay-play"); 
                vgbuffering.style.display ="none";
                vgoverlayplay.style.display = "block";  
            });

            video.addEventListener('pause',()=>{
              console.log("==========pause============");
              let vgoverlayplay:any = this.el.nativeElement.querySelector("vg-overlay-play");
              vgoverlayplay.style.display = "block";  
          });
            video.load();
            video.play();
          }) 
        }); 
      // }
  }

  pauseVideo(){
    let video:any =  this.el.nativeElement.querySelector("video") || "";
    if(video!=""){
      video.pause();;
    }
  }

  clearVideo(){   
    this.posterImg ="";
    this.viedoObj ="";
    let video:any =  this.el.nativeElement.querySelector("video") || "";
    if(video!=""){
      video.pause();;
      video.load();
    }
  }

  setFullScreen(){
    let vgfullscreen = this.el.nativeElement.querySelector("vg-fullscreen") || "";
    if(vgfullscreen !=""){
      vgfullscreen.onclick=()=>{
        let isFullScreen = this.vgFullscreenAPI.isFullscreen;
        if(isFullScreen){
          this.native.setTitleBarBackKeyShown(true);
          titleBarManager.setTitle(this.translate.instant("PostdetailPage.postview"));
          this.appService.addright();
        }else{
          this.native.setTitleBarBackKeyShown(false);
          titleBarManager.setTitle(this.translate.instant("common.video"));
          this.appService.hideright();
         
        }
        this.vgFullscreenAPI.toggleFullscreen(vgfullscreen);
     }
    }
  }

  setOverPlay(){
    let vgoverlayplay:any = this.el.nativeElement.querySelector("vg-overlay-play") || "";
    if(vgoverlayplay!=""){
     vgoverlayplay.onclick = ()=>{
      this.zone.run(()=>{
        if(this.viedoObj === ""){
         this.getVideo(this.nodeId+this.channelId+this.postId);
        }
      });
     }
    }
  }
}
