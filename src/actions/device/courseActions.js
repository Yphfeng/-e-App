
import * as courseService from '../../utils/network/courseService';
import BleApplication from '../../utils/ble/application/application';
import BleModule from '../../utils/ble/bleModule';
import * as qbDate from '../../utils/qbDate';
const BluetoothManager = new BleModule(); 
const Application = new BleApplication();

//激活疗程
export const activeCourse = (index, callback) => ({
	type: 'ACTIVE_COURSE',
	callback: callback,
	index: index,
})

//获取用户疗程
export const getUserCourseList = (dic, callback) => ({
	type: 'GET_USER_COURSE_LIST',
	callback: callback,
	dic: dic,
})

//获取用户已购疗程
export const getUserArticalCourseList = (dic, callback) => ({
	type: 'GET_ARTICAL_COURSE_LIST',
	dic: dic,
	callback: callback,
})

//使用疗程
export const useCourse = (index, callback) => ({
	type: 'USE_COURSE',
	callback: callback,
	index: index,
})

//切换疗程
export const switchCourse = (index, callback) => ({
	type: 'SWITCH_COURSE',
	callback: callback,
	index: index,
})

//暂停疗程
export const stopCourse = (index, callback) => ({
	type: 'STOP_COURSE',
	callback: callback,
	index: index,
})

//写入疗程
export const writeCourse = (dic, callback) =>({
	type: 'WRITE_COURSE',
	dic: dic,
	callback: callback,
})

