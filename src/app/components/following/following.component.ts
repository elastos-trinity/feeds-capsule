import { Component, OnInit ,Input,Output,EventEmitter} from '@angular/core';
import { FeedService } from '../../services/FeedService'
import { ThemeService } from '../../services/theme.service';
import { UtilService } from '../../services/utilService';
import { ViewHelper } from '../../services/viewhelper.service';


@Component({
  selector: 'app-following',
  templateUrl: './following.component.html',
  styleUrls: ['./following.component.scss'],
})
export class FollowingComponent implements OnInit {
  @Output() fromChild=new EventEmitter();
  @Input() followingList:any =[];
  @Input() nodeStatus:any = {};
  @Output() toFollowPage = new EventEmitter();
  constructor(
    //private feedspage: FeedsPage,
    //private tabs: IonTabs,
    private feedService:FeedService,
    public theme:ThemeService,
    private viewHelper:ViewHelper) {

  }

  ngOnInit() {

  }

  moreName(name:string){
    return UtilService.moreNanme(name);
   }

  navTo(nodeId:string, channelId:number){
    this.read(nodeId, channelId);
    this.toFollowPage.emit({"nodeId":nodeId,"channelId":channelId,"page":"/channels"});
    //this.native.getNavCtrl().navigateForward(['/channels', nodeId, channelId]);
  }

  parseAvatar(avatar: string): string{
    return this.feedService.parseChannelAvatar(avatar);
  }

  checkUnreadNumber(nodeId: string, channelId: number):number{
    let nodeChannelId = this.feedService.getChannelId(nodeId, channelId);
    return this.feedService.getUnreadNumber(nodeChannelId);
  }

  read(nodeId: string, channelId: number){
    let nodeChannelId = this.feedService.getChannelId(nodeId, channelId);
    this.feedService.readChannel(nodeChannelId);
  }

  menuMore(nodeId: string , channelId: number, channelName: string){
    this.fromChild.emit({"nodeId":nodeId,"channelId":channelId,"channelName":channelName,"postId":0,"tabType":"myfollow"});
  }

  pressName(channelName:string){
    let name =channelName || "";
    if(name != "" && name.length>15){
      this.viewHelper.createTip(name);
    }
  }
}
