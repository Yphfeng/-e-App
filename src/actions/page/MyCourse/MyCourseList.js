import * as types from '../../../constants/page/MyCourse/MyCourseList';
import * as courseService from '../../../utils/network/courseService';
import BleApplication from '../../../utils/ble/application/application';
import BleModule from '../../../utils/ble/bleModule';
import * as qbDate from '../../../utils/qbDate';
import * as bleActions from "../../device/bleActions";
const BluetoothManager = new BleModule(); 
const Application = new BleApplication();


//疗程状态
export function closeCourse(status, msg) 
{
	return {
		type: types.STOP_USE_COURSE,
		status,
		msg,
	}
}


export function upDateTreatmentParams(data)
{
	return bleActions.getTreatmentParams(data)
	
}

export function upDateTreatmentStatus(data)
{
	return bleActions.fetchTreatmentStatus(data)
	
}


/**
 * [fetchStopCourse 暂停使用疗程]
 * @Author   袁进
 * @DateTime 2019-01-11T10:38:11+0800
 * @param    {[type]}                 id        [description]
 * @param    {[type]}                 device_sn [description]
 * @return   {[type]}                           [description]
 */
export function fetchStopCourse(deviceId, dic, firmare_sn) 
{
	return dispatch => 
	{
		var firmare = firmare_sn.substring(1, 5);
		console.log(firmare, '123123');
		if (firmare >= 1708)
		{

			//暂停使用疗程
			Application.setLaserRegimen(false, BluetoothManager, deviceId)
				.then(() => 
				{
					return courseService.pauseCourse(dic)
						.then(response => 
						{
							console.log(response, '暂停疗程成功')
							dispatch(closeCourse(2, '暂停疗程成功'))
						})
						.catch(error => 
						{
							dispatch(closeCourse(0, '暂停失败'))
						})
				})
				.catch(err => 
				{
					dispatch(closeCourse(0, '暂停失败'))
				})
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
			Application.setLaserTreatmentParameters(treatment, BluetoothManager, deviceId)
				.then(() => {
					return courseService.pauseCourse(dic)
						.then(response => {
							console.log(response,'暂停疗程成功')
							dispatch(closeCourse(2,'暂停疗程成功'))
						})
						.catch(error => {
							dispatch(closeCourse(0,'暂停失败'))
						})
					
				})
				.catch(err => {
					console.log(err,'暂停疗程失败')
					dispatch(closeCourse(0,'暂停失败'))
				})
		}
		
	}
}

/**
 * 
 * @param {针对HA01Y设备暂停疗程} deviceId 
 * @param {*} dic 
 */
export function fetchStopCourseForHA01Y(deviceId, dic, firmare_sn)
{

	return dispatch => 
	{
		var firmare = firmare_sn.substring(1, 5);
		console.log(firmare, '123123');
		if (firmare >= 1708)
		{
			//暂停使用疗程
			Application.setLaserRegimen(false, BluetoothManager, deviceId)
				.then(() => 
				{
					return courseService.pauseCourse(dic)
						.then(response => 
						{
							console.log(response, '暂停疗程成功')
							dispatch(closeCourse(2, '暂停疗程成功'))
						})
						.catch(error => 
						{
							dispatch(closeCourse(0, '暂停失败'))
						})
				})
				.catch(err => 
				{
					dispatch(closeCourse(0, '暂停失败'))
				})
		}
		else
		{
			
			var data = new Date();
			var treatment = {
				index: 16,
				gap: 5,
				periodic: 10,
				endDate: data.getFullYear() + '-'+ (data.getMonth() + 1) +'-'+data.getDate(),
				parameters: [
					{power: 4, duration: 32, startHour: 8, startMinute: 45},
					{power: 4, duration: 8, startHour: 13, startMinute: 0},
					{power: 4, duration: 32, startHour: 17, startMinute: 30}
				],
			}
			Application.setLaserTreatmentParameters(treatment, BluetoothManager, deviceId)
				.then(() => 
				{
					Application.syncTimeForHA01Y(BluetoothManager, deviceId)
						.then(() => 
						{
							Application.syncTime(BluetoothManager, deviceId)
								.then(() => 
								{
									return courseService.pauseCourse(dic)
										.then(response => 
										{
											console.log(response, '暂停疗程成功')
											dispatch(closeCourse(2, '暂停疗程成功'))
										})
										.catch(error => 
										{
											dispatch(closeCourse(0, '暂停失败'))
										})
								})
								.catch(err => 
								{
									dispatch(closeCourse(0, '暂停失败'))
								})
						})
						.catch(err => 
						{
							dispatch(closeCourse(0, '暂停失败'))
						})
					
				})
				.catch(err => 
				{
					console.log(err, '暂停疗程失败')
					dispatch(closeCourse(0, '暂停失败'))
				})
		}
	}

}


