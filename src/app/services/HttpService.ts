import {Injectable} from '@angular/core';
import { HttpClient,HttpHeaders} from '@angular/common/http';
import { NativeService } from 'src/app/services/NativeService';
import { PopupProvider } from 'src/app/services/popup';
import { PopoverController} from '@ionic/angular';

@Injectable()
export class HttpService{
  public httpOptions = {
    headers: new HttpHeaders({
        "Content-Type": "application/json;"
      })
  };
  public popover:any = null;
  constructor(
           public httpClient:HttpClient,
           public native:NativeService,
           public popupProvider:PopupProvider,
           private popoverController: PopoverController,
           ){

  }

  ajaxGet(url:string,isLoading:boolean=true) {
    if(isLoading){
      this.native.showLoading("common.waitMoment",(isDismiss)=>{
      });
    }
    return new Promise((resove, reject) => {
      this.httpClient.get(url).subscribe((response) => {
        this.native.hideLoading();
        if(response["code"] === 400){
          this.native.toast('common.error400');
        }else if(response["code"] === 500){
          this.native.toast('common.error500');
        }
        resove(response);
      }, (error) => {
       let sid = setTimeout(()=>{
          if(isLoading){
          this.native.hideLoading();
          }
          this.openAlert();
          clearTimeout(sid);
        },500);
        reject(error);
      })
    })
  }

  ajaxPost(url:string, json:Object,isLoading:boolean=true) {
    if(isLoading){
      this.native.showLoading("common.waitMoment",(isDismiss)=>{
      });
    }
    return new Promise((resove, reject) => {
      this.httpClient.post(url,JSON.stringify(json),this.httpOptions).subscribe((response) => {
        this.native.hideLoading();
        if(response["code"] === 400){
          this.native.toast('common.error400');
        }else if(response["code"] === 500){
          this.native.toast('common.error500');
        }
        resove(response);
      }, (error) => {
        let sid = setTimeout(()=>{
          if(isLoading){
          this.native.hideLoading();
          }
          this.openAlert();
          clearTimeout(sid);
        },500);
        reject(error);
      })
    })
  }

  ajaxNftPost(url:string, json:Object) {
    return new Promise((resove, reject) => {
      this.httpClient.post(url,json).subscribe((response) => {
        if(response["code"] === 400){
          this.native.toast('common.error400');
        }else if(response["code"] === 500){
          this.native.toast('common.error500');
        }
        resove(response);
      }, (error) => {
        let sid = setTimeout(()=>{
          reject(error);
          clearTimeout(sid);
        },500);
        reject(error);
      })
    })
  }


  openAlert(){
    let value =  this.popoverController.getTop()["__zone_symbol__value"] || "";
    if(value!=""){
      return;
    }
    this.popover = this.popupProvider.ionicAlert(
      this,
      // "ConfirmdialogComponent.signoutTitle",
      "",
      "common.httperror",
      this.confirm,
      'tskth.svg',
      "common.ok"
    );
  }

  confirm(that:any){
      if(this.popover!=null){
         this.popover.dismiss();
         this.popover = null;
      }
  }


}
