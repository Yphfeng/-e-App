import {request, } from './baseService';



/**
* // 获取设备类型  租赁设备||普通设备
* return Promiss
	*/
export function getDeviceType(dic) 
{
	return request({
		path: 'Weixin/IeaseDevice/getDeviceType',
		body: dic,
	});
}

/**
* 写入设备信息
*/
export function writeInformation(dic) 
{
	return request({
		path: 'Weixin/UserCourse/GetDeviceWriteInfo',
		body: dic,
	});
}

/**
*   连接失败未知原因
*/
export function getUserInfo(dic) 
{
	return request({
		path: 'Weixin/User/getUserInfo',
		body: dic,
	});
}

/**
*   连接失败未知原因
*/
export function connectFail(dic) 
{
	return request({
		path: 'Weixin/Monitor/getMonitorInfo',
		body: dic,
	});
}

/**
* 调用连接成功接口
*/

export function connectSuccee(dic) 
{
	return request({
		path: 'Weixin/UserCourse/setCourseGiveStatus',
		body: dic,
	});
}

/**
* 上传心率数据
* heartRateJSONData: 心率数据
* heartRateLastJSONData： 保存心率最后一条数据信息
* return Promiss
*/
export function updateHeartRateData(dic) {

	return request({
		path: 'Weixin/UserData/uploadUserHeartRateDataC',
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
	return request({
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
	return request({
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
	return requestData({
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
	return request({
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

	return request({
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

	return request({
		path: 'Weixin/JapanUserData/getUserHeartRateData',
		body: dic
	});
}

	/**
 *  获取用户激光疗程列表及编号
 * return Promiss
 */
export function getUserCourseSnList() {

	return request({
		path: 'Weixin/UserData/getUserCourseSnList',
		body: undefined
	});
}

//绑定设备
export function addBindSN(dic) {
	return request({
		path: 'Weixin/Device/userBindDevice',
		body: dic,
	})
}
//判断用户是否绑定设备||获取设备列表
export function isBindDevice(dic) {
	return request({
		path: 'Weixin/Device/getUserDeviceListAndType',
		body: dic, 
	})
}
//解绑设备
export function unbindDevice(dic) {
	return request({
		path: 'Weixin/Device/userUnbindDevice',
		body: dic
	})
}

//租赁疗程设置疗程参数
export function setIeaseDeviceCourse(dic) {
	return request({
		path: "Weixin/IeaseDevice/setIeaseDeviceCourse",
		body: dic
	})
}

/**
 * [InitAddScore 连接后增加积分]
 * @Author   袁进
 * @DateTime 2019-01-11T19:41:10+0800
 */
export function InitAddScore(dic){
	return request({
		path: 'Weixin/UserCourse/InitAddScore',
		body: dic
	})
}

/**
 * [updateUserDeviceEBi 上传e币]
 * @Author   袁进
 * @DateTime 2019-01-11T20:16:32+0800
 * @param    {[type]}                 dic [description]
 * @return   {[type]}                     [description]
 */
export function updateUserDeviceEBi(dic) {
	return request({
		path: 'Weixin/User/updateUserDeviceEb',
		body: dic
	})
}

/**
 * [checkVersion 检查新版本]
 * @Author   袁进
 * @DateTime 2019-03-18T16:41:40+0800
 * @param    {[type]}                 dic [description]
 * @return   {[type]}                     [description]
 */
export function checkVersion(dic) {
	console.log(dic,'升级的版本号');
	return request({
		path: 'Weixin/Upgrade/checkVersion',
		body: dic
	})
}

/**
 * [getUploadUrl 获取版本下载地址]
 * @Author   袁进
 * @DateTime 2019-03-18T16:42:33+0800
 * @param    {[type]}                 dic [description]
 * @return   {[type]}                     [description]
 */
export function getUploadUrl(dic) {
	return request({
		path: 'Weixin/Upgrade/getUploadUrl',
		body: dic
	})
}

/**
 * [updateComplete 升级完成]
 * @Author   袁进
 * @DateTime 2019-03-18T16:43:31+0800
 * @param    {[type]}                 dic [description]
 * @return   {[type]}                     [description]
 */
export function updateComplete(dic) {
	return request({
		path: 'Weixin/Upgrade/updateComplete',
		body: dic
	})
} 

/**
 * 
 * @param {获取设备的型号数组} dic 
 */
export function getDeviceArray(dic) 
{
	return request({
		path: "Weixin/Device/getDeviceTypeList",
		body: dic,
	})
}

/**
 * 
 * @param {获取用户已绑定设备列表(新版)} dic 
 */
export function getUserBindDeviceList(dic) 
{
	return request({
		path: 'Weixin/Device/getUserBoundDeviceList',
		body: dic,
	})
}

/**
 * 
 * @param {获取设备详情} dic 
 */
export function getDeviceDetail(dic)
{
	return request({
		path: 'Weixin/Device/getDeviceDetail',
		body: dic,
	})
}

/**
 * 
 * @param {修改设备别名} dic 
 */
export function upDateDeviceAlias(dic)
{
	return request({
		path: 'Weixin/Device/UpdateDeviceAlias',
		body: dic,
	})
}

/**
 * 判断设备是否第一次连接
 */

export function isFirstConnect(dic)
{
	return request({
		path: "/weixin/device/isFirstConnect",
		body: dic,
	})
}

//设置设备E币
export function setEb(dic)
{
	return request({
		path: '/Weixin/device/setEb',
		body: dic,
	})
}