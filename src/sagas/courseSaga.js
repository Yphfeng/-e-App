import {put, call, delay, take, select, takeEvery, } from 'redux-saga/effects';
import * as cmd from '../utils/ble/cmd';
import * as courseService from '../utils/network/courseService';
import * as deviceService from '../utils/network/deviceService';
import * as qbDate from '../utils/qbDate';
import BleModule from '../utils/ble/bleModule';
import BleApplication from '../utils/ble/application/application';
var actionCallback = null;
const BluetoothManager =  BleModule.getInstance();
const Application = new BleApplication();

//获取疗程列表数据
export function* getUserCourseList(action)
{
	console.log(action, '获取的疗程列表');
	actionCallback = action.callback;
	var dic = action.dic;
	try
	{
		var res = yield call(courseService.getUserCourseList, dic);
		console.log(res)
	}
	catch (error)
	{
		console.log(error)
		res = null;
		yield put({type: 'USER_COURSE_LIST', list: [], })
		actionCallback({status: 0, message: '接口出错', })
	}
	console.log(res, '获取的疗程');
	if (!res || res.status == 0 || !res.course_list)
	{
		yield put({type: 'USER_COURSE_LIST', list: [], })
		actionCallback({status: 1, list: [], })
	}
	else
	{
		var courseArrayUI = [];
		var allStatus = 2;
		var courseId = "";
		var user_course_id = '';
		res.course_list.forEach(function (v, index) {
			if (v.course_status == 1) {
				courseId = v.course_id,
				user_course_id = v.id;
			}
			var _remainingDays = v.remaining_days ? parseInt(v.remaining_days) : 0;
			_remainingDays = _remainingDays + (v.add_day ? parseInt(v.add_day) : 0);
			var courseStatus = v.course_status;
			var course = {
				"course": index,
				'useState': courseStatus,
				'courseName': v.course_name,
				'remainingDays': _remainingDays,
				'courseid': v.course_id,
				'id': v.id,
				stage: v.stage ? v.stage : null,
			};
			courseArrayUI.push(course);
		});
		for (var i = 0; i < courseArrayUI.length; i++)
		{
			if (courseArrayUI[i].useState == 1)
			{
				allStatus = 1;
			}
		}
		yield put({type: 'USER_COURSE_LIST', list: courseArrayUI, courseId: courseId, user_course_id: user_course_id, allStatus: allStatus,})
		actionCallback({status: 1, list: courseArrayUI, allStatus: allStatus, })
	}
}

//激活疗程
export function* activeCourse(action)
{
	yield put({type: 'IS_CONNECT_OR_SEARCH', status: 2, })
	actionCallback = action.callback;
	var index = action.index;
	var state = yield select();
	var userCourseList = state.course.userCourseList;
	var willActiveCourseId = userCourseList[index].id;
	var response = yield call(courseService.activeCourse, {user_course_id: willActiveCourseId, })
	console.log(response, '激活的数据');
	if (response.code === 200)
	{
		actionCallback({status: 1, message: '激活成功'});
	}
	else
	{
		actionCallback({status: 0, message: '激活失败'});
	}

}

