import * as Base from './baseService';

/**
 * [sendPhoneLoginCheckCode 发送注册验证码]
 * @Author   袁进
 * @DateTime 2019-02-11T10:45:59+0800
 * @param    {[type]}                 dic [description]
 * @return   {[type]}                     [description]
 */
export function sendPhoneLoginCheckCode(dic) {
	console.log(dic, '发送注册验证码')
	return new Promise((resolve, reject) => {
		Base.requestLogin({
			path: 'Weixin/MobileAccount/sendRegVerify',
			body: dic
		})
		.then((responseJSON) => {
			resolve(responseJSON);
		})
		.catch((error) => {
			console.log(error)
			reject(error);
		});
	})
}

	export function sendCheckCode(dic) {
		return new Promise((resolve, reject) => {
			Base.requestLogin({
					path: 'Weixin/OsAccount/sendRegVerify',
					body: dic
				})
				.then((responseJSON) => {
					resolve(responseJSON);
				})
				.catch((error) => {
					console.log(error)
					reject(error);
				});
		})
	}
	/**
	 * [sendResetPasswordCode 发送找回验证码]
	 * @Author   袁进
	 * @DateTime 2019-02-11T10:50:16+0800
	 * @param    {[type]}                 dic [description]
	 * @return   {[type]}                     [description]
	 */
	export function sendResetPasswordCode(dic) {

		return new Promise((resolve, reject) => {
			Base.requestLogin({
					path: 'Weixin/MobileAccount/sendRetrieveVerify',
					body: dic
				})
				.then((responseJSON) => {
					resolve(responseJSON);
				})
				.catch((error) => {
					reject(error);
				});
		})
	}
	/**
	 * [checkCode 校验注册验证码]
	 * @Author   袁进
	 * @DateTime 2019-02-11T10:48:44+0800
	 * @param    {[type]}                 dic [description]
	 * @return   {[type]}                     [description]
	 */
	export function checkCode(dic) {
		return new Promise((resolve, reject) => {
			Base.requestLogin({
					path: 'Weixin/MobileAccount/getRegVerify',
					body: dic
				})
				.then((responseJSON) => {
					resolve(responseJSON);
				})
				.catch((error) => {
					reject(error);
				});
		})
	}

	//重置密码检查验证码

	export function resetCheckCode(dic) {
		return new Promise((resolve, reject) => {
			Base.requestLogin({
					path: 'Weixin/MobileAccount/getRetrieveVerify',
					body: dic
				})
				.then((responseJSON) => {
					resolve(responseJSON);
				})
				.catch((error) => {
					reject(error);
				});
		})
	}

	export function register(dic) {
		console.log(dic)
		return new Promise((resolve, reject) => {
			Base.requestLogin({
					path: 'Weixin/MobileAccount/mobileReg',
					body: dic
				})
				.then((responseJSON) => {
					resolve(responseJSON);
				})
				.catch((error) => {
					reject(error);
				});
		})
	}

	export function login(dic) {
		dic.login_type = "2";
		return new Promise((resolve, reject) => {
			Base.requestLogin({
					path: 'Weixin/MobileAccount/mobileLogin',
					body: dic
				})
				.then((response) => {
					console.log(response,'登陆成功')
						resolve(response)
				})
				.catch((error) => {
					console.log('登陆失败哦login')
					reject(error);
				});
		})
	}
	/**
	 * [resetPassword 修改密码]
	 * @Author   袁进
	 * @DateTime 2019-02-11T10:52:56+0800
	 * @param    {[type]}                 dic [description]
	 * @return   {[type]}                     [description]
	 */
	export function resetPassword(dic) {
		console.log(dic)
		return new Promise((resolve, reject) => {
			Base.requestLogin({
					path: 'Weixin/MobileAccount/updateMobilePassword',
					body: dic
				})
				.then((responseJSON) => {
					resolve(responseJSON);
				})
				.catch((error) => {
					reject(error);
				});
		})
	}
	/**
	 * [detection 修改密码]
	 * @Author   肖波
	 * @DateTime 2019-04-8T10:52:56+0800
	 * @param    {[type]}                 dic [description]
	 * @return   {[type]}                     [description]
	 */
	export function detection(dic) {
		return new Promise((resolve, reject) => {
			Base.requestLogin({
					path: 'Weixin/MobileAccount/checkMobile',
					body: dic
				})
				.then((responseJSON) => {
					resolve(responseJSON);
				})
				.catch((error) => {
					reject(error);
				});
		})
	}

	/**
	 * 
	 * @param {获取用户token通过手机} dic 
	 */
	export function getUserTokenByMobile(dic) {
		return new Promise((resolve, reject) => {
			Base.requestLogin({
				path: 'Weixin/Account/getUserTokenByMobile',
				body: dic
			})
			.then((responseJSON) => {
				resolve(responseJSON);
			})
			.catch((error) => {
				reject(error);
			});
		})
	}

	/**
	 * 
	 * @param {发送验证码公用} dic 
	 */
	export function sendMobileCode(dic) {
		return new Promise((resolve,reject) => {
			Base.requestLogin({
				path: 'Weixin/Account/sendMobileVerify',
				body: dic,
			})
			.then((responseJSON) => {
				resolve(responseJSON);
			})
			.catch((error) => {
				reject(error);
			});
		})
	}

	/**
	 * 
	 * @param {微信第三方登陆获取token} dic 
	 */
	export function getAccessTokenByCode(dic) 
	{
		return new Promise((resolve, reject) => {
			Base.requestLogin({
				path: 'Weixin/Account/getAccessTokenByCode',
				body: dic,
			})
			.then((responseJSON) => {
				resolve(responseJSON);
			})
			.catch((error) => {
				reject(error);
			});
		})
	}

	/**
	 * 
	 * @param {从微信获取用户信息} dic 
	 */
	export function getUserInfo(dic) 
	{
		return new Promise((resolve, reject) => {
			Base.requestToken({
				path: "https://api.weixin.qq.com/sns/userinfo",
				body: dic,
			})
			.then((responseJSON) => {
				console.log(responseJSON,'2222')
				resolve(responseJSON);
			})
			.catch((error) => {
				console.log(error,'1111')
				reject(error);
			});
		})
	}

