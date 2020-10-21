import {request, } from './baseService';
//当前用户的监护人列表
export function getGuardianList(dic) 
{
	return request({
		path: 'Weixin/GuardPerson/getList',
		body: dic,
	});
}

//监护人信息和状态变更
export function editInfo(dic)
{
	return request({
		path: 'Weixin/GuardPerson/editInfo',
		body: dic,
	})
}

//被监护人编辑（修改名称）
export function edit(dic)
{
	return request({
		path: 'Weixin/Guarder/edit',
		body: dic,
	})
}

//监护人申请
export function applyGuardian(dic)
{
	return request({
		path: 'Weixin/guarder/apply',
		body: dic,
	})
}

//当前用户的被监护人列表
export function list(dic)
{
	return request({
		path: 'Weixin/Guarder/list',
		body: dic,
	})
}

//解除监护人关系
export function sever(dic)
{
	return request({
		path: 'Weixin/Guarder/sever',
		body: dic,
	})
}