//使用疗程
export function* useCourse(action)
{
	yield put({type: 'IS_CONNECT_OR_SEARCH', status: 2, })
	actionCallback = action.callback;
	var index = action.index;
	var state = yield select();
	var connectedDevice = state.ble.connectedDevice;
	var firmare_version = state.ble.firmWare.firmwareVersion;
	var version = firmare_version.substring(1, 5);
	var deviceTreatmentParams = state.ble.deviceTreatmentParams;
	var treatmentStatus = state.ble.treatmentStatus;
	var params = {
		device_sn: connectedDevice.device_sn,
		user_course_id: state.course.userCourseList[index].id,
	}
	if (version >= 1710)
	{
		var response = yield call(courseService.getCourseParameter, params);
		if (response.status === 1)
		{
			var parametersArray = [];
			response.parameter_list.forEach(v =>
			{
				let item = {
					power: parseInt(v.power_level),
					duration: parseInt(v.start_duration),
					startHour: parseInt(v.start_time.split(":")[0]),
					startMinute: parseInt(v.start_time.split(":")[1]),
				}
				parametersArray.push(item);
			})
			var courseNumber = parseInt(response.course_data.course_type_sn);
			var coursePeriodic = parseInt(response.course_data.course_cycle_work_days);
			var courseGap = parseInt(response.course_data.course_cycle_rest_days);
			var _remainingDays = response.remaining_days;
			if (_remainingDays.split("-").length == 3)
			{
				var time = qbDate.getNewDay(0);
				var endDate = qbDate.dateDiff(_remainingDays, time)
			}
			else
			{
				endDate = _remainingDays
			}
			console.log(endDate, '疗程剩余天数')
			var dic = {
				index: courseNumber,
				periodic: coursePeriodic,
				gap: courseGap,
				endDate: endDate,
				parameters: parametersArray,
			}
			console.log(dic, "写入的疗程参数")
			try
			{
				var course_sn = deviceTreatmentParams ? deviceTreatmentParams.sequence : '';
				console.log(course_sn, response.course_data.course_type_sn, "疗程的编号", treatmentStatus)
				if (String(course_sn) !== response.course_data.course_type_sn)
				{
					//使用的和设备中的不是同一个疗程
					console.log(dic, "设置的参数")
					var treatmentParameters = yield call(Application.setLaserTreatmentParameters, dic, BluetoothManager, connectedDevice.bleId);

					yield delay(100);
					var result = yield call(Application.setLaserRegimen, true, BluetoothManager, connectedDevice.bleId);
					if (result.state == "设置成功")
					{
						var _result = yield call(courseService.startCourse, params);
						// eslint-disable-next-line max-depth
						if (_result.status === 1)
						{
							//开启成功后重置疗程参数
							var treatmentParams = {
								endDate: dic.endDate,
								gap: dic.gap,
								isEmpty: false,
								parameters: dic.parameters,
								periodic: dic.periodic,
								sequence: dic.index,
							}
							treatmentStatus = null;
							yield put({type: 'GET_TREATMENT_PARAMS', data: treatmentParams, })
							yield put({type: 'GET_TREATMENT_STATUS', data: treatmentStatus, })
							actionCallback({status: 1, message: '开启成功'});
						}
						else
						{
							actionCallback({status: 0, message: '开启失败'});
						}
					}
					else
					{
						actionCallback({status: 0, message: '开启失败', });
					}

				}
				else
				{
					result = yield call(Application.setLaserRegimen, true, BluetoothManager, connectedDevice.bleId);
					if (result.state == "设置成功")
					{
						//设置疗程周期
						console.log(treatmentStatus, '疗程周期')
						// eslint-disable-next-line max-depth
						if (treatmentStatus)
						{
							var dicStatus = {
								isOpen: treatmentStatus.treatmentStatus,
								remainDays: treatmentStatus.remainDays,
							}
							yield delay(100);
							// eslint-disable-next-line max-depth
							try
							{
								yield call(Application.setTreatmentStatus, dicStatus, BluetoothManager, connectedDevice.bleId);
								res = yield call(courseService.startCourse, params)
								// eslint-disable-next-line max-depth
								if (res.status === 1)
								{
									actionCallback({status: 1, message: '开启成功'});
								}
								else
								{
									actionCallback({status: 0, message: '开启失败', });
								}
							}
							catch (error)
							{
								actionCallback({status: 0, message: '开启失败', });
							}
						}
						else
						{
							response = yield call(courseService.startCourse, params);
							// eslint-disable-next-line max-depth
							if (response.status === 1)
							{
								treatmentParams = {
									endDate: dic.endDate,
									gap: dic.gap,
									isEmpty: false,
									parameters: dic.parameters,
									periodic: dic.periodic,
									sequence: dic.index,
								}
								treatmentStatus = null;
								yield put({type: 'GET_TREATMENT_PARAMS', data: treatmentParams, })
								yield put({type: 'GET_TREATMENT_STATUS', data: treatmentStatus, })
								actionCallback({status: 1, message: '开启成功', });

							}
							else
							{
								actionCallback({status: 0, message: '开启失败', });
							}
						}


					}
					else
					{
						actionCallback({status: 0, message: '开启失败', });
					}

				}


			}
			catch (err)
			{
				actionCallback({status: 0, messeage: '开启失败', })
			}

		}
		else
		{
			actionCallback({status: 0, messeage: response.message, })
		}
	}
	else
	{
		res = yield call(courseService.getCourseParameter, params);
		if (res.status == 1)
		{
			parametersArray = [];
			res.parameter_list.forEach(v => {
				let item = {
					power: parseInt(v.power_level),
					duration: parseInt(v.start_duration),
					startHour: parseInt(v.start_time.split(":")[0]),
					startMinute: parseInt(v.start_time.split(":")[1]),
				}
				parametersArray.push(item);
			})
			courseNumber = parseInt(res.course_data.course_type_sn);
			coursePeriodic = parseInt(res.course_data.course_cycle_work_days);
			courseGap = parseInt(res.course_data.course_cycle_rest_days);
			_remainingDays = res.remaining_days;
			courseEndDate = qbDate.getNewDay(_remainingDays ? parseInt(_remainingDays) : 0);

			dic = {
				index: courseNumber,
				periodic: coursePeriodic,
				gap: courseGap,
				endDate: courseEndDate,
				parameters: parametersArray,
			}
			try
			{
				yield call(Application.setLaserTreatmentParameters, dic, BluetoothManager, connectedDevice.bleId);
				console.log('开启成功');
				response = yield call(courseService.startCourse, params)
				if (response.status === 1) {
					actionCallback({status: 1, message: '开启成功'});
				} else {
					actionCallback({status: 0, message: '开启失败'});
				}
			}
			catch (err)
			{
				actionCallback({status: 0, message: '开启失败'});
			}
		}
		else
		{
			actionCallback({status: 0, message: res.message, });

		}

	}
}

