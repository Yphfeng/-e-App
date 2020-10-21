import * as types from '../../../constants/page/MyCourse/MyCourseDetail';
import * as courseService from '../../../utils/network/courseService';

export function getCourseDetail(course_data,course_parameter,status) {
	return {
		type: types.GET_COURSE_DETAIL,
		course_data,
		course_parameter,
		status,
	}
}

/**
 * 获取疗程详情
 */
export function fetchCourseDetail(dic) 
{
	return dispatch => 
	{
		return courseService.getCourseDetail(dic)
			.then(res => 
			{
				console.log(res,'获取详情')
				if (res.status == 1) 
				{
					dispatch(getCourseDetail(res.course_data,res.course_parameter,1))
				}
				else
				{
					dispatch(getCourseDetail([],[],0))
				}
			})
			.catch(err => 
			{
				dispatch(getCourseDetail([],[],0))
			})
	}
}