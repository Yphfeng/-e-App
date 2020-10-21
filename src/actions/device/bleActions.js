'use strict';
import * as types from '../../constants/device/bleTypes';

import * as DeviceService from '../../utils/network/deviceService';
import * as courseService from '../../utils/network/courseService';
import * as loginService from "../../utils/network/loginService";
import * as userService from "../../utils/network/userService";
import * as qbDate from '../../utils/qbDate';
import * as cmd from '../../utils/ble/cmd';

import BleConnection from '../../utils/ble/application/connect';
import BleApplication from '../../utils/ble/application/application';
import * as bleDataHandle from "../../utils/ble/application/data/bleDataHandle";
import BleModule from '../../utils/ble/bleModule';
import QBStorage from '../../utils/storage/storage';

import {
	PermissionsAndroid,
	Platform,
} from "react-native";

const BluetoothManager = new BleModule();
const Bleconnect = BleConnection.getInstance();
const Application = new BleApplication();
const deviceMap = new Map();
/**
 * [isConnectORsearch 判断是搜素或连接时搜素设备]
 * @Author   袁进
 * @DateTime 2019-03-19T15:54:18+0800
 * @param    {[type]}                 status [description]
 * @return   {Boolean}                       [description]
 */
export function getConnectORsearch(status)
{
	return {
		type: types.IS_CONNECT_OR_SEARCH,
		status,
	}
}

//绑定了一个设备直接连接设备

export const startConnectDevice = (devices, callback) => ({
	type: 'START_CONNECT_DEVICE',
	callback: callback,
	devices: devices,
});

//绑定多个设备后的连接
export const startSeveralConnectDevice = (devices, callback) => ({
	type: 'START_SEVERAL_CONNECT_DEVICE',
	callback: callback,
	devices: devices,
})

//判断是否绑定
export const isBind = callback => ({
	type: 'IS_BIND',
	callback: callback,
})

//上传数据
export const upData = callback => ({
	type: 'UPDATA',
	callback: callback,
})

//空中升级
export const upDataAir = (s, callback) => ({
	type: 'UPDATA_AIR',
	s: s,
	callback: callback,
})

//数据监测
export const getDeviceData = (params, s) => ({
	type: 'GET_DEVICE_DATA',
	params: params,
	callback: s,
})

//引导图上的搜素设备
export const bgSearchDevices = callback => ({
	type: 'BG_SEARCH',
	callback: callback,
})


/**
 * [sacnTimeOut 扫描超时处理]
 * @Author   肖波
 * @DateTime 2019-03-027T11:10:28+0800
 * @param    {[type]}                 status [description]
 * @return   {[type]}                        [description]
 */
export function sacnTimeOut(status, s) {
	console.log('gan')
	return {
		type: types.SCAN_TIME_OUT,
		status,
		s
	}
}

/**
 * [getDeviceTypeSuccess 获取设备类型成功普通设备，租赁设备]
 * @Author   袁进
 * @DateTime 2019-01-10T10:08:11+0800
 * @param    {[type]}                 text           [description]
 * @param    {[type]}                 userCourseList [description]
 * @return   {[type]}                                [description]
 */
export function getDeviceTypeSuccess(text,courseListArray) {
	return {
		type: types.GET_DEVICE_TYPE_SUCCESS,
		status: text,
		courseListArray,
	}
}

/**
 * [getDeviceTypeFail 获取设备类型失败]
 * @Author   袁进
 * @DateTime 2019-01-10T10:09:29+0800
 * @param    {[type]}                 status [description]
 * @return   {[type]}                        [description]
 */
export function getDeviceTypeFail(status) {
	return {
		type: types.GET_DEVICE_TYPE_FAIL,
		status,
		courseListArray: []
	}
}

/**
 * 【异步action 异步获取设备类型】
 * @Author   袁进
 * @DateTime 2018-12-07T18:04:05+0800
 * @return   {[type]}                 [description]
 */
export function fetchDeviceType() {
	return dispatch => {
		return DeviceService.getDeviceType()
			.then((res) => {
				if(res.status){
					console.log(res,'获取设备类型')
					if(res.conf_status == 1) {
						dispatch(getDeviceTypeSuccess(res.conf_status,res.user_course_list))
					}else{
						dispatch(getDeviceTypeSuccess(res.conf_status,[]))
					}

				}

			})
			.catch(err => {
				dispatch(getDeviceTypeFail(0))
			})
	}
}


//蓝牙状态变化
export const getBleStatus = status => ({
	type: 'GET_BLE_STATUS',
	status,
})

/**
 * [startSearching 开始搜索]
 * @Author   袁进
 * @DateTime 2019-01-10T10:11:58+0800
 * @param    {Number}                 status [description]
 * @return   {[type]}                        [description]
 */
export function startSearching(status=1)
{
	return {
		type: types.START_SEARCHING,
		status,
	}
}

/**
 * [searchIng 搜素中]
 * @Author   袁进
 * @DateTime 2019-01-10T10:12:14+0800
 * @param    {[type]}                 devices [description]
 * @param    {Number}                 status  [description]
 * @return   {[type]}                         [description]
 */
export function searchIng(devices, status=2)
{
	return {
		type: types.SEARCHING,
		status,
		devices,
	}
}

