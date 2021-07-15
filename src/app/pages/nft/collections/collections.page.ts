import { Component,OnInit,ViewChild} from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { TranslateService } from "@ngx-translate/core";
import { FeedService } from '../../../services/FeedService';
import { ThemeService } from '../../../services/theme.service';
import { NativeService } from '../../../services/NativeService';
import { Events } from '../../../services/events.service';
import { TitleBarService } from '../../../services/TitleBarService';
import { TitleBarComponent } from '../../..//components/titlebar/titlebar.component';
// import { Web3Service } from '../../../services/Web3Service';
import { HttpService } from '../../../services/HttpService';
import { MenuService } from 'src/app/services/MenuService';
import { ApiUrl } from '../../../services/ApiUrl';
import { NFTContractControllerService } from 'src/app/services/nftcontract_controller.service';

import _ from 'lodash';

@Component({
  selector: 'app-collections',
  templateUrl: './collections.page.html',
  styleUrls: ['./collections.page.scss'],
})
export class CollectionsPage implements OnInit {
  @ViewChild(TitleBarComponent, { static: true }) titleBar: TitleBarComponent;
  public nodeId:string = "";
  public channelId:number = null;
  public selectType:string = "CollectionsPage.created";
  public createdList = [];
  public purchasedList = [];
  public onSaleList = [];
  public likesList:any = [];
  public isMine:number = null;
  public isLoading:boolean =true;
  public nftCreatedCount:number = null;
  constructor(
    private translate:TranslateService,
    private event:Events,
    private native: NativeService,
    private activatedRoute:ActivatedRoute,
    private feedService: FeedService,
    private titleBarService:TitleBarService,
    // private web3Service:Web3Service,
    private httpService:HttpService,
    private menuService: MenuService,
    public theme:ThemeService,
    private nftContractControllerService: NFTContractControllerService,
    ) { }

  ngOnInit(){
    this.activatedRoute.queryParams.subscribe(queryParams => {
      this.nodeId = queryParams.nodeId;
      this.channelId = queryParams.channelId;
    });
  }

  ionViewWillEnter() {
    this.isMine = this.checkChannelIsMine();
   let list = this.feedService.getOwnCreatedList();
    if(list.length === 0){
      this.getNftCreated();
    }else{
      this.createdList = list;
    }
    this.initTile();
    this.addEvent();
  }

  ionViewWillLeave(){
    this.removeEvent();
    this.event.publish(FeedsEvent.PublishType.search);
    this.event.publish(FeedsEvent.PublishType.notification);
    this.event.publish(FeedsEvent.PublishType.addProflieEvent);
  }

  initTile(){
    this.titleBarService.setTitle(this.titleBar,this.translate.instant('CollectionsPage.title'));
    this.titleBarService.setTitleBarBackKeyShown(this.titleBar,true);
    this.titleBarService.setTitleBarMoreMemu(this.titleBar);
   }

