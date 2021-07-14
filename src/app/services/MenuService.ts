import { Injectable } from '@angular/core';
import { ActionSheetController} from '@ionic/angular';
import { TranslateService} from '@ngx-translate/core';
import { FeedService } from './FeedService';
import { NativeService } from './NativeService';
import { PopupProvider } from 'src/app/services/popup';
import { IntentService } from 'src/app/services/IntentService';
import { ViewHelper } from 'src/app/services/viewhelper.service';
// import { Web3Service } from 'src/app/services/Web3Service';
import { Events } from 'src/app/services/events.service';
import { NFTContractControllerService } from 'src/app/services/nftcontract_controller.service';

@Injectable()

export class MenuService {
    public nodeId:string ="";
    public channelId:number =0;
    public postId:number =0;
    public commentId:number = 0;
    public saleOrderId:any = "";
    public assItem:any = {};

    public postDetail:any = null;
    public popover:any = null;
    public commentPostDetail:any = null;
    public replyDetail:any = null;
    public onSaleMenu:any = null;
    public buyMenu:any = null;
    public createdMenu:any = null;
    public shareOnSaleMenu:any = null;
    constructor(
        private feedService: FeedService,
        private actionSheetController: ActionSheetController,
        private translate: TranslateService,
        private native: NativeService,
        public popupProvider:PopupProvider,
        private intentService: IntentService,
        private viewHelper:ViewHelper,
        // private web3Service:Web3Service,
        private events:Events,
        private nftContractControllerService: NFTContractControllerService
    ) {
    }

    async showChannelMenu(nodeId: string, channelId: number, channelName: string,postId:number){
        this.postDetail = await this.actionSheetController.create({
            cssClass: 'editPost',
            buttons: [
            {
                text: this.translate.instant("common.share"),
                icon: 'share',
                handler: () => {
                    let post = this.feedService.getPostFromId(nodeId,channelId,postId) || null;
                    let postContent = ""
                    if(post!=null){
                       postContent = this.feedService.parsePostContentText(post.content);
                    }
                    this.intentService.share("", postContent).then(()=>this.postDetail.dismiss());
                }
            },{
                text: this.translate.instant("common.unsubscribe"),
                role: 'destructive',
                icon: 'person-remove',
                handler: () => {
                    if(this.feedService.getConnectionStatus() != 0){
                        this.native.toastWarn('common.connectionError');
                        return;
                    }

                    this.feedService.unsubscribeChannel(nodeId,channelId);
                }
            },{
                text: this.translate.instant("common.cancel"),
                role: 'cancel',
                icon: 'close-circle',
                handler: () => {
                    if(this.postDetail !=null){
                       this.postDetail.dismiss();
                    }
                }
            }]
        });

        this.postDetail.onWillDismiss().then(()=>{
            if(this.postDetail !=null){
                this.postDetail  = null;
            }
        });
        await this.postDetail.present();
    }

    async showShareMenu(nodeId?: string, channelId?: number, channelName?: string, postId?:number) {
        this.postDetail = await this.actionSheetController.create({
            cssClass: 'editPost',
            buttons: [
            {
                text: this.translate.instant("common.share"),
                icon: 'share',
                handler: () => {
                    let post = this.feedService.getPostFromId(nodeId,channelId,postId) || null;
                    let postContent = ""
                    if(post!=null){
                       postContent = this.feedService.parsePostContentText(post.content);
                    }
                    this.intentService.share("", postContent).then(()=>this.postDetail.dismiss());
                }
            },
            {
                text: this.translate.instant("common.cancel"),
                role: 'cancel',
                icon: 'close-circle',
                handler: () => {
                    if(this.postDetail !=null){
                       this.postDetail.dismiss();
                    }
                }
            }
        ]
        });


        this.postDetail.onWillDismiss().then(()=>{
            if(this.postDetail !=null){
                this.postDetail  = null;
            }

        })
        await this.postDetail.present();
    }