/**
 * [errorSearching 搜素出粗]
 * @Author   袁进
 * @DateTime 2019-01-10T10:12:36+0800
 * @param    {Number}                 status [description]
 * @return   {[type]}                        [description]
 */
export function errorSearching(status = 0)
{
	return {
		type: types.ERROR_SEARCHING,
		status,
	}
}

/**
 * [startSearchDevices 开始搜素设备]
 * @Author   袁进
 * @DateTime 2019-01-10T10:13:30+0800
 * @return   {[type]}                 [description]
 */
export const startSearchDevices = callback => ({
	type: 'START_SEARCHING',
	callback: callback,
})


/**
 * [bindSuccess 绑定设备成功]
 * @Author   袁进
 * @DateTime 2019-01-10T10:13:56+0800
 * @param    {[type]}                 device_sn [description]
 * @param    {[type]}                 msg       [description]
 * @param    {Number}                 status    [description]
 * @return   {[type]}                           [description]
 */
export function bindSuccess(msg, status = 1)
{
	return {
		type: types.DEVICE_BINDING_SUCCESS,
		status,
		msg,
	}
}

/**
 * [bindError 绑定设备失败]
 * @Author   袁进
 * @DateTime 2019-01-10T10:14:09+0800
 * @param    {[type]}                 msg    [description]
 * @param    {Number}                 status [description]
 * @return   {[type]}                        [description]
 */
export function bindError(msg, status = 0, code = 0)
{
	return {
		type: types.DEVICE_BINDING_ERROR,
		status,
		msg,
		code,
	}
}

/**
 * [addBindSN 异步绑定设备]
 * @Author   袁进
 * @DateTime 2019-01-10T10:14:47+0800
 * @param    {[type]}                 device_sn [description]
 */
export function addBindSN(device_sn)
{
	return  async dispatch =>
	{
		try
		{
			var res = await DeviceService.addBindSN({device_sn: device_sn,  })
			dispatch(bindError(res.msg, res.status, 0))
			console.log(res, '12qd1')
			if (res.status == 1)
			{
				dispatch(bindSuccess(res.msg));
			}
			else if (res.status == 2)
			{
				if (res.code == 400022 || res.code == 40009)
				{
					var response = await DeviceService.unbindDevice({device_sn: device_sn, forced_unbound: 1, })
					console.log(response, '写入12请')
					if (response.status == 1)
					{
						var resp = await DeviceService.addBindSN({device_sn: device_sn,  })
						console.log(resp, 'asdeu1')
						if (resp.status == 1)
						{
							dispatch(bindSuccess(resp.msg));
						}
						else
						{
							dispatch(bindError(resp.msg, resp.status, resp.code))
						}
					}
					else
					{
						dispatch(bindError(response.msg, response.status, response.code))
					}
				}
				else
				{
					dispatch(bindError(res.msg, res.status, res.code))
				}

			}
			else
			{
				dispatch(bindError(res.msg, res.status, res.code))
			}


		}
		catch (error)
		{
			console.log(error, '绑定出错')
			dispatch(bindError('绑定接口出错'))
		}

	}
}

/**
 * [unbindDevice 异步解绑设备]
 * @Author   袁进
 * @DateTime 2019-01-10T10:15:59+0800
 * @param    {[type]}                 device_sn [description]
 * @return   {[type]}                           [description]
 */
export function unbindDevice(dic)
{
	return dispatch =>
	{
		return DeviceService.unbindDevice(dic)
			.then(res =>
			{
				dispatch(bindError(res.msg, res.status, 0))

			})
			.catch(error =>
			{
				dispatch(unbindError("接口出错", res.status))
			})
	}
}

/**
 * [getUserDeviceList_error 获取服务器信息写入设备]
 * @Author   肖波
 * @DateTime 2019-01-10T10:18:50+0800
 */
export function deviceParameter(data)
{
	return {
		type: types.DEVICE_INFORMATION,
		data,
	}
}


/**
 * [getUserDeviceList 写入设备信息]
 * @Author   肖波
 * @DateTime 2019-01-10T10:19:21+0800
 * @return   {[type]}                 [description]
 */
var deviceInformation = {};
export function writeInformation(id,device_sn,dispatch){
	return dispatch => {
		console.log(id, device_sn, 'shenmegui')
		dispatch(connectionSucceeded(0))
		return DeviceService.writeInformation({device_sn: device_sn})
			.then(res => {
				console.log(res,'写入设备信息1111111111111111')
				if(res.status !== 1){
					getUserInfo(device_sn, res.data.deviceInfo, res.msg, dispatch)
					if(res.error_sn == 10025) {
						dispatch(getImplement(0));
					}
					return;
				}
				console.log(res.msg, '写入设备信息')
				deviceInformation = res.data.deviceInfo;
				dispatch(deviceParameter(res.data.deviceInfo))
				detachGetLaserManuallyParameters(id)
			})
			.catch(error => {
				console.log(error,'获取失败')
			})
	}
}
/**
 * [getUserDeviceList 获取用户信息]
 * @Author   肖波
 * @DateTime 2019-01-10T10:19:21+0800
 * @return   {[type]}                 [description]
 */
