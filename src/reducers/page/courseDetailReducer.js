'use strict';
import * as types from '../../constants/page/MyCourse/MyCourseDetail';


/**
 * [蓝牙的初始状态，0蓝牙未开启， 1设备未绑定， 2设备未连接 ，3设备已连接]
 * @type {Object}
 */
const initialState = {
    course_data: [],
    course_parameter: [],
    status: 0
};

export default function courseDetail(state = initialState, action) {
    switch (action.type) {
        case types.GET_COURSE_DETAIL:
            return {
                ...state,
                course_data: action.course_data,
                course_parameter: action.course_parameter,
                status: action.status
            }
        default:
            
            return state;
    }
}

