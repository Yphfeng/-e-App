/**
 * 数据展示的处理类
 */



import DataService from '../../../../../utils/network/dataService';
import DateExtands from '../../../../../utils/extends/dateExtands';
import ArrayExpand from '../../../../../utils/extends/arrayExpand';

export default class BLERequestHandle 
{

	constructor() 
	{
		this.dataservice = new DataService();
		this.index = 0;
	}
	/**
		* [movementHandle 从服务器获运动数据]
		* @Author   袁进
		* @DateTime 2018-11-26T10:57:31+0800
		* @param    {String}                 subkind      [运动数据的类别]
		* @param    {[type]}                 responseData [服务器返回的数据]
		* @param    {[type]}                 complete     [成功的回调]
	*/
	movementHandle(subkind, responseData, complete) 
	{
		this.index++
		console.log(subkind, '处理123123')
		var _data = new Object;
		_data.total = {}
		switch (subkind) 
		{
		case 'day':
			if (responseData) 
			{
				const jsonData = responseData;//已在最底层转JSON，业务层不用转了
				_data.total = {
					steps: jsonData.steps_num || 0,
					distance: parseFloat(jsonData.length / 1000).toFixed(3) || 0,
					calorie: jsonData.calorie || 0,
				}
			}
			else
			{
				_data.total = {
					steps: 0,
					distance: 0,
					calorie: 0,
				}
			}
			break;
		case 'week':
			// _data.values = [];
			// _data.categories = [];
			console.log(responseData, '数据week')
			if (responseData) 
			{
				var total_steps_num = responseData.total_steps_num;
				var total_length = parseFloat(responseData.total_length / 1000).toFixed(3);
				var total_calorie = responseData.total_calorie;
				var _time = responseData.week_date;
				var week_steps = responseData.week_data;
				_data.total.time = _time;
				_data.total.total_steps_num = total_steps_num;
				_data.total.total_steps_length = total_length;
				_data.total.total_calorie = total_calorie;
				_data.total.week_steps = week_steps;
				// _data.total.distance = parseFloat(duration / 1000).toFixed(3);
			} 
			else 
			{
				// for (var i = 0; i < 7; i++) {
				//   _data.values.push(0);
				//   let dateString = qbDate.getNewDay(-i).replace(/-/g, "/");
				//   _data.categories.push(dateString);
				// }
			}
			break;
		case 'month':
			// _data.values = [];
			// _data.categories = ['本周', '前一周', '前二周', '前三周'];
			if (responseData) 
			{
				for (var i = 0; i < 4; i++) 
				{
					var itemSteps = 0;
					var itemDistance = 0;
					var itemCalorie = 0;
					if (responseData[i]) 
					{
						responseData[i].forEach(v => 
						{
							itemSteps += parseInt(v.steps_num);
							itemDistance += parseInt(v.length);
							itemCalorie += parseInt(v.calorie);
						})
					}
					// _data.values.push(itemSteps);
					_data.total.steps += itemSteps;
					_data.total.distance = (parseFloat(_data.total.distance) + parseFloat(itemDistance / 1000)).toFixed(3);
					_data.total.calorie += itemCalorie
				}
			} 
			else 
			{
				// for (var i = 0; i < 4; i++) {
				//   _data.values.push(0);
				// }
			}
			break;
		default: return;
		}
		_data.index = this.index
		complete(_data);
	}

	/**
	 * [heartRateHandle 从服务器获取心率数据]
	 * @Author   袁进
	 * @DateTime 2018-11-26T11:07:28+0800
	 * @param    {String}                 subkind      [心率的时间段]
	 * @param    {Object}                 responseData [响应的数据]
	 * @param    {Object}                 requestData  [请求的参数]
	 * @param    {callback}                 complete     [成功的回调]
	 */
	heartRateHandle(subkind, responseData, requestData, complete) {
		console.log(responseData, '心率数据。。。')
		this.index++
		var _hrMax = 0;
		var _hrMin = 0;
		var _categories = [];
		var _point = [];
		var _values = [];
		var _MMValues = [];
		// 00: 00 -- 07:45
		for (var i = 0; i < 32; i++) 
		{
			var _timeNum = i * 15;
			let _hour = parseInt(_timeNum / 60);
			let _hourString = _hour < 10 ? "0" + _hour : _hour;
			let _minute = _timeNum % 60;
			let _minuteString = _minute == 0 ? "00" : _minute;
			_categories.push(_hourString + ":" + _minuteString);
			// _categories.push(String(i));
			_point.push(i);
		}
		// 8: 00 -- 23: 45
		for (var i = 32; i < 96; i++) {
			var _timeNum = i * 15;
			let _hour = parseInt(_timeNum / 60);
			let _minute = _timeNum % 60;
			let _hourString = _hour < 10 ? "0" + _hour : _hour;
			let _minuteString = _minute == 0 ? "00" : _minute;
			_categories.push(_hourString + ":" + _minuteString);
			// _categories.push(String(i));
			_point.push(i);
		}
		const _date = new Date();
		const _day = {
			data: [],
		};

		var _jsonData = responseData.heart_rate ? JSON.parse(responseData.heart_rate.data) : [null, null, null, null, null, null, null];
		// console.log(_jsonData);
		if (_jsonData) {
			_point.forEach((v) => {
				// console.log(v, _jsonData[v]);
				let _value = _jsonData[v];
				if (_value) {
					_day.data.push({ y: _value });
					_MMValues.push(_value);
				} else {
					_day.data.push({ y: 0 });
				}
			})
		} else {
			_point.forEach(() => {
				_day.data.push({ y: 0 });
			})
		}
		_values.push(_day);
		// 求最大值，最小值
		if (_MMValues.length > 0) {    
			_hrMax = Math.max.apply(null, _MMValues);
			_hrMin = Math.min.apply(null, _MMValues);
		}

		complete({
			max: _hrMax ? _hrMax : 0,
			min: _hrMin ? _hrMin : 0,
			values: _values,
			categories: _categories,
			index: this.index
		});
	}

