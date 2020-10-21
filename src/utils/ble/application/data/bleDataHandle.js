/**
 * 数据上传的处理类
 */
import {put, call, delay, take, select, takeEvery, } from 'redux-saga/effects';

import * as types from '../../../../constants/device/bleTypes';
import * as dataService from '../../../../utils/network/dataService';
import QBStorage from '../../../../utils/storage/storage';
import * as qbData from '../../../../utils/qbDate';

import * as DeviceService from '../../../../utils/network/deviceService'

import * as getDataFromBle from './getDataFromBle'
_bleManager = null;
// 缓存使用
// 心率总数据
_heartRateData = [];
// 心率每天的数据
_hrDayData = new Object();
// 激光总数据
_laserData = [];
// 激光每天的数据
_laserDayData = [];
_laserAutoDayData = [];
// 运动总数据
_movementData = [];
_heartRateLastData = new Object();
_laserLastData = new Object();
_movementLastData = new Object();
// 读取数据的日期[2017,1,1]
_dateArray = [];
// 用户保存天数
// 当前要读取的运动数据天数
_motionDayCount = 0;
// 当前要读取激光数据天数
_laserDayCount = 0;
// 要读取心率天数
_heartRateDayCount = 0;
// 运动的总天数据
_motionTotalCount = 0;
// 激光的总天数据
_laserTotalCount = 0;
// 心率的总天数据
_heartRateTotalCount = 0;
// 服务器过来的心率数据下标
_heartRateIndex = 0;
// 服务器过来的激光数据下标
_laserIndex = 0;
// 服务器回来的数据
_lastData = [];
//运动数据定时器
sportTime = 0;
//心率定时器
heartRateTime = 0;
//激光定时器
laserTime = 0;
//数据索引
dataJSON = {};
//固件版本号
firmWareVersion = '';
//设备编号
device_sn = 0;
//用户token
token = 0;

/**
 * 连接失败处理
 * @author 肖波
 * @param {*} dic
 */
export function updataErr(status, msg="")
{
	return {
		type: types.UPDATA_ERR,
		data: status,
		msg,
	}
}

/**
 * 上传数据处理
 * @author 肖波
 * @param {*} dic
 */
export function untied(status)
{
	return {
		type: types.UNTIED_PROMPT,
		status,
	}
}

/**
 *
 * @param {上传运动数据} status
 */
export function upDataSport(status)
{
	return {
		type: types.UPDATA_SPORTS,
		status,
	}
}

/**
 *
 * @param {上传心率数据} status
 */
export function upDataHeart(status)
{
	return {
		type: types.UPDATA_HEART,
		status,
	}
}

/**
 *
 * @param {上传激光数据} status
 */
export function upDataLaser(status)
{
	return {
		type: types.UPDATA_LASER,
		status,
	}
}



/**
 * 数据请求超时处理
 * @author 肖波
 * @param {*} dic
 */
export function* bleErr (content)
{
	yield put({type: 'UPDATA_ERR', data: 0, })
	let userInfo = {}
	var user = yield call(QBStorage.get, 'user');
	userInfo = user
	var res = yield call(DeviceService.getUserInfo, {armariumScienceSession: user.token, });
	var data = {
		armariumScienceSession: userInfo.token,
		user_id: res.data.user_info.armarium_science_user_id,
		phone: res.data.user_info.armarium_science_user_mobile,
		equipment_number: device_sn,
		course: dataJSON.course_data.course_name,
		course_id: dataJSON.course_data.id,
		error_content: content,
		firmware_version_number: firmWareVersion,
	}
	var response = yield call(DeviceService.connectFail, data)
	yield put({type: 'UPDATA_ERR', data: 1, msg: content, })

}
/**
 * 运动数据定时器处理逻辑
 */
export function sportUpdata()
{
	sportTime = setTimeout(()=>
	{
		console.log('sksksks')
		bleErr('获取运动数据超时')
	}, 120000)
}

/**
 * 心率数据定时器处理逻辑
 */
export function heartRateUpdata(dispatch)
{
	console.log('怎么说')
	heartRateTime = setTimeout(()=>
	{
		bleErr('获取心率数据超时', dispatch)
	}, 300000)
}

