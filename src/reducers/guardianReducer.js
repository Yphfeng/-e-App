'use strict';
import * as types from '../constants/user/userTypes';

const initialState = {
	userCourseList: [],
	userArticleList: [],
	userInfo: {},
	deviceArray: [],
	msg: "",
    userDeviceList: [],
    token: '',
    user_id: '',
};

export default function guardian(state = initialState, action) 
{
	switch (action.type) 
	{
	case 'ADD_GUARDIAN_RESULT':
		return {
			...state,
			token: action.user.userToken,
		}
	case "ARTICLELIST":
		return {
			...state,
			userArticleList: action.data,
		}
	case 'SUCCESS_GETUSERDEVICELIST':
		return {
			...state,
			userDeviceList: action.data,
		}
	default:
			
		return state;
	}
}