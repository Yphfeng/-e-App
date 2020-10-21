import {put, call, delay, take, select, takeEvery, race, } from 'redux-saga/effects';
import * as cmd from '../utils/ble/cmd';

import { NordicDFU, } from "react-native-nordic-dfu";
import * as DeviceService from '../utils/network/deviceService';
import * as qbDate from '../utils/qbDate';
import BleConnection from '../utils/ble/application/connect';
import BleApplication from '../utils/ble/application/application';
import * as bleDataHandle from "../utils/ble/application/data/bleDataHandle";
import BleModule from '../utils/ble/bleModule';
import QBStorage from '../utils/storage/storage';

const BluetoothManager = new BleModule();
const Bleconnect = BleConnection.getInstance();
const Application = new BleApplication();

var actionCallback = null;
var deviceId = '', device_sn = '', deviceInformation = null, eb = '', serverStatus = new Object, firmWare = null;
var bindStatus = 0;  //0未绑定 1已绑定
var connectedDevice = null;

//搜素设备

export function* startSearchDevices(action)
{

	actionCallback = action.callback;
	console.log(action, '开始搜素设备');
	yield put({type: 'BLE_ACTION', key: 'search', })
	yield Bleconnect.scan(2);
	var searchedResult = yield take('SEARCH_RESULT');
	console.log(searchedResult, '搜素到的设备');
	var searchedDevices = searchedResult.devices;
	if (searchedDevices.length < 1)
	{
		actionCallback({status: 0, message: '没有搜素到设备', })
	}
	else
	{
		actionCallback({status: 1, devices: searchedDevices, })
	}
}

//判断是否绑定

export function* isBind(action)
{
	var state = yield select();
	actionCallback = action.callback;
	var bleStatus = state.ble.bleStatus;
	yield Bleconnect.stopScan();
	if (bleStatus !== 1)
	{
		actionCallback({status: 0, message: '蓝牙未打开', });
		return;
	}
	var bindingData = yield call(DeviceService.getUserBindDeviceList);
	console.log(bindingData, '绑定的设备11111');
	var status = bindingData.status;
	if (status !== 1)
	{
		//没有绑定设备
		yield put({type: 'SUCCESS_GETUSERDEVICELIST',  data: [], });
		actionCallback({status: 3, message: '没有绑定设备', });
	}
	else
	{
		if (bindingData.device_list)
		{
			if(bindingData.device_list.length <  2)
			{
				actionCallback({status: 1, message: '已绑定', data: bindingData.device_list,  });
			}
			else
			{
				actionCallback({status: 2, message: '已绑定', data: bindingData.device_list,  });
			}
			yield put({type: 'SUCCESS_GETUSERDEVICELIST',  data: bindingData.device_list, });
		}
	}
}

//绑定了一台设备后直接连接设备
export function* startConnectDevice(action)
{
	yield put({type: 'BLE_ACTION', key: 'connect', })
	yield put({type: 'IS_CONNECT_OR_SEARCH', status: 1, });
	yield Bleconnect.stopScan();
	actionCallback = action.callback;
	var state = yield select();
	console.log(state, 'saga的属性');
	var devices = action.devices;
	yield put({type: 'SUCCESS_GETUSERDEVICELIST', data: devices});

	//获取用户绑定状态
	try
	{
		//开始搜索
		yield Bleconnect.scan(10);
		upDataSetTimeOut(actionCallback, 10000, '没有搜索到设备');
		var scanResult = yield take('CONNECT_BIND_ONE');
		clearUpdataTimeOut();
		//直接连接该设备，并设置为长广播
		willDevice = scanResult.device;
		yield call(connectBle, {devices: willDevice, callback: actionCallback, });
		connectedDevice = willDevice;
		scanResult = yield take('CONNECT_OR_SEARCH_RESULT');
		console.log(scanResult, '搜索到的设备')
		var devices = scanResult.devices;
		if (devices.length < 1)
		{
			actionCallback({status: 0, message: '没有搜索到设备', })
			return;
		}
	}
	catch (error)
	{
		console.log(error)
		action.callback({status: 0, message: '接口报错', });
	}



}

//绑定多个设备连接
export function* startSeveralConnectDevice(action)
{
	yield put({type: 'BLE_ACTION', key: 'connect', })
	yield put({type: 'IS_CONNECT_OR_SEARCH', status: 1, });
	yield Bleconnect.stopScan();
	actionCallback = action.callback;
	var state = yield select();
	var devices = action.devices;
	yield put({type: 'SUCCESS_GETUSERDEVICELIST', data: devices});
	console.log(state, 'saga的属性');
	yield Bleconnect.scan(10);
	scanResult = yield take('CONNECT_OR_SEARCH_RESULT');

	console.log(scanResult, '搜索到的设备')
	var devices = scanResult.devices;
	if (devices.length < 1)
	{
		actionCallback({status: 0, message: '没有搜索到设备', })
		return;
	}
}

//多设备连接
export function* connectForManyDevices(action)
{
	console.log(action, '多设备搜索');
	var state = yield select();
	actionCallback({status: 1, message: '未绑定搜索到多设备', device: action.device, })

}

//绑定设备后连接的处理（包括数据）

export function* connectBle(action)
{
	console.log(action, '单个设备直接连接', bindStatus);
	var devices = action.devices;
	deviceId = devices.bleId;
	device_sn = devices.device_sn;
	actionCallback = action.callback;
	Bleconnect.isConnecting = false;
	try
	{
		yield put({type: 'IS_CONNECT_OR_SEARCH', status: 1, });
		console.log(Bleconnect.isConnecting, '连接的装1')
		if (Bleconnect.isConnecting)
		{
			return;
		}
		Bleconnect.isConnecting = true;
		peripheralInfo = yield Bleconnect.connect(deviceId);
		console.log(peripheralInfo, '连接的信息')
		if (peripheralInfo.characteristics.length < 1)
		{
			actionCallback({status: 0, message: '没有搜索到设备', })
			return;
		}
		connectedDevice = devices;
		//打开通知
		yield Bleconnect.startNotification(0);
		yield call(Application.getTime, BluetoothManager, deviceId);

	}
	catch (error)
	{
		console.log(error, '报的错')
		actionCallback({status: 0, message: '没有搜索到设备', })
	}

}

