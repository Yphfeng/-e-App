import {request, } from './baseService';

//获取用户疗程列表
export function getUserCourseList(dic) 
{
	return request({
		path: 'Weixin/UserCourse/getUserCourseList',
		body: dic,
	})
}
/**
 * [getUserArticleList 获取用户购买的疗程]
 * @Author   袁进
 * @DateTime 2019-01-16T18:34:34+0800
 * @param    {[type]}                 dic [description]
 * @return   {[type]}                     [description]
 */
export function getUserArticleList(dic) 
{
	return request({
		path: 'Weixin/UserArticle/getUserArticleList',
		body: dic,
	})
}

/**
 * [getCourseParameter 获取疗程参数 dic courseid devicesn]
 * @Author   袁进
 * @DateTime 2019-01-11T10:32:11+0800
 * @param    {[type]}                 dic [description]
 * @return   {[type]}                     [description]
 */
export function getCourseParameter(dic) 
{
	return request({
		path: 'Weixin/UserCourse/getUserUseCourse',
		body: dic,
	})
}

/**
 * [pauseCourse 暂停疗程]
 * @Author   袁进
 * @DateTime 2019-01-11T10:55:42+0800
 * @param    {[type]}                 dic [description]
 * @return   {[type]}                     [description]
 */
export function pauseCourse(dic) 
{
	return request({
		path: 'Weixin/UserCourse/PauseCourse',
		body: dic,
	})
}

/**
 * [getCourseDetail 获取疗程详情]
 * @Author   袁进
 * @DateTime 2019-01-11T12:43:09+0800
 * @param    {[type]}                 dic [description]
 * @return   {[type]}                     [description]
 */
export function getCourseDetail(dic) 
{
	return request({
		path: 'Weixin/Course/getCourseParameter',
		body: dic,
	})
}

/**
 * [getFistConnectTreatmentInfo 获取第一次连接的疗程信息]
 * @Author   袁进
 * @DateTime 2019-01-11T19:31:22+0800
 * @param    {[type]}                 dic [description]
 * @return   {[type]}                     [description]
 */
export function getFistConnectTreatmentInfo(dic) 
{
	return request({
		path: 'Weixin/UserCourse/getWriteDeviceInfo',
		body: dic,
	})
}

/**
 * [setFirstConnectTreatmentInfo 向服务器写入第一次连接的疗程参数]
 * @Author   袁进
 * @DateTime 2019-01-11T21:38:41+0800
 * @param    {[type]}                 dic [description]
 */
export function setFirstConnectTreatmentInfo(dic) 
{
	return request({
		path: 'Weixin/UserCourse/setCrowdfundingCourseGiveStatus',
		body: dic,
	})
}

/**
 * [activeCourse 激活疗程,user_course_id]
 * @Author   袁进
 * @DateTime 2019-01-14T12:04:43+0800
 * @param    {[type]}                 dic [description]
 * @return   {[type]}                     [description]
 */
export function activeCourse(dic) 
{
	return request({
		path: 'Weixin/Course/activateUserCourse',
		body: dic,
	})
}

/**
 * [startCourse 开始一个新疗程]
 * @Author   袁进
 * @DateTime 2019-01-14T16:14:15+0800
 * @param    {[type]}                 dic [description]
 * @return   {[type]}                     [description]
 */
export function startCourse(dic) 
{
	return request({
		path: 'Weixin/UserCourse/StartCourse',
		body: dic,
	})
}

/**
 * [updateCourse 更新疗程数据]
 * @Author   袁进
 * @DateTime 2019-01-14T16:47:10+0800
 * @param    {[type]}                 dic [description]
 * @return   {[type]}                     [description]
 */
export function updateCourse(dic) 
{
	return request({
		path: 'Weixin/UserCourse/updateUserCourseStatus',
		body: dic,
	})
}

/**
 * [bindCourse 绑定疗程]
 * @Author   袁进
 * @DateTime 2019-02-11T16:56:08+0800
 * @param    {[type]}                 dic [description]
 * @return   {[type]}                     [description]
 */
export function bindCourse(dic) 
{
	return request({
		path: 'Weixin/UserArticle/bindUserArticle',
		body: dic,
	})
}
/**
 * 
 * @param {用户赠送疗程} dic 
 */
export function giveCourse(dic)
{
	return request({
		path: 'Weixin/UserCourse/GiveCourse',
		body: dic,
	})
}

/**
 * 
 * @param {写入用户购买疗程到设备(到我的疗程)} dic 
 */
export function writeUserCourseDevice(dic)
{
	return request({
		path: 'Weixin/UserCourse/WriteUserCourseDevice',
		body: dic,
	})
}