    async showQRShareMenu(title: string, qrCodeString: string) {
        this.postDetail = await this.actionSheetController.create({
            cssClass: 'editPost',
            buttons: [
                {
                    text: this.translate.instant("common.share"),
                    icon: 'share',
                    handler: () => {
                        this.intentService.share(title, qrCodeString).then(()=>this.postDetail.dismiss());
                    }
                },
                {
                    text: this.translate.instant("common.cancel"),
                    role: 'cancel',
                    icon: 'close-circle',
                    handler: () => {
                        if(this.postDetail !=null){
                           this.postDetail.dismiss();
                        }
                    }
                }
            ]
        });

        this.postDetail.onWillDismiss().then(()=>{
            if(this.postDetail) {
                this.postDetail = null;
            }
        })
        await this.postDetail.present();
    }

    async showUnsubscribeMenu(nodeId: string, channelId: number, channelName: string){
        this.postDetail  = await this.actionSheetController.create({
            cssClass: 'editPost',
            buttons: [{
              text: this.translate.instant("common.unsubscribe")+' @'+channelName,
              role: 'destructive',
              icon: 'person-remove',
              handler: () => {
                this.feedService.unsubscribeChannel(nodeId, channelId);
              }
            },
            {
                text: this.translate.instant("common.cancel"),
                role: 'cancel',
                icon: 'close-circle',
                handler: () => {
                    if(this.postDetail !=null){
                       this.postDetail.dismiss();
                    }
                }
            }
        ]
          });

          this.postDetail.onWillDismiss().then(()=>{
            if(this.postDetail !=null){
                this.postDetail  = null;
            }
          });

        await this.postDetail.present();
    }

    async showUnsubscribeMenuWithoutName(nodeId: string, channelId: number){
        this.postDetail = await this.actionSheetController.create({
            cssClass: 'editPost',
            buttons: [{
              text: this.translate.instant("common.unsubscribe"),
              role: 'destructive',
              icon: 'person-remove',
              handler: () => {
                this.feedService.unsubscribeChannel(nodeId, channelId);
              }
            },
            {
                text: this.translate.instant("common.cancel"),
                role: 'cancel',
                icon: 'close-circle',
                handler: () => {
                    if(this.postDetail !=null){
                       this.postDetail.dismiss();
                    }
                }
            }]
          });

          this.postDetail.onWillDismiss().then(()=>{
            if(this.postDetail !=null){
                this.postDetail  = null;
            }
          });

        await this.postDetail.present();
    }

    hideActionSheet(){
        if(this.postDetail!=null){
          this.postDetail.dismiss();
        }
    }

    hideCommetActionSheet(){
        if(this.commentPostDetail!=null){
            this.commentPostDetail.dismiss();
        }
    }


    hideReplyActionSheet(){
        if(this.replyDetail!=null){
            this.replyDetail.dismiss();
        }
    }

    async showPostDetailMenu(nodeId: string, channelId: number, channelName: string,postId:number){
         this.postDetail = await this.actionSheetController.create({
            cssClass: 'editPost',
            buttons: [
            {
                    text: this.translate.instant("common.sharepost"),
                    icon: 'share',
                    handler: () => {
                    this.handlePostDetailMenun(nodeId,channelId,channelName,postId,"sharepost");
                    }
            },
            {
                    text: this.translate.instant("common.editpost"),
                    icon: 'create',
                    handler: () => {
                       this.handlePostDetailMenun(nodeId,channelId,channelName,postId,"editPost");
                    }
            },
            {
                text: this.translate.instant("common.removepost"),
                role: 'destructive',
                icon: 'trash',
                handler: () => {
                    this.handlePostDetailMenun(nodeId,channelId,channelName,postId,"removePost");
                }
            },
            {
                text: this.translate.instant("common.cancel"),
                role: 'cancel',
                icon: 'close-circle',
                handler: () => {
                    if(this.postDetail !=null){
                       this.postDetail.dismiss();
                    }
                }
            }
        ]
        });

        this.postDetail.onWillDismiss().then(()=>{
            if(this.postDetail !=null){
                this.postDetail  = null;
            }

        })
        await this.postDetail.present();
    }