/*
 * 激光数据定时器处理逻辑
 */
export function laserUpdata()
{
	console.log('怎么说')
	laserTime = setTimeout(()=>
	{
		bleErr('获取激光数据超时')
	}, 300000)
}

/**
 * [save 对蓝牙返回的数据进行二次处理]
 * @Author   袁进
 * @DateTime 2018-11-26T10:49:35+0800
 * @param    {Object}                 dic [蓝牙返回的数据]
 */
export function save (dic)
{


	switch (dic.type)
	{
	case 'motion':
		// if (userId == undefined) { return false }
		console.log('nsnsn')
		var stepsNum = dic.data.length == 4 ? dic.data[0] | dic.data[1] << 8 | dic.data[2] << 16 | dic.data[3] << 24 : 0;
		var motionItem = {
			y: _dateArray[0],
			m: _dateArray[1],
			d: _dateArray[2],
			user_id: userId,
			steps_num: stepsNum, //运动步数
			time: getTime(_dateArray[0], _dateArray[1], _dateArray[2])
		}
		_movementData[0] = motionItem ;
		console.log('运动步数', _movementData)
		_movementLastData = {
			y: _dateArray[0],
			m: _dateArray[1],
			d: _dateArray[2],
			user_id: userId,
			time: Math.round(new Date().getTime() / 1000),
		}
		console.log(_movementLastData);

		return true;
	case 'heartRate':
		console.log('心率数据')

		//if (userId == undefined) { return false }
		if (dic.data.length == 1 && dic.data[0] == 4)
		{

			if (Object.keys(_hrDayData).length != 0)
			{

				_heartRateData[0] = {
					user_id: userId,
					y: _dateArray[0],
					m: _dateArray[1],
					d: _dateArray[2],
					data: JSON.stringify(_hrDayData),
				};
			}
			_heartRateIndex = 0;
			_hrDayData = new Object();
			return true
		}
		else if (dic.data.length == 6)
		{
			// 判断是1手动还是2自动
			if (dic.data[6] == 1)
			{
				return;
			}
			if (dic.data[5] == 2)
			{
				var _start_time = dic.data[0] + ":" + dic.data[1];
				var dics = {
					start_time: _start_time,
					start_value: dic.data[3],
				}
				_heartRateIndex = (dic.data[0] * 60 + dic.data[1]) / 15;
				_hrDayData[_heartRateIndex] = dic.data[3];
				// _hrDayData.push({
				//     start_time: _start_time,
				//     start_value: dic.data[3]
				// })
			}

		}
		break;
	case 'laser':

		//if (userId == undefined) { return false }
		if (dic.data.length == 1 && dic.data[0] == 4)
		{


			if (_laserDayData.length != 0)
			{
				let dic = {
					user_id: userId,
					y: _dateArray[0],
					m: _dateArray[1],
					d: _dateArray[2],
					time: getTime(_dateArray[0], _dateArray[1], _dateArray[2]),
					data: _laserDayData,
					type: 1,
					course_sn: _laserDayData[0].course_sn,

				}
				_laserData.push(dic);
				_laserDayData = [];
			}
			if (_laserAutoDayData.length !== 0)
			{
				let dic = {
					user_id: userId,
					y: _dateArray[0],
					m: _dateArray[1],
					d: _dateArray[2],
					time: getTime(_dateArray[0], _dateArray[1], _dateArray[2]),
					data: _laserAutoDayData,
					type: 0,
					course_sn: _laserAutoDayData[0].course_sn,

				}
				_laserData.push(dic);
				_laserAutoDayData = [];
			}
			_laserIndex = 0;


			return true

		}
		else if (dic.data.length == 8)
		{
			// const user = app.getUser();
			if (dic.data[7] !== 1)
			{

				var minute = dic.data[1] < 10 && dic.data[1] !== 0 ? '0' +  dic.data[1] : dic.data[1];
				 let _start_time = dic.data[0] + ":" + minute;
				 console.log(_start_time, '开启时间111')
				let _value = dic.data[3]
				var dic = {
					start_time: _start_time,
					power_level: dic.data[2],
					time: _value,
					heartRate: dic.data[5],
					course_sn: dic.data[7],
					user_id: userId,
					y: _dateArray[0],
					m: _dateArray[1],
					d: _dateArray[2],
					timestamp: getTime(_dateArray[0], _dateArray[1], _dateArray[2]),
				}
				dic[_start_time] = _value;
				_laserAutoDayData.push(dic)

			}
			else
			{
				let _start_time = dic.data[0] + ":" + dic.data[1];
				let _value = dic.data[3]
				var dic = {
					start_time: _start_time,
					power_level: dic.data[2],
					time: _value,
					heartRate: dic.data[5],
					course_sn: dic.data[7],
					user_id: userId,
					y: _dateArray[0],
					m: _dateArray[1],
					d: _dateArray[2],
					timestamp: getTime(_dateArray[0], _dateArray[1], _dateArray[2]),
				}
				dic[_start_time] = _value;
				_laserDayData.push(dic)
			}

		}
		break;
	default:
		break;
	}
}

