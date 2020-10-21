import * as Base from './baseService';


    /**
    * 获取使用指南列表
    * return Promiss
    */
    export function getAboutList(dic) {
        return Base.request({
            path: 'Weixin/About/getAboutList',
            body: dic
        });
    }

    /**
    * 获取使用指南详情
    * heartRateJSONData: 心率数据
    * heartRateLastJSONData： 保存心率最后一条数据信息
    * return Promiss
    */
    export function getAboutContent(dic) {

        return Base.request({
            path: 'Weixin/About/getAboutContent',
            body: dic,
        })
    }
    /**
     * [submitAboutContentComment 点赞]
     * @Author   袁进
     * @DateTime 2018-12-21T16:27:08+0800
     * @param    {[type]}                 dic [description]
     * @return   {[type]}                     [description]
     */
    export function submitAboutContentComment(dic) {
        return Base.request({
            path: 'Weixin/About/submitAboutContentComment',
            body: dic,
        })
    }

    /**
     * 上传激光数据
     * laserJSONData： 激光数据
     * laserLastJSONData： 保存激光最后一条数据信息
     * return Promiss
     */
    export function updateLaserData(dic) {
        return Base.request({
            path: 'Weixin/ManualUserData/uploadLaserDada',
            body: dic,
        });
    }
    /**
     * 上传运动数据
     * movementJSONData： 运动数据
     * movementLastJSONData： 保存运动数据最后一条数据信息
     * return Promiss
     */
    export function updateMovementData(dic) {
        return Base.request({
            path: 'Weixin/UserData/uploadMotionDada',
            body: dic,
        });
    }
    /**
     * [updateAllData 上传所有数据]
     * @Author   袁进
     * @DateTime 2018-11-28T09:58:04+0800
     * @param    {Object}                 dic [心率，激光，运动数据]
     * @return   {[type]}                     [description]
     */
    export function updateAllData(dic) {
        return Base.requestData({
            path: 'Weixin/OsUserData/upload_user_data',
            body: dic,
        })
    }

    /**
     * 获取运动数据
     * return Promiss
     */
    export function getMotionData(dic) {
        console.log(dic,'获取运动数据参数')
        return Base.request({
            path: 'Weixin/JapanUserData/getUserMotionData',
            body: dic,
        });
    }

    /**
     * 获取激光数据
     * return Promiss
     */
    export function getLaserData(dic) {
        console.log(dic,'激光参数')

        return Base.request({
            path: 'Weixin/JapanUserData/getLaserData',
            body: dic,
        });
    }

    /**
     * 获取心率数据
     * type: 0 日数据，值:1 周数据，值:2 时间段数据
     * day_num
     * week_num
     * time_start
     * time_end
     * point
     * return Promiss
     */
    export function getHeartRateData(dic) {

        return Base.request({
            path: 'Weixin/JapanUserData/getUserHeartRateData',
            body: dic,
        });
    }

        /**
     *  获取用户激光疗程列表及编号
     * return Promiss
     */
    export function getUserCourseSnList() {

        return Base.request({
            path: 'Weixin/UserData/getUserCourseSnList',
            body: undefined,
        });
    }

    /**
     *  获取消息列表数据
     * return Promiss
     */
    export function getMessageListData(dic) {

        return Base.request({
            path: 'weixin/message/list',
            body: dic,
        });
    }


/**
 * 
 * @param {已读消息} dic 
 */
    export function readMessage(dic) {
        return Base.request({
            path: 'weixin/message/read',
            body: dic,
        })
    }

    /**
     *  获取消息详情数据
     * return Promiss
     */
    export function getMessageDetailsData(dic) {

        return Base.request({
            path: 'Weixin/PushApp/getMessageDetailsData',
            body: dic,
        });
    }

    /**
     *  滚动通知列表数据
     * return Promiss
     */
    export function getRollMessageListData(dic) {

        return Base.request({
            path: 'Weixin/PushApp/getRollMessageListData',
            body: dic,
        });
    }

    /**
     *  消息滚动消息详情数据
     * return Promiss
     */
    export function getRollMessageDetailsData(dic) {

        return Base.request({
            path: 'Weixin/PushApp/getRollMessageDetailsData',
            body: dic
        });
    }

    /**
     *  消息弹框消息详情数据
     * return Promiss
     */
    export function getPopMessageDetailsData(dic) {

        return Base.request({
            path: 'Weixin/PushApp/getPopMessageDetailsData',
            body: dic
        });
    }

    /**
     *  首页消息弹框
     * return Promiss
     */
    export function getPopMessageData(dic) {

        return Base.request({
            path: 'Weixin/PushApp/getPopMessageData',
            body: dic
        });
    }

    /**
     *  新手引导
     * return Promiss
     */
    export function getUserGuide() {

        return Base.request({
            path: 'Weixin/About/getUserGuide',
            body: undefined
        });
    }
    /**
     *  指针调整操作视频
     * return Promiss
     */
    export function getAboutClockVideo() {

        return Base.request({
            path: 'Weixin/about/getAboutClockVideo',
            body: undefined
        });
    }

    /**
    * 获取使用指南列表
    * return Promiss
    */
    export function uploadVideo(dic) {
        return Base.request({
            path: 'Weixin/upload/video',
            body: dic
        });
    }
