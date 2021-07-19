import { Injectable } from '@angular/core';
import { Events } from 'src/app/services/events.service';

import { LogUtils } from 'src/app/services/LogUtils';
import { CarrierService } from 'src/app/services/CarrierService';
import { StorageService } from 'src/app/services/StorageService';

let TAG: string = "Feeds::AddFeedService";
let tobeAddFeedsPersistenceKey = "tobeAddedFeedMap";
let tobeAddedFeedTimer = [];
@Injectable()
export class AddFeedService {
    //feeds://did:elastos:ixxxxxxx/carrieraddress/feedid#feedname
    //feeds://did:elastos:ixxxxxxx/carrieraddress/feedid
    private tobeAddedFeedMap: {[nodeId: string]: {[feedId: string]: FeedsData.ToBeAddedFeed}} = {};
    constructor(
        private carrierService: CarrierService,
        private storageService: StorageService,
        private events: Events,
        private logUtils: LogUtils) {
        this.loadData().then((map)=>{
            this.tobeAddedFeedMap = map||{};
            this.subscribeEvent();
        })
    }

    subscribeEvent(){
        this.events.subscribe(FeedsEvent.PublishType.friendConnectionChanged,(friendConnectionChangedData: FeedsEvent.FriendConnectionChangedData)=>{
            let connectionStatus = friendConnectionChangedData.connectionStatus;
            let nodeId = friendConnectionChangedData.nodeId;
            if (connectionStatus == FeedsData.ConnState.connected){
                this.changeTobeAddedFeedStatusByNodeId(nodeId, FeedsData.FollowFeedStatus.FRIEND_ONLINE);
                return ;
            }

            if (connectionStatus == FeedsData.ConnState.disconnected){
                this.changeTobeAddedFeedStatusByNodeId(nodeId, FeedsData.FollowFeedStatus.FRIEND_OFFLINE);
                return;
            }
        });

        this.events.subscribe(FeedsEvent.PublishType.login_finish,(nodeId)=>{
            this.changeTobeAddedFeedStatusByNodeId(nodeId, FeedsData.FollowFeedStatus.SIGNIN_FINISH);
        });

        // this.events.subscribe(FeedsEvent.PublishType.addFeedFinish,async (nodeId, feedId, feedName)=>{
        // });
    }

    async processTobeAddedFeedsFinish(nodeId: string, feedId: number){
        this.clearTobeAddedFeedTimer(nodeId);
        await this.changeTobeAddedFeedStatusByNodeFeedId(nodeId, String(feedId), FeedsData.FollowFeedStatus.FOLLOW_FEED_FINISH);
        await this.changeTobeAddedFeedStatusByNodeFeedId(nodeId, String(feedId), FeedsData.FollowFeedStatus.FINISH);
        await this.removeTobeAddedFeedStatusByNodeFeedId(nodeId, feedId);
    }

    addFeed(decodeResult:FeedsData.FeedUrl, nodeId: string, inputAvatar: string, inputFollower: number, inputFeedName: string, ownerName: string, feedDes: string): Promise<FeedsData.ToBeAddedFeed>{
        return new Promise(async (resolve, reject) =>{
            this.logUtils.logd("Start addFeed process, nodeId is "+nodeId,TAG);
            try{
                this.logUtils.logd("Decode result is "+JSON.stringify(decodeResult), TAG);
                let feedName = decodeResult.feedName;
                let avatar = "./assets/images/profile-1.svg";
                let follower = 0;

                if (inputFeedName != null && inputFeedName != undefined && inputFeedName != "")
                    feedName = inputFeedName;

                if (inputAvatar != null && inputAvatar != undefined && inputAvatar != "")
                    avatar = inputAvatar;

                if (inputFollower != null && inputFollower != undefined && inputFollower >0)
                    follower = inputFollower;

                if (decodeResult == null || decodeResult == undefined){
                    let error = "Feed Url decode error";
                    this.logUtils.loge(error, TAG);
                    reject(error);
                    return;
                }

                this.checkTobeAddedFeedMap(nodeId);

                this.tobeAddedFeedMap[nodeId][decodeResult.feedId] =
                    this.generateToBeAddedFeed(nodeId, decodeResult.carrierAddress, decodeResult.feedId,
                        feedName, decodeResult.did, decodeResult.serverUrl, decodeResult.feedUrl,
                        FeedsData.FollowFeedStatus.NONE, FeedsData.FriendState.NONE_STATE, avatar, follower,
                        ownerName, feedDes);

                this.changeTobeAddedFeedStatusByNodeId(nodeId, FeedsData.FollowFeedStatus.ADD_FRIEND_READY);

                this.tobeAddedFeedMap[nodeId][decodeResult.feedId].friendState = await this.addFriends(nodeId, decodeResult.carrierAddress);
                this.saveData();
                resolve(this.tobeAddedFeedMap[nodeId][decodeResult.feedId]);
            }catch(error){
                reject("Add feed error");
            }
        });
    }

