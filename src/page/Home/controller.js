import {
	Platform,
	PermissionsAndroid,
} from 'react-native'
import * as DeviceService from "../../utils/network/deviceService";


//判断用户是否绑定设备 0网络出错，1绑定一个设备， 2绑定多个设备， 3无绑定, 4接口报错
export async function isBindDevice()
{
	try
	{
		var res = await DeviceService.getUserBindDeviceList();
		console.log(res, "获取绑定的设备")
		var result;
		if (res.status == 1)
		{
			if (res.device_list.length == 1)
			{
				result = {
					status: 1,
					deviceList: res.device_list,
				}
				return result
			}
			else
			{
				result = {
					status: 2,
					deviceList: res.device_list,
				}
				return result
			}
		}
		else
		{
			if (res.code == 400013)
			{
				result = {
					status: 3,
					deviceList: null,
				}
				return result
			}
			else
			{

				result = {
					status: 4,
					deviceList: null,
				}
				return result
			}
		}
	}
	catch (error)
	{
		result = {
			status: 0,
			deviceList: null,
		}
		return result
	}

}

//开始搜索设备前的处理

export async function searchBle()
{
	if (Platform.OS == 'ios')
	{
		return 1

	}
	else
	{
		try
		{
			var res = await PermissionsAndroid.check(PermissionsAndroid.PERMISSIONS.ACCESS_COARSE_LOCATION)
			if (res)
			{
				return 1
			}
			else
			{
				var response = await PermissionsAndroid.request(PermissionsAndroid.PERMISSIONS.ACCESS_COARSE_LOCATION);
				if (response == PermissionsAndroid.RESULTS.GRANTED)
				{
					return 1
				}
				else
				{
					return 0
				}
			}
		}
		catch (error)
		{
			return 0
		}


	}
}

var websocket = null;
/**
 * 初始化长连接
 */
export function initLongConnect()
{
	var wsUrl = "wss://www.shixiaoli.com/wss?uid=12880"
	var websocket = new WebSocket(wsUrl);
	websocket.onopen= function(evt)
	{
		console.log(evt, '长连接启动')
	}
	websocket.onmessage = function(evt)
	{
		console.log(evt.data, '数据', evt.data.sn)
		var data = JSON.parse(evt.data);
		console.log(data.sn)

	}
	websocket.onclose = function(evt)
	{
		console.log(evt, '长连接关闭')
	}
	websocket.onerror = function(evt)
	{
		console.log(evt, '报错长连接')
	}

}