    async showHomeMenu(nodeId: string, channelId: number, channelName: string,postId:number){

        this.postDetail = await this.actionSheetController.create({
           cssClass: 'editPost',

           buttons: [
           {
                   text: this.translate.instant("common.sharepost"),
                   icon: 'share',
                   handler: () => {
                   this.handlePostDetailMenun(nodeId,channelId,channelName,postId,"sharepost");
                   }
           },
           {
                   text: this.translate.instant("common.editpost"),
                   icon: 'create',
                   handler: () => {
                      this.handlePostDetailMenun(nodeId,channelId,channelName,postId,"editPost");
                   }
           },
           {
               text: this.translate.instant("common.removepost"),
               role: 'destructive',
               icon: 'trash',
               handler: () => {
                   this.handlePostDetailMenun(nodeId,channelId,channelName,postId,"removePost");
               }
           },
           {
            text: this.translate.instant("common.unsubscribe"),
            role: 'destructive',
            icon: 'person-remove',
            handler: () => {
                if(this.feedService.getConnectionStatus() != 0){
                    this.native.toastWarn('common.connectionError');
                    return;
                }

                this.feedService.unsubscribeChannel(nodeId,channelId);
            }
        },{
            text: this.translate.instant("common.cancel"),
            role: 'cancel',
            icon: 'close-circle',
            handler: () => {
                if(this.postDetail !=null){
                   this.postDetail.dismiss();
                }
            }
        }
       ]
       });

       this.postDetail.onWillDismiss().then(()=>{
           if(this.postDetail !=null){
               this.postDetail  = null;
           }

       })
       await this.postDetail.present();
   }

    handlePostDetailMenun(nodeId: string, channelId: number, channelName: string,postId:number,clickName:string){
        this.nodeId =nodeId;
        this.channelId=channelId;
        this.postId = postId;
        let server = this.feedService.getServerbyNodeId(nodeId);

        switch(clickName){
            case "editPost":
                if (!this.feedService.checkBindingServerVersion(()=>{
                    this.feedService.hideAlertPopover();
                })) return;

                this.native.go(
                    "/editpost",
                    {
                    "nodeId":nodeId,
                    "channelId":channelId,
                    "postId":postId,
                    "channelName":channelName
                    }
                );
                break;
            case "sharepost":
                let post = this.feedService.getPostFromId(nodeId,channelId,postId) || null;
                let postContent = ""
                if(post!=null){
                   postContent = this.feedService.parsePostContentText(post.content);
                }

                this.intentService.share("", postContent).then(()=>this.postDetail.dismiss());
                break;
            case "removePost":
                if (!this.feedService.checkBindingServerVersion(()=>{
                    this.feedService.hideAlertPopover();
                })) return;

                this.popover = this.popupProvider.ionicConfirm(this,"common.deletePost","common.confirmdeletion",this.cancel,this.confirm,'./assets/images/shanchu.svg');
                break;
        }
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
        that.native.showLoading("common.waitMoment",()=>{},50000).then(()=>{
            that.feedService.deletePost(that.nodeId, Number(that.channelId), Number(that.postId));
        }).catch(()=>{
            that.native.hideLoading();
       });
    }

   async showPictureMenu(that:any,openCamera:any,openGallery:any){
        this.postDetail = await this.actionSheetController.create({
            cssClass: 'editPost',
            buttons: [
            {
                text:this.translate.instant("common.takePicture"),
                icon: 'camera',
                handler:()=>{
                    openCamera(that)
                },
            },
            {
                text:this.translate.instant("common.photolibary"),
                icon: 'images',
                handler:()=>{
                openGallery(that)
                },
            },
            {
                text: this.translate.instant("common.cancel"),
                role: 'cancel',
                icon: 'close-circle',
                handler: () => {
                    if(this.postDetail !=null){
                       this.postDetail.dismiss();
                    }
                }
            }
        ]
        });


        this.postDetail.onWillDismiss().then(()=>{
            if(this.postDetail !=null){
                this.postDetail  = null;
            }

        })
        await this.postDetail.present();

        return this.postDetail;
    }