/**
 * 获取年月日的时间时间戳
 */
export function getTime(year, month, day)
{

	var strtime = year + '-' + month + '-' + day ;
	var date = new Date(strtime);
	date = new Date(strtime.replace(/-/g, '/'));
	return Math.round(date.getTime() / 1000)
}

/************************* 从蓝牙获取数据模块 **********************/


/**
 * 获取运动数据
 */

export function getMovementData(ble, id)
{
	console.log(_motionDayCount, '判断获取运动数据', _movementData)
	if (_motionDayCount >= 0 || _movementData.length < 3)
	{
		console.log(_motionDayCount,'判断')
		const _myDate = new Date();
		console.log(_myDate)
		//获取时间索引到当前时间的每一天的数据（用split转化为数组的格式）
		_dateArray = qbData.getNewDay(-_motionDayCount).split('-');
		console.log('判断!!!!!!!!', _dateArray)
		//通过自减的方式达到循环的效果
		_motionDayCount -= 1;
		//调用发动指令函数
		getDataFromBle.getMotionData(_dateArray[0], _dateArray[1], _dateArray[2], ble, id);
	}
}

/**
 * 获取激光数据
 */
export function getLaserData(ble, id)
{
	if (_laserDayCount >= 0 || _laserData.length < 3 )
	{
		console.log("获取激光数据蓝牙交互")
		const _myDate = new Date();
		var index = (_laserDayCount == _laserTotalCount ? _laserIndex : 0);
		_dateArray = qbData.getNewDay(-_laserDayCount).split('-');
		console.log('哎哟我去', _dateArray)
		_laserDayCount -= 1;
		getDataFromBle.getLaserData(ble, id, _dateArray[0], _dateArray[1], _dateArray[2], index);
	}
}
/**
 * 获取心率数据
 */
export function getHRData(ble, id)
{
	console.log('banjiale')
	if (_heartRateDayCount >= 0 || _heartRateData.length < 3 )
	{
		const _myDate = new Date();
		var index = _heartRateDayCount == _heartRateTotalCount ? _heartRateIndex : 0;
		_dateArray = qbData.getNewDay(-_heartRateDayCount).split('-');
		_heartRateDayCount -= 1;
		getDataFromBle.getHrData(ble, id, _dateArray[0], _dateArray[1], _dateArray[2], index);
	}
}


/************************* 上传数据模块 **********************/
/**
 * 上传心率数据到服务器
 */
export function uploadHeartRateData()
{
	const dic = {
		HeartRateLastData: JSON.stringify(_heartRateLastData),
		HeartRateData: _heartRateData.length == 0 ? false : JSON.stringify(_heartRateData)
	}
	// console.debug('心率数据', dic);
	return _dataService.updateHeartRateData(dic);
}

/**
 * 上传激光数据到服务器
 */
export function uploadLaserData()
{
	const dic = {
		laserLastData: JSON.stringify(_laserLastData),
		laserData: _laserData.length == 0 ? false : JSON.stringify(_laserData)
	}
	// console.debug("上传服务器激光数据", dic);
	return _dataService.updateLaserData(dic);
}

/**
 * 上传运动数据到服务器
 */
export function uploadMovementData()
{

	const dic = {
		movementLastData: JSON.stringify(_movementLastData),
		movementData: _movementData.length == 0 ? false : JSON.stringify(_movementData)
	}
	return _dataService.updateMovementData(dic);
}
/**
 * 上传所有数据
 */