    checkFeedUrl(feedUrl: string): boolean{
        if (feedUrl == null || feedUrl == undefined || feedUrl == ""){
            this.logUtils.loge("Feed url is null", TAG);
            return false;
        }

        if (!feedUrl.startsWith("feeds://") || feedUrl.indexOf("/") < 4 || feedUrl.length < 54){
            this.logUtils.loge("Feed url formate error", TAG);
            return false;
        }
    }

    checkToBeAddedList(){
        return this.tobeAddedFeedMap;
    }

    getToBeAddedFeedsInfoByNodeFeedId(nodeId: string, feedId: number): FeedsData.ToBeAddedFeed{
        this.checkTobeAddedFeedMap(nodeId);
        return this.tobeAddedFeedMap[nodeId][feedId];
    }

    getToBeAddedFeedsInfoByNodeId(nodeId: string): FeedsData.ToBeAddedFeed[]{
        this.checkTobeAddedFeedMap(nodeId);
        let map = this.tobeAddedFeedMap[nodeId];
        let result:FeedsData.ToBeAddedFeed[] = [] ;

        let keys: string[] = Object.keys(map) || [];
        for (let index = 0; index < keys.length; index++) {
            if (map[keys[index]] == undefined)
                continue;
            if (map[keys[index]].feedId == 0)
                continue;
            if (map[keys[index]].nodeId == nodeId)
                result.push(map[keys[index]]);
        }
        return result;
    }

    getToBeAddedFeedsList(): FeedsData.ToBeAddedFeed[]{
        let list:FeedsData.ToBeAddedFeed[] = [];
        let keys: string[] = Object.keys(this.tobeAddedFeedMap) || [];
        for (let index = 0; index < keys.length; index++) {
            let listToBeAddedFeedFromNode = this.getToBeAddedFeedsInfoByNodeId(keys[index]);
            for (let fromNodeIndex = 0; fromNodeIndex < listToBeAddedFeedFromNode.length; fromNodeIndex++) {
                list.push(listToBeAddedFeedFromNode[fromNodeIndex]);
            }
        }

        return list;
    }

    decodeFeedUrl(feedUrl: string):FeedsData.FeedUrl{
        if (this.checkFeedUrl(feedUrl)){
            let error = "Feed url contains error";
            this.logUtils.loge(error, TAG);
            return null;
        }

        let tmpString = feedUrl.replace("feeds://","");

        let tmp: string[] = tmpString.split("/")
        let result: FeedsData.FeedUrl = null;
        if (tmp.length < 3){
            result = {
                did             : tmp[0],
                carrierAddress  : tmp[1],
                feedId          : 0,
                feedName        : "Unknow",
                feedUrl         : feedUrl,
                serverUrl       : feedUrl
            }
        }

        if (tmp.length = 3){
            let mFeedName = "Unknow";
            let mFeedId = 0;
            if (tmp[2].indexOf("#") > 0){
                let feedField = tmp[2].split("#");
                try{
                    mFeedId = Number(feedField[0]);
                }catch(error){
                    this.logUtils.loge("Type convert error "+error, TAG);
                }

                mFeedName = decodeURIComponent(feedField[1])||"Unknow";
            }else{
                mFeedId = Number(tmp[2]);
            }

            let serverUrl = feedUrl.substring(0, feedUrl.lastIndexOf("/"));
            result = {
                did             : tmp[0],
                carrierAddress  : tmp[1],
                feedId          : mFeedId,
                feedName        : mFeedName,
                feedUrl         : feedUrl,
                serverUrl       : serverUrl
            }
        }
        return result;
    }

