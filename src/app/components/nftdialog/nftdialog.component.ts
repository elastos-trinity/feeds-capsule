import { Component, OnInit } from '@angular/core';
import { ThemeService } from 'src/app/services/theme.service';
import { PopoverController,NavParams} from '@ionic/angular';
import { ApiUrl } from '../../services/ApiUrl';
import { FeedService } from '../../services/FeedService';
// import { Web3Service } from '../../services/Web3Service';
import { NativeService } from 'src/app/services/NativeService';
import { Events } from '../../services/events.service';
import _ from 'lodash';
import { UtilService } from 'src/app/services/utilService';
import { NFTContractControllerService } from 'src/app/services/nftcontract_controller.service';

@Component({
  selector: 'app-nftdialog',
  templateUrl: './nftdialog.component.html',
  styleUrls: ['./nftdialog.component.scss'],
})
export class NftdialogComponent implements OnInit {
  private throwMsgTransDataLimit = 4 * 1000 * 1000;
  private transDataChannel:FeedsData.TransDataChannel = FeedsData.TransDataChannel.MESSAGE;
  public menuType:any = "";
  public amount:any = "";
  public title: string = "";
  public saleOrderId:any = "";
  public assItem:any = {};
  public curAmount:any = "";
  public quantity:any = "";
  public Maxquantity:any = "";
  public imgBase64:string ="";
  public curAssItem:any = {};
  private orderId:any = "";
  constructor(
    private navParams: NavParams,
    private popover: PopoverController,
    // private web3Service:Web3Service,
    private native:NativeService,
    private feedService:FeedService,
    private events:Events,
    public theme: ThemeService,
    private nftContractControllerService: NFTContractControllerService
    ){

    }

  ngOnInit() {
    this.title = this.navParams.get('title');
    this.menuType = this.navParams.get('menuType');
    let assItem = this.navParams.get('assItem');
    this.curAssItem = assItem;
    this.curAmount =this.nftContractControllerService.transFromWei(this.assItem.fixedAmount);
    this.assItem =  _.cloneDeep(assItem);
    let price = this.assItem.fixedAmount || "";
    this.amount =this.nftContractControllerService.transFromWei(price);
    this.quantity = this.assItem.quantity;
    this.Maxquantity = this.assItem.quantity;
    this.saleOrderId = this.assItem.saleOrderId || "";
    this.hanldeImg();
  }

  confirm(){

    switch(this.menuType){
      case "sale":
        this.handleSaleList();
        break;
      case "created":
        this.handleCreatedList();
        break;
      case "buy":
        this.handleBuyList();
        break;
    }
  }

  handleCreatedList(){
    if(!this.number(this.amount)) {
      this.native.toastWarn('common.amountError');
      return;
    }

   if(this.amount <= 0) {
      this.native.toast_trans('common.amountError');
      return;
    }

    if(this.curAmount === this.amount){
      this.native.toast_trans('change price');
      return;
    }
    this.quantity = this.quantity || "";
    if(this.quantity === ""){
      this.native.toast_trans('input quantity');
      return;
    }
    let regNumber = /^\+?[1-9][0-9]*$/;
    if(regNumber.test(this.quantity) == false) {
      this.native.toast_trans('input quantity');
      return;
    }

    if(parseInt(this.quantity) > parseInt(this.Maxquantity)) {
      this.native.toast_trans('input quantity');
      return;
    }
    let tokenId = this.assItem.tokenId;
    this.native.showLoading("common.waitMoment").then(()=>{
      this.handlePasar(tokenId,"created");
    }).catch(()=>{
      this.native.hideLoading();
    })
  }

  handleBuyList(){
    if(!this.number(this.amount)) {
      this.native.toastWarn('common.amountError');
      return;
    }

   if(this.amount <= 0) {
      this.native.toast_trans('common.amountError');
      return;
    }

    if(this.curAmount === this.amount){
      this.native.toast_trans('change price');
      return;
    }
    this.quantity = this.quantity || "";
    if(this.quantity === ""){
      this.native.toast_trans('input quantity');
      return;
    }
    let regNumber = /^\+?[1-9][0-9]*$/;
    if(regNumber.test(this.quantity) == false) {
      this.native.toast_trans('input quantity');
      return;
    }

    if(parseInt(this.quantity) > parseInt(this.Maxquantity)) {
      this.native.toast_trans('input quantity');
      return;
    }
    let tokenId = this.assItem.tokenId;
    this.native.showLoading("common.waitMoment").then(()=>{
      this.handlePasar(tokenId,"buy");
    }).catch(()=>{
      this.native.hideLoading();
    })
  }