//没有绑定设备时直接连接
export function* noConnectBle(action)
{
	console.log(action, '单个设备直接连接', bindStatus);
	var devices = action.devices;
	deviceId = devices.bleId;
	device_sn = devices.device_sn;
	actionCallback = action.callback;
	try
	{
		if (Bleconnect.isConnecting)
		{
			return;
		}
		//先绑定设备
		var res = yield call(DeviceService.addBindSN, {device_sn: devices.device_sn,  });
		console.log(res, '绑定的设备1231231231231231231231')
		if (res.status === 2)
		{
			var response = yield call(DeviceService.unbindDevice, {device_sn: devices.device_sn, forced_unbound: 1, });
			if (response.status === 1)
			{
				var _res = yield call(DeviceService.addBindSN, {device_sn: devices.device_sn,  });
			}
			else
			{
				actionCallback({status: 0, message: response.message, })
				return;
			}

		}
	}
	catch (error)
	{
		actionCallback({status: 0, message: '网络错误', })
		return;
	}
	try {
		var peripheralInfo = yield Bleconnect.connect(devices.bleId);
		if (peripheralInfo.characteristics.length < 1)
		{
			actionCallback({status: 0, message: '没有搜索到设备', })
			return;
		}
		//打开通知
		yield Bleconnect.startNotification(0);
		//设置长广播
		yield call(Application.setBroadcastDuration, 0, BluetoothManager, deviceId);
		yield delay(1000);
		yield Bleconnect.disconnect();
	} catch (error) {
		// actionCallback({status: 0, message: '连接失败', })
	}
	try
	{
		yield put({type: 'IS_CONNECT_OR_SEARCH', status: 1, });
		yield delay(1000)
		console.log(Bleconnect.isConnecting, '连接的装1')
		if (Bleconnect.isConnecting)
		{
			return;
		}
		peripheralInfo = yield Bleconnect.connect(deviceId);
		console.log(peripheralInfo, '连接的信息')
		if (peripheralInfo.characteristics.length < 1)
		{
			actionCallback({status: 0, message: '没有搜索到设备', })
			return;
		}
		connectedDevice = devices;
		//打开通知
		yield Bleconnect.startNotification(0);
		yield call(Application.getTime, BluetoothManager, deviceId);

	}
	catch (error)
	{
		console.log(error, '报的错')
		actionCallback({status: 0, message: '没有搜索到设备', })
	}

}


//绑定设备后从列表选择设备连接
export function* connectSecondBle(action)
{
	var state = yield select();
	var userDeviceList = state.user.userDeviceList;
	console.log(action, '单个设备直接连接', bindStatus);
	var devices = action.devices;
	deviceId = devices.bleId;
	device_sn = devices.device_sn;
	actionCallback = action.callback;
	Bleconnect.isConnecting = false;
	try {
		yield put({type: 'IS_CONNECT_OR_SEARCH', status: 1, });
		console.log(Bleconnect.isConnecting, '连接的装1')
		if (Bleconnect.isConnecting)
		{
			return;
		}
		Bleconnect.isConnecting = true;
		peripheralInfo = yield Bleconnect.connect(deviceId);
		console.log(peripheralInfo, '连接的信息')
		if (peripheralInfo.characteristics.length < 1)
		{
			actionCallback({status: 0, message: '没有搜索到设备', })
			return;
		}
		connectedDevice = devices;
		//打开通知
		yield Bleconnect.startNotification(0);
		yield call(Application.getTime, BluetoothManager, deviceId);

	}
	catch (error)
	{
		console.log(error, '报的错')
		actionCallback({status: 0, message: '连接失败', })
	}

}



