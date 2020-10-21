/**
 * @author lam
 */
'use strict';

import React, {Component, } from 'react'
import {
	Text,
	View,
	TextInput,
	ScrollView,
	StyleSheet,
	StatusBar,
	Dimensions, BackHandler,
	TouchableOpacity,
	Image,
	Alert,
	Platform,
} from 'react-native'
import NavBar from '../../../common/NavBar'
import Item from '../../../common/Item'
import Toast, { DURATION, } from 'react-native-easy-toast'
import {RadioGroup, RadioButton, } from 'react-native-flexi-radio-button';
import * as qbDate from '../../../utils/qbDate';
import * as courseService from '../../../utils/network/courseService';
import * as userService from '../../../utils/network/userService';
import * as deviceService from "../../../utils/network/deviceService";
import Icon from 'react-native-vector-icons/Ionicons';
import { connect, } from 'react-redux'
import * as userActions from '../../../actions/user/userActions';
import * as courseActions from '../../../actions/device/courseActions';
import DashLine from '../../../common/DashLine';
import {statusBarHeight, height, width, } from '../../../utils/uiHeader';
import * as webSocketActions from '../../../actions/webSocketActions';
import * as deviceActions from '../../../actions/device/deviceActions';
import Spinner from 'react-native-loading-spinner-overlay';
import * as bleActions from "../../../actions/device/bleActions";

const contentHeight = height - NavBar.topbarHeight - statusBarHeight;

//FontAwesome
class BindingBuyCourse extends Component
{
	static navigationOptions = {
		header: null,
	}
	constructor(props)
	{
		super(props);
		this.state = {
			spinner: false,
			spinnerText: '赠送中...',
			userCourseList: [],
			display: false,
			text: '',
			index: 0,
			tabIndex: 0,
			tabsTitleName: [{name: "写入设备", }, {name: "赠送疗程", }],
			isCourseFind: false,
			giveContent: {
				avatar: "",
				name: '用户名称',
				notes: '仅可赠送给分享E疗的注册用户',
				isGive: 0,
			},
			userDeviceList: this.props.userDeviceList,
			isSelectDevice: [],
			guardian: null,
		}
	}
	componentWillMount()
	{
		BackHandler.addEventListener('hardwareBackPress', this.onBackAndroid);
	}
	componentDidMount()
	{
		this.didBlurSubscription = this.props.navigation.addListener(
			'didFocus',
			payload =>
			{
				var guardian = this.props.navigation.state.params ? this.props.navigation.state.params.guardian : null;
				var dic = new Object();
				if (guardian)
				{
					this.setState({
						guardian: guardian,
					})
					console.log(guardian, '被监护人信息', this.props.navigation.state.params)
					dic.armariumScienceSession = guardian.userToken;
					var device_sn = guardian.deviceSn;
					this.setState({
						courseInfo: this.props.navigation.state.params.courseInfo,
						display: true,
					})
					console.log(11111111111111, this.state.userDeviceList)
					this.props.getUserDeviceList(dic, this.onBindDeviceCallback);
					return;
				}

				var device_sn = this.props.connectedDevice ? this.props.connectedDevice.device_sn : '';
				this.setState({
					courseInfo: this.props.navigation.state.params.courseInfo,
					display: true,
					userDeviceList: this.props.userDeviceList,
				})
				var userDeviceList = this.state.userDeviceList;
				if (this.props.connectStatus === 4)
				{
					var findIndex = userDeviceList.findIndex(item =>
					{
						return item.device_sn === device_sn;
					})
				}
				else
				{
					findIndex = 0;
				}
				console.log(this.props.navigation.state.params, '新的路由231212122')

				var index = this.props.navigation.state.params.a ? this.props.navigation.state.params.a : 0;
				var type = this.props.navigation.state.params.type;
				if (type && type === 'choose')
				{
					findIndex = index;
				}
				if (this.state.userDeviceList.length < 1)
				{
					return;
				}
				var isFind = this.state.userDeviceList[findIndex]
				this.index = findIndex;
				console.log(isFind, 'isFind', findIndex);
				if (isFind)
				{
					this.setState({
						isSelectDevice: isFind,
					})
					dic.device_sn = isFind.device_sn;
					if (guardian)
					{
						dic.device_sn = guardian.deviceSn;
					}
					console.log(dic, 'asas')
					this.props.getUserCourseList(dic, this.onFetchCallback);
				}
				else
				{
					this.setState({
						isSelectDevice: this.state.userDeviceList[findIndex],
					})
					this.index = findIndex
					dic.device_sn = this.state.userDeviceList[findIndex].device_sn;
					if (guardian)
					{
						dic.device_sn = guardian.deviceSn;
					}
					console.log(dic, 'asas')
					this.props.getUserCourseList(dic, this.onFetchCallback);
				}
			}
		);

		console.log(this.props.navigation.state.params.courseInfo,'收到的数据状态');

	}

