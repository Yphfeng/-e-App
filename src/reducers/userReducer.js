'use strict';
import * as types from '../constants/user/userTypes';

/**
 * [蓝牙的初始状态，0蓝牙未开启， 1设备未绑定， 2设备未连接 ，3设备已连接]
 * @type {Object}
 */
const initialState = {
	userInfo: {},
	deviceArray: [],
	msg: "",
	userDeviceList: [],
	userMsg: 0,
};

export default function user(state = initialState, action) 
{
	switch (action.type) 
	{
	case types.SAVE_USERINFO:
		return {
			...state,
			userInfo: action.data,
		}
	case 'SUCCESS_GETUSERDEVICELIST':
		return {
			...state,
			userDeviceList: action.data,
		}
	case 'USER_MSG_RESULT':
		return {
			...state,
			userMsg: action.count,
		}
	default:
			
		return state;
	}
}