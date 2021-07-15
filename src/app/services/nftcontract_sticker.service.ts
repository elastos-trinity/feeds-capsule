import { Injectable } from '@angular/core';
import { WalletConnectControllerService } from 'src/app/services/walletconnect_controller.service';
import Web3 from 'web3';

@Injectable()
export class NFTContractStickerService {
    private stickerAddress:string = "0xF85153d9Dc43602d5f71b572eD7bffEC00060A2f";
    private stickerAbi = require("../../assets/contracts/stickerABI.json");
    private web3: Web3;
    private stickerContract: any;
    private checkTokenInterval: NodeJS.Timer;
    private checkApprovedInterval: NodeJS.Timer;

    constructor(private walletConnectControllerService: WalletConnectControllerService) {
      this.init();
    }

    init(){
      this.web3 = this.walletConnectControllerService.getWeb3();
      if (!this.web3)
        return ;
      this.stickerContract = new this.web3.eth.Contract(this.stickerAbi,this.stickerAddress);
    }

    getSticker(){
      return this;
    }

    getStickerAddress(){
      return this.stickerAddress;
    }

    setApprovalForAll(accountAddress: string, contractAddress: string, approved: boolean): Promise<any>{
      return new Promise(async (resolve, reject) => {
        let isApproved = await this.isApprovedForAll(accountAddress, contractAddress);
        console.log("Contract isApproved?",isApproved);
        if (isApproved){
          resolve(isApproved);
          return;
        }

        const data = this.stickerContract.methods.setApprovalForAll(contractAddress, approved).encodeABI();
        let transactionParams = await this.createTxParams(data);
        console.log("Calling setApprovalForAll smart contract through wallet connect", data, transactionParams);
        this.stickerContract.methods.setApprovalForAll(contractAddress, approved).send(transactionParams)
            .on('transactionHash', (hash) => {

              console.log("transactionHash", hash);
              resolve(hash);
            })
            .on('receipt', (receipt) => {

              console.log("receipt", receipt);
              resolve(receipt);
            })
            .on('confirmation', (confirmationNumber, receipt) => {

              console.log("confirmation", confirmationNumber, receipt);
              resolve(receipt);
            })
            .on('error', (error, receipt) => {

              console.error("mint error===");
              console.error("error", error);
              reject(receipt);
            });

        this.checkApprovedState(accountAddress, contractAddress, (isApproved)=>{
          console.log("Set approval success");
          resolve(isApproved);
        });
      })
    }

    async tokenInfo(tokenId){
      if (!this.stickerContract)
        return [];
      return await this.stickerContract.methods.tokenInfo(tokenId).call();
    }

    async mint(tokenId: string, supply: string, uri: string, royalty: string): Promise<any>{
      return new Promise(async (resolve, reject) => {
        console.log("Mint params ",tokenId,supply,uri,royalty);
        const mintdata = this.stickerContract.methods.mint(tokenId,supply,uri,royalty).encodeABI();
        let transactionParams = await this.createTxParams(mintdata);

        console.log("Calling smart contract through wallet connect", mintdata, transactionParams);
        this.stickerContract.methods.mint(tokenId, supply, uri, royalty)
          .send(transactionParams)
            .on('Mint process, transactionHash is', (hash) => {
              console.log("transactionHash", hash);
              // resolve(hash);
            })
            .on('receipt', (receipt) => {
              console.log("Mint process, receipt is", receipt);
              // resolve(receipt);
            })
            .on('confirmation', (confirmationNumber, receipt) => {
              console.log("Mint process, confirmation is", confirmationNumber, receipt);
              // resolve(receipt);
            })
            .on('error', (error, receipt) => {
              console.error("Mint process, error is", error, receipt);
              // reject(error);
            });

        this.checkTokenState(tokenId, (info)=>{
          console.log("Mint success, token info is", info);
          resolve(info);
        });
      });
    }

    async tokenIdOfOwnerByIndex(address, index){
      return await this.stickerContract.methods.tokenIdOfOwnerByIndex(address,index).call();
    }

    async tokenCountOfOwner(address){
      return await this.stickerContract.methods.tokenCountOfOwner(address).call();
    }

    async createTxParams(data){
      let accountAddress = this.walletConnectControllerService.getAccountAddress();
      let gas = 500000;

      const txData = {
        from: this.walletConnectControllerService.getAccountAddress(),
        to: this.stickerAddress,
        value: 0,
        data: data
      };
      console.log("CreateTxParams is",txData);
      try{
        gas = await this.web3.eth.estimateGas(txData,(error,gasResult)=>{
          gas = gasResult;
        })
      }catch(error){
        console.log("error", error);
      }

      let gasPrice = await this.web3.eth.getGasPrice();
      return {
        from: accountAddress,
        // to: stickerAddr,
        gasPrice: gasPrice,
        gas: Math.round(gas*3),
        value: 0
      };
    }

    checkTokenState(tokenId, callback:(tokenInfo: any)=>void){
      this.checkTokenInterval = setInterval(async () => {
        if (!this.checkTokenInterval)
          return ;
        console.log("tokenId = "+tokenId);
        let info = await this.tokenInfo(tokenId);
        console.log("Token info is", info);
        if (info[0]!="0"){
          clearInterval(this.checkTokenInterval);
          callback(info);
          this.checkTokenInterval = null;
        }
      }, 5000);
    }

    cancelMintProcess(){
      if (!this.checkTokenInterval)
          return ;
      clearInterval(this.checkTokenInterval);
    }

    async isApprovedForAll(_owner, _operator){
      if (!this.stickerContract)
        return false;
      return await this.stickerContract.methods.isApprovedForAll(_owner, _operator).call();
    }

    checkApprovedState(_owner, _operator, callback:(isApproved: boolean)=>void){
      this.checkApprovedInterval = setInterval(async () => {
        if (!this.checkApprovedInterval)
          return ;
        let isApproved = await this.isApprovedForAll(_owner, _operator);
        if (isApproved){
          clearInterval(this.checkApprovedInterval);
          callback(isApproved);
          this.checkApprovedInterval = null;
        }
      }, 5000);
    }

    cancelSetApprovedProcess(){
      if (!this.checkApprovedInterval)
        return ;
      clearInterval(this.checkApprovedInterval);
    }
}