var eq = 0;
export function* connectCmd(action)
{
	var dataObject = action.dataObject;
	switch (dataObject.cmd)
	{
	case cmd.kGXYL_GetTime:
		isTreatment = true;
		var data = dataObject.body.date;
		var year = new Date().getFullYear();
		console.log(data, year, '日期');
		if (data == year)
		{
			isWriteCourse = false
		}
		else
		{
			isWriteCourse = true
		}
		yield call(Application.syncTime, BluetoothManager, deviceId);
		break;
	case cmd.kGXYL_TimeSync:
		//同步时间的回调里面调用获取电量的方法
		console.log(dataObject, "同步时间的回调")
		//调用设置手动激光参数的方法
		yield call(Application.setLaserManuallyParameters, 4, 24, BluetoothManager, deviceId);
		break;
	case cmd.kGXYL_LaserManuallyParameters:

		var laser_power = {
			power: 4,
			duration: 24,
		}
		yield put({type: 'LASER_MANUALLY_PARAMETERS', dic: laser_power, });
		//设置手动激光参数回调里面调用获取电量的指令
		yield call(Application.getEQ, BluetoothManager, deviceId);
		break;
	case cmd.kGXYL_GetEQ:
		//设置界面电量
		eq = dataObject.body.eq;
		try
		{
			const res = yield call(DeviceService.writeInformation, { device_sn: device_sn, });
			console.log(res, '写入设备信息1111111111111111');
			if (res.status !== 1)
			{
				yield call(getUserInfo, device_sn, res.data.deviceInfo, res.msg);
				return;
			}
			console.log(res.msg, '写入设备信息');
			deviceInformation = res.data.deviceInfo;
			yield put({type: 'DEVICE_INFORMATION', data: deviceInformation, })
			//获取设备中的e币
			yield call(Application.getLaserManuallyParameters, BluetoothManager, deviceId);
		}
		catch (error)
		{
			console.log(error, '获取失败');
			yield Bleconnect.disconnect();
			actionCallback({status: 0, message: '连接失败', })
		}
		break;
	case cmd.kGXYL_GetLaserManuallyParameters:
		//获取设备里面的E币成功后获取设备信息
		// eb = dataObject.body.duration / 100;
		console.log(dataObject, '获取E币', eb);
		if (isWriteCourse)
		{
			//写入服务器里面的E币
			yield call(Application.setLaserManuallyPaymentDuration, deviceInformation.eb*100, BluetoothManager, deviceId)
			//没有E币从服务器里
		}
		else
		{
			yield call(Application.setLaserManuallyPaymentDuration, deviceInformation.eb*100, BluetoothManager, deviceId)
			// if (eb > 0)
			// {
			// 	yield call(Application.getDeviceInfo, BluetoothManager, deviceId);
			// }
			// else
			// {
			// 	//写入服务器里面的E币
			// 	yield call(Application.setLaserManuallyPaymentDuration, deviceInformation.eb*100, BluetoothManager, deviceId)
			// 	//没有E币从服务器里
			// }
		}

		break;
	case cmd.kGXYL_LaserManuallyPayParameters:
		//设置E币的返回
		console.log(dataObject, '写入E币');
		yield call(Application.getDeviceInfo, BluetoothManager, deviceId);
		break;
	case cmd.kGXYL_GetDeviceInfo:

		firmwareVersion = dataObject.body.deviceInfo.firmwareVersion;
		firmWare = dataObject.body.deviceInfo;
		console.log('写入设备信息', deviceInformation)
		yield put({type: 'GET_FIRMWARE_VERSION', data: dataObject.body.deviceInfo, })
		firmware_1708 = firmwareVersion.substring(1, 5);//1708的判断

		var version = firmwareVersion.substring(1).length > 3 ? firmwareVersion.substring(1) : firmwareVersion.substring(1) + "0";
		console.log(firmware_1708, "疗程版本信息")
		var isConnect = yield call(DeviceService.isFirstConnect, {device_sn: device_sn, });
		console.log(isConnect, "是否第一次连接",  dataObject.body.deviceInfo)
		if (firmware_1708 >= 1701)
		{
			var deviceName = dataObject.body.deviceInfo.productModle
			if (deviceName == "HA01Y" && isConnect.status == 1 && firmware_1708 < 1710)
			{
				//针对HA01Y出库只能写疗程截止日期的问题
				if (deviceInformation.type == 0)
				{
					//是否写入疗程参数0不写入，1写入。
					try
					{
						var user = yield call(QBStorage.get, 'user');
						var dic = {
							index: 16,
							periodic: 10,
							gap: 5,
							endDate: "2017-0-0",
							parameters: [
								{ power: 4, duration: 32, startHour: 8, startMinute: 45 },
								{ power: 4, duration: 8, startHour: 13, startMinute: 0 },
								{ power: 4, duration: 32, startHour: 17, startMinute: 30 }
							],
						};
						console.log(deviceInformation, '写疗程时的设备信息')
						//疗程过期暂停疗程
						// eslint-disable-next-line max-depth
						if (deviceInformation.remaining_days == 0)
						{
							yield call(Application.setLaserTreatmentParameters, dic, BluetoothManager, deviceId);

							yield call(connectSuccee, user.token, deviceId, device_sn, firmwareVersion)

						}
					}
					catch (error)
					{
						console.log(error, '报错')
						actionCallback({status: 0, message: '连接失败', })
					}
				}
				else
				{
					//写入疗程
					var parametersArray = [];
					deviceInformation.parameter_list.forEach(v =>
					{
						let item = {
							power: parseInt(v.power_level),
							duration: parseInt(v.start_duration),
							startHour: parseInt(v.start_time.split(":")[0]),
							startMinute: parseInt(v.start_time.split(":")[1]),
						}
						parametersArray.push(item);
					})
					var courseNumber = parseInt(deviceInformation.course_data.course_type_sn);
					var coursePeriodic = parseInt(deviceInformation.course_data.course_cycle_work_days);
					var courseGap = parseInt(deviceInformation.course_data.course_cycle_rest_days);
					firmware_1708 = firmwareVersion.substring(1, 5);//1708的判断
					if (firmware_1708 >= 1708)
					{
						var courseEndDate = deviceInformation.remaining_days
					}
					else
					{
						courseEndDate = qbDate.getNewDay(deviceInformation.remaining_days);
						console.log(deviceInformation.remaining_days, courseEndDate)
					}
					dic = {
						index: courseNumber,
						periodic: coursePeriodic,
						gap: courseGap,
						endDate: courseEndDate,
						parameters: parametersArray,
					}
					yield call(Application.setLaserTreatmentParameters, dic, BluetoothManager, deviceId);
				}


			}
			else
			{
				//获取激光疗程参数
				console.log(isWriteCourse, deviceInformation.type, 'qwe1eqdwd');
				if (isWriteCourse && deviceInformation.type !== 0)
				{
					//写入疗程
					parametersArray = [];
					deviceInformation.parameter_list.forEach(v =>
					{
						let item = {
							power: parseInt(v.power_level),
							duration: parseInt(v.start_duration),
							startHour: parseInt(v.start_time.split(":")[0]),
							startMinute: parseInt(v.start_time.split(":")[1]),
						}
						parametersArray.push(item);
					})
					courseNumber = parseInt(deviceInformation.course_data.course_type_sn);
					coursePeriodic = parseInt(deviceInformation.course_data.course_cycle_work_days);
					courseGap = parseInt(deviceInformation.course_data.course_cycle_rest_days);
					firmware_1708 = firmwareVersion.substring(1, 5);//1708的判断
					if (firmware_1708 >= 1708)
					{
						courseEndDate = deviceInformation.remaining_days
					}
					else
					{
						courseEndDate = qbDate.getNewDay(deviceInformation.remaining_days);
						console.log(deviceInformation.remaining_days, courseEndDate)
					}

					dic = {
						index: courseNumber,
						periodic: coursePeriodic,
						gap: courseGap,
						endDate: courseEndDate,
						parameters: parametersArray,
					}
					yield call(Application.setLaserTreatmentParameters, dic, BluetoothManager, deviceId);
				}
				else
				{
					yield call(Application.getLaserTreatmentParameters, BluetoothManager, deviceId);
				}
			}

		}
		else
		{
			if (deviceInformation.type == 0)
			{
				//是否写入疗程参数0不写入，1写入。
				try
				{
					user = yield call(QBStorage.get, 'user');
					dic = {
						index: 16,
						periodic: 10,
						gap: 5,
						endDate: "2017-0-0",
						parameters: [
							{ power: 4, duration: 32, startHour: 8, startMinute: 45 },
							{ power: 4, duration: 8, startHour: 13, startMinute: 0 },
							{ power: 4, duration: 32, startHour: 17, startMinute: 30 }
						],
					};
					console.log(deviceInformation, '写疗程时的设备信息')
					//疗程过期暂停疗程
					if (deviceInformation.remaining_days == 0)
					{
						yield call(Application.setLaserTreatmentParameters, dic, BluetoothManager, deviceId);

						yield call(connectSuccee, user.token, deviceId, device_sn, firmwareVersion)

					}
				}
				catch (error)
				{
					console.log(error, '获取user失败')

				}
			}
			else
			{
				//写入疗程
				parametersArray = [];
				deviceInformation.parameter_list.forEach(v =>
				{
					let item = {
						power: parseInt(v.power_level),
						duration: parseInt(v.start_duration),
						startHour: parseInt(v.start_time.split(":")[0]),
						startMinute: parseInt(v.start_time.split(":")[1]),
					}
					parametersArray.push(item);
				})
				courseNumber = parseInt(deviceInformation.course_data.course_type_sn);
				coursePeriodic = parseInt(deviceInformation.course_data.course_cycle_work_days);
				courseGap = parseInt(deviceInformation.course_data.course_cycle_rest_days);
				if (firmware_1708 >= 1708)
				{
					courseEndDate = deviceInformation.remaining_days
				}
				else
				{
					courseEndDate = qbDate.getNewDay(deviceInformation.remaining_days);
					console.log(deviceInformation.remaining_days, courseEndDate)
				}
				dic = {
					index: courseNumber,
					periodic: coursePeriodic,
					gap: courseGap,
					endDate: courseEndDate,
					parameters: parametersArray,
				}
				yield call(Application.setLaserTreatmentParameters, dic, BluetoothManager, deviceId);
			}
		}
		break;
	case cmd.kGXYL_GetlaserTreatmentStatus:
		//获取激光疗程周期状态
		var dataStatus= dataObject.body.treatmentStatus;
		console.log(dataObject, "获取激光周期的回调")
		yield put({type: 'GET_TREATMENT_STATUS', data: dataObject.body, })
		switch (dataStatus)
		{
		case 0:
		case 1:
			serverStatus.course_status = 1;
			break;
		case 2:
		case 3:
			serverStatus.course_status = 2;
			break;
		case 4:
			serverStatus.course_status = 3;
			break;
		}

		user = yield call(QBStorage.get, 'user');
		if (user)
		{
			//上传激光疗程参数到服务器

			console.log(serverStatus, '上传服务器的参数')
			yield call(connectSuccee, user.token, deviceId, device_sn, firmwareVersion, serverStatus)

		}

		break;
	case cmd.kGXYL_GetLaserRegimenParameters:
		//获取激光疗程参数
		console.log(dataObject, '获取激光疗程参数的回调1111')
		yield put({type: 'GET_TREATMENT_PARAMS', data: dataObject.body, })
		var date = dataObject.body.endDate;
		if (date)
		{
			var arr = date.toString().split("-");
			if (arr.length == 3)
			{
				var time = qbDate.getNewDay(0);
				var dateParams = qbDate.dateDiff(time, date);
			}
			else
			{
				dateParams = date;

			}
		}
		else
		{
			dateParams = date;
		}

		serverStatus.remaining_days = dateParams;
		serverStatus.course_type_sn = dataObject.body.sequence;
		yield call(Application.getTreatmentStatus, BluetoothManager, deviceId);
		break;
	case cmd.kGXYL_LaserRegimenParameters:
	//设置激光疗程参数的回调
		console.log(dataObject, '回调');
		firmware_1708 = firmwareVersion.substring(1, 5);//1708的判断

		if (firmware_1708 >= 1701)
		{
			if (dataObject.body.setState == "设置成功")
			{
				//设置激光周期
				var days = deviceInformation.course_data.course_cycle_work_days -  deviceInformation.course_data.use_day;
				if (days < 0)
				{
					dic = {
						isOpen: 0,
						remainDays: deviceInformation.course_data.course_cycle_rest_days + days,
					}

				}
				else
				{
					dic = {
						isOpen: 1,
						remainDays: days,
					}
				}
				console.log(dic, '写激光参数');
				yield call(Application.setTreatmentStatus, dic, BluetoothManager, deviceId);
			}
		}
		else
		{
			user = yield call(QBStorage.get, 'user');

			yield call(connectSuccee, user.token, deviceId, device_sn, firmwareVersion)


		}

		break;
	case cmd.kGXYL_SetlaserTreatmentStatus:
	//写入疗程周期的回调
		if (!isTreatment)
		{
			return;
		}
		isTreatment = false;
		console.log(dataObject, "写入疗程周期成功的回调")
		if (dataObject.body.setState == "设置成功")
		{
			version = firmwareVersion.substring(1).length > 3 ? firmwareVersion.substring(1) : firmwareVersion.substring(1) + "0";
			console.warn(firmwareVersion,'指定的版本号...........', version)
			console.warn(deviceInformation.course_data.use_day, deviceInformation.course_data.course_cycle_work_days, deviceInformation.course_data.course_cycle_rest_days, '疗程周期11111')
			if (version.substring(0, 5) >= 1708 )
			{
				//版本号在1708以上时开启疗程

				var startLaser = yield call(Application.setLaserRegimen, true, BluetoothManager, deviceId);
				console.log(startLaser, '暂停激光111')
				if (startLaser.state == "设置成功")
				{
					user = yield call(QBStorage.get, 'user');

					yield call(connectSuccee, user.token, deviceId, device_sn, firmwareVersion)

				}
			}
			else
			{
				user = yield call(QBStorage.get, 'user');

				yield call(connectSuccee, user.token, deviceId, device_sn, firmwareVersion)

			}

		}
		break;
	case cmd.kGXYL_GetHRRecording:
		// yield call(deviceReturnData, dataObject, BluetoothManager, deviceId, device_sn)
		clearUpdataTimeOut()
		yield call(upDataTimeout, 'heartRate', dataObject)
		break;
	case cmd.kGXYL_GetMotionRecording:
		console.log(dataObject, '获取的运动数据111111111')
		// yield call(bleDataHandle.deviceReturnSports, dataObject, BluetoothManager, deviceId);
		clearUpdataTimeOut()
		yield call(upDataTimeout, 'sports', dataObject)
		break;
	case cmd.kGXYL_GetLaserRecording:
		clearUpdataTimeOut()
		// yield call(bleDataHandle.deviceReturnLaser, dataObject, BluetoothManager, deviceId);
		yield call(upDataTimeout, 'laser', dataObject)
		break;
	default:
		break;
	}
}



