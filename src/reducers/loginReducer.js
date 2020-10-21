'use strict';
import * as types from '../constants/loginTypes';

const initialState = {
	status: 0,
	isSuccess: false,
	user: null,
	msg: '',
	implementStatus: 0,
	isBindPhone: 0,
	netStatus: 0,
	appUpdateStatus: false,
};

export default function loginIn(state = initialState, action) 
{
	switch (action.type) 
	{
	case types.GET_DEVICE_TYPE:
		return {
			...state,
			status: action.status,
			device_status: action.device_status,
			conf_status: action.conf_status,
		};
		
	case 'LOGIN_FOR_REDURCE':
		return {
			...state,
			user: action,
		}
	case types.LOGIN:
		console.log(action,'新的登陆状态')
		return {
			...state,
			user: action.return_data,
		};
	case 'GET_WX_LOGIN':
		return {
			...state,
			user: action.dic,
		}
	case 'LOGIN_WX_SUCCESS':
		return {
			...state,
			user: action.data,
		}
	case types.LOGIN_IN_ERROR:
		return {
			...state,
			status: '登录出错',
			isSuccess: true,
			user: null,
			msg: '登陆出错',
		};
		
	case types.UN_LOGIN:
		return {
			...state,
			status: '登陆失效',
			isSuccess: false,
			user: null,
			msg: '登陆失效',
		}
	case 'LOGIN_OUT_SUCCESS':
		return {
			...state,
			status: 0,
			user: action.data,
		}
	case types.IMPLEMENTION_SUCCESS:
		return {
			...state,
			implementStatus: action.status,
		}
	case types.BIND_PHONE:
		return {
			...state,
			isBindPhone: action.status,
			msg: action.data
		}
	case types.NETWORK:
		return {
			...state,
			netStatus: action.status,
		}
	case types.GET_UPDATE_STATUS:
		return {
			...state, 
			appUpdateStatus: action.status,
		}
	default:
		return state;
	}
}