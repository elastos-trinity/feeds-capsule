import { Component, OnInit , NgZone,ViewChild } from '@angular/core';
import { TranslateService } from "@ngx-translate/core";
import { ThemeService } from '../../../services/theme.service';
import { CameraService } from '../../../services/CameraService';
import { NativeService } from '../../../services/NativeService';
import { UtilService } from '../../../services/utilService';
// import { Web3Service } from '../../../services/Web3Service';
import { Events } from '../../../services/events.service';
import { TitleBarService } from '../../../services/TitleBarService';
import { TitleBarComponent } from '../../..//components/titlebar/titlebar.component';
import { File,DirectoryEntry} from '@ionic-native/file/ngx';
import { HttpService } from '../../../services/HttpService';
import { ApiUrl } from '../../../services/ApiUrl';
import { FeedService } from '../../../services/FeedService';
import { NFTContractControllerService } from 'src/app/services/nftcontract_controller.service';
import { WalletConnectControllerService } from 'src/app/services/walletconnect_controller.service';

@Component({
  selector: 'app-mintnft',
  templateUrl: './mintnft.page.html',
  styleUrls: ['./mintnft.page.scss'],
})
export class MintnftPage implements OnInit {
  @ViewChild(TitleBarComponent, { static: true }) titleBar: TitleBarComponent;
  private throwMsgTransDataLimit = 4 * 1000 * 1000;
  private transDataChannel:FeedsData.TransDataChannel = FeedsData.TransDataChannel.MESSAGE;
  public assetBase64:string = "";
  public nftName:string = "";
  public nftDescription:string = "";
  public curPublishtoPasar:boolean = true;
  /**single  multiple*/
  public issueRadionType:string="single";
  public nftRoyalties:string="";
  public nftQuantity:string = "1";
  public nftFixedAmount:number = null;
  public nftMinimumAmount:number = null;
  /**fixedPrice highestBid */
  public sellMethod:string = "fixedPrice";
  public expirationDate:string = "";
  public maxExpirationDate:string = "";
  public minExpirationDate:string = "";
  public fileName:string = "";
  public thumbnail:string = "";
  private imageObj:any = {};
  private orderId:any = "";
  constructor(
    private translate:TranslateService,
    private event:Events,
    private zone: NgZone,
    private camera: CameraService,
    private native: NativeService,
    private titleBarService: TitleBarService,
    private httpService:HttpService,
    private file:File,
    // private web3Service:Web3Service,
    private feedService:FeedService,
    public theme:ThemeService,
    private nftContractControllerService: NFTContractControllerService,
    private walletConnectControllerService: WalletConnectControllerService) { }

  ngOnInit() {
  }

  ionViewWillEnter() {
    if (this.walletConnectControllerService.getAccountAddress() == "")
      this.walletConnectControllerService.connect();

    this.minExpirationDate = UtilService.dateFormat(new Date());
    this.expirationDate = UtilService.dateFormat(new Date(new Date().getTime()+24*60*60*1000));
    this.maxExpirationDate = UtilService.dateFormat(new Date(new Date().getTime()+10*365*24*60*60*1000));
    this.initTile();
    this.addEvent();
  }

  ionViewWillLeave(){
    this.removeEvent();
    this.event.publish(FeedsEvent.PublishType.addBinaryEvevnt);
  }

