import { Component, OnInit } from '@angular/core';
import { Events,PopoverController} from '@ionic/angular';
import { TranslateService } from "@ngx-translate/core";
import { ThemeService } from '../../services/theme.service';
import { NativeService } from '../../services/NativeService';
import { FeedService } from '../../services/FeedService';
import { PopupProvider } from '../../services/popup';
import { StorageService } from '../../services/StorageService';
import { AppService } from '../../services/AppService';


declare let titleBarManager: TitleBarPlugin.TitleBarManager;
@Component({
  selector: 'app-settings',
  templateUrl: './settings.page.html',
  styleUrls: ['./settings.page.scss'],
})
export class SettingsPage implements OnInit {
  public developerMode:boolean =  false;
  public hideDeletedPosts:boolean = false;;
  public hideDeletedComments:boolean = false;
  public hideOfflineFeeds:boolean = true;
  public popover:any = null;
  constructor(
    private feedService:FeedService,
    private events: Events,
    private native: NativeService,
    private translate:TranslateService,
    private appService: AppService,
    public theme:ThemeService,
    public popupProvider:PopupProvider,
    public storageService:StorageService,
    private popoverController:PopoverController
    ) { 

  }

  ngOnInit() {
  }

  initTitle(){
    titleBarManager.setTitle(this.translate.instant("app.settings"));
  }

  ionViewWillEnter() {
    this.hideDeletedPosts = this.feedService.getHideDeletedPosts();
    this.hideDeletedComments = this.feedService.getHideDeletedComments();
    this.hideOfflineFeeds = this.feedService.getHideOfflineFeeds();
    this.developerMode = this.feedService.getDeveloperMode();
    this.initTitle();
    this.native.setTitleBarBackKeyShown(true);
    
    this.events.subscribe("feeds:updateTitle",()=>{
      this.initTitle();
    });
  }

  ionViewDidEnter(){
  }

  ionViewWillLeave(){
    this.events.unsubscribe("feeds:updateTitle");
    if(this.popover!=null){
      this.popoverController.dismiss();
    }
  }

  toggleHideDeletedPosts(){
    this.hideDeletedPosts = !this.hideDeletedPosts;
    this.feedService.setHideDeletedPosts(this.hideDeletedPosts);
    this.events.publish("feeds:hideDeletedPosts");
    this.feedService.setData("feeds.hideDeletedPosts",this.hideDeletedPosts);
  }

  toggleHideDeletedComments(){
    this.hideDeletedComments = !this.hideDeletedComments;
    this.feedService.setHideDeletedComments(this.hideDeletedComments);
    this.feedService.setData("feeds.hideDeletedComments",this.hideDeletedComments);
  }

  toggleHideOfflineFeeds(){
    this.hideOfflineFeeds = !this.hideOfflineFeeds;
    this.feedService.setDeveloperMode(this.developerMode);
    this.feedService.setData("feeds.hideOfflineFeeds",this.developerMode);
  }

  toggleDeveloperMode(){
    this.developerMode = !this.developerMode;
    this.feedService.setDeveloperMode(this.developerMode);
    this.feedService.setData("feeds.developerMode",this.developerMode);
  }

  cleanData(){
    this.popover = this.popupProvider.ionicConfirm(
      this,
      // "ConfirmdialogComponent.signoutTitle",
      "",
      "SettingsPage.des",
      this.cancel,
      this.confirm,
      'tskth.svg'
    );
  }

  cancel(that:any){
    if(this.popover!=null){
      this.popover.dismiss();
    }
  }

  confirm(that:any){
    if(this.popover!=null){
      this.popover.dismiss();
    }
    
     that.removeData();
  }


  removeData(){
    this.feedService.removeAllServerFriends();
    this.storageService.clearAll().then(()=>{
      localStorage.clear();
      this.feedService.resetConnectionStatus();
      this.feedService.destroyCarrier();
      this.appService.hideright();
      this.native.setRootRouter('disclaimer');
      this.native.toast("SettingsPage.des1"); 
    }).catch((err)=>{
       
    })
  }

}