//数据上传超时的处理
function* upDataTimeout(type, dataObject)
{
	if (type === 'sports')
	{
		upDataSetTimeOut(actionCallback, 120000);

		const {posts, timeout} = yield race({
			posts: call(bleDataHandle.deviceReturnSports, dataObject, BluetoothManager, deviceId),
			timeout: delay(10000),
		})
		console.log(posts, '运动数据的返回');
		if (posts)
		{
			clearUpdataTimeOut();
			yield put({type: 'DATA_PROGRESS', status: 50, })
		}
	}
	else if (type === 'laser')
	{
		upDataSetTimeOut(actionCallback, 300000);
		const {posts, timeout, } = yield race({
			posts: call(bleDataHandle.deviceReturnLaser, dataObject, BluetoothManager, deviceId),
			timeout: delay(120000),
		})
		if (posts)
		{
			clearUpdataTimeOut();
			yield put({type: 'DATA_PROGRESS', status: 70, })
		}
	}
	else
	{
		upDataSetTimeOut(actionCallback, 300000);
		const {posts, timeout, } = yield race({
			posts: call(deviceReturnData, dataObject, BluetoothManager, deviceId, device_sn),
			timeout: delay(300000),
		})
		if (posts)
		{
			clearUpdataTimeOut();
			yield put({type: 'DATA_PROGRESS', status: 90, })
			yield delay(1000)
			yield put({type: 'DATA_PROGRESS', status: 100, })
		}
	}

}