/**
	 * 
	 * @param {服务器获取用户信息} dic 
	 */
export function getServiceUserInfo(dic) 
{
	return new Promise((resolve, reject) => {
		Base.requestLogin({
			path: "Weixin/Account/getUserInfoByOpenId",
			body: dic,
		})
			.then((responseJSON) => {
				console.log(responseJSON,'2222')
				resolve(responseJSON);
			})
			.catch((error) => {
				console.log(error,'1111')
				reject(error);
			});
	})
} 

/**
 * 
 * @param {保存微信信息} dic 
 */
export function saveUserInfo(dic) 
{
	return new Promise((resolve, reject) => {
		Base.requestLogin({
			path: "Weixin/Account/saveWxUserInfo",
			body: dic,
		})
			.then((responseJSON) => {
				console.log(responseJSON, '2222')
				resolve(responseJSON);
			})
			.catch((error) => {
				console.log(error, '1111')
				reject(error);
			});
	})
}

/**
 * 
 * @param {绑定手机} dic 
 */
export function bindPhone(dic) 
{
	return new Promise((resolve, reject) => {
		Base.requestLogin({
			path: "Weixin/Account/bindWxByMobile",
			body: dic,
		})
			.then((responseJSON) => {
				console.log(responseJSON, '2222')
				resolve(responseJSON);
			})
			.catch((error) => {
				console.log(error, '1111')
				reject(error);
			});
	})
}

/**
 * App升级
 */
export function isAppUpGrade(dic) 
{
	return new Promise((resolve, reject) => {
		Base.requestLogin({
			path: "Weixin/Account/checkAppVersion",
			body: dic,
		})
			.then((responseJSON) => {
				console.log(responseJSON, '2222')
				resolve(responseJSON);
			})
			.catch((error) => {
				console.log(error, '1111')
				reject(error);
			});
	})
}