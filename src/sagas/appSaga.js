import {put, call, delay, take, select, takeEvery, } from 'redux-saga/effects';
import * as DeviceService from '../utils/network/deviceService';
import * as HomeService from '../utils/network/homeService';

export function* appLoad(action)
{
	var responseJson = yield call(DeviceService.getDeviceArray);
	if (responseJson.status === 1)
	{
		yield put({type: 'DEVICE_ARRAY', data: responseJson.list, })
	}
}

//获取用户未读消息的条数
export function* getUserMsgCount(action)
{
	var responseJson = yield call(HomeService.getMessageListData);
	console.log(responseJson, '获取的小心吧')
	if (responseJson.code == 200)
	{
		var arr = [];
		var returnData = responseJson.data;
		if (returnData && returnData.length > 0)
		{
			for (var i = 0; i < returnData.length; i ++)
			{
				if (returnData[i].status == 0)
				{
					arr.push(returnData[i])
				}
			}
		}
		else 
		{
			arr = [];
		}
		var returnLen = arr.length;
		
	}
	else
	{
		returnLen = 0;
	}
	console.log(returnLen, '获取的小心吧123');
	yield put({type: 'USER_MSG_RESULT', count: returnLen, })
}