//连接错误上报
export function* getUserInfo(device_sn, obj, msg)
{
	var res = yield call(DeviceService.getUserInfo);
	var data = {
		user_id: res.data.user_info.armarium_science_user_id,
		phone: res.data.user_info.armarium_science_user_mobile,
		equipment_number: device_sn,
		course: obj.course_data.course_name,
		course_id: obj.course_data.id,
		error_content: msg,
	}
	var responseJson = yield call(DeviceService.connectFail, data);
	if (responseJson.status !== 1)
	{
		actionCallback({status: -1, message: '网络错误', })
	}
	else
	{
		actionCallback({status: 0, message: '连接失败', })
	}
}


//数据上传定时器
function upDataSetTimeOut(actionCallback, s, message= '')
{
	this.upDataSetTimeOut = setTimeout(() => {
		actionCallback({status: 0, message: message, })
	}, s);
}

//清除定时器
function clearUpdataTimeOut()
{
	this.upDataSetTimeOut && clearTimeout(this.upDataSetTimeOut)
}

//连接成功后上传数据
/**
 * [getUserDeviceList 调用连接成功的回调]
 * @Author   肖波
 * @DateTime 2019-01-10T10:19:21+0800
 * @return   {[type]}                 [description]
 */
export function* connectSuccee(token, deviceId, device_sn, firmware_sn, serverStatus=null)
{

	var dic = {
		armariumScienceSession: token,
		device_sn: device_sn,
		firmware_sn: firmware_sn,
	}
	if (firmware_sn.substring(1) >= 1700 && !isWriteCourse && serverStatus)
	{
		//HA01Y每次都从服务器中获取，所以不需要同步
		dic.course_status = serverStatus.course_status;
		dic.course_type_sn = serverStatus.course_type_sn;
		dic.remaining_days = serverStatus.remaining_days;
	}
	console.log(dic, '疗程上传到服器');
	var res = yield call(DeviceService.connectSuccee, dic)
	if (res.status === 1)
	{
		var device_name = firmWare.productModle;
		if (device_name.indexOf('HA05') > -1 || device_name.indexOf('HA06') > -1)
		{
			var pointShow = 1
		}
		else
		{
			pointShow = 0;
		}
		yield put({type: 'CONNECT_SUCCESS', status: 4, connectedDevice: connectedDevice, eq: eq, pointShow: pointShow, })
		//连接成功开始上传数据
		upDataSetTimeOut(actionCallback, 10000);
		yield call(bleDataHandle.getDeviceData, BluetoothManager, 'all', deviceId, device_sn, deviceInformation, firmWare)
	}
	else
	{
		yield put({type: 'CONNECT_SUCCESS', status: 0, connectedDevice: null, })
	}
}

//上传数据的结果的结果
export function* deviceReturnData(dataObject, BluetoothManager, bleId, device_sn)
{
	var res = yield call(bleDataHandle.deviceReturnHeart, dataObject, BluetoothManager, bleId, device_sn);
	console.log(res, '上传的数据结果1111')
	if (res)
	{
		var status = res.status;
		if (status && status === 1)
		{
			//上传成功
			actionCallback({status: 1, message: '连接成功', })
		}
		else
		{
			//上传失败
			actionCallback({status: 0, message: '连接失败', })
		}
	}
	return res;
}

//断开设备
export function* disConnectBle(action)
{
	console.log(action, '断开设备', deviceId);
	actionCallback = action.callback;
	try
	{
		console.log('执行断开', '123123')
		yield Bleconnect.disconnect();
		yield put({type: 'DISCONNECT', })
		actionCallback({status: 1, message: '断开成功', })

	}
	catch (error)
	{
		action.callback({status: 0, message: '断开失败'})
	}

}

//绑定设备
var willBindDevices = null; //待绑定的设备
export function* bindDevice(action)
{
	actionCallback = action.callback;
	var devices = action.devices;
	var status = action.status;
	var state = yield select();
	var connectStatus = state.ble.connectStatus;
	if (connectStatus === 4)
	{
		yield Bleconnect.disconnect();
	}
	if (status === 1)
	{
		yield put({type: 'BLE_ACTION', key: 'search', })
		var devices_sn = devices.device_sn;
		yield Bleconnect.scan(2);
		var searchedResult = yield take('SEARCH_RESULT');
		console.log(searchedResult, '搜素到的设备');
		var searchedDevices = searchedResult.devices;
		if (searchedDevices.length < 1)
		{
			actionCallback({status: 0, message: '请按压设备上的按钮激活设备', })
			return;
		}
		var findIndex = searchedDevices.findIndex(item => {
			return item.device_sn === devices_sn;
		})
		if (findIndex < 0)
		{
			actionCallback({status: 0, message: '请按压设备上的按钮激活设备', })
			return;
		}
		willBindDevices = searchedDevices[findIndex];


		//扫码绑定

	}
	else
	{
		willBindDevices = devices;
	}
	//
	console.log(willBindDevices, '要绑定到的设备')
	try
	{
		var id = willBindDevices.bleId;
		var peripheralInfo = yield Bleconnect.connect(id);
		if (peripheralInfo.characteristics.length < 1)
		{
			actionCallback({status: 0, message: '绑定失败,请重试', })
			return;
		}
		//打开通知
		yield Bleconnect.startNotification(0);
		//设置长广播
		yield call(Application.setBroadcastDuration, 0, BluetoothManager, id);
		yield delay(500);
		yield Bleconnect.disconnect();
		//开始绑定设备
		var response = yield call(DeviceService.addBindSN, {device_sn: willBindDevices.device_sn, })
		if (response.status === 1)
		{
			actionCallback({status: 1, message: '绑定成功', })
		}
		else
		{
			var res = yield call(DeviceService.unbindDevice, {device_sn: willBindDevices.device_sn, forced_unbound: 1, });
			if (res.status === 1)
			{
				var _response = yield call(DeviceService.addBindSN, {device_sn: willBindDevices.device_sn, });
				if (_response.status === 1)
				{
					actionCallback({status: 1, message: '绑定成功', })
				}
				else
				{
					actionCallback({status: 0, message: _response.msg, })
				}
			}
			else
			{
				actionCallback({status: 0, message: res.msg, })
			}
		}

	}
	catch (error)
	{
		actionCallback({status: 0, message: '接口报错', })
	}
}