//切换疗程
export function* switchCourse(action)
{
	yield put({type: 'IS_CONNECT_OR_SEARCH', status: 2, })
	actionCallback = action.callback;
	var index = action.index;
	var state = yield select();
	var connectedDevice = state.ble.connectedDevice;
	var firmare_version = state.ble.firmWare.firmwareVersion;
	var version = firmare_version.substring(1, 5);
	var params = {
		device_sn: connectedDevice.device_sn,
		user_course_id: state.course.userCourseList[index].id,
	}
	if (version >= 1708)
	{
		var res = yield call(courseService.getCourseParameter, params)

		console.log(res, '获取的参数')
		if (res.status == 1)
		{
			var parametersArray = [];
			res.parameter_list.forEach(v =>
			{
				let item = {
					power: parseInt(v.power_level),
					duration: parseInt(v.start_duration),
					startHour: parseInt(v.start_time.split(":")[0]),
					startMinute: parseInt(v.start_time.split(":")[1]),
				}
				parametersArray.push(item);
			})
			var courseNumber = parseInt(res.course_data.course_type_sn);
			var coursePeriodic = parseInt(res.course_data.course_cycle_work_days);
			var courseGap = parseInt(res.course_data.course_cycle_rest_days);
			var _remainingDays = String(res.remaining_days);
			if (_remainingDays.split("-").length == 3)
			{
				var time = qbDate.getNewDay(0);
				var endDate = qbDate.dateDiff(_remainingDays, time)
			}
			else
			{
				endDate = _remainingDays
			}
			var dic = {
				index: courseNumber,
				periodic: coursePeriodic,
				gap: courseGap,
				endDate: endDate,
				parameters: parametersArray,
			}

			try
			{
				yield call(Application.setLaserTreatmentParameters, dic, BluetoothManager, connectedDevice.bleId);
				console.log('切换成疗程待启状态成功');
				yield delay(500);
				//设置疗程周期为第一天
				var dic = {
					isOpen: 1,
					remainDays: coursePeriodic,
				}
				yield call(Application.setTreatmentStatus, dic, BluetoothManager, connectedDevice.bleId);
				yield delay(500);
				//开启激光疗程
				var response = yield call(Application.setLaserRegimen, true, BluetoothManager, connectedDevice.bleId);
				if (response.state == "设置成功")
				{
					res = yield call(courseService.updateCourse, params)

					console.log(res, '切换的疗程1111');
					if (res.status == 1)
					{
						var treatmentParams = {
							endDate: dic.endDate,
							gap: dic.gap,
							isEmpty: false,
							parameters: dic.parameters,
							periodic: dic.periodic,
							sequence: dic.index,
						}
						var treatmentStatus = null;
						yield put({type: 'GET_TREATMENT_PARAMS', data: treatmentParams, })
						yield put({type: 'GET_TREATMENT_STATUS', data: treatmentStatus, })
						actionCallback({status: 1, message: '切换成功'});
					}
					else
					{
						actionCallback({status: 0, message: '切换失败'});
					}


				}
				else
				{
					console.log(err, '切换失败3');
					actionCallback({status: 0, message: '切换失败'});
				}

			}
			catch (err)
			{
				console.log(err, '切换失败');
				actionCallback({status: 0, message: '切换失败'});
			}
		}
		else
		{
			console.log(err, '切换失败2');
			actionCallback({status: 0, message: '切换失败'});

		}





	}
	else
	{
		res = yield call(courseService.getCourseParameter, params)

		console.log(res,'获取的参数')
		if (res.status == 1)
		{
			parametersArray = [];
			res.parameter_list.forEach(v =>
			{
				let item = {
					power: parseInt(v.power_level),
					duration: parseInt(v.start_duration),
					startHour: parseInt(v.start_time.split(":")[0]),
					startMinute: parseInt(v.start_time.split(":")[1]),
				}
				parametersArray.push(item);
			})
			courseNumber = parseInt(res.course_data.course_type_sn);
			coursePeriodic = parseInt(res.course_data.course_cycle_work_days);
			courseGap = parseInt(res.course_data.course_cycle_rest_days);
			_remainingDays = res.remaining_days;
			var courseEndDate = qbDate.getNewDay(_remainingDays ? parseInt(_remainingDays) : 0);

			dic = {
				index: courseNumber,
				periodic: coursePeriodic,
				gap: courseGap,
				endDate: courseEndDate,
				parameters: parametersArray,
			}

			try
			{
				yield call(Application.setLaserTreatmentParameters, dic, BluetoothManager, connectedDevice.bleId);
				console.log('切换成疗程待启状态成功');
				res = yield call(courseService.updateCourse, params)
				console.log(res, '切换的疗程1111');
				if (res.status == 1) {
					actionCallback({status: 1, message: '切换成功'});
				}
				else {
					actionCallback({status: 0, message: '切换失败'});
				}




			}
			catch (err)
			{
				actionCallback({status: 0, message: '切换失败'});
			}
		}
		else
		{
			actionCallback({status: 0, message: '切换失败'});
		}
	}
}