    getNodeIdFromAddress(carrierAddress: string): Promise<string>{
        return new Promise((resolve, reject) =>{
            this.carrierService.getIdFromAddress(carrierAddress,
                (userId)=>{
                    this.logUtils.logd("CarriernodeId is "+userId, TAG);
                    resolve(userId);
                },
                (error)=>{
                    let err = "Get nodeId error "+error;
                    reject(err);
                }
            );
        });
    }

    getNodeFeedId(nodeId: string, feedId: number){
        return nodeId + "-" + feedId;
    }

    generateToBeAddedFeed(nodeId: string, carrierAddress: string, feedId: number, feedName: string,
        did: string, serverUrl: string, feedUrl: string, status : FeedsData.FollowFeedStatus, state: FeedsData.FriendState,
        avatar: string, follower: number, ownerName: string, feedDes: string): FeedsData.ToBeAddedFeed{
        return {
            nodeId          : nodeId,
            did             : did,
            carrierAddress  : carrierAddress,
            feedId          : feedId,
            feedName        : feedName,
            feedUrl         : feedUrl,
            serverUrl       : serverUrl,
            status          : status,
            friendState     : state,
            avatar          : avatar,
            follower        : follower,
            ownerName       : ownerName,
            feedDes         : feedDes
        }
    }

    checkTobeAddedFeedMap(nodeId: string){
        if (this.tobeAddedFeedMap == null || this.tobeAddedFeedMap == undefined)
            this.tobeAddedFeedMap = {};
        if (this.tobeAddedFeedMap[nodeId] == null || this.tobeAddedFeedMap[nodeId] == undefined)
            this.tobeAddedFeedMap[nodeId] = {};
    }

    async changeTobeAddedFeedStatusByNodeId(nodeId: string, status: FeedsData.FollowFeedStatus){
        this.setTimeoutStatus(nodeId);
        this.processChangeTobeAddedFeedStatusByNodeId(nodeId, status);
    }

    processChangeTobeAddedFeedStatusByNodeId(nodeId: string, status: FeedsData.FollowFeedStatus){
        this.checkTobeAddedFeedMap(nodeId);
        let keys: string[] = Object.keys(this.tobeAddedFeedMap[nodeId]) || [];
        for (let index = 0; index < keys.length; index++) {
            this.changeTobeAddedFeedStatusByNodeFeedId(nodeId, keys[index], status);
        }
    }

    async changeTobeAddedFeedStatusByNodeFeedId(nodeId: string, feedId: string, status: FeedsData.FollowFeedStatus){
        this.logUtils.logd("Change status, nodeId is "+nodeId+" feedId is "+feedId+ " status is "+ status, TAG);
        this.checkTobeAddedFeedMap(nodeId);
        if (this.tobeAddedFeedMap[nodeId][feedId] == null || this.tobeAddedFeedMap[nodeId][feedId] == undefined){
            this.logUtils.loge("To be added feed is null , nodeId is " +nodeId + " feedId is "+ feedId, TAG);
            return;
        }

        this.tobeAddedFeedMap[nodeId][feedId].status = status;

        await this.saveData();

        let addFeedStatusChangedData: FeedsEvent.AddFeedStatusChangedData = {
            nodeId: nodeId, 
            feedId: feedId, 
            status: status
        }
        this.events.publish(FeedsEvent.PublishType.addFeedStatusChanged, addFeedStatusChangedData);
    }

    async removeTobeAddedFeedStatusByNodeFeedId(nodeId: string, feedId: number): Promise<void>{
        return new Promise(async (resolve, reject) =>{
            let feedIdStr = String(feedId);
            this.checkTobeAddedFeedMap(nodeId);
            if (this.tobeAddedFeedMap[nodeId][feedIdStr] == null || this.tobeAddedFeedMap[nodeId][feedIdStr] == undefined){
                this.logUtils.loge("To be added feed is null , nodeId is " +nodeId + " feedId is "+ feedId, TAG);
                return;
            }

            delete this.tobeAddedFeedMap[nodeId][feedIdStr];

            await this.saveData();
            resolve();
        });
    }

    saveData(): Promise<any>{
        return this.storageService.set(tobeAddFeedsPersistenceKey, this.tobeAddedFeedMap);
    }

    loadData(): Promise<{[nodeFeedId: string]: {[feedId: string]: FeedsData.ToBeAddedFeed}}>{
        return this.storageService.get(tobeAddFeedsPersistenceKey);
    }

