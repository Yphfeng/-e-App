import QBStorage from '../storage/storage';
import axios from 'axios';
import { Platform, DeviceEventEmitter, } from 'react-native';

import qs from 'qs';

//  this.baseURL = 'https://git.sharemedical.vip/'
// this.baseURL = 'https://www.sharemedical.vip/'
// let baseURL = 'https://bug.sharemedical.vip/'
// let baseURL = 'https://line.sharemedical.vip/'
// let baseURL = 'http://dev.sharemedical.vip/'
// this.bodyToString.bind(this);

//当前域名
let baseURL = 'https://dev.sharemedical.vip/'

//开发域名
// let baseURL = 'https://custody.sharemedical.vip/'

export const URL = baseURL

export function requestToken(dic)
{
	const url = dic.path;
	if (dic.body == undefined)
	{
		dic.body = new Object();
	}
	console.log(url, '请求的url')
	return new Promise((resolve, reject) =>
	{
		if (Platform.OS === "ios")
		{
			fetch(url, {
				method: "POST",
				headers:
				{
					"Content-Type": "application/x-www-form-urlencoded"
				},
				body: bodyToString(dic.body),
			})
				.then(response => response.json())
				.then(responseJson => {
					console.log("登陆成功")
					resolve(responseJson)
				})
				.catch(error => {
					console.log("登陆失败")
					reject(error)
				})
		}
		else
		{

			axios({
				url: dic.path,
				headers: {
					'Content-Type': 'application/x-www-form-urlencoded',
				},
				method: "post",
				data: bodyToString(dic.body),
			})
				.then((response) => {
					console.log(response, '登陆成功')
					var res = response.data;

					resolve(res)
				}).catch(err => {
					console.log('登陆失败requestLogin')
					reject(err)
				})
		}

	})

}

export function requestLogin(dic)
{
	const url = baseURL + dic.path;
	console.log(url, '请求的url')
	if (dic.body == undefined)
	{
		dic.body = new Object();
	}
	return new Promise((resolve, reject) => {
		if (Platform.OS === "ios")
		{
			fetch(url, {
				method: "POST",
				headers:
				{
					"Content-Type": "application/x-www-form-urlencoded"
				},
				body: bodyToString(dic.body),
			})
				.then(response => response.json())
				.then(responseJson => {
					console.log("登陆成功")
					resolve(responseJson)
				})
				.catch(error => {
					console.log("登陆失败")
					reject(error)
				})
		}
		else
		{
			axios({
				url: url,
				headers: {
					'Content-Type': 'application/x-www-form-urlencoded',
				},
				method: "POST",
				data: bodyToString(dic.body),
			}).then((response) => {
				console.log(response, '登陆成功')
				if (response)
				{
					var res = eval('(' + response.data + ')');
				}
				else
				{
					var res = null;
				}
				console.log(res, '登陆成功')
				resolve(res)
			}).catch(err => {
				console.log('登陆失败requestLogin')
				reject(err)
			})
		}

	})

}

export function request(dic)
{
	const url = baseURL + dic.path;
	return new Promise((resolve, reject) => {
		QBStorage.get('user')
			.then((_user) => {
				console.log(_user, '缓存111', dic)
				if (dic.body == undefined)
				{
					dic.body = new Object();
				}
				if (_user)
				{
					if (!dic.body.armariumScienceSession)
					{
						dic.body.armariumScienceSession = _user.token;
					}
				}
				return dic;

			})
			.then((dic) => {
				console.log(dic.body, '参数')
				if (Platform.OS === "ios")
				{
					return fetch(url, {
						method: "POST",
						headers: {
							"Content-Type": "application/x-www-form-urlencoded",
						},
						body: bodyToString(dic.body),
					})
						.then(response => response.json())
						.then(responseJson => {
							resolve(responseJson)
						})
						.catch(error => reject(error))
				}
				else
				{
					console.log(baseURL + dic.path, 'ossurl')
					return axios({
						url: baseURL + dic.path,
						headers: { "Content-Type": "application/x-www-form-urlencoded" },
						method: "post",
						data: bodyToString(dic.body),
					});
				}

			})
			.then((response) => {
				console.log(response,'运动数据的返回值')
				if (response)
				{
					var res = eval('(' + response.data + ')');
				}
				else
				{
					var res = null;
				}
				// var res = response.data;
				resolve(res)
			})
			.catch((error) => {
				console.log(error, '请求底层')
				reject(error);
			})
	})
}
export function requestData(dic)
{
	const url = baseURL + dic.path;
	return new Promise((resolve, reject) => {
		QBStorage.get('user')
			.then((_user) => {
				if (dic.body == undefined)
				{
					dic.body = new Object();
				}
				dic.body.armariumScienceSession = _user.token;
				return dic;
			})
			.then((dic) => {
				if (Platform.OS === "ios")
				{
					return fetch(url, {
						method: "POST",
						headers: {
							"Content-Type": "application/x-www-form-urlencoded",
						},
						body: bodyToString(dic.body),
					})
						.then(response => response.json())
						.then(responseJson => {
							resolve(responseJson)
						})
						.catch(error => reject(error))
				}
				else
				{
					console.log(baseURL, dic.path, bodyToString(dic.body))
					return axios({
						url: baseURL + dic.path,
						headers: { "Content-Type": "application/x-www-form-urlencoded" },
						method: "post",
						data: bodyToString(dic.body),
					});
				}

			})
			.then((response) => {
				console.log(typeof response.data, '运动数据的返回值1111q')
				var res = eval('(' + response.data + ')');
				resolve(res)
			})
			.catch((error) => {
				console.log(error, '请求底层')
				reject(error);
			})
	})
}

export function bodyToString(body)
{
	var _str = "";
	Object.keys(body).forEach((_key, index) => {
		_str += _key + "=" + body[_key];
		_str += index < Object.keys(body).length - 1 ? "&" : "";
	});
	// console.log('bodyToString:', _str);
	return _str;
}
