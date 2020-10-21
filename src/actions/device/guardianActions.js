//获取被监护人的设备信息
export const getGuardianDeviceList = dic => ({
	type: 'GET_GUARDIAN_DEVICE_LIST',
	dic: dic,
})

//添加监护人信息
export const addGuardian = user => ({
	type: 'ADD_GUARDIAN',
	user: user,
})