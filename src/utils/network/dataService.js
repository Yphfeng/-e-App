import {request} from './baseService';

/**
 * [getMotionData 获取服务器上的运动数据]
 * @Author   袁进
 * @DateTime 2019-02-22T14:55:12+0800
 * @param    {[type]}                 dic [description]
 * @return   {[type]}                     [description]
 */
export function getMotionData(dic) {
	return request({
		path: 'Weixin/UserData/getMotionData',
		body: dic
	})
}

/**
 * [getLaserData 获取服务器上的激光数据]
 * @Author   袁进
 * @DateTime 2019-02-22T14:56:03+0800
 * @return   {[type]}                 [description]
 */
export function getLaserData() {
	return request({
		path: 'Weixin/UserData/getUserLasereDataC',
		body: dic
	})
}

/**
 * [getHeartRateData 获取服务器上的心率数据]
 * @Author   袁进
 * @DateTime 2019-02-22T14:57:12+0800
 * @param    {[type]}                 data [description]
 * @return   {[type]}                      [description]
 */
export function getHeartRateData(data) {
	return request({
		path: 'Weixin/UserData/getUserHeartRateDataC',
		body: dic
	})
}

/**
 * [getHeartRateData 上传激光，心率，运动所有的数据]
 * @Author   肖波
 * @DateTime 2019-03-31T14:57:12+0800
 * @param    {[type]}                 data [description]
 * @return   {[type]}                      [description]
 */
export function updateAllData(dic) {
	return request({
		path: 'Weixin/UserData/upload_user_data',
		body: dic
	})
}

//数据监测定时器
export function updateStatus(dic) 
{
	console.log(dic, '12312数据监测定时器')
	return request({
		path: 'Weixin/UserData/updateStatus',
		body: dic,
	})
}