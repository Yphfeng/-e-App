import {put, call, delay, take, select, takeEvery, race, } from 'redux-saga/effects';
import * as cmd from '../utils/ble/cmd';
import * as courseService from '../utils/network/courseService';
import * as DeviceService from '../utils/network/deviceService';
import * as qbDate from '../utils/qbDate';
import * as bleDataHandle from "../utils/ble/application/data/bleDataHandle";
import * as Utils from '../utils/utils';
import BleModule from '../utils/ble/bleModule';
import BleConnection from '../utils/ble/application/connect';
import BleApplication from '../utils/ble/application/application';
var actionCallback = null;
const Bleconnect = BleConnection.getInstance();
const BluetoothManager =  BleModule.getInstance();
const Application = new BleApplication();

var connectedDevice = null, firmWare = null, params = null;

//获取用户绑定的设备
export function* getUserDeviceList(action) 
{
	console.log(action, '获取1111');
	actionCallback = action.callback;
	var dic = action.dic ? action.dic : null;
	var res = yield call(DeviceService.getUserBindDeviceList, dic);
	console.log(res, '接口返回的数据', dic);
	if (res.code === 200) 
	{
		var device_list = res.device_list;
		if (device_list && device_list.length > 0) 
		{
			for (var i =0; i < device_list.length; i ++ ) {
				var name = device_list[i].device_name;
				device_list[i].device_name = Utils.stitchingName(name);
				var device_name = device_list[i].device_code;
				if (device_name.indexOf("HA05") > -1|| device_name.indexOf("HA06") > -1) 
				{
					device_list[i].isCicle = 1;
				} 
				else 
				{
					device_list[i].isCicle = 0;
				}
				device_list[i].prevName = device_list[i].device_sn.substring(13);
			}
		}
		actionCallback({status: 1, data: device_list, })
		yield put({type: 'SUCCESS_GETUSERDEVICELIST', data: device_list, })
	} 
	else 
	{
		actionCallback({status: 0, data: [], })
		yield put({type: 'SUCCESS_GETUSERDEVICELIST', data: [], })
	}
}
//绑定解绑时的蓝牙操作
export function* bindCMD(action)
{
	var state = yield select();
	connectedDevice = state.ble.connectedDevice;
	var dataObject = action.dataObject;
	switch (dataObject.cmd) 
	{
	case cmd.kGXYL_GetHRRecording:
		clearUpTimeOut()
		yield call(upDataTimeout, 'heartRate', dataObject)
		break;
	case cmd.kGXYL_GetMotionRecording:
		console.log(dataObject, '获取的运动数据111111111')
		clearUpTimeOut()
		yield call(upDataTimeout, 'sports', dataObject)
		break;
	case cmd.kGXYL_GetLaserRecording:
		clearUpTimeOut()
		yield call(upDataTimeout, 'laser', dataObject)
		break;
	case cmd.kGXYL_RealtimeIsOpen:
		yield call(Application.isOpenRealtimeData, false, BluetoothManager, connectedDevice.bleId)
	}
}

//数据上传超时的处理
function* upDataTimeout(type, dataObject) 
{
	var state = yield select();
	connectedDevice = state.ble.connectedDevice;
	if (type === 'sports') 
	{
		upTimeOut && upTimeOut(actionCallback, 10000)
		const {posts, timeout, } = yield race({
			posts: call(bleDataHandle.deviceReturnSports, dataObject, BluetoothManager, connectedDevice.bleId),
			timeout: delay(10000),
		})
		if (posts) 
		{
			clearUpTimeOut();
			actionCallback({status: 1, progress: 50, })
		}
		console.log(posts, timeout, '上传的数据');
	} 
	else if (type === 'laser') 
	{
		upTimeOut(actionCallback, 120000)
		const {posts, timeout, } = yield race({
			posts: call(bleDataHandle.deviceReturnLaser, dataObject, BluetoothManager, connectedDevice.bleId),
			timeout: delay(120000),
		})
		if (posts) 
		{
			clearUpTimeOut()
			actionCallback({status: 1, progress: 70, })
		}
	} 
	else 
	{
		upTimeOut(actionCallback, 300000)
		const {posts, timeout} = yield race({
			posts: call(bleDataHandle.deviceReturnHeart, dataObject, BluetoothManager, connectedDevice.bleId, connectedDevice.device_sn),
			timeout: delay(300000),
		})
		if (posts) 
		{
			clearUpTimeOut()
			actionCallback({status: 1, progress: 90, })
			var status = posts.status;
			if (status === 1) 
			{
				response =  yield call(DeviceService.unbindDevice, params)
				console.log(response, '解绑11111')
				if (response.msg == "解绑成功") 
				{
					//解绑设置为非长广播
					try {
						var firmWare_version = firmWare.firmwareVersion.substring(1, 5);
						if (firmWare_version > 1705) 
						{
							var s =  yield call(Application.setBroadcastDuration, 60, BluetoothManager, connectedDevice.bleId);
						}
						yield delay(1000);
						yield Bleconnect.disconnect();
					} catch (error) {
						console.log(error, 'assasas')
						
					}
					finally
					{
						actionCallback({status: 1, progress: 100, })
						delay(1000)
						actionCallback({status: 2, message: '解绑成功', })
					}
					
				}
				else
				{
					actionCallback({status: 0, message: res.msg, })
				}		
			} 
			else
			{
				actionCallback({status: 0, message: res.message, })
			}
		}
	}

}

//数据上传定时器
function upTimeOut(actionCallback, s)
{
	this.upTimeOut = setTimeout(() => {
		actionCallback({status: 0, message: '解绑失败'})
	}, s);
}

//清除定时器
function clearUpTimeOut()
{
	this.upTimeOut && clearTimeout(this.upTimeOut)
}

export function* confirmUnbind(action)
{
	yield put({type: 'IS_CONNECT_OR_SEARCH', status: 3, })
	yield put({type: 'BLE_ACTION', key: 'search', })
	actionCallback = action.callback;
	var state = yield select();
	var connectStatus = state.ble.connectStatus;
	connectedDevice = state.ble.connectedDevice;
	var connect_sn = connectedDevice ? connectedDevice.device_sn : '';
	params = action.dic;
	if (connectStatus === 4)
	{
		var deviceInformation = state.ble.deviceInformation;
		firmWare = state.ble.firmWare;
		if (connect_sn === params.device_sn) 
		{
			//先上传数据然后解绑
			upTimeOut(actionCallback, 10000);
			yield call(bleDataHandle.getDeviceData, BluetoothManager, 'all', connectedDevice.bleId, connectedDevice.device_sn, deviceInformation, firmWare)
		}
		else
		{
			try 
			{
				yield delay(2000)
				response =  yield call(DeviceService.unbindDevice, params)
				if (response.msg == "解绑成功") 
				{
					actionCallback({status: 2, message: '解绑成功', })
				}
				else
				{
					actionCallback({status: 0, message: res.msg, })
				}
			} 
			catch (error) 
			{
				actionCallback({status: 0, message: '接口出错', })
			}		
		}
	}
	else
	{
		try 
		{
			yield delay(2000)
			res = yield call(DeviceService.unbindDevice, params)
		
			if (res.msg == "解绑成功") 
			{
				actionCallback({status: 2, message: '解绑成功', })
			}
			else
			{
				actionCallback({status: 0, message: res.msg, })
			}		
			
		} 
		catch (error) 
		{
			actionCallback({status: 0, message: '接口出错', })
		}
	}
}