//暂停疗程
export function* stopCourse(action)
{
	yield put({type: 'IS_CONNECT_OR_SEARCH', status: 2, })
	actionCallback = action.callback;
	var index = action.index;
	var state = yield select();
	var connectedDevice = state.ble.connectedDevice;
	var firmare_version = state.ble.firmWare.firmwareVersion;
	var version = firmare_version.substring(1, 5);
	var params = {
		device_sn: connectedDevice.device_sn,
		user_course_id: state.course.userCourseList[index].id,
	}
	if (version >= 1708)
	{

		//暂停使用疗程
		yield call(Application.setLaserRegimen, false, BluetoothManager, connectedDevice.bleId)

		var response = yield call(courseService.pauseCourse, params)
		if (response.status === 1)
		{
			actionCallback({status: 1, message: '暂停成功'});
		}
		else
		{
			actionCallback({status: 0, message: '暂停失败'});
		}
	}
	else
	{
		var treatment = {
			index: 16,
			gap: 5,
			periodic: 10,
			endDate: "2017-0-0",
			parameters: [
				{power: 4, duration: 32, startHour: 8, startMinute: 45, },
				{power: 4, duration: 8, startHour: 13, startMinute: 0},
				{power: 4, duration: 32, startHour: 17, startMinute: 30}
			]
		}
		yield call(Application.setLaserTreatmentParameters, treatment, BluetoothManager, connectedDevice.bleId)

		response = yield call(courseService.pauseCourse, params)
		console.log(response, '暂停的返回')
		if (response.status === 1)
		{
			actionCallback({status: 1, message: '暂停成功'});
		}
		else
		{
			actionCallback({status: 0, message: '暂停失败'});
		}
	}
}

