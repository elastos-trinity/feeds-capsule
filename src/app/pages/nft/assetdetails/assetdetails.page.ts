import { Component, OnInit,ViewChild} from '@angular/core';
import { TranslateService } from "@ngx-translate/core";
import { ActivatedRoute } from '@angular/router';
import { NativeService } from '../../../services/NativeService';
import { ThemeService } from '../../../services/theme.service';
import { Events } from 'src/app/services/events.service';
import { TitleBarService } from 'src/app/services/TitleBarService';
import { TitleBarComponent } from 'src/app/components/titlebar/titlebar.component';
import { ApiUrl } from '../../../services/ApiUrl';
import { NFTContractControllerService } from 'src/app/services/nftcontract_controller.service';
import { FeedService} from '../../../services/FeedService';
import { UtilService } from 'src/app/services/utilService';
type detail = {
  type: string,
  details: string
}
@Component({
  selector: 'app-assetdetails',
  templateUrl: './assetdetails.page.html',
  styleUrls: ['./assetdetails.page.scss'],
})
export class AssetdetailsPage implements OnInit {
  @ViewChild(TitleBarComponent, { static: true }) titleBar: TitleBarComponent;
  public contractDetails:detail[]= [];
  public owner:string = "";
  public name:string = "";
  public description:string = "";
  public quantity:string = "";
  public dateCreated:string = "";
  public stickerContractAddress:string = "";// sticker 代理合约的地址
  public parsarContractAddress:string = "";//  parsar 代理合约地址
  public blockchain:string = "Elastos Smart Chain (ESC)";
  public tokenID:string = "";

  public purchaseInfos:detail[] = [];
  public creator:string = "";
  public datePurchased:string = "2020-05-06";
  public price:number = 100;
  public currency:string = "ELASC";
  public type:string = "Bid"
  public purchaseInfoQuantity:string = "1";
  public selectType:string = "AssetdetailsPage.contract";
  public assetUri:string = null;
  public developerMode:boolean =  false;

  constructor(
    private translate:TranslateService,
    private event:Events,
    private native:NativeService,
    private titleBarService:TitleBarService,
    private activatedRoute:ActivatedRoute,
    private nftContractControllerService: NFTContractControllerService,
    private feedService:FeedService,
    public theme:ThemeService,
    ) {

    }

  ngOnInit() {
    this.activatedRoute.queryParams.subscribe(queryParams => {
      let asset = queryParams.asset || {};
      this.owner = queryParams.name || "";
      this.name = queryParams.name || "";
      this.description = queryParams.description || "";
      this.quantity = queryParams.quantity || "1";
      this.tokenID = queryParams.tokenId || "";
      // this.contractAddress = this.web3Service.getStickerAddr();
      this.stickerContractAddress = this.nftContractControllerService.getSticker().getStickerAddress();
      this.parsarContractAddress = this.nftContractControllerService.getPasar().getPasarAddress();
      this.assetUri = this.handleImg(asset);
      let createTime =  queryParams.createTime || "";
      if(createTime!=""){
        let createDate = new Date(parseInt(createTime));
        this.dateCreated = UtilService.dateFormat(createDate,'yyyy-MM-dd HH:mm:ss');
      }
      this.creator = queryParams.royalties || "";
    });
  }

  ionViewWillEnter() {
    this.developerMode = this.feedService.getDeveloperMode();
    this.initTile();
    this.changeType(this.selectType);
    this.addEvent();
  }

  ionViewWillLeave(){
    this.removeEvent();
    this.event.publish(FeedsEvent.PublishType.search);
    this.event.publish(FeedsEvent.PublishType.notification);
    this.event.publish(FeedsEvent.PublishType.addProflieEvent);
  }

  initTile(){
    this.titleBarService.setTitle(this.titleBar,this.translate.instant('AssetdetailsPage.title'));
    this.titleBarService.setTitleBarBackKeyShown(this.titleBar,true);
    this.titleBarService.setTitleBarMoreMemu(this.titleBar);
   }

   addEvent(){
    this.event.subscribe(FeedsEvent.PublishType.updateTitle,()=>{
      this.initTile();
    });
   }