export function uploadAllData(deviceSN)
{
	const dic = {
		movementData: _movementData.length == 0 ? false : JSON.stringify(_movementData),
		laserData: _laserData.length == 0 ? false : JSON.stringify(_laserData),
		HeartRateData: _heartRateData.length == 0 ? false : JSON.stringify(_heartRateData),
		device_sn: deviceSN,
		armariumScienceSession: token,
	}
	console.log('上传所有数据1111111111111', dic)
	return dataService.updateAllData(dic);
}

/**
 *
 * @param {数据上传的进度条} status
 */
export function dataProgress(status)
{
	return {
		type: types.DATA_PROGRESS,
		status,
	}
}

/**
 * 清空缓存
 */
export function clearData()
{

	_heartRateData = [];
	_heartRateLastData = new Object();
	_laserData = [];
	_laserLastData = new Object();
	_movementData = [];
	_movementLastData = new Object();
	_hrDayData = new Object();
	_laserDayData = [];
	_laserAutoDayData = [];
}

export function clearTime()
{
	laserTime && clearTimeout(laserTime)
	heartRateTime && clearTimeout(heartRateTime)
	sportTime && clearTimeout(sportTime)
}


//运动数据的处理

export function* deviceReturnSports(data, bleManager, id)
{
	console.log(data, '获取的运动数据')
	var _body = data.body;
	if (save({ type: 'motion', data: _body.data, }))
	{
		console.log('激光', _movementData, _motionDayCount)
		if (_motionDayCount < 0 || _movementData.length >= 3)
		{
			console.log('激光', _motionDayCount)
			clearTimeout(sportTime)
			yield put({type: 'UPDATA_SPORTS', status: 1, });
			yield put({type: 'UPDATA_LASER', status: 5, })
			yield put({type: 'DATA_PROGRESS', status: 30, })
			laserUpdata()
			getLaserData(bleManager, id);
			return {state: '上传运动数据成功', };

		}
		else
		{
			getMovementData(bleManager, id);
		}
	}

}

//数据监测接收今日运动数据的处理
export function* deviceObserveReturnSports(data, bleManager, id, deviceSN)
{
	var state = yield select();
	console.log(data, '获取的运动数据')
	var _body = data.body;
	if (save({ type: 'motion', data: _body.data, }))
	{
		console.log('运动', _movementData, _motionDayCount)
		if (_motionDayCount < 0 || _movementData.length >= 3)
		{
			console.log('激光', _motionDayCount)
			if (_movementData[0].steps_num == 0)
			{
				return {status: 1, message: '上传数据成功', };
			}
			try
			{
				var _responseJSON = yield call(uploadAllData, deviceSN)

				console.log(_responseJSON, '上传数据成功');
				if (_responseJSON.status === 1)
				{
					return {status: 1, message: '上传数据成功', };
				}
				else
				{
					return {status: 0, message: '上传数据失败', }
				}
			}
			catch (error)
			{
				return {status: 0, message: '上传数据失败', }
			}
		}
	}
}

//数据监测今日心率的数据
export function* deviceObserveReturnHeart(data, bleManager, id, deviceSN) {
	var _body = data.body;
	console.log(save({ type: 'heartRate', data: _body.data, }), '心率上传的结果', _heartRateDayCount, _heartRateData)
	if (save({ type: 'heartRate', data: _body.data, }))
	{
		if (_heartRateDayCount < 0 || _heartRateData.length >= 3)
		{
			if (_heartRateData.length == 0)
			{
				return {status: 1, message: '上传数据成功', };
			}
			try
			{
				var _responseJSON = yield call(uploadAllData, deviceSN)
				console.log(_responseJSON, '上传数据成功');
				if (_responseJSON.status === 1)
				{
					return {status: 1, message: '上传数据成功', };
				}
				else
				{
					return {status: 0, message: '上传数据失败', }
				}
			}
			catch (error)
			{
				return {status: 0, message: '上传数据失败', }
			}
		}
	}
}