	onBindDeviceCallback = res =>
	{
		console.log(res, '用户绑定的设备');
		var userDeviceList = res.data;

		var isFind = userDeviceList.find(item => {
			return item.device_sn === this.state.guardian.deviceSn;
		})
		console.log(isFind, 'isFind');
		var dic = new Object();
		if (isFind)
		{
			this.setState({
				isSelectDevice: isFind,
			})
			dic.device_sn = isFind.device_sn;
			dic.armariumScienceSession = this.state.guardian.userToken
			this.props.getUserCourseList(dic, this.onFetchCallback);
		}
	}

	onFetchCallback = res =>
	{
		var message = res.message;
		if (message === "接口出错")
		{
			this.refs.toast.show(<View style={{justifyContent: "center", alignItems: 'center'}}>
				<Icon name="ios-checkmark-outline" size={55} color="#fff"></Icon>
				<Text style={{color: '#fff', }}>{message}</Text>
			</View>)
		}
	}
	async componentWillReceiveProps(nextProps)
	{
		this.setState({
			firmWare: nextProps.firmWare,
			deviceTreatmentParams: nextProps.deviceTreatmentParams,
			laserTreatmentStatus: nextProps.laserTreatmentStatus,
			deviceInformation: nextProps.deviceInformation,
			device_sn: nextProps.device_sn,
			user: nextProps.user,
			socketMsg: nextProps.socketMsg,
			connectedDevice: nextProps.connectedDevice,
		})
		console.log(nextProps, '收到的新属性')
		var userCourseList = nextProps.userCourseList;
		var course_id = this.props.navigation.state.params.courseInfo.course_id;
		var isCourseFind = userCourseList.find((v, index, userCourseList) => {
			return v.courseid == course_id
		})
		if (isCourseFind)
		{
			this.setState({
				isCourseFind: true,
				isCourseFindValue: isCourseFind,
			})
		}
		else
		{
			this.setState({
				isCourseFind: false,
			})
		}

		if  (nextProps.connectLoadingStatus == 7 && nextProps.connectLoadingStatus !== this.props.connectLoadingStatus)
		{
			console.log("1231321", this.state.addDay)
			//获取激光疗程
			this.props.fetchTreatmentParams(this.state.addDay, nextProps.deviceId);
		}
		if (nextProps.connectLoadingStatus == 8 && nextProps.connectLoadingStatus !== this.props.connectLoadingStatus)
		{
			this.setState({
				spinner: false,
			})
			var result = {
				id: this.state.courseInfo.id,
				device_sn: this.state.isSelectDevice.device_sn,
			}
			var guardian = this.props.navigation.state.params ? this.props.navigation.state.params.guardian : null;

			if (guardian)
			{
				result.armariumScienceSession = guardian.userToken;
			}
			var giveResult = await courseService.writeUserCourseDevice(result);
			if (giveResult.status == 1)
			{
				console.log(giveResult, '写入疗程成功')
				this.setState({
					spinner: false,
				})
				this.props.loading(4);
				this.props.navigation.navigate("CourseSuccessPage", {type: "writeSuccess", })
				if (nextProps.socketMsg)
				{
					this.props.sendSocketMessage(9, nextProps.socketMsg.guardian, nextProps.socketMsg.underGuardian, '写入成功' );
				}
			}

		}
		if (nextProps.socketMsg && nextProps.socketMsg.sn == 5 && nextProps.socketMsg !== this.props.socketMsg)
		{
			if (nextProps.socketMsg.url == "健康服务2")
			{
				if (nextProps.socketMsg.type == 1)
				{
					var courseInfo = this.props.navigation.state.params.courseInfo;
					var type = "write";
					var res = {courseInfo: courseInfo, type: type, }
					this.bindSet(res);
				}
				else if (nextProps.socketMsg.type == 2)
				{
					console.log(nextProps.socketMsg, '收到111')
					courseInfo = this.props.navigation.state.params.courseInfo;
					var mobile = nextProps.socketMsg.phone;
					type = "give";
					this.setState({
						courseInfo: courseInfo,
						mobile: mobile,
					})
					console.log(mobile, '手机号');
					res = {courseInfo: courseInfo, type: type, mobile: mobile, }
					this.bindSet(res);

				}
			}
		}
		else if (nextProps.socketMsg && nextProps.socketMsg.sn == 9 && nextProps.socketMsg !== this.props.socketMsg)
		{
			if (nextProps.socketMsg.title == "写入成功" || nextProps.socketMsg.title == "赠送成功")
			{
				this.props.navigation.navigate("RemoteOperation")
			}
			this.setState({
				spinner: false,
			})
			this.refs.toast.show(<View style={{justifyContent: "center", alignItems: 'center'}}>
				<Icon name="ios-checkmark-outline" size={55} color="#fff"></Icon>
				<Text style={{color: '#fff', }}>{nextProps.socketMsg.title}</Text>
			</View>)
		}
		else if (nextProps.socketMsg && nextProps.socketMsg.sn == 0)
		{
			this.setState({
				spinner: false,
			})
			this.props.remoteLoading(false);
		}
	}