const delay = function() 
{
	return new Promise(resolve => 
	{
		setTimeout(function()
		{
			resolve();
		}, 2000);
	});
};

/**
 * [pauseCourse 使用疗程]
 * @Author   袁进
 * @DateTime 2019-01-11T10:57:26+0800
 * @param    {[type]}                 dic [description]
 * @return   {[type]}                     [description]
 */
export function beginCourse(params, deviceId, firmare_sn, treatmentStatus, course_sn) 
{
	return async dispatch => 
	{
		var firmare = firmare_sn.substring(1, 5);
		console.log(firmare, '固件编号')
		if (firmare >= 1710)
		{

			courseService.getCourseParameter(params)
				.then(async res => 
				{
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
						var _remainingDays = res.remaining_days;
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


						console.log(dic, "hahahhhaahhaaaaaaahhhahha")
						try 
						{
							console.log(course_sn, res.course_data.course_type_sn, "疗程的编号", treatmentStatus)
							if (String(course_sn) !== res.course_data.course_type_sn)
							{
								console.log(dic, "设置的参数")
								var treatmentParameters = await Application.setLaserTreatmentParameters(dic, BluetoothManager, deviceId);
								
								await delay();
								var result = await Application.setLaserRegimen(true, BluetoothManager, deviceId);
								if (result.state == "设置成功")
								{
									courseService.startCourse(params)
										.then(response => 
										{
											console.log('开启成功', response);
											//开启成功后重置疗程参数
											var treatmentParams = {
												endDate: dic.endDate,
												gap: dic.gap,
												isEmpty: false,
												parameters: dic.parameters,
												periodic: dic.periodic,
												sequence: dic.index,
											}
											var treatmentStatus = null;
											dispatch(upDateTreatmentStatus(treatmentStatus))
											dispatch(upDateTreatmentParams(treatmentParams))
											dispatch(closeCourse(3, '开启成功'));
										})
										.catch(fail => 
										{
											console.log(fail, '开启失败');
											dispatch(closeCourse(0, '开启失败'));
										});
									

									
								}
								else
								{
									dispatch(closeCourse(0, '切换失败'));
								}

							}
							else
							{
								result = await Application.setLaserRegimen(true, BluetoothManager, deviceId);
								if (result.state == "设置成功")
								{
									//设置疗程周期
									console.log(treatmentStatus, '疗程周期')
									if (treatmentStatus)
									{
										var dicStatus = {
											isOpen: treatmentStatus.treatmentStatus,
											remainDays: treatmentStatus.remainDays,
										}
										await delay();
										Application.setTreatmentStatus(dicStatus, BluetoothManager, deviceId)
											.then(() => 
											{
												courseService.startCourse(params)
													.then(response => {
														console.log('开启成功', response);
														dispatch(closeCourse(3, '开启成功'));
													})
													.catch(fail => {
														console.log(fail, '开启失败');
														dispatch(closeCourse(0, '开启失败'));
													});
											})
											.catch(err => 
											{
												dispatch(closeCourse(0, '开启失败'));
											})
									}
									else
									{
										courseService.startCourse(params)
											.then(response => {
												console.log('开启成功', response);
												//开启成功后重置疗程参数
												var treatmentParams = {
													endDate: dic.endDate,
													gap: dic.gap,
													isEmpty: false,
													parameters: dic.parameters,
													periodic: dic.periodic,
													sequence: dic.index,
												}
												var treatmentStatus = null;
												dispatch(upDateTreatmentStatus(treatmentStatus))
												dispatch(upDateTreatmentParams(treatmentParams))
												dispatch(closeCourse(3, '开启成功'));
											})
											.catch(fail => 
											{
												console.log(fail, '开启失败');
												dispatch(closeCourse(0, '开启失败'));
											});
									}
	
									
								}
								else
								{
									dispatch(closeCourse(0, '切换失败'));
								}
	
							}
							
							
						}
						catch (err) 
						{
							console.log(err, '开启失败');
							dispatch(closeCourse(0, '开启失败'));
						}
					} 
					else 
					{
						console.log("1111111111")
					
					}


				})
				.catch(error => {
					console.log(error)
					dispatch(closeCourse(0))
				})
		}
		else
		{
			courseService.getCourseParameter(params)
				.then(async res => 
				{
					console.log(res, '获取的参数')
					if (res.status == 1) 
					{
						var parametersArray = [];
						res.parameter_list.forEach(v => {
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
						var _remainingDays = res.remaining_days;
						var courseEndDate = qbDate.getNewDay(_remainingDays ? parseInt(_remainingDays) : 0);
						
						var dic = {
							index: courseNumber,
							periodic: coursePeriodic,
							gap: courseGap,
							endDate: courseEndDate,
							parameters: parametersArray,
						}

						console.log(dic, "hahahhhaahhaaaaaaahhhahha1231123123123")
						try 
						{
							await Application.setLaserTreatmentParameters(dic, BluetoothManager, deviceId);
							console.log('开启成功');
							courseService.startCourse(params)
								.then(response => {
									console.log('开启成功', response);
									dispatch(closeCourse(3, '开启成功'));
								})
								.catch(fail => {
									console.log(fail, '开启失败');
									dispatch(closeCourse(0, '开启失败'));
								});
						}
						catch (err) 
						{
							console.log(err, '开启失败');
							dispatch(closeCourse(0, '开启失败'));
						}
					} 
					else 
					{
						console.log("1111111111")
					
					}


				})
				.catch(error => {
					console.log(error)
					dispatch(closeCourse(0))
				})
		}

	}
}

/**
 * [switchCourse 切换疗程]
 * @Author   袁进
 * @DateTime 2019-01-14T16:44:43+0800
 * @param    {[type]}                 dic [description]
 * @return   {[type]}                     [description]
 */
export function switchCourse(params, deviceId, firmare_sn) 
{
	return dispatch => 
	{
		var firmare = firmare_sn.substring(1, 5);	
		if (firmare >= 1708)
		{
			courseService.getCourseParameter(params)
				.then(async res => 
				{
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
							await Application.setLaserTreatmentParameters(dic, BluetoothManager, deviceId);
							console.log('切换成疗程待启状态成功');
							await delay();
							var response = await Application.setLaserRegimen(true, BluetoothManager, deviceId);
							if (response.state == "设置成功")
							{
								courseService.updateCourse(params)
									.then(res => 
									{
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
											dispatch(upDateTreatmentStatus(treatmentStatus))
											dispatch(upDateTreatmentParams(treatmentParams))
											dispatch(closeCourse(4, '切换成功'));
										}
										else {
											dispatch(closeCourse(0, '切换失败'));
										}
									})
									.catch(err => {
										dispatch(closeCourse(0, '切换失败'));
									});
							}
							else
							{
								dispatch(closeCourse(0, '切换失败'));
							}
							
						}
						catch (err) 
						{
							console.log(err, '开启失败');
							dispatch(closeCourse(0, '切换失败'));
						}
					} 
					else 
					{
						dispatch(closeCourse(0, '切换失败'))
					
					}


				})
				.catch(error => 
				{
					console.log(error)
					dispatch(closeCourse(0, '切换失败'))
				})
		
		}	
		else
		{
			courseService.getCourseParameter(params)
				.then(async res => 
				{
					console.log(res,'获取的参数')
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
						var _remainingDays = res.remaining_days;
						var courseEndDate = qbDate.getNewDay(_remainingDays ? parseInt(_remainingDays) : 0);
						
						var dic = {
							index: courseNumber,
							periodic: coursePeriodic,
							gap: courseGap,
							endDate: courseEndDate,
							parameters: parametersArray,
						}

						try 
						{
							await Application.setLaserTreatmentParameters(dic, BluetoothManager, deviceId);
							console.log('切换成疗程待启状态成功');
							courseService.updateCourse(params)
								.then(res => {
									console.log(res, '切换的疗程1111');
									if (res.status == 1) {
										dispatch(closeCourse(4, '切换成功'));
									}
									else {
										dispatch(closeCourse(0, '切换失败'));
									}
								})
								.catch(err => {
									dispatch(closeCourse(0, '切换失败'));
								});
							
						
							
						}
						catch (err) 
						{
							console.log(err, '开启失败');
							dispatch(closeCourse(0, '切换失败'));
						}
					} 
					else 
					{
						dispatch(closeCourse(0, '切换失败'))
					
					}


				})
				.catch(error => 
				{
					console.log(error)
					dispatch(closeCourse(0, '切换失败'))
				})
		}		
	}
}