export function* upData(action)
{
	yield put({type: 'IS_CONNECT_OR_SEARCH', status: 1, });
	actionCallback = action.callback;
	yield call(bleDataHandle.getDeviceData, BluetoothManager, 'all', deviceId, device_sn, deviceInformation, firmWare)
}


//空中升级
export function* upDataAir(action)
{
	var state = yield select();
	var connectedDevice = state.ble.connectedDevice;
	yield put({type: 'IS_CONNECT_OR_SEARCH', status: 4, })
	actionCallback = action.callback;
	//开始空中升级, 升级前需上传数据
	//先上传数据然后进行空中升级
	yield call(bleDataHandle.getDeviceData, BluetoothManager, 'all', connectedDevice.bleId, connectedDevice.device_sn, deviceInformation, firmWare)
}

export function* airCallback(action)
{
	console.log('获取的运动数据111111111', 'adasdsd');
	//空中升级的回调
	var dataObject = action.dataObject;
	switch (dataObject.cmd)
	{
	case cmd.kGXYL_GetHRRecording:
		console.log(dataObject, '获取的心率数据111111111')
		clearUpdataTimeOut()
		yield call(airUpDataTimeout, 'heartRate', dataObject)
		break;
	case cmd.kGXYL_GetMotionRecording:
		console.log(dataObject, '获取的运动数据111111111')
		clearUpdataTimeOut()
		yield call(airUpDataTimeout, 'sports', dataObject)
		break;
	case cmd.kGXYL_GetLaserRecording:
		console.log(dataObject, '获取的激光数据111111111')
		clearUpdataTimeOut()
		yield call(airUpDataTimeout, 'laser', dataObject)
		break;
	}
}

//数据上传超时的处理
function* airUpDataTimeout(type, dataObject)
{
	var state = yield select();
	var connectedDevice = state.ble.connectedDevice;
	if (type === 'sports')
	{
		upDataSetTimeOut(actionCallback, 10000)
		const {posts, timeout, } = yield race({
			posts: call(bleDataHandle.deviceReturnSports, dataObject, BluetoothManager, connectedDevice.bleId),
			timeout: delay(10000),
		})
		if (posts)
		{
			clearUpdataTimeOut()
			actionCallback({status: 5, progress: 10, })
		}
	}
	else if (type === 'laser')
	{
		upDataSetTimeOut(actionCallback, 60000)
		const {posts, timeout, } = yield race({
			posts: call(bleDataHandle.deviceReturnLaser, dataObject, BluetoothManager, connectedDevice.bleId),
			timeout: delay(60000),
		})
		if (posts)
		{
			clearUpdataTimeOut()
			actionCallback({status: 5, progress: 30, })
		}
	}
	else
	{
		upDataSetTimeOut(actionCallback, 60000)
		const {posts, timeout, } = yield race({
			posts: call(airDeviceReturnData, dataObject, BluetoothManager, connectedDevice.bleId, connectedDevice.device_sn),
			timeout: delay(60000),
		})
		console.log(posts, '心率的返回1111')
		if (posts)
		{
			clearUpdataTimeOut();
			actionCallback({status: 5, progress: 50, })
			yield delay(1000);
			//开始空中升级
			yield Bleconnect.scan(10);
			//数据上传完成，开始空中升级
			try
			{
				yield call(Application.startDFU, BluetoothManager, connectedDevice.bleId);
			}
			catch (error)
			{
				actionCallback({status: 0, message: '启动空中升级失败', })
			}
		}
	}
}

//上传数据的结果的结果
export function* airDeviceReturnData(dataObject, BluetoothManager, bleId, device_sn)
{
	var res = yield call(bleDataHandle.deviceReturnHeart, dataObject, BluetoothManager, bleId, device_sn);
	console.log(res, '上传的数据结果1111')
	if (res)
	{
		var status = res.status;
		if (status && status === 1)
		{
			return res;
		}
		else
		{
			actionCallback({status: 0, message: res.message, })
		}
	}
	return res;
}

//获取升级的进度
export function* getDfuProgress(action)
{
	var state = yield select();
	console.log(action, '获取升级的进度');
	var progress = action.progress;
	if (progress === 100)
	{
		actionCallback({status: 5, progress: 100, })
		yield put({type: 'DISCONNECT', data: null, })
	}
	if (progress == 30)
	{
		actionCallback({status: 5, progress: 70, })
	}
	else if (progress == 60)
	{
		actionCallback({status: 5, progress: 90, })
	}
}

export function* getApplicationFirst(action)
{
	actionCallback = action.callback;
	yield put({type: 'IS_CONNECT_OR_SEARCH', status: 6, })
	yield call(Application.getManuallyHRState, BluetoothManager, deviceId);
}

