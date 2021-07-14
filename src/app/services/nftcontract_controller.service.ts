import { Injectable } from '@angular/core';
import { WalletConnectControllerService } from 'src/app/services/walletconnect_controller.service';
import { NFTContractParsarService } from 'src/app/services/nftcontract_parsar.service';
import { NFTContractStickerService } from 'src/app/services/nftcontract_sticker.service';
import { Events } from 'src/app/services/events.service';

@Injectable()
export class NFTContractControllerService {
    constructor(
      private event: Events,
      private walletConnectControllerService: WalletConnectControllerService,
      private nftContractParsarService: NFTContractParsarService,
      private nftContractStickerService: NFTContractStickerService) {
      this.init();
      this.initSubscribeEvent();
    }

    init(){
      this.nftContractStickerService.init();
      this.nftContractParsarService.init();
    }

    initSubscribeEvent(){
      this.event.subscribe(FeedsEvent.PublishType.walletConnected,()=>{
        this.init();
      });
      this.event.subscribe(FeedsEvent.PublishType.walletDisconnected,()=>{
        this.init();
      });
    }

    getSticker(): NFTContractStickerService{
      return this.nftContractStickerService.getSticker();
    }

    getPasar(): NFTContractParsarService{
      return this.nftContractParsarService.getPasar();
    }

    getAccountAddress(){
      return this.walletConnectControllerService.getAccountAddress();
    }

    transFromWei(price:string){
      let eth = this.walletConnectControllerService.getWeb3().utils.fromWei(price, 'ether');
      return eth;
    }

    transToWei(price: string){
      let wei  = this.walletConnectControllerService.getWeb3().utils.toWei(price, 'ether');
      return wei;
    }
}