export function getUserInfo(device_sn, obj, msg, dispatch){
	DeviceService.getUserInfo()
		.then((res)=>{

			var data = {
				user_id: res.data.user_info.armarium_science_user_id,
				phone: res.data.user_info.armarium_science_user_mobile,
				equipment_number: device_sn,
				course: obj.course_data.course_name,
				course_id: obj.course_data.id,
				error_content: msg
			}
			DeviceService.connectFail(data)
				.then((res)=>{
					console.log('res',res)
					at && clearInterval(at);
					if (res.status !== 1)
					{
						dispatch(updataErr(1, 'connectFail接口的status不为1'))
					}

				})
				.catch((err)=>{
					console.log(err)
				})
		})
}


/**
 * [configuration 配置超时错误处理]
 * @Author   肖波
 * @DateTime 2019-01-10T10:19:21+0800
 * @return   {[type]}                 [description]
 */
export function configuration(device_sn, obj, msg)
{
	return dispatch =>
	{
		DeviceService.getUserInfo()
			.then((res)=>
			{
				console.log(res,'获取的用户信息',obj,msg)
				var data = {
					user_id: res.data.user_info.armarium_science_user_id,
					phone: res.data.user_info.armarium_science_user_mobile,
					equipment_number: device_sn,
					course: obj.course_data.course_name,
					course_id: obj.course_data.id,
					error_content: msg,
				}
				DeviceService.connectFail(data)
					.then((res)=>
					{
						console.log('res',res)
					})
					.catch((err)=>
					{
						console.log(err)
					})
			})
	}
}


/**
 * [setPointer 06x调整指针]
 * @Author   袁进
 * @DateTime 2019-01-10T17:17:48+0800
 * @param    {[type]}                 dic              [description]
 * @param    {[type]}                 BluetoothManager [description]
 * @param    {[type]}                 deviceId         [description]
 */
export function setNewPointer(dic, deviceId)
{
	const success = (res, dispatch) =>
	{
		return res
	}
	const fail = (err, dispatch) =>
	{
		return err
	}
	return async dispatch => {
		try
		{
			const res = await Application.setNewPointer(dic, BluetoothManager, deviceId)
			return success(res, dispatch)
		} catch (error) {
			return fail(error, dispatch)
		}
	}
}


/**
 * [getUserDeviceList 首页指针功能的显示隐藏]
 * @Author   肖波
 * @DateTime 2019-01-10T10:19:21+0800
 * @return   {[type]}                 [description]
 */
export function pointerShow(data)
{
	return {
		type: types.POINTER_SHOW,
		data,
	}
}
/**
 * [getUserDeviceList 调用连接成功的回调]
 * @Author   肖波
 * @DateTime 2019-01-10T10:19:21+0800
 * @return   {[type]}                 [description]
 */
export function connectSuccee(token, deviceId, device_sn, firmware_sn, dispatch, serverStatus=null)
{
	synchronis(dispatch, '开始调用连接成功')

	var dic = {
		armariumScienceSession: token,
		device_sn: device_sn,
		firmware_sn: firmware_sn,
	}
	if (firmware_sn.substring(1) >= 1700 && !isWriteCourse)
	{
		dic.course_status = serverStatus.course_status;
		dic.course_type_sn = serverStatus.course_type_sn;
		dic.remaining_days = serverStatus.remaining_days;
	}
	console.log(dic, '疗程上传到服器');
	DeviceService.connectSuccee(dic)
		.then(res =>
		{
			clearTimeout(synchronis1)
			//console.log('连接成功接口数据', res)
			dispatch(pointerShow(1))
			dispatch(connectSuccess(4, deviceId, device_sn))
			//上传数据

		})
		.catch(error => {
			clearTimeout(synchronis1)
			synchronis(dispatch, '调用连接成功的回调失败')
			console.log(error,'获取失败')

		})
}

/**
 * [instruction 配置超时处理]
 * @Author   肖波
 * @DateTime 2019-01-10T10:19:21+0800
 * @return   {[type]}                 [description]
 */
export function instruction(status, s){
	return {
		type: types.INSTRUCTION_TIME_OUT,
		status,
		s,
	}
}

/**
 * [getFirstConnectStatus 用户是否第一次连接]
 * @Author   袁进
 * @DateTime 2019-01-10T10:19:50+0800
 * @param    {[type]}                 status [description]
 * @return   {[type]}                        [description]
 */
export function getFirstConnectStatus(status)
{
	return {
		type: types.FIRST_CONNECT_STATUS,
		status,
	}
}

/**
 * [connectSuccess 连接设备]
 * @Author   袁进
 * @DateTime 2019-01-10T10:20:57+0800
 * @param    {[type]}                 status [description]
 * @param    {[type]}                 id     [description]
 * @return   {[type]}                        [description]
 */
export function connectSuccess(status, id, device_sn)
{
	return {
		type: types.CONNECT_SUCCESS,
		status,
		connectLoadingStatus: status,
		id,
		device_sn,
	}
}

/**
 *
 * @param {搜索到的设备} device
 */
export function searchedDevices(device)
{
	return {
		type: types.SEARCHED_DEVICES,
		device,
	}
}
//无绑定设备时连接

export const clickNoBindConnectDevice = callback => ({
	type: 'NO_BIND_CONNECT_DEVICE',
	callback: callback,
})

export function connectDevice()
{

}