  handleSaleList(){

    if(!this.number(this.amount)) {
      this.native.toastWarn('common.amountError');
      return;
    }

   if(this.amount <= 0) {
      this.native.toast_trans('common.amountError');
      return;
    }

    if(this.curAmount === this.amount){
      this.native.toast_trans('change price');
      return;
    }

    this.native.showLoading("common.waitMoment").then(()=>{
      this.changePrice();
    }).catch(()=>{
      this.native.hideLoading();
    })
  }

  async handlePasar(tokenId:any,type:any){
    let sellerAddress = this.nftContractControllerService.getAccountAddress();
    const sellerInfo = await this.nftContractControllerService.getPasar().getSellerByAddr(sellerAddress);
    this.orderId  =  sellerInfo[2];

    // Seller approve pasar
    let pasarAddr = this.nftContractControllerService.getPasar().getAddress();
    let result = "";
    try{
      result = await this.nftContractControllerService.getSticker().setApprovalForAll(sellerAddress, pasarAddr,true);
    }catch(error){
    }

    result = result || "";
    if(result===""){
      this.native.hideLoading();
      this.native.toast_trans("common.publicPasarFailed");
      return;
    }

    let accountAddress = this.nftContractControllerService.getAccountAddress();
    let price = UtilService.accMul(this.amount,this.quantity);
    console.log("=======price======="+price);
    let salePrice = this.nftContractControllerService.transToWei(price.toString());
    console.log("=======salePrice======="+salePrice);
      console.log("=====this.quantity======"+typeof(this.quantity));
      if(typeof(this.quantity)=== "number"){
        this.quantity = this.quantity.toString();
      }
      console.log("=====this.quantity======"+typeof(this.quantity));
      let orderIndex = -1;
      try{
        orderIndex = await this.nftContractControllerService.getPasar().createOrderForSale(tokenId,this.quantity,salePrice);
      }catch(error){
      }
       
      
      orderIndex = orderIndex || -1;
      if(orderIndex == -1){
        this.native.hideLoading();
        this.native.toast_trans("common.publicPasarFailed");
        return;
      }
      //console.log("======receipt======"+JSON.stringify(receipt))
      await this.getSetChannel(tokenId);
      let sAssItem =_.cloneDeep(this.curAssItem);
          sAssItem["sellerAddr"] = sellerAddress;
      let obj = {"type":type,"assItem":sAssItem}
      this.events.publish(FeedsEvent.PublishType.nftUpdateList,obj);
      this.native.hideLoading();
      this.popover.dismiss();
      this.native.toast("public pasar sucess");
  }


  async changePrice(){
    let accountAddress = this.nftContractControllerService.getAccountAddress();
    let price = this.nftContractControllerService.transToWei(this.amount.toString()).toString();
    let changeStatus = "";
    try{
      changeStatus = await this.nftContractControllerService.getPasar().changeOrderPrice(accountAddress, this.saleOrderId, price);
    }catch(error){
    }

    changeStatus = changeStatus || "";
    
    if(changeStatus!=""&&changeStatus!=undefined){
      this.native.hideLoading();
      this.curAssItem.fixedAmount = price;
      let list = this.feedService.getPasarList();
      this.feedService.setData("feed.nft.pasarList",JSON.stringify(list));
      this.popover.dismiss();
    }else{
      this.native.hideLoading();
      this.native.toast_trans("common.priceChangeFailed")
    }
  }

  number(text:any) {
    var numPattern = /^(([1-9]\d*)|\d)(.\d{1,9})?$/;
    return numPattern.test(text);
  }

  cancel(){
    if(this.popover!=null){
      this.popover.dismiss();
    }
  }

