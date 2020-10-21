'use strict';
import * as types from '../../constants/page/MyCourse/MyCourseList';


/**
 * [疗程的状态 1设备未绑定， 2设备未连接 ，3设备已连接]
 * @type {Object}
 */
const initialState = {
	status: 0,
	msg: '',
};

export default function courseList(state = initialState, action) 
{
	switch (action.type) {
	case types.STOP_USE_COURSE:
		return {
			...state,
			status: action.status,
			msg: action.msg,
		}
	default:
			
		return state;
	}
}