/**
 * [connectBle 异步连接设备]
 * @Author   袁进
 * @DateTime 2019-01-10T10:22:28+0800
 * @param    {[type]}                 BluetoothManager [description]
 * @param    {[type]}                 deviceId         [description]
 * @return   {[type]}                                  [description]
 */
var deviceSucee = 0;
var runCount = 0;

//绑定后的连接
export const connectBle = (devices, callback) => ({
	type: 'CONNECT_BLE',
	devices: devices,
	callback: callback,
})
//没有绑定设备时连接
export const noConnectBle = (devices, callback) => ({
	type: 'NO_CONNECT_BLE',
	devices: devices,
	callback: callback,
})

export const connectSecondBle = (devices, callback) => ({
	type: 'CONNECT_SECOND_BLE',
	devices: devices,
	callback: callback,
})

function connectTaker(dispatch, deviceId, device_sn)
{
	console.log(Bleconnect.nofityServiceUUID, '服务🆔123123123131313123')
	dispatch(connectSuccess(1, deviceId, device_sn)) //改变蓝牙状态为配置中的状态
	return Bleconnect.startNotification(0) //打开通知
		.then(() =>
		{
			//获取时间
			synchronis(dispatch, '获取设备时间失败');
			Application.getTime(BluetoothManager, deviceId) //发送同步时间的指令
				.then(r =>
				{
					console.log("获取时间成功")
				})
				.catch(er =>
				{
					console.log("获取时间失败")
				})
		})
		.catch(error => {
			dispatch(sacnTimeOut(0))
			dispatch(updataErr(1, 'connectTaker走到catch'))
			dispatch(connectSuccess(0)) //修改蓝牙状态为连接中的状态
		})
}
var at;
function connectTimeout(dispatch,deviceId, device_sn) {
	//设置定时器每一秒执行一次
	// at = setInterval(() => {
	//     runCount++
	console.log(at,'定时器',aa,bb)
	console.log(Bleconnect.nofityServiceUUID,'服务id1111111111')
	// if(aa == 0 && bb == 0) {
	//     connectGetNotify(dispatch,deviceId)
	// }
	// if(aa == 1) { //代表已经拿到了nofityServiceUUID，可以开启通知和发送指令了
	aa = 0;bb =0;
	connectTaker(dispatch, deviceId, device_sn)
	// runCount = 0;
	// clearTimeout(at) //清楚定时器

	// }
	// },1000)
}

/**
 * 蓝牙断开后清除
 */
export function clearAt()
{
	at && clearTimeout(at) //清楚定时器
}

var aa = 0,bb = 0;
export function connectGetNotify(dispatch,deviceId)
{
	bb = 1
	Bleconnect.connect(deviceId)
		.then(res => {
			//如果nofityServiceUUID数组里面没有内容断开连接，反之把aa的状态设置为1去开启通知
			if (Bleconnect.nofityServiceUUID.length<1)
			{
				disconnect2(dispatch)//断开连接
			}
			else
			{
				aa = 1
				bb = 0

			}

		})
		.catch(err=> {
			console.log(err,'连接失败')
			bb = 0
			at && clearInterval(at);
			dispatch(updataErr(1, '连接官方接口走到catch里面'))
		})

}

export function disconnect2(dispatch)
{
	Bleconnect.disconnect()
		.then(() =>
		{
			console.log(err, '连接失败1')
			bb = 0
			if (runCount > 3)
			{
				runCount = 0;
				at && clearInterval(at);
				dispatch(updataErr(1, 'disconnect2断开连接成功'))
			}
		})
		.catch(() =>
		{
			console.log('连接失败2')
			bb = 0
			if (runCount > 3)
			{
				runCount = 0;
				at && clearInterval(at);
				dispatch(updataErr(1, 'disconnect2断开连接失败'))
			}
		})
}


//连接成功后上传数据

export function connectedUpData(deviceSN, data)
{
	return dispatch =>
	{
		bleDataHandle.receiveBLEData(deviceSN, data, getDataType, () => {

		}, () => {

		})
	}
}

/**
 * [getTime 连接成功后同步更新时间]
 * @Author   袁进
 * @DateTime 2019-01-10T10:22:57+0800
 * @param    {[type]}                 time [description]
 * @return   {[type]}                      [description]
 */
export function getTime(time)
{
	return {
		type: types.SYNC_TIME_SUCCESS,
		time,
	}
}


/**
 * [connectionSucceeded 连接成功弹出框判断依据]
 * @Author   肖波
 * @DateTime 2019-01-10T10:24:22+0800
 * @param    {[type]}                 status [description]
 * @return   {[type]}                        [description]
 */
export function connectionSucceeded(status)
{
	return {
		type: types.CONNECTION_SUCCEEDED,
		connectLoadingStatus: status,

	}
}

/**
 * [updataErr 上传错误信息状态控制]
 * @Author   肖波
 * @DateTime 2019-01-10T10:24:22+0800
 * @param    {[type]}                 status [description]
 * @return   {[type]}                        [description]
 */
export function updataErr(status, msg)
{
	return {
		type: types.UPDATA_ERR,
		data: status,
		msg,
	}
}

/**
 * [loading 连接搜索Loading状态]
 * @Author   袁进
 * @DateTime 2019-01-10T10:25:53+0800
 * @param    {[type]}                 status [description]
 * @return   {[type]}                        [description]
 */