	componentWillUnmount()
	{
		BackHandler.removeEventListener('hardwareBackPress', this.onBackAndroid);
	}

	onBackAndroid = () =>
	{
		this.props.navigation.goBack();
		return true;
	};

	back()
	{
		this.props.navigation.pop();
	}
	//弹出提示
	alert(title, text, fail, callback)
	{
		Alert.alert(title, text, [{text: '取消', onPress: ()=>{ fail() }}, { text:'重试',onPress:()=>{ callback()} }]);
	}
	addDevice()
	{
		this.props.navigation.navigate("BleAddMethodsPage")
	}
	detail (res)
	{
		var courseId = res.id;
		this.props.navigation.push("MyCourseDetailPage",{courseId: courseId, })
	}

	async bindSet(res)
	{
		let giveResult, result;
		try
		{
			var type = res.type;
			var courseInfo = res.courseInfo;
			console.log(res, '先休息休息')
			var addDay = courseInfo.course_days;
			this.setState({
				addDay: addDay,
			})
			switch (type)
			{
			case "write":
				if (this.state.guardian)
				{
					console.log(this.state.guardian.underGuardian, this.props.user_id, "写入疗程1111111")
					//写入疗程
					this.props.remoteLoading(true, '写入中');
					this.props.serviceSend(5, this.state.guardian.underGuardian, this.props.user_id, '健康服务', '健康服务2', 1);
					return;
				}
				var connectedDevice = this.state.connectedDevice;
				if (this.props.connectStatus !== 4)
				{
					this.refs.toast.show(
						<View style={{justifyContent: "center", alignItems: 'center'}}>
							<Icon name="ios-checkmark-outline" size={55} color="#fff"></Icon>
							<Text style={{color: '#fff', }}>请连接设备</Text>
						</View>
					)
					if (this.state.socketMsg)
					{
						//返回信息给监护人
						this.props.sendSocketMessage(9, this.state.socketMsg.guardian, this.state.socketMsg.underGuardian, "被监护人设备未连接" );
					}
					return;
				}
				if (this.state.isSelectDevice.device_sn === connectedDevice.device_sn)
				{
					this.setState({
						spinner: true,
						spinnerText: '写入中...',
					})
					var dic = {
						id: this.state.courseInfo.id,
						device_sn: this.state.isSelectDevice.device_sn,
						courseInfo: courseInfo,
						type: 1,
						addDay: addDay,
					}
					this.props.writeCourse(dic, this.onWriteCallback);
				}
				else
				{
					dic = {
						id: this.state.courseInfo.id,
						device_sn: this.state.isSelectDevice.device_sn,
						type: 0,
						courseInfo: courseInfo,
						addDay: addDay,
					}
					this.props.writeCourse(dic, this.onWriteCallback);
				}

				break;
			case "give":
				if (this.state.guardian)
				{
					//赠送疗程
					this.props.remoteLoading(true, "赠送中");
					console.log(this.state.mobile, this.state.guardian.underGuardian, this.props.user_id)
					this.props.serviceSend(5, this.state.guardian.underGuardian, this.props.user_id, '健康服务', '健康服务2', 2, 0, this.state.mobile );
					return;
				}
				if (!this.state.socketMsg)
				{
					if (this.state.giveContent.isGive !== 2)
					{
						return;
					}
				}

				this.setState({
					spinner: true,
					spinnerText: '赠送中...',
				})
				var mobile = this.state.mobile;
				if (this.state.socketMsg)
				{
					mobile = res.mobile;
				}
				result = {
					id: this.state.courseInfo.id,
					user_id: this.props.user_id,
					course_id: this.state.courseInfo.course_id,
					mobile: mobile,
				}
				console.log(result, '撒打算打算')
				giveResult = await courseService.giveCourse(result);
				if (giveResult.status == 1)
				{
					console.log(giveResult, '赠送疗程成功')
					this.setState({
						spinner: false,
					})
					this.props.navigation.navigate("CourseSuccessPage", {type: "giveSuccess", guardian: this.state.guardian })
					if (this.state.socketMsg)
					{
						this.props.sendSocketMessage(9, this.state.socketMsg.guardian, this.state.socketMsg.underGuardian, "赠送成功" );
					}

				}
				else
				{
					console.log(giveResult, '赠送疗程err')
					this.setState({
						spinner: false,
					})
					if (this.state.socketMsg)
					{
						this.props.sendSocketMessage(9, this.state.socketMsg.guardian, this.state.socketMsg.underGuardian, "赠送失败" );
					}

					this.alert("赠送失败", "疗程赠送过程中遇到一些问题，本次赠送失败，是否重新赠送?",() => {

					}, () => {
						this.bindSet({type: "give", })
					})
				}
				break;
			}
		}
		catch (error)
		{
			console.log(error);
		}

	}

