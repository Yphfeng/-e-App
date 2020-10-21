/**
 * ios权限验证
 */
import {
	NativeModules, //导入
} from 'react-native';


//在JavaScript中调用Object-C定义的方法，需要先导入NativeModules
//如果在iOS中设置了导出了类的名字，此处需要和导出的名字一致
const manager = NativeModules.PermissionsManager;

/*相机权限*/
export function cameraPermission()
{

	return new Promise((resolve, reject) =>
	{
		manager.cameraPermission().then(data =>
		{
			resolve(data);
		}).catch(err =>
		{
			reject(err);
		});
	});
}

/*相机权限*/
export function photoPermission()
{

	return new Promise((resolve, reject) =>
	{
		manager.photoPermission().then(data =>
		{
			resolve(data);
		}).catch(err =>
		{
			reject(err);
		});
	});
}

/*位置权限*/
export function locationPermission()
{

	return new Promise((resolve, reject) =>
	{
		manager.locationPermission().then(data =>
		{
			resolve(data);
		}).catch(err =>
		{
			reject(err);
		});
	});
}

/*麦克风权限*/
export function microphonePermission()
{

	return new Promise((resolve, reject) =>
	{
		manager.microphonePermission().then(data =>
		{
			resolve(data);
		}).catch(err =>
		{
			reject(err);
		});
	});
}

/*通知状态*/
export function notificationStatus()
{

	return new Promise((resolve) =>
	{
		manager.notificationStatus((status)=>
		{
			resolve(status);
		});
	});
}