   addEvent(){
    this.event.subscribe(FeedsEvent.PublishType.updateTitle,()=>{
      this.initTile();
    });

    this.event.subscribe(FeedsEvent.PublishType.nftCancelOrder,(assetItem)=>{
        let saleOrderId = assetItem.saleOrderId;
        let sellerAddr = assetItem.sellerAddr;
        console.log("=====sellerAddr====="+sellerAddr);
       // remove sale
        this.onSaleList =  _.filter(this.onSaleList,(item)=>{
          return item.saleOrderId!=saleOrderId; }
        );

        this.feedService.setOwnOnSaleList(this.onSaleList);
        this.feedService.setData("feed.nft.own.onSale.list",JSON.stringify(this.onSaleList));

        //add created
         assetItem["fixedAmount"] = "";
        let clist = this.feedService.getOwnCreatedList();
            clist.push(assetItem);
        this.feedService.setOwnCreatedList(clist);
        this.feedService.setData("feed.nft.own.created.list",JSON.stringify(clist));

       //remove pasr
       let pList = this.feedService.getPasarList();
           pList =  _.filter(pList,(item)=>{
           return !(item.saleOrderId===saleOrderId&&item.sellerAddr===sellerAddr)
          }
       );
      this.feedService.setPasarList(pList);
      this.feedService.setData("feed.nft.pasarList",JSON.stringify(pList))
    });

    this.event.subscribe(FeedsEvent.PublishType.nftUpdateList,(obj)=>{
      let type = obj["type"];
      switch(type){
        case "buy":
          let assItem = obj["assItem"];
          let saleOrderId = assItem["saleOrderId"];
          let tokenId = assItem["tokenId"];
          this.purchasedList =  _.filter(this.purchasedList,(item)=>{
            return item.saleOrderId!=saleOrderId; }
          );
          this.feedService.setOwnPurchasedList(this.purchasedList);
          this.feedService.setData("feed.nft.own.purchased.list",JSON.stringify(this.purchasedList));

          let cList = this.feedService.getOwnCreatedList();
          cList =  _.filter(cList,(item)=>{
            return item.tokenId!=tokenId; }
          );
          this.feedService.setOwnCreatedList(cList);
          this.feedService.setData("feed.nft.own.created.list",JSON.stringify(cList));

          let pList = this.feedService.getPasarList();
          let pItem = _.cloneDeep(assItem);
              pList.push(pItem);
          this.feedService.setPasarList(pList);
          this.feedService.setData("feed.nft.pasarList",JSON.stringify(pList));

          let olist = this.feedService.getOwnOnSaleList();
          let oItem = _.cloneDeep(assItem);
              olist.push(oItem);
          this.feedService.setOwnOnSaleList(olist);
          this.feedService.setData("feed.nft.own.onSale.list",JSON.stringify(olist));
          break;
        case "created":
          let cAssItem = obj["assItem"];
          let cSaleOrderId = cAssItem["saleOrderId"] || "";
          if(cSaleOrderId!=""){

            this.createdList =  _.filter(this.createdList,(item)=>{
              return item.saleOrderId!=cSaleOrderId; }
            );
            this.feedService.setOwnCreatedList(this.createdList);
            this.feedService.setData("feed.nft.own.created.list",JSON.stringify(this.createdList));

            let purchasedList = this.feedService.getOwnPurchasedList();
                purchasedList =  _.filter(purchasedList,(item)=>{
              return item.saleOrderId!=cSaleOrderId;}
            );
            this.feedService.setOwnPurchasedList(purchasedList);
            this.feedService.setData("feed.nft.own.purchased.list",JSON.stringify(purchasedList));
          }else{
            let tokenId = cAssItem["tokenId"] || "";
            this.createdList =  _.filter(this.createdList,(item)=>{
              return item.tokenId!=tokenId; }
            );
            this.feedService.setOwnCreatedList(this.createdList);
            this.feedService.setData("feed.nft.own.created.list",JSON.stringify(this.createdList));

            let purchasedList = this.feedService.getOwnPurchasedList();
            purchasedList =  _.filter(purchasedList,(item)=>{
               return item.tokenId!=tokenId;}
            );
           this.feedService.setOwnPurchasedList(purchasedList);
           this.feedService.setData("feed.nft.own.purchased.list",JSON.stringify(purchasedList));
          }

          let cpList = this.feedService.getPasarList();
          let cpItem = _.cloneDeep(cAssItem);
              cpList.push(cpItem);
          this.feedService.setPasarList(cpList);
          this.feedService.setData("feed.nft.pasarList",JSON.stringify(cpList));

          let colist = this.feedService.getOwnOnSaleList();
          let coItem = _.cloneDeep(cAssItem);
              colist.push(coItem);
          this.feedService.setOwnOnSaleList(colist);
          this.feedService.setData("feed.nft.own.onSale.list",JSON.stringify(colist));
          break;
      }

  });

   }

   removeEvent(){
    this.event.unsubscribe(FeedsEvent.PublishType.updateTitle);
    this.event.unsubscribe(FeedsEvent.PublishType.nftCancelOrder);
    this.event.unsubscribe(FeedsEvent.PublishType.nftUpdateList);
   }

   changeType(type:string){
    this.selectType = type;
    switch(type){
      case 'CollectionsPage.created':
        this.isLoading = true;
        let list = this.feedService.getOwnCreatedList();
        if(list.length === 0){
          this.getNftCreated();
        }else{
          this.createdList = list;
          this.isLoading = false;
        }
        break;
      case 'CollectionsPage.purchased':
        this.isLoading = true;
        let plist = this.feedService.getOwnPurchasedList();
        if(plist.length === 0){
            this.getPurchased();
        }else{
          this.purchasedList = plist;
          this.isLoading = false;
        }
        break;
      case 'CollectionsPage.onSale':
        this.isLoading = true;
        let olist = this.feedService.getOwnOnSaleList();
        if(olist.length === 0){
            this.getOnSale();
        }else{
          this.onSaleList = olist;
          this.isLoading = false;
        }
        break;
      case 'CollectionsPage.likes':
          this.isLoading = true;
          this.likesList = [];
          this.isLoading = false;
          break;
    }
  }

  addAsset(){
    this.native.navigateForward(['mintnft'],{});
  }

  clickAssetItem(assetitem:any){
    this.native.navigateForward(['assetdetails'],{queryParams:assetitem});
  }

  checkChannelIsMine(){
    if (this.feedService.checkChannelIsMine(this.nodeId, this.channelId))
      return 0;

    return 1;
  }

