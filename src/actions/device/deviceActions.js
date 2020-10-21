//取消绑定
export const confirmCancel = (dic, callback) => ({
	type: 'CONFIRM_UNBIND',
	callback: callback,
	dic: dic,
})

//获取用户绑定的设备
export const getUserDeviceList = (dic, callback) => ({
	type: 'GET_USER_DEVICELIST',
	callback: callback,
	dic: dic,
})