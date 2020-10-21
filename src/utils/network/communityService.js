import { request, requestLogin, } from './baseService';

/**
 * [isBindPhone 获取列表]
 * @Author   袁进
 * @DateTime 2018-12-20T18:10:07+0800
 * @return   {Boolean}                [description]
 */
export function getList() 
{
	return request({
		path: 'Weixin/Circle/list',
		body: null,
	})
}

export function giveThumbsUp()
{
	return request({
		path: 'Weixin/Circle/giveThumbsUp',
		body: null,
	})
}