  initTile(){
    this.titleBarService.setTitle(this.titleBar,this.translate.instant('MintnftPage.title'));
    this.titleBarService.setTitleBarBackKeyShown(this.titleBar, true);
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

   clickPublishtoPasar(){
    this.zone.run(()=>{
      this.curPublishtoPasar = !this.curPublishtoPasar;
    });
  }

  addAsset(){
    this.addImg(0);
  }

  mint(){
    if(this.checkParms()){
        this.sendIpfsJSON();
    }
  }

  getFlieObj(fileName:string,filepath:string){

    this.file.resolveLocalFilesystemUrl(filepath)
    .then((dirEntry: DirectoryEntry)=>{
      dirEntry.getFile(fileName,{ create: true, exclusive: false},
      (fileEntry)=>{
        fileEntry.file(
        (file)=>{
          let fileReader = new FileReader();
          fileReader.onloadend =(event:any)=>{
            this.zone.run(()=>{
              let assetBase64 = fileReader.result.toString();
              this.sendIpfsImage(fileName,assetBase64);
            });
          };

          fileReader.onprogress = (event:any)=>{
            this.zone.run(()=>{
            })
          };

          fileReader.readAsDataURL(file);
        },
        ()=>{

        })
      },()=>{

      });
    }).catch((dirEntryErr)=>{
      console.log("====dirEntryErr===="+JSON.stringify(dirEntryErr))
    });
  }

  async sendIpfsImage(fileName:string,file:any){
    let thumbnailBase64 = await this.compressImage(file);
    let blob = this.dataURLtoBlob(file);
    let formData = new FormData();
    formData.append("",blob);
    this.httpService.ajaxNftPost(ApiUrl.nftAdd,formData).then((result)=>{
        let hash = result["Hash"] || null;
        let imgFormat = fileName.split(".")[1];
        if(hash != null){
          this.assetBase64 = file;
          this.imageObj["imgSize"] = result["Size"];
          this.imageObj["imgHash"] = "feeds:imgage:"+hash;
          this.imageObj["imgFormat"] = imgFormat;
          this.sendIpfsThumbnail(thumbnailBase64);
        }
    }).catch((err)=>{
      this.native.hideLoading();
    });
  }

  sendIpfsThumbnail(thumbnailBase64:any){
    let thumbnailBlob  = this.dataURLtoBlob(thumbnailBase64);
    let formData = new FormData();
    formData.append("",thumbnailBlob);
    this.httpService.ajaxNftPost(ApiUrl.nftAdd,formData,false).then((result)=>{
      let hash = result["Hash"] || null;
      if(hash != null){
        this.native.hideLoading();
        this.thumbnail = thumbnailBase64;
        this.imageObj["thumbnail"] = "feeds:imgage:"+hash;
      }

    }).catch((err)=>{
      this.native.hideLoading();
    });
  }

  sendIpfsJSON(){
   let ipfsJSON = {
      "version":"1",
      "type": "image",
      "name":this.nftName,
      "description":this.nftDescription,
      "image":this.imageObj['imgHash'],
      "kind":this.imageObj['imgFormat'],
      "size":this.imageObj["imgSize"],
      "thumbnail":this.imageObj["thumbnail"]
   }

   let formData = new FormData();
   formData.append("",JSON.stringify(ipfsJSON));

   this.httpService.ajaxNftPost(ApiUrl.nftAdd,formData).then((result)=>{
    //{"Name":"blob","Hash":"QmaxWgjheueDc1XW2bzDPQ6qnGi9UKNf23EBQSUAu4GHGF","Size":"17797"};
    console.log("====json Data====="+JSON.stringify(result));
    let hash = result["Hash"] || null;
    if(hash != null){
       let tokenId = "0x"+UtilService.SHA256(hash);
       let jsonHash = "feeds:json:"+hash;
       this.mintContract(tokenId,jsonHash,this.nftQuantity,this.nftRoyalties);
    }
}).catch((err)=>{
     console.log("========"+JSON.stringify(err));
});

  }

  dataURLtoBlob(dataurl:string) {
    let arr = dataurl.split(','),
        mime = arr[0].match(/:(.*?);/)[1],
        bstr = atob(arr[1]),
        n = bstr.length,
        u8arr = new Uint8Array(n);
    while (n--) {
        u8arr[n] = bstr.charCodeAt(n);
    }
    return new Blob([u8arr], { type: mime });
 }

  addImg(type: number) {
    this.camera.openCamera(
      100,1, type,
      (imgPath: any) => {
        this.zone.run(() => {
          let pathObj =this.handlePath(imgPath);
          this.getFlieObj(pathObj["fileName"],pathObj["filepath"])
        });
      },
      (err: any) => {
        console.error('Add img err', err);
        let imgUrl = this.assetBase64 || "";
        if(imgUrl) {
          this.native.toast_trans('common.noImageSelected');
        }
      }
    );
  }

  removeImg(){
    this.thumbnail = "";
    this.assetBase64 = "";
  }

  checkParms(){
    if(this.thumbnail === ""){
      this.native.toastWarn("MintnftPage.nftAssetPlaceholder");
      return false;
    }

    if(this.nftName === ""){
      this.native.toastWarn("MintnftPage.nftNamePlaceholder");
      return false;
    }

    if(this.nftDescription === ""){
      this.native.toastWarn("MintnftPage.nftDescriptionPlaceholder");
      return false;
    }

    if(this.curPublishtoPasar&&this.issueRadionType=== "oneTimeIssue" && this.nftFixedAmount === null){
      this.native.toastWarn("MintnftPage.nftFixedAmount");
      return false;
    }

    if(this.curPublishtoPasar&&this.issueRadionType=== "reIssueable" && this.nftMinimumAmount === null){
      this.native.toastWarn("MintnftPage.nftMinimumAmount");
      return false;
    }

    if(this.nftRoyalties === ""){
      this.native.toastWarn("MintnftPage.nftRoyaltiesPlaceholder");
      return false;
    }

    if(this.nftQuantity === ""){
      this.native.toastWarn("MintnftPage.nftQuantityPlaceholder");
      return false;
    }
    return true;
  }

  radioChange(){
    if(this.issueRadionType === 'single'){
        this.nftQuantity = "1";
    }else{
        this.nftQuantity = "";
    }
  }

  handlePath(fileUri:string){
    let pathObj = {};
    fileUri =  fileUri.replace("/storage/emulated/0/","/sdcard/");
    let path = fileUri.split("?")[0];
    let lastIndex = path.lastIndexOf("/");
    pathObj["fileName"] =  path.substring(lastIndex+1,fileUri.length);
    this.fileName = pathObj["fileName"];
    pathObj["filepath"] =  path.substring(0,lastIndex);
    pathObj["filepath"] = pathObj["filepath"].startsWith('file://') ? pathObj["filepath"] : `file://${pathObj["filepath"]}`;
    return pathObj;
  }

  async mintContract(tokenId:any,uri:any,supply:any,royalty:any){
    let result = "";
    try{
      result = await this.nftContractControllerService.getSticker().mint(tokenId, supply, uri, royalty);
    }catch(error){
    }

    result = result || "";
    if(result=== ""){
      this.native.hideLoading();
      alert("nft创建失败");
      this.native.toast_trans("common.nftCreationFailed")
    return;
    }
    if(result!=""&&this.curPublishtoPasar){
      this.handlePasar(tokenId);
      return;
    }
    this.native.hideLoading();
    this.native.pop();
    this.native.toast("sucess");
  }

 async handlePasar(tokenId:any){
    // Seller approve pasar
    let pasarAddress = this.nftContractControllerService.getPasar().getAddress();
    let result = "";
    let accountAddress = this.nftContractControllerService.getAccountAddress();
    try{
      result = await this.nftContractControllerService.getSticker().setApprovalForAll(accountAddress, pasarAddress, true);
    }catch(error){
    }

    result = result || "";
    if(result===""){
      this.native.hideLoading();
      alert("public pasar失败");
      return;
    }

    let price = UtilService.accMul(this.nftFixedAmount,this.nftQuantity);
    console.log("=======price======="+price);
    let salePrice = this.nftContractControllerService.transToWei(price.toString()).toString();
    console.log("=======salePrice======="+salePrice);
    let orderIndex = -1;
    try{
      orderIndex = await this.nftContractControllerService.getPasar().createOrderForSale(accountAddress, tokenId,this.nftQuantity,salePrice);
    }catch(error){
    }
    console.log("-----------");
    orderIndex = orderIndex || -1;
    console.log("----1111111111-------");
    console.log("----createOrderresult-------", orderIndex);
    if(orderIndex == -1){
      console.log("----222222-------");
      this.native.hideLoading();
      alert("public pasar失败");
      return;
    }
   //console.log("======receipt======"+JSON.stringify(receipt))

    let order = await this.nftContractControllerService.getPasar().getSellerOrderByIndex(accountAddress, orderIndex);
    console.log("======order======", order);

    this.orderId = tokenId = order[3];
    let sellerAddr = order[7] || "";
    let saleOrderId = order[0];
    let item = {
      "saleOrderId":saleOrderId,
      "tokenId":tokenId,
      "asset":this.imageObj["imgHash"],
      "name":this.nftName,
      "description":this.nftDescription,
      "fixedAmount":order[5],
      "kind":this.imageObj['imgFormat'],
      "type":this.issueRadionType,
      "royalties":this.nftRoyalties,
      "quantity":this.nftQuantity,
      "thumbnail":this.imageObj["thumbnail"],
      "sellerAddr":sellerAddr
    }

    let list = this.feedService.getPasarList();
        list.push(item)
    this.feedService.setPasarList(list);
    this.feedService.setData("feed.nft.pasarList",JSON.stringify(list));

    let slist = this.feedService.getOwnOnSaleList();
        slist.push(item);
    this.feedService.setData("feed.nft.own.onSale.list",JSON.stringify(slist));

    await this.getSetChannel(tokenId);
    this.native.hideLoading();
    this.native.pop();
    this.native.toast("public pasar sucess");
  }


  // 压缩图片
compressImage(path:any):Promise<string>{
  //最大高度
  const maxHeight = 600;
  //最大宽度
  const maxWidth = 600;
  return new Promise((resolve, reject) => {
      let img = new Image();
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
        let base64 = canvas.toDataURL('image/*',0.7);
        resolve(base64);
      }

    });
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

        let imgSize = this.thumbnail.length;
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
            imgThumb: this.thumbnail,
            imgSize : imgSize
          }
        imgThumbs.push(imgThumb);

        let nftContent = {};
        nftContent["version"]="1.0";
        nftContent["imageThumbnail"] = imgThumbs;
        nftContent["text"] = this.nftDescription;
        nftContent["nftTokenId"] = tokenId;
        nftContent["nftOrderId"] = this.orderId;
        //let content = this.feedService.createContent(this.nftDescription,imgThumbs,null);
        this.feedService.declarePost(nodeId,channelId,JSON.stringify(nftContent),false,tempPostId,
        this.transDataChannel,this.thumbnail,"");
  }

}