    async showCommentDetailMenu(comment:any){
        this.nodeId = comment["nodeId"];
        this.channelId=comment["channel_id"];
        this.postId = comment["post_id"];
        this.commentId = comment["id"];
        let nodeId = comment["nodeId"];
        let feedId = comment["channel_id"];
        let postId = comment["post_id"];
        let commentById = comment["comment_id"]
        let commentId = comment["id"];
        let content = comment["content"];
        this.commentPostDetail = await this.actionSheetController.create({
            cssClass: 'editPost',
            buttons: [
            {
                    text: this.translate.instant("common.editcomment"),
                    icon: 'create',
                    handler: () => {
                       //this.handlePostDetailMenun(nodeId,channelId,channelName,postId,"editPost");
                       this.native.go("editcomment",{
                        nodeId:nodeId,
                        channelId:feedId,
                        postId:postId,
                        commentById:commentById,
                        commentId:commentId,
                        content:content,
                        titleKey:'common.editcomment',

                      });
                    }
            },
            {
                text: this.translate.instant("common.removecomment"),
                role: 'destructive',
                icon: 'trash',
                handler: () => {
                    this.popover = this.popupProvider.ionicConfirm(this,"common.deleteComment","common.confirmdeletion1",this.cancel1,this.confirm1,'./assets/images/shanchu.svg');
                }
            },
            {
                text: this.translate.instant("common.cancel"),
                role: 'cancel',
                icon: 'close-circle',
                handler: () => {
                    if(this.commentPostDetail !=null){
                       this.commentPostDetail.dismiss();
                    }
                }
            }
        ]
        });

        this.commentPostDetail.onWillDismiss().then(()=>{
            if(this.commentPostDetail!=null){
                this.commentPostDetail  = null;
            }

        })
        await this.commentPostDetail.present();
    }

    cancel1(){
       if(this.popover!=null){
            this.popover.dismiss();
       }
    }

    confirm1(that:any){
        if(this.popover!=null){
            this.popover.dismiss();
        }
        that.native.showLoading("common.waitMoment",()=>{},50000).then(()=>{
            that.feedService.deleteComment(that.nodeId,Number(that.channelId),Number(that.postId),Number(that.commentId));
          }).catch(()=>{
            that.native.hideLoading();
          })
    }

    async showReplyDetailMenu(reply:any){
        this.nodeId = reply["nodeId"];
        this.channelId=reply["channel_id"];
        this.postId = reply["post_id"];
        this.commentId = reply["id"];
        let nodeId = reply["nodeId"];
        let feedId = reply["channel_id"];
        let postId = reply["post_id"];
        let commentById = reply["comment_id"]
        let commentId = reply["id"];
        let content = reply["content"];
        this.replyDetail = await this.actionSheetController.create({
            cssClass: 'editPost',
            buttons: [
            {
                    text: this.translate.instant("CommentlistPage.editreply"),
                    icon: 'create',
                    handler: () => {
                       //this.handlePostDetailMenun(nodeId,channelId,channelName,postId,"editPost");
                       this.native.go("editcomment",{
                        nodeId:nodeId,
                        channelId:feedId,
                        postId:postId,
                        commentById:commentById,
                        commentId:commentId,
                        content:content,
                        titleKey:'CommentlistPage.editreply',
                      });
                    }
            },
            {
                text: this.translate.instant("CommentlistPage.deletereply"),
                role: 'destructive',
                icon: 'trash',
                handler: () => {
                    this.popover = this.popupProvider.ionicConfirm(this,"common.deleteReply","common.confirmdeletion2",this.cancel1,this.confirm1,'./assets/images/shanchu.svg');
                }
            },
            {
                text: this.translate.instant("common.cancel"),
                role: 'cancel',
                icon: 'close-circle',
                handler: () => {
                    if(this.replyDetail!=null){
                       this.replyDetail.dismiss();
                    }
                }
            }
        ]
        });

        this.replyDetail.onWillDismiss().then(()=>{
            if(this.replyDetail!=null){
                this.replyDetail  = null;
            }

        })
        await this.replyDetail.present();
    }

