import { Component, OnInit ,ViewChild,NgZone} from '@angular/core';
import { TranslateService } from "@ngx-translate/core";
import { IonRefresher,IonSearchbar} from '@ionic/angular';
import { Events } from '../../../services/events.service';
import { ThemeService } from '../../../services/theme.service';
import { HttpService } from '../../../services/HttpService';
import { FeedService } from '../../../services/FeedService';
import { NativeService } from '../../../services/NativeService';
import { StorageService } from '../../../services/StorageService';
import { ApiUrl } from '../../../services/ApiUrl';
import { IntentService } from '../../../services/IntentService';
import { TitleBarComponent } from '../../../components/titlebar/titlebar.component';
import { TitleBarService } from '../../../services/TitleBarService';
import * as _ from 'lodash';
@Component({
  selector: 'app-explorefeeds',
  templateUrl: './explorefeeds.page.html',
  styleUrls: ['./explorefeeds.page.scss'],
})
export class ExplorefeedsPage implements OnInit {
  @ViewChild(TitleBarComponent, { static: true }) titleBar: TitleBarComponent;
  @ViewChild(IonRefresher,{static:true}) ionRefresher:IonRefresher;
  @ViewChild('searchbar', {static: false}) searchbar:IonSearchbar;
  private pageNum:number = 1;
  private pageSize:number = 2;
  private totalNum:number = 0;
  private curtotalNum:number = 0;
  public connectionStatus = null;
  public channelNewList = [];
  public searchChannelNewList = [];
  public feedList = [];
  public developerMode:boolean =  false;

  public hotBidsList:any = [{
    "asset": "./assets/images/test.png",
    "name": "test",
    "description": "12",
    "fixedAmount": "1",
    "minimumAmount": null,
    "expirationDate": "2021-04-29",
    "type": "single",
    "royalties": "1",
    "quantity": "1"
  }, {
    "asset": "./assets/images/test.png",
    "name": "test",
    "description": "12",
    "fixedAmount": "1",
    "minimumAmount": null,
    "expirationDate": "2021-04-29",
    "type": "single",
    "royalties": "1",
    "quantity": "1"
  }, {
    "asset": "./assets/images/test.png",
    "name": "test",
    "description": "12",
    "fixedAmount": "1",
    "minimumAmount": null,
    "expirationDate": "2021-04-29",
    "type": "single",
    "royalties": "1",
    "quantity": "1"
  }, {
    "asset": "./assets/images/test.png",
    "name": "test",
    "description": "12",
    "fixedAmount": "1",
    "minimumAmount": null,
    "expirationDate": "2021-04-29",
    "type": "single",
    "royalties": "1",
    "quantity": "1"
  }, {
    "asset": "./assets/images/test.png",
    "name": "test",
    "description": "12",
    "fixedAmount": "1",
    "minimumAmount": null,
    "expirationDate": "2021-04-29",
    "type": "single",
    "royalties": "1",
    "quantity": "1"
  }];
  public isSearch:string ="";
  public scanServiceStyle ={"right":""};
  private isAddSearch:boolean = false;
  public tabType:string = "feeds";
  constructor(
    private feedService: FeedService,
    private events: Events,
    private zone: NgZone,
    private httpService:HttpService,
    private native:NativeService,
    private storageService:StorageService,
    private intentService: IntentService,
    private titleBarService: TitleBarService,
    private translate:TranslateService,
    public theme:ThemeService){

  }

  ngOnInit() {
    this.scanServiceStyle["right"] = screen.width*7.5/100+5+"px";
  }

  initTitleBar(){
    let title = this.translate.instant("FeedsPage.tabTitle4");
    this.titleBarService.setTitle(this.titleBar, title);
    this.titleBarService.setTitleBarMoreMemu(this.titleBar);
  }

  ionViewWillEnter() {
    this.events.subscribe(FeedsEvent.PublishType.search, ()=>{
        this.addEvent();
        this.initData();
    });
    this.addEvent();
    this.initData();
  }

  ionViewWillLeave(){
    this.events.unsubscribe(FeedsEvent.PublishType.search);
    this.removeEvent();
  }

  ionViewDidEnter() {
    this.initTitleBar();
  }

  addEvent(){
    this.events.subscribe(FeedsEvent.PublishType.updateTitle,()=>{
      this.initTitleBar();
    });
    this.events.subscribe(FeedsEvent.PublishType.connectionChanged,(status)=>{
      this.zone.run(() => {
        this.connectionStatus = status;
      });
    });
  }

  removeEvent(){
    this.isAddSearch = false;
    this.events.unsubscribe(FeedsEvent.PublishType.updateTitle);
    this.events.unsubscribe(FeedsEvent.PublishType.connectionChanged);
  }

