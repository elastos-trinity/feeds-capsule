import { Component,OnInit,Input,Output,EventEmitter} from '@angular/core';
import { ThemeService } from '../../services/theme.service';
import { NativeService } from '../../services/NativeService';
import { FeedService } from '../../services/FeedService';
import { UtilService } from '../../services/utilService';
@Component({
  selector: 'app-switchfeed',
  templateUrl: './switchfeed.component.html',
  styleUrls: ['./switchfeed.component.scss'],
})
export class SwitchfeedComponent implements OnInit {
  @Input() public feedList = [];
  @Input() public nodeStatus = {};
  @Output() hideComment = new EventEmitter();

  constructor(
    public theme: ThemeService,
    public native: NativeService,
    private feedService: FeedService) { }

  ngOnInit() {}

  parseAvatar(avatar: string): string{
    return this.feedService.parseChannelAvatar(avatar);
  }


  moreName(name:string){
    return UtilService.moreNanme(name);
  }

  clickItem(feed:any){
    this.hideComment.emit(feed);
  }

}