var isManuallyHrStatus = 0, isManuallyLaserStatus = 0, isAutoHrStatus = 0;
//设备应用相关
export function* dataFromApplication(action)
{
	console.log('是否设备英语', '12312');
	var state = yield select();
	var dataObject = action.dataObject;
	switch (dataObject.cmd)
	{
	case cmd.kGXYL_GetManuallyHRState:
		//获取手动心率开启状态的回调里面调用获取自动心率开启状态的指令
		isManuallyHrStatus = dataObject.body.manuallyHRState != "0" ? true : false
		console.log('获取手动心率开启状态回调', isManuallyHrStatus, dataObject.body.manuallyHRState);
		yield call(Application.getAutoHRState, BluetoothManager, deviceId);
		break;
	case cmd.kGXYL_GetAutoHRState:
		//获取自动心率开启状态的回调里面调用获取手动激光开启状态的指令
		isAutoHrStatus = dataObject.body.autoHRState != "0" ? true : false
		console.log('获取自动心率开启状态回调', isAutoHrStatus, dataObject.body.autoHRState);
		var dic = {
			isManuallyHrStatus: isManuallyHrStatus,
			isAutoHrStatus: isAutoHrStatus,
		}
		yield put({type: "AUTO_HR_STATE", status: isAutoHrStatus});
		yield put({type: "MANUALLY_HR_STATE", status: isManuallyHrStatus});
		actionCallback({status: 1, message: '成功', dic: dic, })
		break;
	case cmd.kGXYL_GetManuallyLaserState:
		//获取手动激光开启状态的回调里面执行完成
		isManuallyLaserStatus = dataObject.body.manuallyLaserState != "0" ? true : false
		console.log('获取手动激光开启状态回调', isManuallyLaserStatus, dataObject.body.manuallyLaserState)
		yield put({type: 'MANUALLY_LASER_STATE', state: isManuallyLaserStatus});
		dic = {
			isManuallyLaserStatus: isManuallyLaserStatus,
		}
		actionCallback({status: 1, message: '成功', dic: dic, })
		break;
	case cmd.kGXYL_RealtimeIsOpen:
		console.log(dataObject, '实时心率')
		if (dataObject.body.realtimeData)
		{
			if (dataObject.body.realtimeData.hrRealtime >= 255)
			{
				//关掉自动心率
				try {
					yield call(Application.isOpenRealtimeData, false, BluetoothManager, deviceId);
					actionCallback({status: 2, hrRealtime: 0, })
				} catch (error) {
					actionCallback({status: 2, hrRealtime: 0, })
				}
			}
			else
			{
				console.log('实时心率数据', dataObject.body.realtimeData.hrRealtime)
				actionCallback({status: 2, hrRealtime: dataObject.body.realtimeData.hrRealtime, })
			}
		}
		break;
	case cmd.kGXYL_LaserManuallyParameters:
		if (dataObject.body.setState == '设置成功')
		{
			var isStart = !isManuallyLaserStatus;
			yield call(Application.isOpenLaserAction, isStart, BluetoothManager, deviceId);
		}
		else
		{
			actionCallback({status: 0, message: '失败', })
		}

		break;
	case cmd.kGXYL_LaserIsOpen:
		isManuallyLaserStatus = !isManuallyLaserStatus;
		yield put({type: 'MANUALLY_LASER_STATE', state: isManuallyLaserStatus});
		if (dataObject.body.setState == '设置成功')
		{
			actionCallback({status: 1, message: '成功', isManuallyLaserStatus: isManuallyLaserStatus, type: 'laser', })
		}
		else
		{
			actionCallback({status: 0, message: dataObject.body.setState, })
		}
		break;
	case cmd.kGXYL_HRManuallyIsOpen:
		isManuallyHrStatus = !isManuallyHrStatus;
		yield put({type: "MANUALLY_HR_STATE", status: isManuallyHrStatus});
		if (dataObject.body.setState == "设置成功")
		{
			actionCallback({status: 1, message: '设置成功', isManuallyHrStatus: isManuallyHrStatus, type: 'hr', })
		}
		else
		{
			actionCallback({status: 0, message: dataObject.body.setState, })
		}
		break;
	case cmd.kGXYL_HRAutomaticallIsOpen:
		isAutoHrStatus = !isAutoHrStatus;
		yield put({type: "AUTO_HR_STATE", status: isAutoHrStatus});
		if (dataObject.body.setState == "设置成功")
		{
			actionCallback({status: 1, message: '设置成功', isAutoHrStatus: isAutoHrStatus, type: 'autoHr', })

		}
		else
		{
			actionCallback({status: 0, message: dataObject.body.setState, })
		}

		break;
	case cmd.kGXYL_setPointer:
		console.log(dataObject, '指针调整')
		break;
	case cmd.kGXYL_GetHRRecording:

		break;
	case cmd.kGXYL_GetMotionRecording:
		console.log(dataObject, '获取的运动数据111111111')

		break;
	case cmd.kGXYL_GetLaserRecording:

		break;
	case cmd.kGXYL_setNewPointer:
		console.log("指针HA06X成功")
		break;
	case cmd.kGXYL_SetBoardCastDuration:
		console.log("设置蓝牙广播")
		break;
	case cmd.kGXYL_GetBoardCastDuration:
		console.log(dataObject, "获取蓝牙广播")
		break;
	case cmd.kGXYL_LaserRegimenParameters:
		console.log(dataObject, "设置激光疗程")

		break;
	default:
		console.log('连接收到异常指令')
		break;
	}
}

//开关自动心率
export function* isOpenAutoHr(action)
{
	actionCallback = action.callback;
	var isOpen = action.isOpen;
	try
	{
		yield call(Application.isOpenAutoHrAction, isOpen, BluetoothManager, deviceId);
	}
	catch (error)
	{
		actionCallback({status: 0, message: '失败', })
	}
}

//开关手动心率
export function* isOpenManuallyHr(action)
{
	try {
		var state = yield select();
		var connectedDevice = state.ble.connectedDevice;
		actionCallback = action.callback;
		if (connectedDevice.bleId)
		{
			var isOpen = action.isOpen;
			try
			{
				yield call(Application.isOpenHrAction, isOpen, BluetoothManager, connectedDevice.bleId);
				yield call(Application.isOpenRealtimeData, isOpen, BluetoothManager, connectedDevice.bleId);
			}
			catch (error)
			{
				actionCallback({status: 0, message: '失败', })
			}
		}
		else
		{
			actionCallback({status: 0, message: '失败', })
		}
	} catch (error) {
		actionCallback({status: 0, message: '失败', })
	}

}