//写入设备
var addDay = 0; //增加的天数
export function* writeCourse(action)
{
	actionCallback = action.callback;
	yield put({type: 'IS_CONNECT_OR_SEARCH', status: 5, })
	var state = yield select();
	var connectedDevice = state.ble.connectedDevice;
	deviceId = connectedDevice.bleId;
	var firmWare = state.ble.firmWare;
	var firmWare_sn = firmWare.firmwareVersion.substring(1, 3);
	var dic = action.dic;
	addDay = dic.addDay;
	var courseInfo = dic.courseInfo;
	var response = yield call(deviceService.writeInformation, {device_sn: connectedDevice.device_sn, });
	console.log(response, '请求的参数', courseInfo.course_id)
	var treatment = response.data.deviceInfo.parameter_list.length;
	var course_data = response.data.deviceInfo.course_data;
	var id = response.data.deviceInfo.course_data.id;
	console.log(dic, '写入的信息', firmWare_sn);
	var result = {
		id: dic.id,
		device_sn: dic.device_sn,
	}
	if (firmWare_sn >= 17)
	{
		console.log(treatment, courseInfo, id, '写入的信息12312');
		if (!treatment || courseInfo.course_id !== id)
		{
			var giveResult = yield call(courseService.writeUserCourseDevice, result);
			console.log(giveResult, '写入的信息123123')
			// eslint-disable-next-line max-depth
			if (giveResult.status == 1)
			{
				console.log(giveResult, '写入疗程成功')
				actionCallback({status: 1, message: '写入成功', })
			}
			else
			{
				actionCallback({status: 2, message: '写入失败', })
			}
		}
		else
		{
			giveResult = yield call(courseService.writeUserCourseDevice, result);
			console.log(giveResult, '写入的回调');
			if (giveResult.status == 1)
			{
				yield call(Application.getLaserTreatmentParameters, BluetoothManager, deviceId);
			}
			else
			{
				actionCallback({status: 2, message: '写入失败', })
			}
		}
		return;
	}
	giveResult = yield call(courseService.writeUserCourseDevice, result);
	console.log(giveResult, 'axas12')
	if (giveResult.status == 1)
	{
		actionCallback({status: 1, message: '写入成功', })
	}
	else
	{
		actionCallback({status: 2, message: '写入失败', })
	}
}

