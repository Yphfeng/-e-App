'use strict';
import * as userTypes from '../../constants/user/userTypes';

import * as userService from '../../utils/network/userService';
import * as courseService from '../../utils/network/courseService';


/**
 * [closeCourse 暂停使用疗程]
 * @Author   袁进
 * @DateTime 2019-01-09T17:05:11+0800
 * @return   {[type]}                 [description]
 */
export function closeCourse(){

}


/**
 * [saveUserInfo 用户信息]
 * @Author   袁进
 * @DateTime 2019-03-19T18:34:31+0800
 * @param    {[type]}                 data [description]
 * @return   {[type]}                      [description]
 */
export function saveUserInfo(data) {
	return {
		type: userTypes.SAVE_USERINFO,
		data
	}
}