 async hanldeImg(){
    let imgUri = this.assItem["thumbnail"];
    if(imgUri.indexOf("feeds:imgage:")>-1){
      imgUri = imgUri.replace("feeds:imgage:","");
      imgUri = ApiUrl.nftGet+imgUri;
    }
    this.imgBase64 = await this.compressImage(imgUri);
  }

  async getSetChannel(tokenId:any){
    let setChannel = this.feedService.getCollectibleStatus();
    for(let key in setChannel){
        let value = setChannel[key] || "";
        if(value){
        let nodeId = key.split("_")[0];
        let channelId =parseInt(key.split("_")[1]) ;
        await this.sendPost(tokenId,nodeId,channelId);
        }
    }
   }

   async sendPost(tokenId:any,nodeId:string,channelId:number){
     let tempPostId = this.feedService.generateTempPostId();
     this.publishPostThrowMsg(tokenId,nodeId,channelId,tempPostId);
   }

   async publishPostThrowMsg(tokenId:any,nodeId:string,channelId:number,tempPostId: number){

         let imgSize = this.imgBase64.length;
         if (imgSize > this.throwMsgTransDataLimit){
           this.transDataChannel = FeedsData.TransDataChannel.SESSION
           let memo: FeedsData.SessionMemoData = {
             feedId    : channelId,
             postId    : 0,
             commentId : 0,
             tempId    : tempPostId
           }
           this.feedService.restoreSession(nodeId, memo);
         }else{
           this.transDataChannel = FeedsData.TransDataChannel.MESSAGE
         }

         let imgThumbs: FeedsData.ImgThumb[] = [];
           let imgThumb: FeedsData.ImgThumb = {
             index   : 0,
             imgThumb: this.imgBase64,
             imgSize : imgSize
           }
         imgThumbs.push(imgThumb);

         let nftContent = {};
         nftContent["version"]="1.0";
         nftContent["imageThumbnail"] = imgThumbs;
         nftContent["text"] = this.assItem.description;
         nftContent["nftTokenId"] = tokenId;
         nftContent["nftOrderId"] = this.orderId;
         //let content = this.feedService.createContent(this.nftDescription,imgThumbs,null);
         this.feedService.declarePost(nodeId,channelId,JSON.stringify(nftContent),false,tempPostId,
         this.transDataChannel,this.imgBase64,"");
   }

  compressImage(path:any):Promise<string>{
    //最大高度
    const maxHeight = 600;
    //最大宽度
    const maxWidth = 600;
    return new Promise((resolve, reject) => {
        let img = new Image();
        img.setAttribute('crossOrigin', 'anonymous');
        img.src = path;

        img.onload = ()=> {
          const originHeight = img.height;
          const originWidth = img.width;
          let compressedWidth = img.height;
          let compressedHeight = img.width;
          if ((originWidth > maxWidth) && (originHeight > maxHeight)) {
            // 更宽更高，
            if ((originHeight / originWidth) > (maxHeight / maxWidth)) {
              // 更加严重的高窄型，确定最大高，压缩宽度
              compressedHeight = maxHeight
              compressedWidth = maxHeight * (originWidth / originHeight)
            } else {
              //更加严重的矮宽型, 确定最大宽，压缩高度
              compressedWidth = maxWidth
              compressedHeight = maxWidth * (originHeight / originWidth)
            }
          } else if (originWidth > maxWidth && originHeight <= maxHeight) {
            // 更宽，但比较矮，以maxWidth作为基准
            compressedWidth = maxWidth
            compressedHeight = maxWidth * (originHeight / originWidth)
          } else if (originWidth <= maxWidth && originHeight > maxHeight) {
            // 比较窄，但很高，取maxHight为基准
            compressedHeight = maxHeight
            compressedWidth = maxHeight * (originWidth / originHeight)
          } else {
            // 符合宽高限制，不做压缩
          }
          // 生成canvas
          let canvas = document.createElement('canvas');
          let context = canvas.getContext('2d');
          canvas.height = compressedHeight;
          canvas.width = compressedWidth;
          // context.globalAlpha = 0.2;
          context.clearRect(0, 0, compressedWidth, compressedHeight);
          context.drawImage(img, 0, 0, compressedWidth, compressedHeight);
          let base64 = canvas.toDataURL('image/*');
          resolve(base64);
        }

      });
    }
}