 async getNftCreated(){
   this.createdList = [];
   this.feedService.setOwnCreatedList([]);
   let createAddress = this.nftContractControllerService.getAccountAddress();
   let nftCreatedCount = await this.countOfOwner(createAddress);
   if(nftCreatedCount === "0"){
       this.hanleListCace("created");
       this.isLoading = false;
   }else{
    for(let index = 0 ;index<nftCreatedCount;index++){
      this.createdList.push(null);
    }
    for(let cIndex=0;cIndex<nftCreatedCount;cIndex++){
    this.handleOwnCreatedData(createAddress,cIndex)
    }
  }

 }

async handleOwnCreatedData(createAddress:any,cIndex:any){
  // let tokenId =  await stickerContract.methods.tokenIdOfOwnerByIndex(createAddress,cIndex).call();
  // let tokenInfo =  await stickerContract.methods.tokenInfo(tokenId).call();
  let tokenId =  await this.nftContractControllerService.getSticker().tokenIdOfOwnerByIndex(createAddress,cIndex);
  let tokenInfo =  await this.nftContractControllerService.getSticker().tokenInfo(tokenId);
  let price = "";
  let tokenNum =  tokenInfo[2];
  let tokenUri = tokenInfo[3];
  let royaltyOwner = tokenInfo[4];
  this.handleFeedsUrl(tokenUri,tokenId,price,tokenNum,royaltyOwner,"created",cIndex);
 }

 async countOfOwner(createAddress:any){
  // let nftCreatedCount =  await stickerContract.methods.tokenCountOfOwner(createAddress).call();
  let nftCreatedCount =  await this.nftContractControllerService.getSticker().tokenCountOfOwner(createAddress);
  return nftCreatedCount;
}

handleFeedsUrl(feedsUri:string,tokenId:string,price:any,tokenNum:any,royaltyOwner:any,listType:any,cIndex:any){
  feedsUri  = feedsUri.replace("feeds:json:","");
  this.httpService.ajaxGet(ApiUrl.nftGet+feedsUri,false).then((result)=>{
  let type = result["type"] || "single";
  let royalties = royaltyOwner;
  let quantity = tokenNum;
  let fixedAmount = price;
  let thumbnail = result["thumbnail"] || "";
  if(thumbnail === ""){
    thumbnail = result["image"];
  }
  let item = {
      "tokenId":tokenId,
      "asset":result["image"],
      "name":result["name"],
      "description":result["description"],
      "fixedAmount":fixedAmount,
      "kind":result["kind"],
      "type":type,
      "royalties":royalties,
      "quantity":quantity,
      "thumbnail":thumbnail
  }
  try{
    this.createdList.splice(cIndex,1,item);
    this.hanleListCace(listType);
    this.isLoading = false;
  }catch(err){
   console.log("====err===="+JSON.stringify(err));
  }
  }).catch(()=>{

  });
}

async getPurchased(){
  this.purchasedList = [];
  this.feedService.setOwnPurchasedList(this.purchasedList);
  let createAddress = this.nftContractControllerService.getAccountAddress();
  let buyerInfo = await this.nftContractControllerService.getPasar().getBuyerByAddr(createAddress);
  console.log("BuyerInfo", buyerInfo);
  let buyerAddr = buyerInfo[1];
  let buyOrderCount = buyerInfo[2];
  if(buyOrderCount === '0'){
    this.hanleListCace("buy");
    this.isLoading = false;
  }else{
    for(let index = 0;index<buyOrderCount;index++){
      this.purchasedList.push(null);
    }
    this.handleBuyOrder(buyerAddr,buyOrderCount);
  }

}

async getOnSale(){
  this.onSaleList = [];
  this.feedService.setOwnOnSaleList([]);
  let createAddress = this.nftContractControllerService.getAccountAddress();
  let sellerInfo = await this.nftContractControllerService.getPasar().getSellerByAddr(createAddress);
  let sellerAddr = sellerInfo[1];
  let orderCount = sellerInfo[3];
  if(orderCount === '0'){
    this.hanleListCace("sale");
    this.isLoading = false;
  }else{
    for(let index = 0;index<orderCount;index++){
      this.onSaleList.push(null);
    }
   await this.handleOrder(sellerAddr,orderCount,"sale");
  }

}

async handleOrder(sellerAddr:any,orderCount:any,listType:any){
   for(let index=0;index<orderCount;index++){
    try {
      let sellerOrder =  await this.nftContractControllerService.getPasar().getSellerOpenByIndex(sellerAddr,index);
      let tokenId = sellerOrder[3];
      let saleOrderId = sellerOrder[0];
      let price = sellerOrder[5];
      // const stickerContract = this.web3Service.getSticker();
      let tokenInfo = await this.nftContractControllerService.getSticker().tokenInfo(tokenId);
      let feedsUri= tokenInfo[3];
      feedsUri  = feedsUri.replace("feeds:json:","");
      let tokenNum = tokenInfo[2];
      this.httpService.ajaxGet(ApiUrl.nftGet+feedsUri,false).then((result)=>{
       let type = result["type"] || "single";
       let royalties = result["royalties"] || "1";
       let quantity = tokenNum;
       let fixedAmount = price || "1";
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
           "fixedAmount":fixedAmount,
           "kind":result["kind"],
           "type":type,
           "royalties":royalties,
           "quantity":quantity,
           "thumbnail":thumbnail,
           "sellerAddr":sellerAddr
       }
       this.onSaleList.splice(index,1,item);
       this.hanleListCace(listType);
       this.isLoading = false;
       }).catch(()=>{

       });
    } catch (error) {
      this.onSaleList =_.filter(this.onSaleList,(item)=>{
           return item!=null;
      });
     this.hanleListCace(listType);
     this.isLoading = false;
    }

   }
}