   removeEvent(){
    this.event.unsubscribe(FeedsEvent.PublishType.updateTitle);
   }

   collectContractData(){
    this.contractDetails = [];
    if(this.creator!=""){
      this.contractDetails.push({
        type:'AssetdetailsPage.creator',
        details:this.creator
      });
    }

    this.contractDetails.push({
      type:'AssetdetailsPage.name',
      details:this.name
    });

    this.contractDetails.push({
      type:'AssetdetailsPage.description',
      details:this.description
    });

    this.contractDetails.push({
      type:'AssetdetailsPage.quantity',
      details:this.quantity
    });

    if(this.dateCreated != ""){
      this.contractDetails.push({
        type:'AssetdetailsPage.dateCreated',
        details:this.dateCreated
      });
    }

    this.contractDetails.push({
      type:'AssetdetailsPage.stickerContractAddress',
      details:this.stickerContractAddress
    });

    if(this.developerMode){
      this.contractDetails.push({
        type:'AssetdetailsPage.pasarContractAddress',
        details:this.parsarContractAddress
      });
    }

    this.contractDetails.push({
      type:'AssetdetailsPage.tokenID',
      details:this.tokenID
    });

    this.contractDetails.push({
      type:'BidPage.blockchain',
      details:this.blockchain
    });


   }

   collectPurchaseInfos(){
     this.purchaseInfos = [];
     this.purchaseInfos.push({
      type:'AssetdetailsPage.creator',
      details:this.creator
    });

    this.purchaseInfos.push({
      type:'AssetdetailsPage.datePurchased',
      details:this.datePurchased
    });

    this.purchaseInfos.push({
      type:'AssetdetailsPage.price',
      details:this.price.toString()
    });

    this.purchaseInfos.push({
      type:'AssetdetailsPage.currency',
      details:this.currency
    });

    this.purchaseInfos.push({
      type:'AssetdetailsPage.type',
      details:this.type
    });

    this.purchaseInfos.push({
      type:'AssetdetailsPage.quantity',
      details:this.purchaseInfoQuantity
    });

   }

  async purchaseInfoBurn(){
    this.native.navigateForward(['bid'],{queryParams:{"showType":"burn"}});
    //  let web3 = await this.web3Service.getWeb3Js();
    //  let stickerAddr = this.web3Service.getStickerAddr();
    //  let stickerAbi = this.web3Service.getStickerAbi();
    //  const stickerContract = new web3.eth.Contract(stickerAbi,stickerAddr);
    // const transferData = stickerContract.methods.safeTransferFrom("0xf36dA13891027Fd074bCE86E1669E5364F85613A","0xbA1ddcB94B3F8FE5d1C0b2623cF221e099f485d1",this.tokenID,"1").encodeABI();
    // const transferTx = {
    //   from: "0xf36dA13891027Fd074bCE86E1669E5364F85613A",
    //   to: stickerAddr,
    //   value: 0,
    //   data: transferData,
    // };
    // const accCreator = await this.web3Service.getAccount(web3,"04868f294d8ef6e1079752cd2e1f027a126b44ee27040d949a88f89bddc15f31");
    // const { status: transferStatus } = await this.web3Service.sendTxWaitForReceipt(web3,transferTx, accCreator);

    // if(transferStatus!=""){
    //   alert("transfer sucess");
    // }
   }

   changeType(type:string){
    this.selectType = type;
    switch(type){
      case "AssetdetailsPage.contract":
        this.collectContractData();
      break;
      case "AssetdetailsPage.history":
        this.collectPurchaseInfos();
      break;
    }

   }

   handleImg(imgUri:string){
    if(imgUri.indexOf("feeds:imgage:")>-1){
      imgUri = imgUri.replace("feeds:imgage:","");
      imgUri = ApiUrl.nftGet+imgUri;
    }
    return imgUri;
   }

   copytext(text:any){
    let textdata = text || "";
    if(textdata!=""){
      this.native.copyClipboard(text).then(()=>{
        this.native.toast_trans("common.copysucceeded");
    }).catch(()=>{

    });;
    }
  }
}