  clickAssetItem(parms:any){
    this.removeEvent();
    this.native.navigateForward(['assetdetails'],{});
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

  ionClear(){
    this.isSearch = "";
    if(this.checkFeedUrl(this.isSearch)){
      this.addFeedUrl(this.isSearch);
      return;
    }
    if(this.isSearch == ""){
      this.ionRefresher.disabled = false;
      this.channelNewList = _.cloneDeep(this.searchChannelNewList);
      return;
    }
    this.ionRefresher.disabled = true;
    this.handleSearch();
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
      this.channelNewList = _.cloneDeep(this.searchChannelNewList);;
      return;
    }
    this.ionRefresher.disabled = true;
      this.handleSearch();
    }
  }

  handleSearch(){
    if(this.isSearch===""){
        return;
    }
    this.channelNewList = this.searchChannelNewList.filter(
      feed=>feed.name.toLowerCase().indexOf(this.isSearch.toLowerCase()) > -1
    );
  }

  initData(){
    let discoverfeeds = this.feedService.getDiscoverfeeds();
    if(discoverfeeds.length === 0){
      this.pageNum = 1;
      this.getHttpsData();
    }else{
     let channelNewList = _.cloneDeep(discoverfeeds);
     this.channelNewList = this.filterdiscoverSquareList(channelNewList) || [];
     this.searchChannelNewList = _.cloneDeep(this.channelNewList);
    }
    this.handleSearch();
  }

  getHttpsData(){
    this.httpService.ajaxGet(ApiUrl.listPage+"?pageNum="+this.pageNum+"&pageSize="+this.pageSize,false).then((result)=>{
      if(result["code"] === 200){
         this.totalNum = result["data"]["total"];
         let  newData = result["data"]["result"] || [];
         this.curtotalNum = this.curtotalNum+newData.length;

         if(newData.length === 0){
          return;
         }
         this.handleCache(newData);
         let discoverSquareList = this.feedService.getDiscoverfeeds();
         this.channelNewList = this.filterdiscoverSquareList(_.cloneDeep(discoverSquareList));
         this.searchChannelNewList = _.cloneDeep(this.channelNewList);
         if(this.curtotalNum<=this.totalNum){
              this.pageNum = this.pageNum+1;
              let sid =setTimeout(()=>{
                   this.getHttpsData();
                   clearTimeout(sid);
              },50);
         }
      }
    }).catch((err)=>{

    });
  }

  clickChannelItem(channelItem:any){
    this.removeEvent();
    this.native.go("discoverfeedinfo",{
      params:channelItem
     });
  }

  filterdiscoverSquareList(discoverSquare:any){

    this.developerMode = this.feedService.getDeveloperMode();
    this.feedList = this.feedService.getChannelsList() || [];
    //this.addingChanneList = this.feedService.getToBeAddedFeedsList() || [];
    //this.searchAddingChanneList = _.cloneDeep(this.addingChanneList);
    let discoverSquareList = [];
     discoverSquareList =  _.filter(discoverSquare,(feed:any)=>{
       return this.handleShow(feed);
     });
     return discoverSquareList;
   }

   handleShow(feed:any){

    let  feedNodeId = feed["nodeId"]
    let feedUrl = feed["url"];
    let feedId = feedUrl.split("/")[4];
    let followFeed = _.filter(this.feedList,(item:any)=>{
        return (feedNodeId==item["nodeId"]&&feedId==item["id"]);
    });

    if(followFeed.length>0){
        return false;
    }

    // let addingFeed = _.filter(this.addingChanneList,(item:any)=>{
    //   return (feedNodeId==item["nodeId"]&&feedId==item["feedId"]);
    // });

    // if(addingFeed.length>0){
    //   return false;
    // }

    let purpose = feed["purpose"] || "";
    if(purpose != "" && !this.developerMode){
        return false;
     }

    return true;
  }

  doRefresh(event:any) {
    let sid = setTimeout(() => {
      this.feedService.updateSubscribedFeed();
      this.feedService.setDiscoverfeeds([]);
      this.channelNewList = [];
      this.searchChannelNewList = _.cloneDeep(this.channelNewList);
      this.pageNum = 1;
      this.getHttpsData();
      event.target.complete();
      clearTimeout(sid);
    }, 2000);
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
          })
      }
    });
  }

  clickChannelViewAll(){
    this.removeEvent();
    this.native.navigateForward('channelsviewall',{});
  }

  clickHotNft(){
    this.removeEvent();
    this.native.navigateForward('currencyviewall',{});
  }

  clickTab(type:string){
    console.log("====type====="+type);
    this.tabType = type;
  }
}