export function loading(status)
{
	return {
		type: types.LOADING_STATUS,
		status,
	}
}
/**
 * [disconnect 断开设备]
 * @Author   袁进
 * @DateTime 2019-01-10T16:48:44+0800
 * @param    {[type]}                 status [description]
 * @return   {[type]}                        [description]
 */
export const disconnectBle = callback => ({
	type: 'DISCONNECT_DEVICE',
	callback: callback,
})



/**
 * [stopScan 停止扫描]
 * @Author   袁进
 * @DateTime 2019-02-27T11:39:51+0800
 * @return   {[type]}                 [description]
 */
export function stopScan()
{
	return dispatch =>
	{
		return Bleconnect.stopScan()
			.then(() => {

			})
			.catch(err => {

			})
	}
}

/**
 * [getFirmwareVersion 获取固件版本信息]
 * @Author   袁进
 * @DateTime 2019-02-26T15:10:07+0800
 * @param    {[type]}                 obj [description]
 * @return   {[type]}                     [description]
 */
export function getFirmwareVersion(obj)
{
	return {
		type: types.GET_FIRMWARE_VERSION,
		data: obj,
	}
}

/**
 * [setUserCourse 租赁设备设置用户疗程]
 * @Author   袁进
 * @DateTime 2019-01-10T16:52:16+0800
 * @param    {[type]}                 msg [description]
 */
export function setUserCourse(msg)
{
	return {
		type: types.SET_USER_COURSE,
		msg,
	}
}

/**
 * [fetchUserCourse 异步设置用户疗程]
 * @Author   袁进
 * @DateTime 2019-01-10T16:52:48+0800
 * @param    {[type]}                 user_course_id [description]
 * @return   {[type]}                                [description]
 */
export function fetchUserCourse(user_course_id) {
	return dispatch => {
		return DeviceService.setIeaseDeviceCourse({user_course_id: user_course_id, })
			.then(res => {
				dispatch(getDeviceTypeSuccess(0,[]))
			})
			.catch(err => {
				dispatch(setUserCourse('选择疗程失败'))
			})
	}
}

//封装定时器方法
var synchronis1;
function synchronis(dispatch, s)
{
	dispatch(instruction(0, s))
	synchronis1 = setTimeout(() =>
	{
		dispatch(instruction(1, s))
	}, 20000);
}
//获取手动激光参数
function detachGetLaserManuallyParameters(deviceId){
	return Application.getLaserManuallyParameters(BluetoothManager,deviceId)
		.then(() => {
			console.log('获取手动激光参数成功')
		})
		.catch(error => {
		});//获取手动激光参数
}
//获取设备信息
function detachGetDeviceInfo(deviceId){
	return Application.getDeviceInfo(BluetoothManager,deviceId)
		.then(() => {
			console.log('获取设备信息成功')

		})
		.catch(err => {

		})
}
//写入eb
export function detachSetLaserManuallyPaymentDuration(deviceId)
{
	return dispatch =>
	{
		return Application.setLaserManuallyPaymentDuration( deviceInformation.eb*100, BluetoothManager, deviceId)
			.then(result =>
			{
				console.log('sjsjjsjsj')
			})
			.catch(fail =>
			{
				console.log('失败', fail)
			})
	}

}
//设置手动激光参数

export const detachSetLaserManuallyParameters = (power, duration, callback) => ({
	type: 'SET_LASER_MANUALLY_PARAMETERS',
	power: power,
	duration: duration,
	callback: callback,
})

//获取手动激光状态
export const getManuallyLaserState = callback => ({
	type: 'GET_MANUALLY_LASER_STATE',
	callback: callback,
})

//开启手动心率
export const isOpenManullyHr = (isOpen, callback) => ({
	type: 'OPEN_MANULLY_HR',
	isOpen: isOpen,
	callback: callback,
})

//获取手动心率开启状态
export function detachGetManuallyHRState(deviceId)
{
	return dispatch => {
		Application.getManuallyHRState(BluetoothManager, deviceId)
			.then(() =>
			{
				console.log('配置完成')
			})
			.catch(erro =>
			{

			});//获取手动心率开启状态
	}
}
//获取自动心率开启状态
function detachGetAutoHRState(deviceId){
	return Application.getAutoHRState(BluetoothManager,deviceId)
		.then(() => {
			console.log('获取自动心率开启状态成功')
			//dispatch(getManuallyLaserState(isManuallyLaserStatus))
		})
		.catch(error => {

		});
}
//写入疗程
export async function detachSetLaserTreatmentParameters(dic, deviceId)
{
	console.log(dic, '写疗程');
	try
	{
		await Application.setLaserTreatmentParameters(dic, BluetoothManager, deviceId);
		console.log('写入疗程成功');
	}
	catch (err)
	{
		console.log('写入疗程失败');
	}
}
/**
 * 写入疗程周期
 * @param {*} dic
 * @param {*} deviceId
 */
function setTreatmentStatus(dic, deviceId)
{
	return Application.setTreatmentStatus(dic, BluetoothManager, deviceId)
		.then(() => {

		})
		.catch(err => {
			console.log(err)
		})
}

/**
 * [getTreatmentStatus 获取激光疗程周期]
 * @Author   袁进
 * @DateTime 2019-03-13T14:49:20+0800
 * @param    {[type]}                 ble      [description]
 * @param    {[type]}                 deviceId [description]
 * @return   {[type]}                          [description]
 */