	onWriteCallback = res =>
	{
		console.log(res, '写入的回调11111111111')
		var status = res.status;
		if (status === 1)
		{
			this.setState({
				spinner: false,
			})
			this.refs.toast.show(<View style={{justifyContent: "center", alignItems: 'center'}}>
				<Icon name="ios-checkmark-outline" size={55} color="#fff"></Icon>
				<Text style={{color: '#fff', }}>{res.message}</Text>
			</View>);
			setTimeout(() =>
			{


				this.props.navigation.navigate("CourseSuccessPage", {type: "writeSuccess", guardian: this.state.guardian, })


			}, 1000)
			if (this.state.socketMsg)
			{
				this.props.sendSocketMessage(9, this.state.socketMsg.guardian, this.state.socketMsg.underGuardian, '写入成功' );
			}
		}
		else
		{
			this.setState({
				spinner: false,
			})
			this.refs.toast.show(<View style={{justifyContent: "center", alignItems: 'center'}}>
				<Icon name="ios-checkmark-outline" size={55} color="#fff"></Icon>
				<Text style={{color: '#fff', }}>{res.message}</Text>
			</View>);
			if (this.state.socketMsg)
			{
				this.props.sendSocketMessage(9, this.state.socketMsg.guardian, this.state.socketMsg.underGuardian, '写入失败' );
			}
		}
	}

	onSelect(index, value)
	{
		this.setState({
			index: value,
		})
	}

	switchTab(res)
	{
		var index = res.index;
		this.setState({
			tabIndex: index,
		})
	}

	async giveUser(mobile)
	{
		var TEL_REGEXP = /^1([38][0-9]|4[579]|5[0-3,5-9]|6[6]|7[0135678]|9[89])\d{8}$/;
		var giveData = this.state.giveContent;
		if (!TEL_REGEXP.test(mobile))
		{
			giveData.name = "用户名称";
			giveData.notes = "仅可赠送给分享医疗的注册用户";
			giveData.isGive = 0;
			giveData.avatar = "";
			this.setState({
				giveContent: giveData,
			})
			return false;
		}
		try
		{
			var dic = new Object();
			if (this.state.guardian)
			{
				dic.armariumScienceSession = this.state.guardian.userToken;
			}
			dic.mobile = mobile;
			let userInfo = await userService.getCourseToUserInfo(dic)
			console.log(userInfo, '参数');
			if (userInfo.status == 1)
			{
				giveData.avatar = userInfo.data.avatar_url;
				giveData.name = userInfo.data.nickname;
				giveData.notes = "注册用户，可直接赠送";
				giveData.isGive = 2;
				this.setState({
					giveContent: giveData,
					mobile: mobile,
				})
			}
			else if (userInfo.msg == "自己不能够赠送给自己")
			{
				giveData.name = "注册用户";
				giveData.notes = "自己不能够赠送给自己";
				giveData.isGive = 1;
				giveData.avatar = "";
				this.setState({
					giveContent: giveData,
				})
			}
			else
			{
				giveData.name = "未注册用户";
				giveData.notes = "请该用户先注册账号";
				giveData.isGive = 1;
				giveData.avatar = "";
				this.setState({
					giveContent: giveData,
				})
			}
		}
		catch (err)
		{
			console.log(err, '参数err');
		}
	}

