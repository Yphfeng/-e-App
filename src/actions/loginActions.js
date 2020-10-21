'use strict';
import * as types from '../constants/loginTypes';

import * as DeviceService from '../utils/network/deviceService';

import * as Login from '../utils/network/loginService';
import QBStorage from '../utils/storage/storage';


/**
 * [getImplement 判断token是否过期]
 * @Author   袁进
 * @DateTime 2019-03-07T11:10:28+0800
 * @param    {[type]}                 status [description]
 * @return   {[type]}                        [description]
 */
export function getImplement(status) {
	return {
		type: types.IMPLEMENTION_SUCCESS,
		status
	}
}


export function getDeviceType(text,device_status,conf_status) {
	return {
		type: types.GET_DEVICE_TYPE,
		status: text,
		device_status,
		conf_status,
	}
}

//网络状态
export function netWork(status)
{
	return {
		type: types.NETWORK,
		status,
	}
}

//更新登录状态
export function getLoginForRedurce(login_status) {
	return {
		type: "LOGIN_FOR_REDURCE",
		...login_status
	}
}


//手机登录
export const  getLogin = (dic, callback)  => ({
	type: 'GET_LOGIN',
	callback: callback,
	dic: dic,
})

export function loginOut(login_status) 
{
	return {
		type: types.LOGIN_OUT,
		login_status,
	}
}

export function loginOutError(login_status) {
	return {
		type: types.LOGIN_OUT_ERROR,
		login_status,
	}
}
/**
 * 【异步action获取设备类型】
 * @Author   袁进
 * @DateTime 2018-12-07T18:04:05+0800
 * @return   {[type]}                 [description]
 */
export function fetchDeviceType() 
{
	return dispatch => {
		return DeviceService.getDeviceType()
			.then((res) => {
				if (res.status)
				{
					console.log(res, '获取设备类型')
					dispatch(getDeviceType(res.status,res.device_status,res.conf_status))
				}
				else
				{
					console.log(res, '获取设备类型')
					dispatch(getImplement(0))
				}
			
			})
			.catch(err => {
				dispatch(getImplement(0))
			})
	}    
}
export function fetchLogin(dic) 
{
	dic.login_type = "2";
	return async dispatch => {

		return Login.getUserTokenByMobile(dic)
			.then( async res => {
				console.log(res,'查看')
				if (res.status == 1) 
				{
					console.log(res, '登陆成功信息')
					res.mobile = dic.mobile;
					QBStorage.save("user",res)
						.then( async ()=>{
							dispatch(getLogin(res))
						})
						.catch(err => {

						})
					if (res.is_new == 1)
					{

						QBStorage.save("guide", 'show');
					}
				}
				else
				{
					dispatch(getLogin(res))
				}
			})
			.catch(err => 
			{
				console.log(err,'登陆信息')
				dispatch(getLogin(res))
			})
	}
}

/**
 * [fetchLoginOut 退出登陆]
 * @param  {[type]} dic [description]
 * @return {[type]}     [description]
 */
export const  fetchLoginOut = callback => ({
	type: 'LOGIN_OUT',
	callback: callback,
})

//微信登录
export const getWXLogin = (dic, callback) => ({
	type: 'GET_WX_LOGIN',
	dic: dic,
	callback: callback,
})


/**
 * [errorLogin 登陆失效]
 * @param  {[type]} data [description]
 * @return {[type]}      [description]
 */
export function errorLogin(data) {
	return {
		type: userTypes.UN_LOGIN,
		data
	}
}


//绑定手机号
export function bindPhone(dic, callback) 
{
	return {
		type: types.BIND_PHONE,
		dic: dic,
		callback: callback,
	}
}
export function isBindPhone(dic) {
	return dispatch => {
		return Login.bindPhone(dic)
			.then(res => {
				console.log(res)
				dispatch(bindPhone(res.status, res.msg))
				if(res.is_new == 1){
					QBStorage.save("guide", 'show');
				}
			})
			.catch(err => {
				console.log(err)
				dispatch(bindPhone(11, "接口出错"))
			})
	}
}

//App是否有升级

export function getUpdateStatus(status)
{
	return {
		type: types.GET_UPDATE_STATUS,
		status,
	}
}

//第一次进入是否登录
export const firstLoading  = callback => ({
	type: 'FIRST_LOADING',
	callback: callback,
})