function getTreatmentStatus(deviceId)
{
	return Application.getTreatmentStatus(BluetoothManager,deviceId)
		.then(() => {
			console.log('获取疗程周期成功')
		})
		.catch(err => {
			console.log('获取疗程周期失败')
		})
}


var isManuallyLaserStatus = false,
	isManuallyHrStatus = false,
	isAutoHrStatus = false

//获取设备里面的疗程参数
export function getTreatmentParams(data)
{
	return {
		type: types.GET_TREATMENT_PARAMS,
		data,
	}
}

//从设备中获取激光周期
export function fetchTreatmentStatus(data)
{
	return {
		type: types.GET_TREATMENT_STATUS,
		data,
	}
}

//获取应用初始化
export const getApplicationFirst = s => ({
	type: 'GET_APPLICATION_FIRST',
	callback: s,
})
//设备应用获取初始状态

export function dataFromApplication(dataObject, deviceId, device_sn)
{
	return dispatch =>
	{

	}
}


var addDay ="", treatmentPrams = new Object(), parametersArray;
//设置疗程参数后一系列执行
export function fetchTreatmentParams(addDays, deviceId)
{
	return dispatch =>
	{

		addDay = addDays;
		synchronis(dispatch, '获取激光疗程参数失败')
		Application.getLaserTreatmentParameters(BluetoothManager, deviceId)
			.then(() =>
			{

			})
			.catch(err =>
			{

			})



	}

}

const delay = function()
{
	return new Promise(resolve =>
	{
		setTimeout(function()
		{
			resolve();
		}, 2000);
	});
};

//购买疗程时获取连接的疗程数据
var treatmentStatus = new Object(), params = "", treatmentParams = new Object(), dateParams;
export function dataFromTreatment(dataObject, deviceId, device_sn)
{
	return async dispatch =>
	{
		switch (dataObject.cmd)
		{
		case cmd.kGXYL_GetlaserTreatmentStatus:
			//获取激光疗程周期状态
			clearTimeout(synchronis1)
			var dataStatus= dataObject.body.treatmentStatus;
			console.log(dataObject, "获取激光周期的回调", treatmentParams)
			treatmentStatus = dataObject.body;
			parametersArray = [];
			var parameters = treatmentParams.parameters;
			parameters.forEach(v =>
			{
				let item = {
					power: parseInt(v.power),
					duration: parseInt(v.duration),
					startHour: parseInt(v.startHour),
					startMinute: parseInt(v.startMinute),
				}
				parametersArray.push(item);
			})
			var courseNumber = parseInt(treatmentParams.sequence);
			var coursePeriodic = parseInt(treatmentParams.periodic);
			var courseGap = parseInt(treatmentParams.gap);
			var courseEndDate = treatmentParams.endDate;
			console.log(courseEndDate, '123123')
			if (courseEndDate)
			{
				var arr = courseEndDate.split("-");
				var version = firmwareVersion.substring(1).length > 3 ? firmwareVersion.substring(1) : firmwareVersion.substring(1) + "0";
				console.warn(firmwareVersion, '指定的版本号...........', version)
				if (version.substring(0, 5) >= 1708 )
				{
					if (arr.length == 3)
					{
						var time = qbDate.getNewDay(0);
						dateParams = qbDate.dateDiff(time, courseEndDate);
						dateParams = Number(dateParams) + Number(addDay)
					}
					else
					{
						dateParams = Number(courseEndDate) + Number(addDay)
					}
				}
				else
				{
					if (arr.length == 3)
					{
						time = qbDate.getNewDay(0);
						dateParams = qbDate.dateDiff(time, courseEndDate);
						dateParams = Number(dateParams) + Number(addDay)
						dateParams = qbDate.getNewDay(dateParams).split('-');

					}
					else
					{
						//剩余时间转截止日期
						dateParams = Number(courseEndDate) + Number(addDay);
						dateParams = qbDate.getNewDay(dateParams).split('-');
					}
				}

			}
			console.log(dateParams, '写入的截止日期')
			dic = {
				index: courseNumber,
				periodic: coursePeriodic,
				gap: courseGap,
				endDate: dateParams,
				parameters: parametersArray,
			}
			console.log(dic, '设置的激光')
			synchronis(dispatch, '设置激光疗程参数失败')
			Application.setLaserTreatmentParameters(dic, BluetoothManager, deviceId)
			break;
		case cmd.kGXYL_GetLaserRegimenParameters:
			//获取激光疗程参数
			clearTimeout(synchronis1);
			console.log(dataObject, '获取激光疗程参数的回调')
			synchronis(dispatch, '获取疗程周期失败')
			treatmentParams = dataObject.body;

			Application.getTreatmentStatus(BluetoothManager, deviceId);
			break;
		case cmd.kGXYL_LaserRegimenParameters:
		//设置激光疗程参数的回调
			clearTimeout(synchronis1)
			synchronis(dispatch, '设置激光暂停失败')
			if (dataObject.body.setState == "设置成功")
			{
				var dic = {
					isOpen: treatmentStatus.treatmentStatus,
					remainDays: treatmentStatus.remainDays,
				};
				console.log(dic, '希尔疗程周期')
				setTreatmentStatus(dic, deviceId);

			}
			break;
		case cmd.kGXYL_SetlaserTreatmentStatus:
		//写入疗程周期的回调
			clearTimeout(synchronis1)
			synchronis(dispatch, '设置激光状态失败')
			console.log(dataObject, "写入疗程周期成功的回调")
			if (dataObject.body.setState == "设置成功")
			{
				version = firmwareVersion.substring(1).length > 3 ? firmwareVersion.substring(1) : firmwareVersion.substring(1) + "0";
				console.log(firmwareVersion, '指定的版本号...........', version)
				if (Number(version.substring(0, 4)) >= 1708 )
				{
					console.log("1231231开启成功")
					//版本号在1708以上时开启疗程,根据状态是否开启暂停疗程
					var res = await delay();
					Application.setLaserRegimen(true, BluetoothManager, deviceId);
					//直接开启成功
					clearTimeout(synchronis1)
					dispatch(loading(8))

				}
				else
				{
					//直接开启成功
					clearTimeout(synchronis1)
					dispatch(loading(8))
				}


			}
			break;
		case cmd.kGXYL_setLaserRegimen:
			clearTimeout(synchronis1)
			synchronis(dispatch, '设置激光暂停失败')
			console.log(dataObject, '设置激光疗程暂停111')
			if (dataObject.body.setState == "设置成功")
			{
				//直接开启成功
				clearTimeout(synchronis1)
				dispatch(loading(8))
			}
			break;
		default:
			console.log("结尾")
			break;
		}
	}
}