	/**
	* [laserHandle 从服务器获取激光数据]
	* @Author   袁进
	* @DateTime 2018-11-26T11:17:30+0800
	* @param    {String}                 subkind         [激光的时间段]
	* @param    {Object}                 responseData    [响应的数据]
	* @param    {Object}                 courseParameter [请求的疗程参数]
	* @param    {callback}                 complete        [成功的回调]
	*/
	laserHandle(subkind, responseData, courseParameter, complete) {
		// console.log(subkind, responseData, courseParameter);
		this.index++
		const _date = new Date();
		const _values = [];
		const _categories = [];
		var _totalNum = 0;
		var _totalDuration = 0;
		var daylaserTotal = [];
		var weeklaserTotal = [];
		var weeklaserNumTotal = [];
		courseParameter.forEach(v => {
			const _day = {
				data: [],
				name: this.startTimeHandle(v.start_time),
			}
			_values.push(_day);
		})

		switch (subkind) {
			case 'day' :
				if(responseData) {
					console.log('激光天的数据',responseData);
					daylaserTotal = responseData || null;
				}else{
					daylaserTotal = null
				}
			break;
			case 'week':
				if (responseData) {
					weeklaserTotal = responseData || []; 
				} else {
					weeklaserTotal = []
				}
			break;
			default:
			break;
		}
		complete({
			daylaserTotal: daylaserTotal,
			weeklaserTotal: weeklaserTotal,
			index: this.index
		});
	}
	/**
	 * [startTimeHandle description]
	 * @Author   袁进
	 * @DateTime 2018-11-26T11:23:31+0800
	 * @param    {[type]}                 _startTime [description]
	 * @return   {[type]}                            [description]
	 */
	startTimeHandle(_startTime) {
		let _startTimes = _startTime.split(':');
		// console.log(_startTime);
		return (_startTimes[0].length == 1 ? '0' + _startTimes[0] : _startTimes[0]) + ":" + (_startTimes[1].length == 1 ? '0' + _startTimes[1] : _startTimes[1]);
	}
/**
 * 以下为对外暴露接口
 * subkind: 当天，当月的运动数据
 */
	movement(subkind, complete, fail) {
		var _type;
		switch (subkind) {
			case 'day': _type = 1; break;
			case 'week': _type = 2; break;
			case 'month': _type = 3; break;
			// case 'years': _type = 3; break;
			default: return;
		}
		this.dataservice.getMotionData({ motion_type: _type, week_num: 1, })
		.then((_responseJSON) => {
			console.log(_responseJSON,'周数据');
			if (_responseJSON.status == 1) {
				console.log('周数据')
				this.movementHandle(subkind, _responseJSON.data, complete)
			}else if(_responseJSON.status == 2){
				this.movementHandle(subkind, _responseJSON.data, complete)
			} else {
				fail();
			}
		})
		.catch((error) => {
			console.log(error);
			fail()
		})
	}

	// 改接口
	laser(subkind, data, courseParameter, complete, fail) {
		// console.log('bleRequestHandle', subkind, data, courseParameter);
		switch(subkind) {
			case 'day': _type = 1; break;
			case 'week': _type = 2; break;
			default: return;
		}
		this.dataservice.getLaserData({laser_type: _type})
		.then((_responseJSON) => {
			console.log(_responseJSON);
			console.log(_responseJSON, '激光周的数据')
			if (_responseJSON.status == 1) {
				this.laserHandle(subkind, _responseJSON.laser_info, courseParameter, complete)
			}else if(_responseJSON.status == 2) {
				this.laserHandle(subkind, _responseJSON.laser_info, courseParameter, complete)
			}else {
				fail();
			}
		})
		.catch((error) => {
			// console.log(error);
			fail();
		})
	}

	// 心率的接口
	heartRate(subkind, data, complete, fail) {
		// console.log(subkind,data);
		this.dataservice.getHeartRateData(data)
		.then((_responseJSON) => {
			// console.log(_responseJSON);
			if (_responseJSON.status == 1) {
				this.heartRateHandle(subkind, _responseJSON, data, complete)
			}else if(_responseJSON.status == 2){
				this.heartRateHandle(subkind, _responseJSON, data, complete)
			} else {
				fail()
			}
		})
		.catch((error) => {
			// console.log('请求出错', error);
			fail()
		});
	}

/**
 * 获取用户激光疗程列表及疗程编号
 */
	courseList(complete, fail) {

		this.dataservice.getUserCourseSnList()
		.then(_responseJSON => {
			if (_responseJSON.status == 1) {
				complete(_responseJSON);
			} else {
				fail();
			}
		})
		.catch(error => {
			fail();
		})
	}
}