	chooseDevice()
	{
		var index = this.index > 0 ? this.index : 0;
		var guardian = this.props.navigation.state.params.guardian;
		this.props.navigation.navigate("ChooseDevicePage", {index: index, guardian: guardian, });
	}

	render()
	{
		let list = null ;
		let operate1 = null;
		let operate2 = null;
		let courseInfo = this.state.courseInfo;
		let topView = null, buyDateView = null, tabsTitleView = null, tabsContent = null, writeDetailView = null, imageAvtar = null, bottomView = null;

		if (!this.state.display)
		{
			list = null
		}
		else
		{
			if (courseInfo)
			{
				topView = (<View style={styles.topView}>
					<View style={styles.imgStyle}>
						<Image source={require('../../../img/course_img.png')} roundAsCircle={true} style={styles.img} />
					</View>
					<View style={styles.listContent}>
						<View style={styles.listTitle}>
							<Text style={{ color: '#000', fontSize: 18, fontWeight: 'bold', }}>{courseInfo.course_goods_name}</Text>
							<View style={styles.dot}><Text></Text></View>
							<Text style={{ color: '#24A090', fontSize: 18, }}>{courseInfo.course_days}天</Text>
						</View>
						<View style={styles.buyDate}>
							<Text style={styles.buyText}>{qbDate.DateFormat(courseInfo.add_time, 0)}</Text>
							<Text style={[styles.buyText, {paddingHorizontal: 5, }]}>{qbDate.DateFormat(courseInfo.add_time, 1)}</Text>
							{buyDateView}
						</View>
					</View>
				</View>)
				tabsTitleView = this.state.tabsTitleName.map((item, index) => {
					return (<TouchableOpacity onPress={this.switchTab.bind(this, {index: index, })}  key={index} style={{borderBottomColor: index == this.state.tabIndex ? "#24A090" : '#fff',borderBottomWidth: 2, paddingHorizontal: 8, paddingVertical: 7, }}><Text style={{color: index == this.state.tabIndex ? "#24A090" : '#999999', fontSize: 16, }}>{item.name}</Text></TouchableOpacity>)
				})
				if (courseInfo.source == 1)
				{
					buyDateView = (<Text style={styles.buyText} >购买</Text>)
				}
				else
				{
					buyDateView = (<Text style={styles.buyText} >赠送</Text>)
				}
			}
			if (this.state.tabIndex == 0)
			{
				if (this.state.userDeviceList.length > 0)
				{
					if (this.state.isCourseFind)
					{
						writeDetailView = (<View>
							<View style={styles.detailWhole}>
								<View style={styles.leftTitle}>
									<Text style={{fontSize: 16, paddingBottom: 5, }}>{courseInfo.course_goods_name}</Text>
									<Text style={{fontSize: 12, color: '#666666', }}>当前剩余天数： {this.state.isCourseFindValue.remainingDays}天</Text>
								</View>
								<View style={{width: 20, height: 70, flexDirection: 'column', overflow: 'hidden',marginTop: -1,marginRight: -10, }}>
									<View style={{height: 20, width: 20, borderRadius: 100,borderColor: '#FFD692',borderWidth: 1, backgroundColor: '#fff', marginTop: -10, }}><Text></Text></View>
									<View style={{flex: 1, }}><DashLine /></View>
									<View style={{height: 20, width: 20, borderRadius: 100, borderColor: '#FFD692', borderWidth: 1, backgroundColor: '#fff', marginBottom: -10, }}><Text></Text></View>
								</View>

								<View style={styles.rightDay}><Text style={{color: '#F59800', fontSize: 12, }}>+</Text><Text style={{color: '#F59800', fontSize: 18, paddingHorizontal: 5, }}>{courseInfo.course_days}</Text><Text style={{color: '#F59800', fontSize: 12, }}>天</Text></View>
							</View>
							<View style={{justifyContent: 'center', alignItems: 'center', paddingVertical: 20, }}>
								<Text style={{fontSize: 10, color: '#999999'}}>写入设备后共计{Number(this.state.isCourseFindValue.remainingDays) + Number(courseInfo.course_days)}天</Text>
							</View>
						</View>)
					}
					else
					{
						writeDetailView = (<View>
							<View style={styles.detailWhole}>
								<View style={styles.leftTitle}>
									<Text style={{fontSize: 16, paddingBottom: 5, }}>{courseInfo.course_goods_name}</Text>
									<Text style={{fontSize: 12, color: '#666666', }}>当前设备暂无此疗程</Text>
								</View>
								<View style={{width: 20, height: 70, flexDirection: 'column', overflow: 'hidden',marginTop: -1,marginRight: -10, }}>
									<View style={{height: 20, width: 20, borderRadius: 100,borderColor: '#FFD692',borderWidth: 1, backgroundColor: '#fff', marginTop: -10, }}><Text></Text></View>
									<View style={{flex: 1, }}><DashLine /></View>
									<View style={{height: 20, width: 20, borderRadius: 100, borderColor: '#FFD692', borderWidth: 1, backgroundColor: '#fff', marginBottom: -10, }}><Text></Text></View>
								</View>
								<View style={styles.rightDay}><Text style={{color: '#F59800', fontSize: 16, paddingHorizontal: 5, }}>新增疗程</Text></View>

							</View>
							<View style={{justifyContent: 'center', alignItems: 'center', paddingVertical: 20, }}>
								<Text style={{fontSize: 10, color: '#999999'}}>写入设备后共计{courseInfo.course_days}天</Text>
							</View>
						</View>)
					}
					if (this.state.isSelectDevice)
					{
						operate1 = (<View>
							<View style={{width: width - 50, flexDirection: 'row',justifyContent: "space-between", alignItems: 'center', paddingHorizontal: 10,  }}>
								<View style={{flexDirection: 'row', justifyContent: 'center', alignItems: 'center', }}>
									<Image source={require('../../../img/device_img_03.png')} style={styles.deviceImg} />

									<View style={{paddingLeft: 10, }}>
										<View style={{flexDirection: 'row',justifyContent: 'flex-start', alignItems: 'center', }}>
											<Text numberOfLines={1} style={{fontSize: 16, }}>{this.state.isSelectDevice.device_alias ? this.state.isSelectDevice.device_alias : this.state.isSelectDevice.device_name}</Text>
										</View>
										<Text style={{fontSize: 13, color: '#7F8389'}}>编号： {this.state.isSelectDevice.device_sn}</Text>
									</View>
								</View>
								{!this.state.guardian ? <TouchableOpacity onPress={this.chooseDevice.bind(this)} style={{width: 52, height: 26, borderWidth: 1, borderColor: '#24A090', justifyContent: 'center', alignItems: 'center', borderRadius: 13, }}>
									<Text style={{fontSize: 12, color: '#24A090'}}>切换</Text>
								</TouchableOpacity>	: null}
							</View>
							<View style={{marginTop: 20, }}><Text>写入详情:</Text></View>
							<View>{writeDetailView}</View>
						</View>)
					}
					else
					{
						operate1 = null;
					}

				}
				else
				{
					operate1 = (<View style={{width: width - 50 , flexDirection: 'row',justifyContent: 'flex-start',alignItems: 'center'}}>
						<Image source={require('../../../img/device_img_03.png')} style={styles.deviceImg} />
						<Text style={{paddingLeft: 20}}>暂无绑定设备</Text>
					</View>)
				}
				list =  (
					<View style={styles.list}>
						<View><Text>当前绑定设备:</Text></View>
						<View style={{paddingVertical: 10, }}>{operate1}</View>

					</View>
				)
				bottomView = (<TouchableOpacity onPress={this.bindSet.bind(this, {type: 'write', courseInfo: courseInfo })} style={styles.btnAdd}>
					<Text style={{color: '#fff', }}>写入</Text>
				</TouchableOpacity> )
			}
			else
			{
				var avatar = this.state.giveContent.avatar;
				if (!avatar)
				{
					imageAvtar = (<View><Image source={require("../../../img/course_img.png")} style={styles.userAvtar} /></View>)
				}
				else
				{
					imageAvtar = (<View><Image source={{uri: avatar, }} style={styles.userAvtar} /></View>)
				}
				writeDetailView = (<View style={styles.giveTitle}>
					<Icon name="ios-calculator" size={24}></Icon>
					<TextInput
						placeholder="填写用户手机号"
						underlineColorAndroid={"transparent"}
						keyboardType="numeric"
						style={{paddingLeft: 10, flex: 1, fontSize: 16, }}
						onChangeText={this.giveUser.bind(this)}
						maxLength={11}
					/>
				</View>)
				operate1 = (<View>
					{writeDetailView}
					<View style={{marginTop: 20, marginBottom: 20, }}><Text>用户信息:</Text></View>
					<View style={styles.userInfo}>
						{imageAvtar}
						<View style={{flexDirection: 'column', flex: 1, justifyContent: 'center', paddingLeft: 10, }}>
							<Text style={{fontSize: 16, color: '#4A4A4A', paddingBottom: 5, }}>{this.state.giveContent.name}</Text>
							<Text style={{fontSize: 13, color: this.state.giveContent.isGive !== 1 ? '#7F8389' : '#FE4949', }}>{this.state.giveContent.notes}</Text>
						</View>
					</View>
				</View>)

				list =  (
					<View style={styles.list}>
						<View><Text>赠送到用户:</Text></View>
						<View style={{paddingVertical: 20, }}>{operate1}</View>

					</View>
				)
				bottomView = (<TouchableOpacity onPress={this.bindSet.bind(this,{type: "give", courseInfo: courseInfo, })} style={[styles.btnAdd,{backgroundColor: this.state.giveContent.isGive == 2 ? '#24a090' : '#8ebdb7', }]}>
					<Text style={{color: '#fff', }}>赠送</Text>
				</TouchableOpacity> )
			}
		}

		return (
			<View style={{flex: 1, backgroundColor: "#f3f3f3"}}>
				<View style={styles.sBar} backgroundColor={'#24a090'}/>
				<NavBar
					title="疗程激活"
					leftIcon="ios-arrow-back"
					leftPress={this.back.bind(this)}
				/>
				<ScrollView style={{height: contentHeight, }}>
					<View style={styles.topWholeView}>{topView}</View>
					<View style={styles.midView}>
						<View style={styles.tabsTitle}>
							{tabsTitleView}
						</View>
						<View style={{height: contentHeight - 300, }}>{list}</View>
						<View style={styles.bottomView}>
							{bottomView}
						</View>
					</View>
				</ScrollView>
				<Toast ref="toast"
					position="center"
				/>
				<Spinner
					visible={this.state.spinner}
					textContent={this.state.spinnerText}
					textStyle={styles.spinnerTextStyle}
				/>
			</View>
		)
	}
}