//蓝牙长广播模块
export function dataFromLongBoardCast(dataObject, deviceId, device_sn)
{
	return dispatch =>
	{
		switch (dataObject.cmd)
		{
		case cmd.kGXYL_SetBoardCastDuration:
			console.log(dataObject, '设置蓝牙长连接')
			break;
		}
	}
}

/**
 *
 * @param {数据上传的进度条} status
 */
export function getDataProgress(status)
{
	return {
		type: types.DATA_PROGRESS,
		status,
	}
}

/**
 *
 * @param {解绑时上传数据} status
 */
export function updataUnbindData(status)
{
	return {
		type: types.UNBIND_DATA_STATUS,
		status,
	}
}

/**
 * [isManuallyLaser 开关手动激光]
 * @Author   袁进
 * @DateTime 2019-01-10T16:53:04+0800
 * @param    {Boolean}                isOpen [description]
 * @param    {[type]}                 msg    [description]
 * @return   {Boolean}                       [description]
 */
export function isManuallyLaser(isOpen,msg) {
	return {
		type: types.IS_MANUALLY_LASER_STATE,
		isOpen,
		msg,
	}
}

/**
 * [isOpenManullyLaser 开关手动激光]
 * @Author   袁进
 * @DateTime 2019-01-10T17:15:41+0800
 * */
export const isOpenManullyLaser = (isOpen, callback) => ({
	type: 'OPEN_MANULLY_LASER',
	isOpen: isOpen,
	callback: callback,
})



/**
 * [isOpenAutoHr 开关自动心率]
 * @Author   袁进
 * @DateTime 2019-01-10T17:17:00+0800
 * @param    {Boolean}                isOpen           [description]
 * @param    {[type]}                 BluetoothManager [description]
 * @param    {[type]}                 deviceId         [description]
 * @return   {Boolean}                                 [description]
 */
export const  isOpenAutoHr = (isOpen, callback)  => ({
	type: "IS_OPEN_AUTOHR",
	isOpen: isOpen,
	callback: callback,
})


/**
 * [setPointer 调整指针]
 * @Author   袁进
 * @DateTime 2019-01-10T17:17:48+0800
 * @param    {[type]}                 dic              [description]
 * @param    {[type]}                 BluetoothManager [description]
 * @param    {[type]}                 deviceId         [description]
 */
export function setPointer(dic,deviceId) {
	return dispatch => {
		return Application.setPointer(dic,BluetoothManager,deviceId)
			.then(() => {
				console.log("设置表指针成功")
			})
			.catch(err => {
				console.log("设置表指针失败")
			})
	}
}


export function getFirstConnectDevice(device_sn)
{
	return dispatch =>
	{
		return courseService.getFistConnectTreatmentInfo(device_sn)
	}
}

export function airUpdating(status= 1, msg)
{
	return {
		type: types.AIR_UPDATING,
		status,
		msg,
	}
}

export function airUpdataSuccess(status= 2)
{
	return {
		type: types.AIR_UPDATA_SUCCESS,
		status,
	}
}

export function airUpdataError(status= 3)
{
	return {
		type: types.AIR_UPDATA_ERROR,
		status,
	}
}

/**
 * [startDFU 开始空中升级]
 * @Author   袁进
 * @DateTime 2019-02-26T18:23:01+0800
 * @param    {[type]}                 deviceId [description]
 * @return   {[type]}                          [description]
 */
export function startDFU(deviceId)
{
	return dispatch =>
	{
		if (!deviceId)
		{
			dispatch(airUpdating(3, '升级的设备id不存在'));
			return;
		}
		if (!BluetoothManager)
		{
			dispatch(airUpdating(3, "蓝牙没有初始化"));
			return;
		}
		return Application.startDFU(BluetoothManager, deviceId)
			.then(() =>
			{
				console.log('启动成功')
				dispatch(airUpdating(1))
			})
			.catch(err=>
			{
				console.log(err, '启动失败');
				dispatch(airUpdating(3, '指令发送失败'))
			})
	}
}