//已购疗程的回调
var treatmentStatus = new Object(), params = "", treatmentParams = new Object(), dateParams, deviceId,isSetTreatmentStatus;
export function* returnCourse(action)
{
	var dataObject = action.dataObject;
	switch (dataObject.cmd)
	{
	case cmd.kGXYL_GetlaserTreatmentStatus:
		//获取激光疗程周期状态
		var dataStatus= dataObject.body.treatmentStatus;
		console.log(dataObject, "获取激光周期的回调", treatmentParams)
		treatmentStatus = dataObject.body;
		parametersArray = [];
		var parameters = treatmentParams.parameters;
		parameters.forEach(v =>
		{
			let item = {
				power: parseInt(v.power),
				duration: parseInt(v.duration),
				startHour: parseInt(v.startHour),
				startMinute: parseInt(v.startMinute),
			}
			parametersArray.push(item);
		})
		var courseNumber = parseInt(treatmentParams.sequence);
		var coursePeriodic = parseInt(treatmentParams.periodic);
		var courseGap = parseInt(treatmentParams.gap);
		var courseEndDate = treatmentParams.endDate;
		console.log(courseEndDate, '123123')
		if (courseEndDate)
		{
			var arr = courseEndDate.split("-");
			var version = firmwareVersion.substring(1).length > 3 ? firmwareVersion.substring(1) : firmwareVersion.substring(1) + "0";
			console.warn(firmwareVersion, '指定的版本号...........', version)
			if (version.substring(0, 5) >= 1708 )
			{
				if (arr.length == 3)
				{
					var time = qbDate.getNewDay(0);
					dateParams = qbDate.dateDiff(time, courseEndDate);
					dateParams = Number(dateParams) + Number(addDay)
				}
				else
				{
					dateParams = Number(courseEndDate) + Number(addDay)
				}
			}
			else
			{
				if (arr.length == 3)
				{
					time = qbDate.getNewDay(0);
					dateParams = qbDate.dateDiff(time, courseEndDate);
					console.log(dateParams, '时间1')
					dateParams = Number(dateParams) + Number(addDay)
					console.log(dateParams, '时间2')
					dateParams = qbDate.getNewDay(dateParams);
					console.log(dateParams, '时间3')

				}
				else
				{
					//剩余时间转截止日期
					dateParams = Number(courseEndDate) + Number(addDay);
					dateParams = qbDate.getNewDay(dateParams);
				}
			}

		}
		console.log(dateParams, '写入的截止日期')
		dic = {
			index: courseNumber,
			periodic: coursePeriodic,
			gap: courseGap,
			endDate: String(dateParams),
			parameters: parametersArray,
		}
		console.log(dic, '设置的激光')
		yield call(Application.setLaserTreatmentParameters, dic, BluetoothManager, deviceId)
		break;
	case cmd.kGXYL_GetLaserRegimenParameters:
		//获取激光疗程参数
		treatmentParams = dataObject.body;

		yield call(Application.getTreatmentStatus, BluetoothManager, deviceId);
		break;
	case cmd.kGXYL_LaserRegimenParameters:
	//设置激光疗程参数的回调
		if (dataObject.body.setState == "设置成功")
		{
			var dic = {
				isOpen: treatmentStatus.treatmentStatus,
				remainDays: treatmentStatus.remainDays,
			};
			console.log(dic, '希尔疗程周期')
			isSetTreatmentStatus = true;
			yield call(Application.setTreatmentStatus, dic, BluetoothManager, deviceId);

		}
		else
		{
			actionCallback({status: 0, message: '写入失败'})
		}
		break;
	case cmd.kGXYL_SetlaserTreatmentStatus:
	//写入疗程周期的回调
		if (!isSetTreatmentStatus)
		{
			return;
		}
		isSetTreatmentStatus = false;
		console.log(dataObject, "写入疗程周期成功的回调")
		if (dataObject.body.setState == "设置成功")
		{
			version = firmwareVersion.substring(1).length > 3 ? firmwareVersion.substring(1) : firmwareVersion.substring(1) + "0";
			console.log(firmwareVersion, '指定的版本号...........', version)
			if (Number(version.substring(0, 4)) >= 1708 )
			{
				console.log("1231231开启成功", actionCallback)
				//版本号在1708以上时开启疗程,根据状态是否开启暂停疗程
				//直接开启成功
				actionCallback({status: 1, message: '写入成功'})
				yield delay(1000);
				yield call(Application.setLaserRegimen, true, BluetoothManager, deviceId);

			}
			else
			{
				//直接开启成功
				actionCallback({status: 1, message: '写入成功'})
			}


		}
		break;
	case cmd.kGXYL_setLaserRegimen:
		console.log(dataObject, '设置激光疗程暂停111')
		// if (dataObject.body.setState == "设置成功")
		// {
		// 	//直接开启成功
		// 	actionCallback({status: 1, message: '写入成功'})
		// }
		break;
	default:
		console.log("结尾")
		break;
	}
}

//我的疗程回调
export function* returnMyCourse(action) {

}

//获取已购疗程
export function* getUserArticalCourseList(action)
{
	actionCallback = action.callback;
	var dic = action.dic;
	try
	{
		var res = yield call(courseService.getUserArticleList, dic);
		console.log(res, '获取已购疗程')
		if (res.status == 1)
		{
			yield put({type: 'ARTICLELIST', data: res.data, })
			actionCallback({status: 1, data: res.data, })
		}
		else
		{
			yield put({type: 'ARTICLELIST', data: [], })
			actionCallback({status: 0, data: [], })
		}
	} catch (error) {
		yield put({type: 'ARTICLELIST', data: [], })
		actionCallback({status: 0, data: [], })
	}
}