async handleBuyOrder(buyerAddr:any,orderCount:any){
  for(let index=0;index<orderCount;index++){
    //try {
    let purchasedOrder =  await this.nftContractControllerService.getPasar().getBuyerOrderByIndex(buyerAddr,index);
    let tokenId = purchasedOrder[3];
    let saleOrderId = purchasedOrder[0];
    let price = purchasedOrder[5];

    // const stickerContract = this.web3Service.getSticker();
    let tokenInfo = await this.nftContractControllerService.getSticker().tokenInfo(tokenId);
    let feedsUri= tokenInfo[3];
    feedsUri  = feedsUri.replace("feeds:json:","");
    let tokenNum = tokenInfo[2];
    this.httpService.ajaxGet(ApiUrl.nftGet+feedsUri,false).then((result)=>{
     let type = result["type"] || "single";
     let royalties = result["royalties"] || "1";
     let quantity = tokenNum;
     let fixedAmount = price || "1";
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
         "fixedAmount":fixedAmount,
         "kind":result["kind"],
         "type":type,
         "royalties":royalties,
         "quantity":quantity,
         "thumbnail":thumbnail
     }
      this.purchasedList.splice(index,1,item);
       this.hanleListCace("buy");
       this.isLoading = false;
     }).catch(()=>{

     });
    // } catch (error) {
    //   this.purchasedList =_.filter(this.purchasedList,(item)=>{
    //     return item!=null;
    //   });
    //  this.hanleListCace("buy");
    //  this.isLoading = false;
    // }

  }
}

clickMore(parm:any){
  let type = parm["type"];
  console.log("===type==="+type);
  let asstItem = parm["assetItem"];
  switch(type){
     case "CollectionsPage.onSale":
       this.handleOnSale(asstItem);
       break;
      case "CollectionsPage.purchased":
       this.handleBuy(asstItem);
       break;
      case "CollectionsPage.created":
        this.handleCreated(asstItem);
        break;
  }
}

handleOnSale(asstItem:any){
 this.menuService.showOnSaleMenu(asstItem);
}

handleBuy(asstItem:any){
  this.menuService.showBuyMenu(asstItem);
}

handleCreated(asstItem:any){
  this.menuService.showCreatedMenu(asstItem);
}

doRefresh(event:any){
  this.isLoading = true;
  switch(this.selectType){
    case "CollectionsPage.created":
      this.createdList = [];
      this.feedService.setOwnCreatedList([]);
      let cId =  setTimeout(() => {
           this.getNftCreated();
           event.target.complete();
           clearTimeout(cId);
      },1000);
      break;
    case "CollectionsPage.purchased":
      this.purchasedList = [];
      this.feedService.setOwnPurchasedList([]);
      let pId =  setTimeout(() => {
        this.getPurchased();
        event.target.complete();
        clearTimeout(pId);
       },1000);
      break;
    case "CollectionsPage.onSale":
      this.onSaleList = [];
      this.feedService.setOwnOnSaleList([]);
      this.feedService.setOwnOnSaleList([]);
      let oId =  setTimeout(() => {
        this.getOnSale();
        event.target.complete();
        clearTimeout(oId);
      },1000);
      break;
  }
}

hanleListCace(listType:string){
  console.log("====listType===="+listType);
  switch(listType){
   case "created":
     console.log("====this.createdList===="+this.createdList.length);
      this.feedService.setOwnCreatedList(this.createdList);
      this.feedService.setData("feed.nft.own.created.list",JSON.stringify(this.createdList));
      break;
   case "buy":
      this.feedService.setOwnPurchasedList(this.purchasedList);
      this.feedService.setData("feed.nft.own.purchased.list",JSON.stringify(this.purchasedList));
      break;
   case "sale":
      this.feedService.setOwnOnSaleList(this.onSaleList);
      this.feedService.setData("feed.nft.own.onSale.list",JSON.stringify(this.onSaleList));
      break;
  }
}

}
