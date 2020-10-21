import {put, select, call, } from 'redux-saga/effects';
import {Platform, PermissionsAndroid, } from 'react-native';
import * as Login from '../utils/network/loginService';
import QBStorage from '../utils/storage/storage';

var nav = null;
var actionCallback = null;
export function* startUp(action)
{
	const state = yield select();
	var token = state.loginIn.user;
	console.log(token, '21欠我的期望');
	if (token)
	{
		action.callback({status: 1, message: '登录成功'})
	}
	else
	{
		action.callback({status: 2, message: '未登录'})
	}
}

//登录
export function* loginIn(action)
{
	var dic = action.dic;
	var mobile = dic.mobile;
	var androidVersion = dic.androidVersion;
	actionCallback = action.callback;
	var params = {
		mobile: mobile,
		code: dic.code,
		uuid: dic.uid,
	}
	console.log(params, '登录的信息');
	if (mobile === '18338299767')
	{
		yield call(fetchLogin, params);
		return;
	}
	//登录

	if (Platform.OS === 'ios')
	{
		yield call(fetchLogin, params)
	}
	else
	{
		console.log(androidVersion, '安卓的版本信息12')
		if (androidVersion < 23)
		{
			yield call(fetchLogin, params)
		}
		else
		{
			//返回string类型
			const granted = yield call(PermissionsAndroid.request,
				PermissionsAndroid.PERMISSIONS.WRITE_EXTERNAL_STORAGE
			)
			console.log(granted, '获取的权限', PermissionsAndroid.RESULTS.GRANTED)

			if (granted === PermissionsAndroid.RESULTS.GRANTED)
			{
				yield call(fetchLogin, params);
			}
		}
	}
}

//微信登录
export function* loginWXIn(action)
{
	var dic = action.dic;
	yield put({type: 'LOGIN_WX_SUCCESS', data: dic, });
	QBStorage.save('user', dic)
	action.callback({status: 1, message: '登录成功', })
}

function* fetchLogin(dic)
{
	try
	{
		var response = yield call(Login.getUserTokenByMobile, dic);
		console.log(response, '登录的1111')
		if (response.code === 200)
		{
			actionCallback({status: 1, message: '登录成功', })
			response.mobile = dic.mobile;
			QBStorage.save('user', response)
			yield put({type: 'LOGIN', return_data: response, })
			if (response.is_new && response.is_new == 1)
			{
				QBStorage.save('guide', 'show')
			}
		}
		else
		{
			actionCallback({status: 1, message: '登录失败', })
		}

	}
	catch (error)
	{
		actionCallback({status: 0, message: '接口出错', })
	}
}

//退出登录
export function* loginOut(action) {
	QBStorage.delete('user')
	yield put({type: 'LOGIN_OUT_SUCCESS', data: null,  })
	action.callback({status: 1, message: '退出成功', });

}

export function* bindPhone(action)
{
	console.log(action, '新的绑定信息');
	var dic = {
		mobile: action.dic.mobile,
		unique_id: action.dic.unique_id,
	}
	var response = yield call(Login.bindPhone, dic);
	if (response.status === 1)
	{
		if(response.is_new && response.is_new == 1){
			QBStorage.save("guide", 'show');
		}
		//绑定成功获取用户信息
		var result = yield call(Login.getServiceUserInfo, {openid: action.dic.openid});
		console.log(result, '获取用户信息')
		if (result.status === 1)
		{
			var loginIn = {
				token: result.data.token,
				user_id: result.data.user_id,
				mobile: result.data.mobile,
				shop_id: result.data.shop_id ? result.data.shop_id : "",
				shop_url: result.data.shop_url ? result.data.shop_url : null,
			}
			yield put({type: 'LOGIN_WX_SUCCESS', data: loginIn});
			QBStorage.save('user', loginIn);
			action.callback({status: 1, message: '绑定成功'})
		}
		else
		{
			action.callback({status: 0, message: result.msg})
		}
	}
	else
	{
		action.callback({status: 0, message: response.msg})
	}

}