    checkIsFriends(nodeId: string): Promise<Boolean>{
        return new Promise((resolve, reject) =>{
            this.carrierService.isFriends(nodeId,(res)=>{
                resolve(res.isFriend);
            },(err)=>{
                let error = "check friend error "+err;
                this.logUtils.logd("Check is Friend error, "+error);
                reject(error);
            })
        });
    }

    addFriends(nodeId: string, carrierAddress: string): Promise<FeedsData.FriendState>{
        return new Promise(async (resolve, reject) =>{
            this.logUtils.logd("Start add Friend, friend nodeId is "+nodeId);
            try{
                let isFriend = await this.checkIsFriends(nodeId);
                if (isFriend){
                    this.changeTobeAddedFeedStatusByNodeId(nodeId, FeedsData.FollowFeedStatus.ADD_FRIEND_FINISH);
                    resolve(FeedsData.FriendState.IS_FRIEND);
                    return;
                }

                await this.addFriend(carrierAddress);
                this.changeTobeAddedFeedStatusByNodeId(nodeId, FeedsData.FollowFeedStatus.ADD_FRIEND_FINISH);
                resolve(FeedsData.FriendState.IS_ADDED);
                return;
            }catch(err){
                this.logUtils.loge("Added friend exception, nodeId is "+nodeId + " error is "+err, TAG);
                this.changeTobeAddedFeedStatusByNodeId(nodeId, FeedsData.FollowFeedStatus.ADD_FRIEND_ERROR);
                reject(err);
            }
        });
    }

    addFriend(carrierAddress: string): Promise<void>{
        return new Promise(async (resolve, reject) =>{
            this.logUtils.logd("Prepare add friend, server carrierAddress is "+carrierAddress);
            this.carrierService.addFriend(carrierAddress, "addFeed", ()=>{
                this.logUtils.logd("Add friend success, carrier address is "+carrierAddress);
                resolve();
            },(err)=>{
                let error = "Add friends error, error is "+ JSON.stringify(err);
                this.logUtils.logd(error);
                reject(error);
            });
        });
    }

    checkIsTobeAddedFeeds(nodeId: string, feedId: number): boolean{
        if (feedId == 0){
            return this.checkIsTobeAddedFeedsFromNodeId(nodeId);
        }
        return this.checkIsTobeAddedFeedsFromFeedId(nodeId, feedId);
    }

    private checkIsTobeAddedFeedsFromNodeId(nodeId: string): boolean{
        if (this.tobeAddedFeedMap == null || this.tobeAddedFeedMap == undefined ||
            this.tobeAddedFeedMap[nodeId] == null || this.tobeAddedFeedMap[nodeId] == undefined){
            return false;
        }
        if (this.getToBeAddedFeedsInfoByNodeId(nodeId).length == 0)
            return false
        return true;
    }

    private checkIsTobeAddedFeedsFromFeedId(nodeId: string, feedId: number): boolean{
        let feedIdStr = String(feedId) ;
        if (this.tobeAddedFeedMap == null || this.tobeAddedFeedMap == undefined ||
            this.tobeAddedFeedMap[nodeId] == null || this.tobeAddedFeedMap[nodeId] == undefined ||
            this.tobeAddedFeedMap[nodeId][feedIdStr] == null || this.tobeAddedFeedMap[nodeId][feedIdStr] == undefined){
            return false ;
        }
        return true;
    }


    async cleanTobeAddedFeedMap(){
        this.tobeAddedFeedMap = {};
        await this.storageService.remove(tobeAddFeedsPersistenceKey);
    }

    setTimeoutStatus(nodeId: string){
        this.clearTobeAddedFeedTimer(nodeId);
        tobeAddedFeedTimer[nodeId] = setTimeout(()=>{
            this.processChangeTobeAddedFeedStatusByNodeId(nodeId, FeedsData.FollowFeedStatus.DISCONNECTED);
            this.clearTobeAddedFeedTimer(nodeId);
        },120000);
    }

    clearTobeAddedFeedTimer(nodeId: string){
        if (tobeAddedFeedTimer[nodeId] != null&&tobeAddedFeedTimer[nodeId] != undefined){
            clearTimeout(tobeAddedFeedTimer[nodeId]);
            tobeAddedFeedTimer[nodeId] = null;
        }
    }
}