//心率数据的处理
export function* deviceReturnHeart(data, bleManager, id, deviceSN)
{
	console.log('心率数据的处理1')
	var _body = data.body;
	if (save({ type: 'heartRate', data: _body.data, }))
	{
		console.log('心率数据的处理2', _heartRateDayCount, _heartRateData.length)
		if (_heartRateDayCount < 0 || _heartRateData.length >= 3)
		{
			clearTimeout(heartRateTime)
			yield put({type: 'DATA_PROGRESS', status: 90, })
			console.log(_movementData, _movementData[0].steps_num,'打印111111111111',_laserData,_heartRateData)
			if (_movementData[0].steps_num == 0 && _laserData.length == 0 && _heartRateData.length == 0)
			{
				yield put({type: 'UPDATA_HEART', status: 1, })
				yield put({type: 'UNTIED_PROMPT', status: 1, })
				yield put({type: 'DATA_PROGRESS', status: 100, })
				return {status: 1, message: '上传数据成功', };
			}
			yield put({type: 'UNTIED_PROMPT', status: 2, })
			try
			{
				var _responseJSON = yield call(uploadAllData, deviceSN)
				clearData();
				clearTime();
				console.log(_responseJSON, '上传数据成功');
				if (_responseJSON.status === 1)
				{
					yield put({type: 'UPDATA_HEART', status: 1, })
					yield put({type: 'UNTIED_PROMPT', status: 1, })
					yield put({type: 'DATA_PROGRESS', status: 100, })
					yield delay(500)
					yield put({type: 'DATA_PROGRESS', status: 0, })
					return {status: 1, message: '上传数据成功', };
				}
				else
				{
					yield put({type: 'UPDATA_SPORTS', status: 0, })
					yield put({type: 'UPDATA_LASER', status: 0, })
					yield put({type: 'UPDATA_HEART', status: 0, })
					yield put({type: 'UNTIED_PROMPT', status: 0, })
					return {status: 0, message: '上传数据失败', }
				}
			}
			catch (error)
			{
				clearData();
				yield put({type: 'UPDATA_SPORTS', status: 0, })
				yield put({type: 'UPDATA_LASER', status: 0, })
				yield put({type: 'UPDATA_HEART', status: 0, })
				yield put({type: 'UNTIED_PROMPT', status: 0, })
				return {status: 0, message: '上传数据失败', }
			}
		}
		else
		{
			getHRData(bleManager, id);
		}
	}

}

//数据监测今日激光的数据
export function* deviceObserveReturnLaser(data, bleManager, id, deviceSN)
{
	var _body = data.body;
	if (save({ type: 'laser', data: _body.data, }))
	{
		if (_laserDayCount < 0 || _laserData.length >= 3)
		{
			if (_laserData.length == 0)
			{
				return {status: 1, message: '上传数据成功', };
			}
			try
			{
				var _responseJSON = yield call(uploadAllData, deviceSN)
				console.log(_responseJSON, '上传数据成功');
				if (_responseJSON.status === 1)
				{
					return {status: 1, message: '上传数据成功', };
				}
				else
				{
					return {status: 0, message: '上传数据失败', }
				}
			}
			catch (error)
			{
				return {status: 0, message: '上传数据失败', }
			}
		}
	}
}

//激光数据的处理

export function* deviceReturnLaser(data, bleManager, id)
{
	var _body = data.body;
	if (save({ type: 'laser', data: _body.data, }))
	{
		if (_laserDayCount < 0 || _laserData.length >= 3)
		{
			console.log('心率', _movementLastData)
			clearTimeout(laserTime)
			yield put({type: 'UPDATA_LASER', status: 1, })
			yield put({type: 'UPDATA_HEART', status: 5, })
			yield put({type: 'DATA_PROGRESS', status: 60, })
			heartRateUpdata()
			getHRData(bleManager, id)
			return {state: '上传激光数据成功', };
		}
		else
		{
			getLaserData(bleManager, id);
		}
	}

}

/**
 * 计算两个日期间的天数
 */
export function dateDiff(sDate1, sDate2)
{ //sDate1和sDate2是2006-12-18格式
	var aDate, oDate1, oDate2, iDays;
	aDate = sDate1.split("-");
	oDate1 = Date.parse(aDate[1] + '/' + aDate[2] + '/' + aDate[0]); //转换为12-18-2006格式
	aDate = sDate2.split("-");
	oDate2 = Date.parse(aDate[1] + '/' + aDate[2] + '/' + aDate[0]);
	iDays = parseInt(Math.abs(oDate1 - oDate2) / 1000 / 60 / 60 / 24);
	//把相差的毫秒数转换为天数
	return iDays;
}