//开关手动激光
export function* isOpenManuallyLaser(action) {
	actionCallback = action.callback;
	var isOpen = action.isOpen;
	try
	{
		yield call(Application.isOpenLaserAction, isOpen, BluetoothManager, deviceId);
	}
	catch (error)
	{
		actionCallback({status: 0, message: '失败', })
	}
}

//设置手动激光参数
export function* setLaserManuallyParameters(action)
{
	console.log(action, '设置激光参数');
	actionCallback = action.callback;
	var power = action.power;
	var duration = action.duration;
	try
	{
		yield call(Application.setLaserManuallyParameters, power, duration, BluetoothManager, deviceId)
	}
	catch (error)
	{
		actionCallback({status: 0, message: '失败', })
	}
}

//获取手动激光状态
export function* getManuallyLaserState(action)
{
	actionCallback = action.callback;
	yield call(Application.getManuallyLaserState, BluetoothManager, deviceId);
}

//数据监测获取数据相关

var data_type = '';//数据上传的类型
export function* getDeviceData(action)
{
	console.log(action, 'asdasda')
	yield put({type: 'IS_CONNECT_OR_SEARCH', status: 7, })
	actionCallback = action.callback;
	data_type = action.params;
	//数据监测上传数据
	action.callback({status: 5, progress: 80, })
	upDataSetTimeOut(actionCallback, 10000, '上传运动超时');
	yield call(bleDataHandle.getDeviceData, BluetoothManager, data_type, connectedDevice.bleId, connectedDevice.device_sn, deviceInformation, firmWare)
}

//数据监测的返回
export function* returnDataObserve(action)
{
	var dataObject = action.dataObject;
	switch (dataObject.cmd)
	{
	case cmd.kGXYL_GetHRRecording:
		clearUpdataTimeOut()
		yield call(upDataObserveTimeout, data_type, dataObject)
		break;
	case cmd.kGXYL_GetMotionRecording:
		console.log(dataObject, '获取的运动数据111111111')
		clearUpdataTimeOut()
		yield call(upDataObserveTimeout, data_type, dataObject)
		break;
	case cmd.kGXYL_GetLaserRecording:
		clearUpdataTimeOut()
		yield call(upDataObserveTimeout, data_type, dataObject)
		break;
	}
}

function* upDataObserveTimeout(type, dataObject)
{
	if (type === 'day_heart')
	{
		upDataSetTimeOut(actionCallback, 50000)
		const {posts, timeout, } = yield race({
			posts: call(deviceObserveReturnData, type, dataObject, BluetoothManager, connectedDevice.bleId, connectedDevice.device_sn),
			timeout: delay(50000),
		})
		if (posts)
		{
			clearUpdataTimeOut();

		}
	}
	else if (type === 'day_sports')
	{
		upDataSetTimeOut(actionCallback, 50000, '上传运动超时')
		const {posts, timeout} = yield race({
			posts: call(deviceObserveReturnData, type, dataObject, BluetoothManager, connectedDevice.bleId, connectedDevice.device_sn),
			timeout: delay(50000),
		})
		console.log(posts, timeout, '上传的晕阿萨达说的')
		if (posts)
		{
			clearUpdataTimeOut();

		}
	}
	else if (type === 'day_laser')
	{
		upDataSetTimeOut(actionCallback, 50000)
		const {posts, timeout, } = yield race({
			posts: call(deviceObserveReturnData, type, dataObject, BluetoothManager, connectedDevice.bleId, connectedDevice.device_sn),
			timeout: delay(50000),
		})
		if (posts)
		{
			clearUpdataTimeOut();

		}
	}
}
//上传数据的结果的结果
export function* deviceObserveReturnData(type, dataObject, BluetoothManager, bleId, device_sn)
{
	actionCallback({status: 5, progress: 90, })
	if (type === 'day_sports')
	{
		var res = yield call(bleDataHandle.deviceObserveReturnSports, dataObject, BluetoothManager, bleId, device_sn);
		console.log(res, '上传的数据结果1111')
		if (res)
		{
			var status = res.status;
			if (status === 1)
			{
				actionCallback({status: 5, progress: 95, })
				yield delay(2000);
				actionCallback({status: 5, progress: 100, })
			}
			else
			{
				actionCallback({status: 5, progress: 95, })
				yield delay(2000);
				actionCallback({status: 5, progress: 100, })
			}
		}
		return res;
	}
	else if (type === 'day_heart')
	{
		res = yield call(bleDataHandle.deviceObserveReturnHeart, dataObject, BluetoothManager, bleId, device_sn);
		console.log(res, '上传的数据结果1111')
		if (res)
		{
			status = res.status;
			if (status === 1)
			{
				actionCallback({status: 5, progress: 95, })
				yield delay(1000);
				actionCallback({status: 5, progress: 100, })
			}
			else
			{
				actionCallback({status: 5, progress: 95, })
				yield delay(2000);
				actionCallback({status: 5, progress: 100, })
			}
		}
		return res;
	}
	else if (type === 'day_laser')
	{
		res = yield call(bleDataHandle.deviceObserveReturnLaser, dataObject, BluetoothManager, bleId, device_sn);
		console.log(res, '上传的数据结果1111')
		if (res)
		{
			status = res.status;
			if (status === 1)
			{
				actionCallback({status: 5, progress: 95, })
				yield delay(1000);
				actionCallback({status: 5, progress: 100, })
			}
			else
			{
				actionCallback({status: 5, progress: 95, })
				yield delay(2000);
				actionCallback({status: 5, progress: 100, })
			}
		}
		return res;
	}
}


//蓝牙状态变化
export function* getBleStatus(action)
{
	var status = action.status;
	console.log(status, '蓝牙状态变化');
	if (!status)
	{
		deviceId = '';
		device_sn = '';
		deviceInformation = null;
		eb = '';
		firmWare = null;
		connectedDevice = null;
		yield put({type: 'DISCONNECT', data: null, })
	}
	yield put({type: 'GET_BLE_STATUS_RESULT', status: status, })
}


/**引导图相关 */

//引导图搜素设备
export function* bgSearchDevices(action)
{
	yield put({type: 'BLE_ACTION', key: 'search', })
	actionCallback = action.callback;
	yield Bleconnect.scan(5);
	var result = yield take('SEARCH_RESULT');
	var devices = result.devices;
	if (devices.length < 1)
	{
		actionCallback({status: 2, devices: [], })
	}
	else
	{
		actionCallback({status: 1, devices: devices, })
	}
}
