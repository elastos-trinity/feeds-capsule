import { Component, OnInit, NgZone } from '@angular/core';
import { Events, PopoverController, IonTabs} from '@ionic/angular';
import { FeedService } from '../../../services/FeedService';
import { Router } from '@angular/router'
import { CommentComponent } from '../../../components/comment/comment.component'
import { FeedsPage } from '../feeds.page'
import { ThemeService } from 'src/app/services/theme.service';
import { UtilService } from 'src/app/services/utilService';
import { TranslateService } from "@ngx-translate/core";
import { NativeService } from 'src/app/services/NativeService';
@Component({
  selector: 'app-home',
  templateUrl: './home.page.html',
  styleUrls: ['./home.page.scss'],
})


export class HomePage implements OnInit {
  private postList: any;
  private bigImageUrl: string;
  private bigImage: boolean = false;
  constructor(
    private feedspage: FeedsPage,
    private tabs: IonTabs,
    private popoverController: PopoverController,
    private events: Events,
    private zone: NgZone,
    private feedService :FeedService,
    private router: Router,
    public theme:ThemeService,
    private translate:TranslateService,
    private navtive:NativeService) {
      this.bigImage = false;
      this.postList = feedService.getPostList();
      this.events.subscribe('feeds:postDataUpdate',()=>{
        this.zone.run(() => {
          this.postList = this.feedService.getPostList();
      });
    });
  }

  ionViewWillEnter() {
  
  }

  
  getChannel(nodeId, channelId):any{
    return this.feedService.getChannelFromId(nodeId,channelId);
  }

  getContentText(content: string): string{
    return this.feedService.parsePostContentText(content);
  }

  getContentImg(content: any): string{
    return this.feedService.parsePostContentImg(content);
  }

  getChannelOwnerName(nodeId, channelId){
    let ownerName:string = this.getChannel(nodeId, channelId).owner_name;
    return this.feedService.indexText(ownerName,25,25);
  }

  ngOnInit() {
  }

  like(nodeId, channelId, postId){
    if (this.checkMyLike(nodeId,channelId,postId)){
      this.feedService.postUnlike(nodeId,Number(channelId),Number(postId),0);
      return ;
    }

    this.feedService.postLike(nodeId,Number(channelId),Number(postId),0);
  }

  navTo(nodeId, channelId){
    this.navtive.getNavCtrl().navigateForward(['/channels', nodeId, channelId]);
  }

  navToPostDetail(nodeId, channelId, postId){
    this.navtive.getNavCtrl().navigateForward(['/postdetail',nodeId, channelId,postId]);
  }

  refresh(){
  }

  async showCommentPage(event, nodeId, channelId, postId){
    const popover = await this.popoverController.create({
      component: CommentComponent,
      componentProps: {nodeId: nodeId, channelId: channelId, postId: postId},
      event:event,
      translucent: true,
      cssClass: 'bottom-sheet-popover'
    });

    popover.onDidDismiss().then((result)=>{
      if(result.data == undefined){
        return;
      }
    });
    return await popover.present();
  }

  checkMyLike(nodeId: string, channelId: number, postId: number){
    return this.feedService.checkMyLike(nodeId, channelId, postId);
  }

  exploreFeeds(){
    this.tabs.select("search");
    this.feedspage.currentTab = "search";
  }

  parseAvatar(nodeId: string, channelId: number): string{
    return this.feedService.parseChannelAvatar(this.getChannel(nodeId, channelId).avatar);
  }

  handleDisplayTime(createTime:number){

    let obj = UtilService.handleDisplayTime(createTime);
    if(obj.type==='m'){
      return obj.content+this.translate.instant('HomePage.minutesAgo');
    }
    if(obj.type==='h'){
      return obj.content+this.translate.instant('HomePage.hoursAgo');
    }
    return  obj.content;
  }

  menuMore(){
    alert("more");
  }

  showBigImage(content: any){
    this.bigImage = true;
    this.bigImageUrl =  this.getContentImg(content);
  }

  hideBigImage(){
    this.bigImage = false;
  }
}