   async showOnSaleMenu(assItem:any){
        this.assItem = assItem || "";
        this.onSaleMenu = await this.actionSheetController.create({
            cssClass: 'editPost',
            buttons: [
            {
                    text: this.translate.instant("BidPage.changePrice"),
                    icon: 'create',
                    handler: () => {
                       this.viewHelper.showNftPrompt(assItem,"BidPage.changePrice","sale");
                    }
            },
            {
                text: this.translate.instant("BidPage.cancelOrder"),
                role: 'destructive',
                icon: 'trash',
                handler: () => {
                    this.popover = this.popupProvider.ionicConfirm(this,"BidPage.cancelOrder","BidPage.cancelOrder",this.cancelOnSaleMenu,this.confirmOnSaleMenu,'./assets/images/shanchu.svg');
                }
            },
            {
                text: this.translate.instant("common.cancel"),
                role: 'cancel',
                icon: 'close-circle',
                handler: () => {
                    if(this.onSaleMenu!=null){
                       this.onSaleMenu.dismiss();
                    }
                }
            }
        ]
        });

        this.onSaleMenu.onWillDismiss().then(()=>{
            if(this.onSaleMenu!=null){
                this.onSaleMenu  = null;
            }

        })
        await this.onSaleMenu.present();
   }

    cancelOnSaleMenu(){
      if(this.popover!=null){
         this.popover.dismiss();
      }
    }

    confirmOnSaleMenu(that:any){
        if(this.popover!=null){
            this.popover.dismiss();
        }
        that.native.showLoading("common.waitMoment",()=>{},50000).then(()=>{
            that.cancelOrder(that);
          }).catch(()=>{
            that.native.hideLoading();
          })
    }

    async cancelOrder(that:any){
        let saleOrderId  =  this.assItem["saleOrderId"] || ""
        const cancelStatus = await this.nftContractControllerService.getPasar().cancelOrder(saleOrderId);
        that.native.hideLoading();
        if(cancelStatus!=""&&cancelStatus!=undefined){
         that.events.publish(FeedsEvent.PublishType.nftCancelOrder,this.assItem);
         this.native.toast_trans("common.cancelSuccessfully");
          //this.native.navigateForward(['confirmation'],{queryParams:{"showType":"buy"}});
        }else{
          this.native.toast_trans("common.cancellationFailed");
        }
    }

   async showBuyMenu(assItem:any){
        this.buyMenu = await this.actionSheetController.create({
            cssClass: 'editPost',
            buttons: [
            {
                    text: this.translate.instant("CollectionsPage.onSale"),
                    icon: 'create',
                    handler: () => {
                       this.viewHelper.showNftPrompt(assItem,"CollectionsPage.putOnSale","buy");
                    }
            },
            {
                text: this.translate.instant("common.cancel"),
                role: 'cancel',
                icon: 'close-circle',
                handler: () => {
                    if(this.buyMenu!=null){
                       this.buyMenu.dismiss();
                    }
                }
            }
        ]
        });

        this.buyMenu.onWillDismiss().then(()=>{
            if(this.buyMenu!=null){
                this.buyMenu  = null;
            }

        })
        await this.buyMenu.present();
    }

  async showCreatedMenu(assItem:any){
    this.createdMenu = await this.actionSheetController.create({
        cssClass: 'editPost',
        buttons: [
        {
                text: this.translate.instant("CollectionsPage.onSale"),
                icon: 'create',
                handler: () => {
                   this.viewHelper.showNftPrompt(assItem,"CollectionsPage.putOnSale","created");
                }
        },
        {
            text: this.translate.instant("common.cancel"),
            role: 'cancel',
            icon: 'close-circle',
            handler: () => {
                if(this.createdMenu!=null){
                   this.createdMenu.dismiss();
                }
            }
        }
    ]
    });

    this.createdMenu.onWillDismiss().then(()=>{
        if(this.createdMenu!=null){
            this.createdMenu = null;
        }

    })
    await this.createdMenu.present();
    }

    async showShareOnSaleMenu(assItem:any){

        this.shareOnSaleMenu = await this.actionSheetController.create({
            cssClass: 'editPost',
            buttons: [
            {
                text: this.translate.instant("common.cancel"),
                role: 'cancel',
                icon: 'close-circle',
                handler: () => {
                    if(this.shareOnSaleMenu!=null){
                       this.shareOnSaleMenu.dismiss();
                    }
                }
            }
        ]
        });

        this.shareOnSaleMenu.onWillDismiss().then(()=>{
            if(this.shareOnSaleMenu!=null){
                this.shareOnSaleMenu = null;
            }

        })
        await this.shareOnSaleMenu.present();
    }
}
