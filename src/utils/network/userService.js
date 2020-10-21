import { request, requestLogin, } from './baseService';
/**
 * [isBindPhone 绑定手机]
 * @Author   袁进
 * @DateTime 2018-12-20T18:10:07+0800
 * @return   {Boolean}                [description]
 */
export function isBindPhone() 
{
	return request({
		path: 'Weixin/UserBindPhone/isBindPhone',
		body: null,
	})
}

/**
 * [sendRegVerify 发送验证码]
 * @Author   袁进
 * @DateTime 2018-12-21T18:23:20+0800
 * @param    {[type]}                 dic [description]
 * @return   {[type]}                     [description]
 */
export function sendRegVerify(dic) 
{
	return request({
		path: 'Weixin/UserBindPhone/sendRegVerify',
		body: dic,
	})
}

/**
 * [getRegVerify 判断验证码是否正确]
 * @Author   袁进
 * @DateTime 2018-12-21T17:31:41+0800
 * @param    {[type]}                 dic [description]
 * @return   {[type]}                     [description]
 */
export function getRegVerify(dic) 
{
	return request({
		path: 'Weixin/UserBindPhone/getRegVerify',
		body: dic,
	})
}
/**
 * [bindPhone 绑定手机]
 * @Author   袁进
 * @DateTime 2018-12-21T18:28:14+0800
 * @param    {[type]}                 dic [description]
 * @return   {[type]}                     [description]
 */
export function bindPhone(dic) 
{
	return request({
		path: 'Weixin/UserBindPhone/bindPhone',
		body: dic,
	})
}
/**
 * [saveUserinfo 如果是以前的老用户 需要重新储存用户信息]
 * @Author   袁进
 * @DateTime 2018-12-21T18:35:26+0800
 * @param    {[type]}                 dic [description]
 * @return   {[type]}                     [description]
 */
export function saveUserinfo(dic) 
{
	return request({
		path: 'Weixin/UserBindPhone/saveUserinfo',
		body: dic,
	})
}

/**
 * [getUserPoints 获取用户积分]
 * @Author   袁进
 * @DateTime 2019-01-14T18:46:14+0800
 * @param    {[type]}                 dic [description]
 * @return   {[type]}                     [description]
 */
export function getUserPoints(dic) 
{
	return request({
		path: 'Weixin/UserPoint/getUserPoints',
		body: dic,
	})
}

/**
 * [scoreLogList 获取用户历史积分消费纪录]
 * @Author   袁进
 * @DateTime 2019-01-14T18:47:02+0800
 * @param    {[type]}                 dic [description]
 * @return   {[type]}                     [description]
 */
export function scoreLogList(dic) 
{
	return request({
		path: 'Weixin/ScoreManage/scoreLogList',
		body: dic,
	})
}

/**
 * [getUserInfo 获取用户信息]
 * @Author   袁进
 * @DateTime 2019-01-15T14:56:37+0800
 * @param    {[type]}                 dic [description]
 * @return   {[type]}                     [description]
 */
export function getUserInfo(dic) 
{
	return request({
		path: 'Weixin/User/getUserInfo',
		body: dic,
	})
}

/**
 * [updateUserInfo 更新用户信息]
 * @Author   袁进
 * @DateTime 2019-01-15T14:57:30+0800
 * @param    {[type]}                 dic [description]
 * @return   {[type]}                     [description]
 */
export function updateUserInfo(dic) 
{
	return request({
		path: 'Weixin/User/updateUserInfo',
		body: dic,
	})
}

/**
 * [getMedicalList 获取病史列表]
 * @Author   袁进
 * @DateTime 2019-01-15T15:37:52+0800
 * @param    {[type]}                 dic [description]
 * @return   {[type]}                     [description]
 */
export function getMedicalList(dic) 
{
	return request({
		path: 'Weixin/User/gitDiseaseList',
		body: dic,
	})
}

/**
 * [getCompanyProfile 获取公司信息]
 * @Author   袁进
 * @DateTime 2019-01-16T11:50:06+0800
 * @param    {[type]}                 dic [description]
 * @return   {[type]}                     [description]
 */
export function getCompanyProfile(dic) 
{
	return request({
		path: 'Weixin/About/getCompanyProfile',
		body: dic,
	})
}

/**
 * [getUserQRCode 获取二维码]
 * @Author   袁进
 * @DateTime 2019-01-16T14:56:40+0800
 * @param    {[type]}                 dic [description]
 * @return   {[type]}                     [description]
 */
export function getUserQRCode(dic) 
{
	return request({
		path: 'Weixin/Weixin/getWeixinQrcode',
		body: dic,
	})
}

/**
 * [getUploadVoucher 移动应用获取STS]
 * @Author   袁进
 * @DateTime 2019-03-22T09:54:49+0800
 * @param    {[type]}                 dic [description]
 * @return   {[type]}                     [description]
 */
export function getUploadVoucher(dic) 
{
	return request({
		path: 'weixin/User/getStsToken',
		body: dic,
	})
}

/**
 * 
 * @param {获取疗程被赠送人信息} dic 
 */
export function getCourseToUserInfo(dic) 
{
	return request({
		path: 'Weixin/UserCourse/getUserInfo',
		body: dic,
	})
}


/**
 * ios判断是否联网
 */
export function getNetInfo(dic)
{
	return new Promise((resolve, reject) => {
		request({
			path: "Weixin/Weixin/getWeixinQrcode",
			body: dic,
		})
			.then((responseJSON) => {
				console.log(responseJSON, '2222')
				resolve(responseJSON);
			})
			.catch((error) => {
				console.log(error, '1111')
				reject(error);
			});
	})
}

/**
 * 连接监控
 */
export function getMonotorInfo(dic)
{
	return new Promise((resolve, reject) => {
		request({
			path: "Weixin/Monitor/getMonitorInfo",
			body: dic,
		})
			.then((responseJSON) => {
				console.log(responseJSON, '2222')
				resolve(responseJSON);
			})
			.catch((error) => {
				console.log(error, '1111')
				reject(error);
			});
	})
}

/**
 * 
 * @param {保存推送设备id和手机系统} dic 
 */
export function savePushDeviceSn(dic) 
{
	return new Promise((resolve, reject) => {
		request({
			path: "weixin/PushApp/savePushDeviceSn",
			body: dic,
		})
		.then((responseJSON) => {
			console.log(responseJSON, '2222')
			resolve(responseJSON);
		})
		.catch((error) => {
			console.warn(error, '1111')
			reject(error);
		});
	})
}