/**
 * [getDeviceData 从服务器中获取数据索引后上传]
 * @Author   袁进
 * @DateTime 2018-11-26T10:47:49+0800
 * @param    {Object}                 bleManager [蓝牙底层类实例]
 * @param    {String}                 dataType   [上传类型]
 * @param    {String}                 id         [设备id]
 * @param    {string}                 _responseJSON [数据来源]
 * @param    {string}                 firmWare   [固件信息]
 */

export function* getDeviceData(bleManager, dataType, id, deviceSN, _responseJSON, firmWare, actionCallback)
{

	getDataType = dataType;
	// 获取服务器保存的最近上传日期
	console.log(_responseJSON,'获取上传数据的索引', firmWare.firmwareVersion)
	dataJSON = _responseJSON
	firmWareVersion = firmWare.firmwareVersion
	device_sn = deviceSN
	const _myDate = new Date();
	// 计算需要获取的天数dayNum和下标hr_index、laser_index，计算同步数据预估时间need_time
	var newDate = new Date();
	const todayDate = newDate.getFullYear() + '-' + (newDate.getMonth() + 1) + '-' + newDate.getDate();
	if (dataType === 'day_sports')
	{
		_motionTotalCount = _motionDayCount = 0
	}
	else if (dataType === 'day_heart')
	{
		_heartRateTotalCount = _heartRateDayCount = 0
	}
	else if (dataType === 'day_laser')
	{
		_laserTotalCount = _laserDayCount = 0
	}
	else
	{
		if (_responseJSON.user_data_last == null)
		{
			_motionTotalCount = _motionDayCount = 15;
		}
		else
		{
			const _dayCount = dateDiff(_responseJSON.user_data_last.y + '-' + _responseJSON.user_data_last.m + '-' + _responseJSON.user_data_last.d, todayDate);
			//_dayCount = dateDiff('2019' + '-' + '03' + '-' + '31', todayDate); (模拟测试)
			console.log('时间索引', _dayCount)
			// _motionTotalCount = _motionDayCount = _dayCount >= 7 ? 6 : _dayCount;
			_motionTotalCount = _motionDayCount = _dayCount
		}

		if (_responseJSON.user_data_last == null)
		{
			_laserTotalCount = _laserDayCount = 15;
			_laserIndex = 0;
		}
		else
		{
			_laserIndex = parseInt(_responseJSON.user_data_last.a ? _responseJSON.user_data_last.a : 0);
			const _dayCount = dateDiff(_responseJSON.user_data_last.y + '-' + _responseJSON.user_data_last.m + '-' + _responseJSON.user_data_last.d, todayDate);
			_laserTotalCount = _laserDayCount = _dayCount;
		}

		if (_responseJSON.user_data_last == null)
		{
			_heartRateTotalCount = _heartRateDayCount = 15;
			_heartRateIndex = 0;
		}
		else
		{
			_heartRateIndex = parseInt(_responseJSON.user_data_last.a ? _responseJSON.user_data_last.a : 0);
			const _dayCount = dateDiff(_responseJSON.user_data_last.y + '-' + _responseJSON.user_data_last.m + '-' + _responseJSON.user_data_last.d, todayDate);
			_heartRateTotalCount = _heartRateDayCount = _dayCount;
		}
	}

	var user = yield call(QBStorage.get, 'user');
	console.log(user, '缓存的user数据')
	userId = user.user_id;
	token = user.token;
	switch (dataType)
	{
	case 'day_sports':
	case 'sports':
		getMovementData(bleManager, id);
		break;
	case 'day_laser':
	case 'laser':
		getLaserData(bleManager, id);
		break;
	case 'day_heart':
	case 'hr':
		getHRData(bleManager, id);
		break;
	case 'all':

		yield put({type: 'UPDATA_SPORTS', status: 5, })
		getMovementData(bleManager, id);
		break;
	default: return;
	}

}
//}


