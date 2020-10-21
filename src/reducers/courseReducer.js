'use strict';

/**
 * 
 * @type {Object}
 */
const initialState = {
	status: 0,
	msg: '',
	userCourseList: [],
	userArticleList: [], //用户已购买的疗程
	allStatus: 0,
	user_course_id: null,
	courseId: null,
};

export default function course(state = initialState, action) 
{
	switch (action.type) 
	{
	case "USER_COURSE_LIST":
		return {
			...state,
			userCourseList: action.list,
			courseId: action.courseId, 
			user_course_id: action.user_course_id, 
			allStatus: action.allStatus,
		}
	case "ARTICLELIST":
		return {
			...state,
			userArticleList: action.data,
		}
	default:	
		return state;
	}
}