function mapStateToProps(state) {
	console.log(state,'子组件的属性')
	return {
		msg: state.courseList.msg,
		connectStatus: state.ble.connectStatus,
		userCourseList: state.course.userCourseList,
		course_id: state.course.courseId,
		user_id: state.loginIn.user ? state.loginIn.user.user_id : null,
		user_course_id: state.course.user_course_id,
		allStatus: state.course.allStatus,
		connectedDevice: state.ble.connectedDevice,
		stopStatus: state.courseList.status,
		userDeviceList: state.user.userDeviceList,
		firmWare: state.ble.firmWare,
		deviceTreatmentParams: state.ble.deviceTreatmentParams,
		laserTreatmentStatus: state.ble.laserTreatmentStatus,
		deviceInformation: state.ble.deviceInformation,
		connectLoadingStatus: state.ble.connectLoadingStatus,
		socketMsg: state.webSocketReducer.socketMsg,
		user: state.loginIn.user,
	}
}

function mapDispatchToProps(dispatch)
{
	return {
		getUserDeviceList: (dic, callback) => dispatch(deviceActions.getUserDeviceList(dic, callback)),
		writeCourse: (dic, callback) => dispatch(courseActions.writeCourse(dic, callback)),
		getUserCourseList: (dic, callback)=> dispatch(courseActions.getUserCourseList(dic, callback)),
		loading: (s) => dispatch(bleActions.loading(s)),
		fetchTreatmentParams: (s, d) => dispatch(bleActions.fetchTreatmentParams(s, d)),
		sendSocketMessage: (a, b, c, d, e, f, g) => dispatch(webSocketActions.sendMessage(a, b, c, d, e, f, g)),
		serviceSend: (a, b, c, d, e, f, g, h) => dispatch(webSocketActions.serviceSend(a, b, c, d, e, f, g, h)),
		remoteLoading: (status, text) => dispatch(webSocketActions.remoteLoading(status, text)),
	}
}

