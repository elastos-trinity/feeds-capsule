declare namespace FeedsData{
    const enum TitleBarForegroundMode {
        /** Title bar title and icons use a light (white) color. Use this on a dark background color. */
        LIGHT = 0,
        /** Title bar title and icons use a dark (dark gray) color. Use this on a light background color. */
        DARK = 1
    }

    const enum TitleBarIconSlot {
        /** Icon on title bar's left edge. */
        OUTER_LEFT = 0,
        /** Icon between the outer left icon and the title. */
        INNER_LEFT = 1,
        /** Icon between the title and the outer right icon. */
        INNER_RIGHT = 2,
        /** Icon on title bar's right edge. */
        OUTER_RIGHT = 3
    }

    const enum SortType{
        lastUpdateRevert = 0
    }

    const enum MediaType{
        noMeida = 0 ,
        containsImg = 1 ,
        containsVideo = 2
    }

    const enum PostCommentStatus {
        available = 0,
        deleted = 1,
        edited = 2,
        sending = 11,
        error = 12
    }

    const enum ConnState {
        connected = 0,
        disconnected = 1
    }

    const enum EditState{
        NoChange,
        TextChange,
        TextImageChange,
        TextVideoChange,
    }
    const enum SessionError {
        UnknownError                     = -101,
        UnimplementedError               = -102,
        NotFoundError                    = -103,
        InvalidArgument                  = -104,
        PointerReleasedError             = -105,
        DevUUIDError                     = -106,
        FileNotExistsError               = -107,
        CreateDirectoryError             = -108,
        SizeOverflowError                = -109,
        StdSystemError                   = -110,
        OutOfMemoryError                 = -111,
        DidNotReady                      = -120,
        InvalidAccessToken               = -121,
        NotAuthorizedError               = -122,
        CarrierSessionInitFailed         = -130,
        CarrierSessionConnectFailed      = -131,
        CarrierSessionCreateFailed       = -132,
        CarrierSessionAddStreamFailed    = -133,
        CarrierSessionTimeoutError       = -134,
        CarrierSessionReplyFailed        = -135,
        CarrierSessionStartFailed        = -136,
        CarrierSessionBadStatus          = -137,
        CarrierSessionDataNotEnough      = -138,
        CarrierSessionUnsuppertedVersion = -139,
        CarrierSessionReleasedError      = -140,
        CarrierSessionSendFailed         = -141,
        CarrierSessionErrorExists        = -142,
        MassDataUnknownReqFailed         = -150,
        MassDataUnmarshalReqFailed       = -151,
        MassDataMarshalRespFailed        = -152,
        MassDataUnsupportedVersion       = -153,
        MassDataUnsupportedAlgo          = -154,

        OFFLINE                          = -200,
        STREAM_STATE_DEACTIVATED         = -205,
        STREAM_STATE_CLOSED              = -206,
        STREAM_STATE_ERROR               = -207,

        WRITE_DATA_ERROR                 = -301,

        SESSION_CREATE_TIMEOUT           = -300,
        SESSION_NEW_SESSION_ERROR        = -311,
        SESSION_ADD_STREAM_ERROR         = -312,
        SESSION_REQUEST_ERROR            = -313,
        SESSION_START_ERROR              = -314,

    }
    const enum TransDataChannel {
        MESSAGE,
        SESSION
    }
    const enum StreamState {
        NOTINIT = -1,
        /** Raw stream. */
        RAW = 0,
        /** Initialized stream. */
        INITIALIZED = 1,
        /** The underlying transport is ready for the stream to start. */
        TRANSPORT_READY = 2,
        /** The stream is trying to connect the remote. */
        CONNECTING = 3,
        /** The stream connected with remove peer. */
        CONNECTED = 4,
        /** The stream is deactived. */
        DEACTIVATED = 5,
        /** The stream closed gracefully. */
        CLOSED = 6,
        /** The stream is on error, cannot to continue. */
        ERROR = 7,
        UNKNOW = 8
    }

    type StandardAuthResult = {
        jwtToken            : string,
        serverName          : string,
        serverDescription   : string,
        elaAddress          : string
    }

    type Content = {
        version         :   string,
        text            :   string,
        mediaType       :   MediaType,
        videoThumbKey   :   VideoThumbKey,
        imgThumbKeys    :   ImageThumbKey[],
        nftTokenId      :   number,
        nftOrderId      :   number
    }

    type ImgThumb = {
        index   : number,
        imgThumb: any,
        imgSize    : number
    }

    type ImageThumbKey = {
        index       :   number,
        imgThumbKey :   string,
        imgSize   :   number
    }
    type VideoThumb = {
        videoThumb      :   string,
        duration        :   number,
        videoSize       :   number
    }

    type VideoThumbKey = {
        videoThumbKey   :   string,
        duration        :   number,
        videoSize       :   number
    }

    type AllFeed = {
        nodeId: string,
        avatar: string,
        topic: string,
        desc: string,
        subscribeState: string
    }

    type AccessToken = {
        token: string ;
        isExpire: boolean;
    }

    type SessionMemoData = {
        feedId    : number,
        postId    : number,
        commentId : number,
        tempId    : number
    }

    type TempData = {
        nodeId          :   string,
        feedId          :   number,
        tempPostId      :   number,
        tempCommentId   :   number,
        dataHash        :   string,
        status          :   SendingStatus,
        transDataChannel:   TransDataChannel,
        videoData       :   string,
        imageData       :   string,
        postId          :   number,
        commentId       :   number,
        content         :   any
    }

    const enum SendingStatus{
        normal,
        needDeclearPost,
        needPushData,
        needNotifyPost,
    }

    const enum MethodType {
        declare_post = "declare_post",
        notify_post = "notify_post",

        create_channel = "create_channel",
        publish_post = "publish_post",
        post_comment = "post_comment",
        post_like = "post_like",
        get_my_channels = "get_my_channels",
        // get_my_channels_metadata = "get_my_channels_metadata",
        get_channels = "get_channels",
        get_channel_detail = "get_channel_detail",
        get_subscribed_channels = "get_subscribed_channels",
        get_posts = "get_posts",
        get_comments = "get_comments",
        get_statistics = "get_statistics",
        subscribe_channel = "subscribe_channel",
        unsubscribe_channel = "unsubscribe_channel",

        // add_node_publisher = "add_node_publisher",
        // remove_node_publisher = "remove_node_publisher",

        query_channel_creation_permission = "query_channel_creation_permission",


        negotiateLogin = "negotiate_login",
        confirmLogin = "confirm_login",

        post_unlike = "post_unlike",

        updateFeedInfo = "update_feedinfo",

        editPost = "edit_post",
        deletePost = "delete_post",

        editComment = "edit_comment",
        deleteComment = "delete_comment",

        getServerVersion = "get_service_version",

        updateCredential = "update_credential",
        enable_notification = "enable_notification",

        getBinary = "get_binary",
        setBinary = "set_binary",

        standard_sign_in = "standard_sign_in",
        standard_did_auth = "standard_did_auth",
        get_multi_comments = "get_multi_comments",

        get_multi_subscribers_count = "get_multi_subscribers_count",
        get_multi_likes_and_comments_count = "get_multi_likes_and_comments_count",

        //PUSH Notification
        newPostNotification = "new_post",
        newCommentNotification = "new_comment",
        newLikesNotification = "new_like",
        newSubscriptionNotification = "new_subscription",
        feedInfoUpdateNotification = "feedinfo_update",
        postUpdateNotification="post_update",
        commentUpdateNotification="comment_update",
    }

    const enum FriendState{
        NONE_STATE,
        IS_FRIEND,
        IS_ADDED
    }

    const enum FollowFeedStatus{
        NONE,
        ADD_FRIEND_READY,
        ADD_FRIEND_FINISH,
        ADD_FRIEND_ERROR,
        FRIEND_ONLINE,
        FRIEND_OFFLINE,
        SIGNIN_READY,
        SIGNIN_FINISH,
        SIGNIN_ERROR,
        FOLLOW_FEED_READY,
        FOLLOW_FEED_FINISH,
        FOLLOW_FEED_ERROR,
        FINISH,
        ERROR,
        DISCONNECTED
    }

    type FeedUrl = {
        did             : string,
        carrierAddress  : string,
        feedId          : number,
        feedName        : string,
        feedUrl         : string,
        serverUrl       : string
    }

    type ToBeAddedFeed = {
        nodeId          : string
        did             : string
        carrierAddress  : string
        feedId          : number
        feedName        : string
        feedUrl         : string
        serverUrl       : string
        status          : FollowFeedStatus
        friendState     : FriendState
        avatar          : string
        follower        : number
        ownerName       : string
        feedDes         : string
    }

    const enum PersistenceKey{
        ///////////////////////////////
        signInData = "signInData",
        lastSignInData = "lastSignInData",

        signInRawData = "signInRawData",

        subscribedChannelsMap = "subscribedChannelsMap",
        channelsMap = "channelsMap",
        myChannelsMap = "myChannelsMap",
        unreadMap = "unreadMap",
        postMap = "postMap",
        lastPostUpdateMap = "lastPostUpdateMap",
        commentsMap = "commentsMap",
        serverStatisticsMap = "serverStatisticsMap",
        serversStatus = "serversStatus",
        subscribeStatusMap = "subscribeStatusMap",
        likeMap = "likeMap",

        // bindingServerMap = "bindingServerMap",
        accessTokenMap = "accessTokenMap",
        credential = "credential",

        bindingServer = "bindingServer",

        serverMap = "serverMap",

        notificationList = "notificationList",

        likeCommentMap = "likeCommentMap",
        // lastFeedUpdateMap = "lastFeedUpdateMap",
        lastCommentUpdateMap = "lastCommentUpdateMap",

        lastMultiLikesAndCommentsCountUpdateMap = "lastMultiLikesAndCommentsCountUpdateMap",
        lastSubscribedFeedsUpdateMap = "lastSubscribedFeedsUpdateMap",
        serverVersions = "serverVersions",
        isSignOut = "isSignOut",

        syncPostStatusMap = "syncPostStatusMap",
        syncCommentStatusMap = "syncCommentStatusMap",

        tempIdDataList = "tempIdDataList",
        tempDataMap = "tempDataMap",

        walletAccountAddress = "walletAccountAddress"
    }


    type ServerVersion = {
        nodeId        : string,
        versionName   : string,
        versionCode   : number
    }

    type Likes = {
        nodeId    : string,
        channelId : number,
        postId    : number,
        commentId : number
    }

    type BindURLData = {
        did: string;
        carrierAddress: string;
        nonce: string;
    }

    type Notification = {
        id: string;
        userName: string;
        behavior: Behavior;
        behaviorText: string;
        details: Details;
        time: number;
        readStatus: number;
    }

    type Details = {
        nodeId: string;
        channelId: number;
        postId: number;
        commentId: number;
    }

    type SignResult = {
        signingdid: string,
        publickey: string,
        signature: string
    }

    type SignIntentResponse = {
        result: SignResult
    }

    type PostUpdateTime = {
        nodeId: string,
        channelId: number,
        time:number
    }

    type FeedUpdateTime = {
        nodeId: string,
        time:number
    }

    type CommentUpdateTime = {
        nodeId: string,
        channelId: number,
        postId: number,
        time: number
    }

    type LikesAndCommentsCountUpdateTime = {
        nodeId: string,
        time: number
    }

    type ServerStatus = {
        nodeId: string,
        did: string,
        status: ConnState
    }
    type NodeChannelPostComment ={
        [channelId: number]: ChannelPostComment;
    }
    type ChannelPostComment = {
        [postId:number]: PostComment
    }
    type PostComment = {
        [commentId: number]: Comment
    }

    type MyChannel = {
        nodeId: string,
        channelId: number
    }

    type Channels = {
        nodeId:string,
        id: number,
        name: string,
        introduction: string,
        owner_name: string,
        owner_did: string,
        subscribers : number,
        last_update : number,
        last_post: any,
        avatar: any,
        isSubscribed: boolean
    }

    type Comment = {
        nodeId      : string,
        channel_id  : number,
        post_id     : number,
        id          : number,
        comment_id  : number | 0,
        user_name   : string,
        content     : any,
        likes       : number,
        created_at  : number,
        updated_at  : number,
        status      : FeedsData.PostCommentStatus,
        user_did    : string
    }

    type LikedComment = {
        nodeId     : string,
        channel_id : number,
        post_id    : number,
        id         : number,
    }

    type ChannelPost = {
        [postId: number]: Post
    }

    type Post = {
        nodeId      : string,
        channel_id  : number,
        id          : number,
        content     : any,
        comments    : number,
        likes       : number,
        created_at  : number,
        updated_at  : number,
        post_status : FeedsData.PostCommentStatus
    }

    type PostKey = {
        created_at: number;
    }

    type ServerStatistics = {
        did               : string
        connecting_clients: number
        total_clients     : number
    }

    type Server = {
        name              : string
        owner             : string
        introduction      : string
        did               : string
        carrierAddress    : string
        nodeId            : string
        feedsUrl          : string
        elaAddress        : string
    }

    type SyncPostStatus = {
        nodeId        : string,
        feedsId       : number,
        isSyncFinish  : boolean,
        lastUpdate    : number
    }

    type SyncCommentStatus = {
        nodeId        : string,
        feedsId       : number,
        postId        : number,
        isSyncFinish  : boolean,
        lastUpdate    : number
    }

    const enum RequestAction{
        defaultAction,
        refreshPostDetail
    }

    const enum Behavior {
        comment,
        likedPost,
        likedComment,
        follow
    }
}