/**
 * [getProgressBarValue 更新进度条的值]
 * @Author   袁进
 * @DateTime 2019-02-26T18:23:40+0800
 * @param    {[type]}                 value [description]
 * @return   {[type]}                       [description]
 */
export function getProgressBarValue(value) {
	return {
		type: types.GET_PROGRESSBAR_VALUE,
		value: value/100
	}
}


/**
 *
 * @param {修改设备名称} name
 */
export function upDataDeviceName(name)
{
	return {
		type: types.UPDATA_DEVICE_NAME,
		name,
	}
}

/**
 *
 * @param {热更新App} status
 */
export function upGrade(status)
{
	return {
		type: types.UPGRADE,
		status,
	}
}

/**
 *
 * @param {更新进度对象} data
 */
export function upGrade_progress(data)
{
	return {
		type: types.UPGRADE_PROGRESS,
		data,
	}
}

/**
 *
 * @param {热更新升级出错} data
 */
export function upGrade_error(data)
{
	return {
		type: types.UPGRADE_ERROR,
		data
	}
}

export function upGradeBand(data)
{
	return {
		type: types.UPGRADEBAND,
		data,
	}
}


/**
 * 获取服务器上的最新版本信息
 */
export function getAppNewBand(dic)
{
	return async dispatch => {
		try {
			const result = await loginService.isAppUpGrade(dic);
			console.log(result, '新的版本信息')
			if (result.status == 1)
			{
				return dispatch(upGradeBand(result.info))
			}
			else
			{
				return dispatch(upGradeBand(null))
			}
		}
		catch (error)
		{
			console.log(error, "获取出错")
			return dispatch(upGradeBand(null))
		}
	}
}

//打开蓝牙

export function eableBlue()
{
	return async  dispatch => {
		try {
			var res = await Bleconnect.enableBluetooth()

		} catch (error) {

		}

	}
}

export function broadCastValue(status, v="", msg="")
{
	return {
		type: types.BOARDCAST_INFO,
		v,
		status,
		msg,
	}
}

export function setBroadCastValue(status, msg="")
{
	return {
		type: types.SET_BOARDCAST_INFO,
		status,
		msg,
	}
}

/**
 * 设置蓝牙广播时长
 */
export function setBroadcastDuration(duration, deviceId)
{
	const success = (res, dispatch) => {
		dispatch(setBroadCastValue(2, '设置成功'))
		return res
	}
	const fail = (err, dispatch) => {
		dispatch(setBroadCastValue(3,'设置失败'))
		return err
	}
	return async dispatch =>
	{
		try
		{
			const res = await Application.setBroadcastDuration(duration, BluetoothManager, deviceId)
			await Bleconnect.disconnect();
			return success(res, dispatch)
		}
		catch (error)
		{
			return fail(error, dispatch)
		}
	}
}

/**
 * 获取蓝牙广播时长
 */
export function getBroadcastDuration(deviceId)
{
	const success = (res, dispatch) => {
		dispatch(broadCastValue(4, res.boardCastDuration))
		return res
	}
	const fail = (err, dispatch) => {
		dispatch(broadCastValue(3))
	}
	return async dispatch =>
	{
		try
		{
			const res = await Application.getBroadcastDuration(BluetoothManager, deviceId);
			return success(res, dispatch)
		}
		catch (error)
		{
			return fail(error, dispatch)
		}
	}
}

//搜索绑定设备 status == 0 , 扫码绑定 status == 1
export const bindDevice = (status, devices, callback) => ({
	type: 'BIND_DEVICE',
	callback: callback,
	devices: devices,
	status: status,
})


export function bindService(deviceId, device_sn)
{
	const success = (res, dispatch) =>
	{
		dispatch(setBroadCastValue(2, '设置成功'))
		return res
	}
	const fail = (err, dispatch) =>
	{
		dispatch(setBroadCastValue(3, '设置失败'))
		return err
	}
	return async dispatch =>
	{
		try
		{
			const response = await DeviceService.getDeviceDetail({ device_sn: device_sn, });
			console.log(response, '获取的设备详情', response.status)
			if (response.status !== 1)
			{
				var state = {state: "设置失败", };
				return state;
			}
			else
			{
				var firmware_sn = response.data.firmware_sn
			}
			console.log(firmware_sn)
			var sn = firmware_sn.substring(1).split('.').join("");
			console.log(sn, '分割的')
			if (sn && sn.substring(0, 4) >= 1710)
			{
				const peripheralInfo = await Bleconnect.connect(deviceId);
				console.log(peripheralInfo, 'peripheralInfo');
				if (peripheralInfo.characteristics.length < 1)
				{
					Bleconnect.disconnect();
					state = {state: "设置失败", };
					return state;
				}
				const notification = await Bleconnect.startNotification(0);
				const res = await Application.setBroadcastDuration(0, BluetoothManager, deviceId)
				await Bleconnect.disconnect();
				return success(res, dispatch)
			}
			else
			{
				state = {state: "设置成功", };
				return state;
			}
		}
		catch (error)
		{
			state = {state: "设置失败", };
			return state;
		}
	}
}