export default connect(mapStateToProps, mapDispatchToProps)(BindingBuyCourse)


const styles = StyleSheet.create({
	title: {
		paddingHorizontal: 16,
		paddingVertical: 8,
		color: "#666",
	},
	sBar: {
		height: statusBarHeight,
		width: width,
	},
	topWholeView: {
		paddingVertical: 15,
		paddingHorizontal: 15,
		marginBottom: 20,
		backgroundColor: '#fff',
		height: 100,
		width: width - 20,
		marginLeft: 10,
		marginRight: 10,
		marginTop: 20,
	},
	topView: {
		flexDirection: 'row',
		justifyContent: 'flex-start',
		alignItems: 'center',
	},
	hr: {
		flexDirection: 'row',
		justifyContent: 'flex-end',
		alignItems: 'center',
	},
	imgStyle: {
		width: 65,
		height: 65,
		marginBottom: 10,
		borderRadius: 50,
		flexDirection: 'column',
		justifyContent: 'center',
		alignItems: 'center',
		marginRight: 15,

	},
	img: {
		width: 65,
		height: 65,
	},
	listContent: {
		flexDirection: 'column',
		justifyContent: 'flex-start',
		alignItems: 'flex-start',
	},
	dot: {
		width: 5,
		height: 5,
		borderRadius: 100,
		backgroundColor: 'rgba(36,160,144,.3)',
		marginLeft: 5,
		marginRight: 5,
	},
	buyDate: {
		flexDirection: 'row',
		justifyContent: 'center',
		alignItems: 'center',
	},
	buyText: {
		fontSize: 12,
		paddingTop: 7,
		color: '#666666',

	},
	list: {
		paddingTop: 20,
	},
	deviceImg: {
		width: 52,
		height: 52,
	},
	listTitle: {
		flexDirection: 'row',
		justifyContent: 'center',
		alignItems: 'center',

	},
	btnAdd: {
		height: 45,
		width: width - 100,
		backgroundColor: '#24a090',
		borderRadius: 20,
		justifyContent: 'center',
		alignItems: 'center',
	},
	btnBuy: {
		width: width - 50,
		height: 30,
		backgroundColor: '#24a090',
		borderRadius: 20,
		marginBottom: 20,
		justifyContent: 'center',
		alignItems: 'center',
	},
	total: {
		flexDirection: 'column',
		justifyContent: 'center',
		alignItems: 'center',
	},
	operate: {
		flexDirection: 'row',
		alignItems: 'center',
		justifyContent: 'center',
		borderBottomWidth: 1,
		borderBottomColor: '#f4f4f4',
	},
	operateItem: {
		paddingVertical: 6,
		flex:1,
		flexDirection: 'row',
		alignItems: 'center',
		justifyContent: 'center',
	},
	btnText: {
		fontSize: 12,
		color: '#fff',
	},
	midView: {
		backgroundColor: '#fff',
		paddingVertical: 15,
		paddingHorizontal: 15,
		height: contentHeight - 165,
		width: width - 20,
		marginLeft: 10,
		marginRight: 10,
	},
	device_sn: {
		flex: 1,
		marginRight: 20,
	},
	bottomView: {
		flexDirection: 'row',
		justifyContent: 'center',
		alignItems: 'center',
	},
	tabsTitle: {
		flexDirection: 'row',
		justifyContent: "space-around",
		alignItems: 'center',
	},
	detailWhole: {
		marginTop: 20,
		width: width - 60,
		height: 70,
		borderRadius: 4,
		borderWidth: 1,
		borderColor: '#FFD692',
		flexDirection: 'row',
		backgroundColor: '#fffbf4',
	},
	rightDay: {
		flexDirection: 'row',
		height: 70,
		justifyContent: 'center',
		alignItems: 'center',
		minWidth: 100,
	},
	leftTitle: {
		flex: 1,
		justifyContent: 'center',
		alignItems: "flex-start",
		paddingLeft: 20,
	},
	giveTitle: {
		flexDirection: 'row',
		borderBottomColor: '#DEDEDE',
		borderBottomWidth: 1,
		paddingHorizontal: 10,
		justifyContent: 'center',
		alignItems: 'center',
	},
	userAvtar: {
		width: 53,
		height: 53,
		borderRadius: 26,
	},
	userInfo: {
		flexDirection: 'row',
		alignItems: 'center',
	},
	spinnerTextStyle: {
		color: '#FFF',
	},
});
