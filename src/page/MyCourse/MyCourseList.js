/**
 * @author lam
 */
'use strict';

import React, {Component, } from 'react'
import {
	Text,
	View,
	ScrollView,
	StyleSheet,
	StatusBar,
	Dimensions, BackHandler,
	TouchableOpacity,
	Image,
	Alert,
	Platform,
} from 'react-native'
import NavBar from '../../common/NavBar';
import Item from '../../common/Item';
import Toast, { DURATION, } from 'react-native-easy-toast'
import Spinner from 'react-native-loading-spinner-overlay';
import Icon from 'react-native-vector-icons/Ionicons'
import * as webSocketActions from '../../actions/webSocketActions';
import CommonDialog from '../../common/Modal';
import { connect, } from 'react-redux'
import { fetchStopCourse, } from '../../actions/page/MyCourse/MyCourseList';
import * as courseActions from '../../actions/device/courseActions';
import {statusBarHeight, height, width, } from '../../utils/uiHeader';

const contentHeight = height - NavBar.topbarHeight - statusBarHeight

//FontAwesome
class MyCoursePage extends Component
{
	static navigationOptions = {
		header: null,
	}
	constructor(props)
	{
		super(props);
		this.state = {
			userCourseList: [],
			display: false,
			spinnerText: '',
			spinner: false,
			laserTreatmentStatus: this.props.laserTreatmentStatus,
			user: this.props.user,
			remoteConnectStatus: true,
			connectStatus: this.props.connectStatus,
			connectedDevice: this.props.connectedDevice,
			dataProgress: this.props.dataProgress,
			socketMsg: this.props.socketMsg,
		}
		this.index = 0;
		this.guardian = null;
	}
	componentWillMount()
	{
		BackHandler.addEventListener('hardwareBackPress', this.onBackAndroid);
	}
	componentDidMount()
	{
		var guardian = this.props.navigation.state.params ? this.props.navigation.state.params.guardian : null;
		console.log(guardian, '监护人', this.props.navigation.state)
		this.guardian = guardian;
		if (guardian)
		{
			var user = this.props.user;
			this.guardian = guardian;
			var dic = new Object();
			dic.device_sn = this.guardian.deviceSn;
			dic.armariumScienceSession = this.guardian.userToken;

			this.props.getUserCourseList(dic, this.onFetchCallback);
		}
		else
		{
			if (this.props.connectedDevice)
			{
				dic = {device_sn: this.props.connectedDevice.device_sn, }
				this.props.getUserCourseList(dic, this.onFetchCallback);
				setTimeout(() => {
					if (this.state.socketMsg)
					{
						console.log(this.state.socketMsg, '监护人信息1212', this.state.connectStatus)

						if (this.state.socketMsg.type && this.state.socketMsg.a)
						{
							var type = this.state.socketMsg.type;
							var typeValue = ""
							if (type == 1)
							{
								typeValue = "active"
							}
							else if (type == 2)
							{
								typeValue = "use"
							}
							else if (type == 3)
							{
								typeValue = "switch"
							}
							else
							{
								typeValue = "stop"
							}
							//各种操作。。。
							this.index = this.state.socketMsg.a;
							this.events({type: typeValue, index: this.state.socketMsg.a, })
						}
					}

				}, 1000)
			}
			else
			{
				if (this.state.socketMsg)
				{
					this.props.sendSocketMessage(9, this.state.socketMsg.guardian, this.state.socketMsg.underGuardian, '被监护人设备未连接', 0, 0, "", );
				}

			}
		}
		this.setState({
			display: true,
		})

	}

	onFetchCallback = res =>
	{
		console.log(res, '用户疗程阿的期望')
		this.setState({
			userCourseList: res.list,
			allStatus: res.allStatus ? res.allStatus : 0,
		})
	}
	//长连接的处理
	remoteNextProps = (nextProps) =>
	{
		if (nextProps.stopStatus == 2 && nextProps.stopStatus !== this.props.stopStatus)
		{
			this.props.getUserCourseList({device_sn: this.props.connectedDevice.device_sn, }, this.onFetchCallback);
			console.log("暂停成功")
			this.setState({
				spinnerText: '',
				spinner: false,
			})
			this.refs.toast.show(
				<View style={{justifyContent: 'center', alignItems: 'center', }}>
					<Icon name="ios-checkmark" size={50} color={'#fff'}/>
					<Text style={{color: '#fff', }}>暂停成功,使用手动激光可激活疗程!</Text>
				</View>, 1000)
		}
		else if (nextProps.stopStatus == 3 && nextProps.stopStatus !== this.props.stopStatus )
		{
			this.props.getUserCourseList({device_sn: this.props.connectedDevice.device_sn, }, this.onFetchCallback);
			console.log("使用成功")
			this.setState({
				spinnerText: '',
				spinner: false,
			})
			this.refs.toast.show(
				<View style={{justifyContent: 'center',alignItems: 'center', }}>
					<Icon name="ios-checkmark" size={50} color={'#fff'}/>
					<Text style={{color: '#fff', }}>使用成功!</Text>
				</View>, 1000)
		}
		else if (nextProps.stopStatus == 4 && nextProps.stopStatus !== this.props.stopStatus)
		{
			this.props.getUserCourseList({device_sn: this.props.connectedDevice.device_sn, }, this.onFetchCallback);
			console.log("切换成功")
			this.setState({
				spinnerText: '',
				spinner: false,
			})
			this.refs.toast.show(
				<View style={{justifyContent: 'center', alignItems: 'center', }}>
					<Icon name="ios-checkmark" size={50} color={'#fff'}/>
					<Text style={{color: '#fff'}}>切换成功!</Text>
				</View>,1000)
		}
		else if (nextProps.stopStatus == 5 && nextProps.stopStatus !== this.props.stopStatus)
		{
			this.props.getUserCourseList({device_sn: this.props.connectedDevice.device_sn, }, this.onFetchCallback);
			console.log("激活成功")
			this.setState({
				spinnerText: '',
				spinner: false,
			})
			this.refs.toast.show(
				<View style={{justifyContent: 'center', alignItems: 'center', }}>
					<Icon name="ios-checkmark" size={50} color={'#fff'}/>
					<Text style={{color: '#fff', }}>激活成功!</Text>
				</View>, 1000)
		}
		else if (nextProps.stopStatus == 10 && nextProps.stopStatus !== this.props.stopStatus )
		{
			this.refs.toast.show(
				<View style={{justifyContent: 'center', alignItems: 'center', }}>
					<Icon name="ios-checkmark" size={50} color={'#fff'}/>
					<Text style={{color: '#fff', }}>您的固件不支持该疗程，请升级!</Text>
				</View>, 1000)
		}
	}

	componentWillReceiveProps(nextProps)
	{
		console.log(nextProps, '收到的新属性')
		this.setState({
			laserTreatmentStatus: nextProps.laserTreatmentStatus,
			deviceTreatmentParams: nextProps.deviceTreatmentParams,
			user: nextProps.user,
			socketMsg: nextProps.socketMsg,
			connectStatus: nextProps.connectStatus,
			connectedDevice: nextProps.connectedDevice,
			dataProgress: nextProps.dataProgress,
		})
		if (nextProps.stopStatus == 2 && nextProps.stopStatus !== this.props.stopStatus)
		{
			this.props.getUserCourseList({device_sn: this.props.connectedDevice.device_sn, }, this.onFetchCallback);
			console.log("暂停成功")
			this.setState({
				spinnerText: '',
				spinner: false,
			})
			this.refs.toast.show(
				<View style={{justifyContent: 'center', alignItems: 'center', }}>
					<Icon name="ios-checkmark" size={50} color={'#fff'}/>
					<Text style={{color: '#fff', }}>暂停成功,使用手动激光可激活疗程!</Text>
				</View>, 1000)
			//暂停成功，通知监护人
			if (nextProps.socketMsg && nextProps.socketMsg.sn == 4)
			{
				//返回结果给监护人
				this.props.sendSocketMessage(9, nextProps.socketMsg.guardian, nextProps.socketMsg.underGuardian, '暂停成功', 0, 0, this.props.device_sn, );
			}

		}
		else if (nextProps.stopStatus == 3 && nextProps.stopStatus !== this.props.stopStatus )
		{
			this.props.getUserCourseList({device_sn: this.props.connectedDevice.device_sn, }, this.onFetchCallback);
			console.log("使用成功")
			this.setState({
				spinnerText: '',
				spinner: false,
			})
			this.refs.toast.show(
				<View style={{justifyContent: 'center',alignItems: 'center', }}>
					<Icon name="ios-checkmark" size={50} color={'#fff'}/>
					<Text style={{color: '#fff', }}>使用成功!</Text>
				</View>, 1000)
			if ( nextProps.socketMsg && nextProps.socketMsg.sn == 4)
			{
				this.props.sendSocketMessage(9, nextProps.socketMsg.guardian, nextProps.socketMsg.underGuardian, '使用成功', 0, 0, this.props.connectedDevice.device_sn, );
			}
		}
		else if (nextProps.stopStatus == 4 && nextProps.stopStatus !== this.props.stopStatus)
		{
			this.props.getUserCourseList({device_sn: this.props.connectedDevice.device_sn, }, this.onFetchCallback);
			console.log("切换成功")
			this.setState({
				spinnerText: '',
				spinner: false,
			})
			this.refs.toast.show(
				<View style={{justifyContent: 'center', alignItems: 'center', }}>
					<Icon name="ios-checkmark" size={50} color={'#fff'}/>
					<Text style={{color: '#fff'}}>切换成功!</Text>
				</View>,1000)
			if (nextProps.socketMsg && nextProps.socketMsg.sn == 4)
			{
				//返回结果给监护人
				this.props.sendSocketMessage(9, nextProps.socketMsg.guardian, nextProps.socketMsg.underGuardian, '切换成功', 0, 0, this.props.connectedDevice.device_sn, );
			}
		}
		else if (nextProps.stopStatus == 5 && nextProps.stopStatus !== this.props.stopStatus)
		{
			this.props.getUserCourseList({device_sn: this.props.connectedDevice.device_sn, }, this.onFetchCallback);
			console.log("激活成功")
			this.setState({
				spinnerText: '',
				spinner: false,
			})
			this.refs.toast.show(
				<View style={{justifyContent: 'center', alignItems: 'center', }}>
					<Icon name="ios-checkmark" size={50} color={'#fff'}/>
					<Text style={{color: '#fff', }}>激活成功!</Text>
				</View>, 1000)
			if (nextProps.socketMsg && nextProps.socketMsg.sn == 4)
			{
				this.props.sendSocketMessage(9, nextProps.socketMsg.guardian, nextProps.socketMsg.underGuardian, '激活成功', 0, 0, "", );
			}
		}
		else if (nextProps.stopStatus == 10 && nextProps.stopStatus !== this.props.stopStatus )
		{
			this.refs.toast.show(
				<View style={{justifyContent: 'center', alignItems: 'center', }}>
					<Icon name="ios-checkmark" size={50} color={'#fff'}/>
					<Text style={{color: '#fff', }}>您的固件不支持该疗程，请升级!</Text>
				</View>, 1000)
			if (nextProps.socketMsg && nextProps.socketMsg.sn == 4)
			{
				//返回结果给监护人
				this.props.sendSocketMessage(9, nextProps.socketMsg.guardian, nextProps.socketMsg.underGuardian, '您的固件不支持该疗程，请升级', 0, 0, "", );
			}
		}
		if (nextProps.socketMsg && nextProps.socketMsg.sn == 4 && nextProps.socketMsg !== this.props.socketMsg)
		{
			if (nextProps.connectStatus !== 4)
			{
				this.props.sendSocketMessage(9, nextProps.socketMsg.guardian, nextProps.socketMsg.underGuardian, '被监护人设备未连接', 0, 0, "", );
			}
			else
			{
				if (nextProps.socketMsg.type)
				{
					var type = nextProps.socketMsg.type;
					var typeValue = ""
					if (type == 1)
					{
						typeValue = "active"
					}
					else if (type == 2)
					{
						typeValue = "use"
					}
					else if (type == 3)
					{
						typeValue = "switch"
					}
					else
					{
						typeValue = "stop"
					}
					//各种操作。。。
					this.index = nextProps.socketMsg.a;
					this.events({type: typeValue, index: nextProps.socketMsg.a, })
				}
			}

		}
		if (nextProps.socketMsg && nextProps.socketMsg !== this.props.socketMsg && nextProps.socketMsg.sn == 9)
		{
			if (nextProps.socketMsg.title == "被监护人该设备未连接")
			{
				this.setState({
					remoteConnectStatus: false,
				})
				return
			}
			if (nextProps.socketMsg.title == "已连接")
			{
				this.setState({
					remoteConnectStatus: true,
				})

				this.props.getUserCourseList({device_sn: nextProps.socketMsg.device_sn, armariumScienceSession: this.guardian.userToken, }, this.onFetchCallback);
			}
			if (nextProps.socketMsg.title)
			{
				this.props.getUserCourseList({device_sn: this.guardian.deviceSn, armariumScienceSession: this.guardian.userToken, }, this.onFetchCallback);
				this.setState({
					spinnerText: '',
					spinner: false,
				})
				this.refs.toast.show(
					<View style={{justifyContent: 'center', alignItems: 'center', }}>
						<Icon name="ios-checkmark" size={50} color={'#fff'}/>
						<Text style={{color: '#fff'}}>{nextProps.socketMsg.title}</Text>
					</View>, 1000)
			}

		}
		if (nextProps.socketMsg && nextProps.socketMsg !== this.props.socketMsg && nextProps.socketMsg.sn == 0)
		{
			this.setState({
				spinnerText: '',
				spinner: false,
			})
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
	alert(text, callback)
	{
		Alert.alert('提示', text, [{ text: '确定', onPress: ()=>{ callback()} }]);
	}

	stopCourse()
	{
		var dic = {
			device_sn: this.props.connectedDevice.device_sn,
			user_course_id: this.state.userCourseList[this.index].id,
		}
		var firmware_sn = this.props.firmWare.firmwareVersion ? this.props.firmWare.firmwareVersion : '';
		if (this.props.device_sn == "HA01Y")
		{
			this.props.fetchStopCourseForHA01Y(this.props.connectedDevice.bleId, dic, firmware_sn )
		}
		else
		{
			this.props.fetchStopCourse(this.props.connectedDevice.bleId, dic, firmware_sn)
		}
	}

	events(res)
	{
		console.log(this.props, '收到得数据', res)
		var type = res.type;
		this.index = res.index;
		var bleStatus = this.props.bleStatus;
		var connectStatus = this.props.connectStatus;
		var guardian = this.guardian;
		if (!guardian)
		{
			if (!bleStatus)
			{
				this.refs.toast.show(<View style={{justifyContent: "center", alignItems: 'center'}}>
					<Icon name="ios-checkmark-outline" size={55} color="#fff"></Icon>
					<Text style={{color: '#fff', }}>蓝牙未开启</Text>
				</View>)
				return;
			}
			if (!connectStatus)
			{
				this.refs.toast.show(<View style={{justifyContent: "center", alignItems: 'center'}}>
					<Icon name="ios-checkmark-outline" size={55} color="#fff"></Icon>
					<Text style={{color: '#fff', }}>请连接设备</Text>
				</View>)
				return;
			}
			if (this.props.dataProgress > 0)
			{
				this.refs.toast.show(<View style={{justifyContent: "center", alignItems: 'center'}}>
					<Icon name="ios-checkmark-outline" size={55} color="#fff"></Icon>
					<Text style={{color: '#fff', }}>数据上传中</Text>
				</View>)
				return;
			}
		}

		switch (type)
		{
		case 'stop':
			var user = this.state.user;
			this.setState({
				spinnerText: '暂停中',
				spinner: true,
			})
			if (this.guardian)
			{
				console.log(this.guardian.underGuardian, user.user_id, this.index, this.guardian.deviceSn, 'asdad爱上');
				this.props.sendSocketMessage(4, this.guardian.underGuardian, user.user_id, "暂停疗程", 4, this.index, this.guardian.deviceSn);
				return;
			}
			this.props.stopCourse(this.index, this.onActionCallback);

			break;
		case 'use' :
			user = this.state.user;
			if (this.guardian)
			{
				this.setState({
					spinnerText: '使用中',
					spinner: true,
				})

				this.props.sendSocketMessage(4, this.guardian.underGuardian, user.user_id, "使用疗程", 2, this.index, this.guardian.deviceSn);
				return;
			}
			var firmware_sn = this.props.firmWare.firmwareVersion ? this.props.firmWare.firmwareVersion : '';
			var stage = this.state.userCourseList[this.index].courseid;
			var firmWare = firmware_sn.substring(1, 5);
			console.log(stage, firmWare, "新的1111")
			if (stage >= 71 && firmWare < 1710 )
			{
				this.alert("您的设备固件不支持，请先空中升级！", ()=> {

				});
				if (this.state.socketMsg && this.state.socketMsg.sn === 4) {
					var socketMsg = this.state.socketMsg;
					this.props.sendSocketMessage(9, socketMsg.guardian, socketMsg.underGuardian, "您的设备固件不支持，请先空中升级！");
				}

				return;
			}
			this.setState({
				spinnerText: '使用中',
				spinner: true,
			})
			this.props.useCourse(this.index, this.onActionCallback);

			break;
		case 'switch':
			user = this.state.user;
			if (this.guardian)
			{
				this.setState({
					spinnerText: '切换中',
					spinner: true,
				})

				this.props.sendSocketMessage(4, this.guardian.underGuardian, user.user_id, "切换疗程", 3, this.index, this.guardian.deviceSn);
				return;
			}
			firmware_sn = this.props.firmWare.firmwareVersion ? this.props.firmWare.firmwareVersion : '';
			stage = this.state.userCourseList[this.index].courseid;
			firmWare = firmware_sn.substring(1, 5);
			if (stage >= 71 && firmWare<1710 )
			{
				this.alert("您的设备固件不支持，请先空中升级！", ()=> {

				});
				if (this.state.socketMsg && this.state.socketMsg.sn === 4) {
					socketMsg = this.state.socketMsg;
					this.props.sendSocketMessage(9, socketMsg.guardian, socketMsg.underGuardian, "您的设备固件不支持，请先空中升级！");
				}
				return;
			}
			this.setState({
				spinnerText: '切换中',
				spinner: true,
			})
			this.props.switchCourse(this.index, this.onActionCallback);
			break;
		case 'active':
			user = this.state.user;
			this.setState({
				spinnerText: '激活中',
				spinner: true,
			})
			if (this.guardian)
			{

				this.props.sendSocketMessage(4, this.guardian.underGuardian, user.user_id, "激活疗程", 1, this.index, this.guardian.deviceSn);
				return;
			}
			this.props.activeCourse(this.index, this.onActionCallback);
			break;
		}
	}

	onActionCallback = res =>
	{
		console.log(res, '使用的返回值')
		var status = res.status;
		if (status === 1)
		{
			var dic = {device_sn: this.props.connectedDevice.device_sn, }
			this.props.getUserCourseList(dic, this.onFetchCallback);
			if (this.state.socketMsg)
			{
				this.props.sendSocketMessage(9, this.state.socketMsg.guardian, this.state.socketMsg.underGuardian, res.message, 0, 0, "", );
			}
		}
		else
		{
			if (this.state.socketMsg)
			{
				this.props.sendSocketMessage(9, this.state.socketMsg.guardian, this.state.socketMsg.underGuardian, res.message, 0, 0, "", );
			}
		}
		this.setState({
			spinner: false,
		})
		this.refs.toast.show(<View style={{justifyContent: "center", alignItems: 'center'}}>
			<Icon name="ios-checkmark-outline" size={55} color="#fff"></Icon>
			<Text style={{color: '#fff', }}>{res.message}</Text>
		</View>)

	}

	detail(res)
	{
		if (this.state.socketMsg && this.state.socketMsg.sn == 9 && this.state.socketMsg.title == '被监护人设备未连接') {
			this.refs.toast.show('设备未连接');
			return;
		}
		var id = res.id;
		this.props.navigation.push("MyCourseDetailPage", {id: id, })
	}

	buy()
	{
		this.alert("请关注养米科技公众号，购买疗程。", () =>
		{

		} )
	}

	render()
	{
		let list = null ;
		if (!this.state.display)
		{
			list = null
		}
		else
		{
			if (this.guardian)
			{
				//存在则为监护人
				if (!this.state.remoteConnectStatus)
				{
					list = (<View style={styles.total}>
						<View style={{justifyContent:'center',alignItems:'center'}}>
							<Text>请先连接设备</Text>
						</View>
					</View>)
				}
				else
				{
					if (this.state.userCourseList.length < 1)
					{
						list = (<View style={styles.total}>
							<View style={{height: contentHeight - 100,justifyContent:'center',alignItems:'center'}}>
								<Text>暂无疗程</Text>
							</View>
						</View>)
					}
					else
					{
						list = this.state.userCourseList.map((item, index) => {
							let oparateBtn = null, isUser = null, subTitle = null;
							if (item.stage)
							{
								subTitle = <View style={{paddingRight: 10, }}><Text style={{fontSize: 14, }}>{item.stage}</Text></View>
							}
							else
							{
								subTitle = null;
							}
							if (item.useState == 1 && this.state.allStatus==1)
							{
								isUser=(<View style={{flexDirection: 'row', justifyContent: 'center', alignItems: 'center', }}>
									{subTitle}
									<Text style={{color: '#24A090', fontSize: 14, }}>使用中</Text>
								</View>)
								oparateBtn = (<TouchableOpacity style={[styles.btnAdd,{backgroundColor: '#fff', borderColor: '#24A090', borderWidth: 1, }]} onPress={this.events.bind(this,{type: 'stop',index: index})}>
									<Text style={[styles.btnText, {color: '#24A090', }]}>停止</Text>
								</TouchableOpacity>)
							}
							else if (item.useState == 0)
							{
								oparateBtn = (<TouchableOpacity style={styles.btnAdd} onPress={this.events.bind(this,{type: 'active',index: index})}>
									<Text style={styles.btnText}>激活</Text>
								</TouchableOpacity>)
							}
							else if (item.useState == 2 && this.state.allStatus==1)
							{
								oparateBtn = (<TouchableOpacity style={styles.btnAdd} onPress={this.events.bind(this,{type: 'switch',index: index})}>
									<Text style={styles.btnText}>切换使用</Text>
								</TouchableOpacity>)
							}
							else if (item.useState == 2 && this.state.allStatus==2)
							{
								oparateBtn = (<TouchableOpacity style={styles.btnAdd} onPress={this.events.bind(this,{type: 'use',index: index})}>
									<Text style={styles.btnText}>使用</Text>
								</TouchableOpacity>)
							}
							else if (item.useState == 3)
							{
								oparateBtn = null;
							}
							return (
								<View style={styles.list} key={item.course}>
									<View style={styles.contentLeft}>
										<View style={styles.imgStyle}>
											<Image source={require('../../img/course_img.png')} roundAsCircle={true} style={styles.img} />
										</View>
										<View style={styles.listContent}>

											<View style={{maxWidth: width - 150, }}><Text style={{ color: '#000', fontSize: 14, fontWeight: 'bold', }}>{item.courseName}</Text></View>
											{isUser}
											<Text style={{ color: '#7f8389', fontSize: 12, }}>剩余：{item.remainingDays}天</Text>
										</View>
										<View style={{width: 80, }}>{oparateBtn}</View>
									</View>
									<View style={styles.operate}>
										<TouchableOpacity style={[styles.operateItem, {borderRightColor: '#ccc', borderRightWidth: 1, }]} onPress={this.detail.bind(this, {id: item.id, })}>
											<Text style={{fontSize: 12, }}>疗程详情</Text>
										</TouchableOpacity>
										<TouchableOpacity style={styles.operateItem} onPress={this.buy.bind(this)}>
											<Text style={{fontSize: 12, }}>购买续费</Text>
										</TouchableOpacity>
									</View>
								</View>
							)
						})
					}
				}
			}
			else
			{
				if (this.props.connectStatus !== 4)
				{
					list = (<View style={styles.total}>
						<View style={{justifyContent:'center',alignItems:'center'}}>
							<Text>请先连接设备</Text>
						</View>
					</View>)
				}
				else
				{
					if (this.state.userCourseList.length < 1)
					{
						list = (<View style={styles.total}>
							<View style={{height: contentHeight - 100,justifyContent:'center',alignItems:'center'}}>
								<Text>暂无疗程</Text>
							</View>
						</View>)
					}
					else
					{
						list = this.state.userCourseList.map((item, index) => {
							let oparateBtn = null, isUser = null, subTitle = null;
							if (item.stage)
							{
								subTitle = <View style={{paddingRight: 10, }}><Text style={{fontSize: 14, }}>{item.stage}</Text></View>
							}
							else
							{
								subTitle = null;
							}
							if (item.useState == 1 && this.state.allStatus==1)
							{
								isUser=(<View style={{flexDirection: 'row', justifyContent: 'center', alignItems: 'center', }}>
									{subTitle}
									<Text style={{color: '#24A090', fontSize: 14, }}>使用中</Text>
								</View>)
								oparateBtn = (<TouchableOpacity style={[styles.btnAdd,{backgroundColor: '#fff', borderColor: '#24A090', borderWidth: 1, }]} onPress={this.events.bind(this,{type: 'stop',index: index})}>
									<Text style={[styles.btnText, {color: '#24A090', }]}>停止</Text>
								</TouchableOpacity>)
							}
							else if (item.useState == 0)
							{
								oparateBtn = (<TouchableOpacity style={styles.btnAdd} onPress={this.events.bind(this,{type: 'active',index: index})}>
									<Text style={styles.btnText}>激活</Text>
								</TouchableOpacity>)
							}
							else if (item.useState == 2 && this.state.allStatus==1)
							{
								oparateBtn = (<TouchableOpacity style={styles.btnAdd} onPress={this.events.bind(this,{type: 'switch',index: index})}>
									<Text style={styles.btnText}>切换使用</Text>
								</TouchableOpacity>)
							}
							else if (item.useState == 2 && this.state.allStatus==2)
							{
								oparateBtn = (<TouchableOpacity style={styles.btnAdd} onPress={this.events.bind(this,{type: 'use',index: index})}>
									<Text style={styles.btnText}>使用</Text>
								</TouchableOpacity>)
							}
							else if (item.useState == 3)
							{
								oparateBtn = null;
							}
							return (
								<View style={styles.list} key={item.course}>
									<View style={styles.contentLeft}>
										<View style={styles.imgStyle}>
											<Image source={require('../../img/course_img.png')} roundAsCircle={true} style={styles.img} />
										</View>
										<View style={styles.listContent}>

											<View style={{maxWidth: width - 150, }}><Text style={{ color: '#000', fontSize: 14, fontWeight: 'bold', }}>{item.courseName}</Text></View>
											{isUser}
											<Text style={{ color: '#7f8389', fontSize: 12, }}>剩余：{item.remainingDays}天</Text>
										</View>
										<View style={{width: 80, }}>{oparateBtn}</View>
									</View>
									<View style={styles.operate}>
										<TouchableOpacity style={[styles.operateItem, {borderRightColor: '#ccc', borderRightWidth: 1, }]} onPress={this.detail.bind(this, {id: item.id, })}>
											<Text style={{fontSize: 12, }}>疗程详情</Text>
										</TouchableOpacity>
										<TouchableOpacity style={styles.operateItem} onPress={this.buy.bind(this)}>
											<Text style={{fontSize: 12, }}>购买续费</Text>
										</TouchableOpacity>
									</View>
								</View>
							)
						})
					}
				}
			}

		}

		return (
			<View style={{flex: 1, backgroundColor: "#f3f3f3"}}>
				<View style={styles.sBar} backgroundColor={'#24a090'}/>
				<NavBar
					title="我的疗程"
					leftIcon="ios-arrow-back"
					leftPress={this.back.bind(this)}
				/>
				<ScrollView style={{height: contentHeight, }}>
					<View style={{flexDirection: 'column', backgroundColor: '#fff', }}>
						{list}
					</View>
				</ScrollView>
				<Toast ref="toast"
					position="center"
				/>
				<Spinner
					visible={this.state.spinner}
					textContent={this.state.spinnerText}
				/>
				<CommonDialog types={'confirm'} ref="dConfirm" />
			</View>
		)
	}
}

function mapStateToProps(state) {
	console.log(state,'子组件的属性')
	return {
		bleStatus: state.ble.bleStatus,
		msg: state.courseList.msg,
		connectStatus: state.ble.connectStatus,
		stopStatus: state.courseList.status,
		firmWare: state.ble.firmWare,
		laserTreatmentStatus: state.ble.laserTreatmentStatus,
		deviceTreatmentParams: state.ble.deviceTreatmentParams,
		socketMsg: state.webSocketReducer.socketMsg,
		user: state.loginIn.user,
		connectedDevice: state.ble.connectedDevice,
		dataProgress: state.ble.dataProgress,
	}
}

function mapDispatchToProps(dispatch)
{
	return {
		getUserCourseList: (dic, callback) => dispatch(courseActions.getUserCourseList(dic, callback)),
		fetchStopCourse: (id, dic, firmware_sn) => dispatch(fetchStopCourse(id, dic, firmware_sn)),
		fetchStopCourseForHA01Y: (id, dic) => dispatch(fetchStopCourseForHA01Y(id, dic)),
		switchCourse: (index, callback) => dispatch(courseActions.switchCourse(index, callback)),
		activeCourse: (index, callback) => dispatch(courseActions.activeCourse(index, callback)),
		useCourse: (index, callback) => dispatch(courseActions.useCourse(index, callback)),
		stopCourse: (index, callback) => dispatch(courseActions.stopCourse(index, callback)),
		sendSocketMessage: (a, b, c, d, e, f, g) => dispatch(webSocketActions.sendMessage(a, b, c, d, e, f, g)),
	}
}

export default connect(mapStateToProps, mapDispatchToProps)(MyCoursePage)


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
	list: {
		flexDirection: 'column',
		justifyContent: 'space-around',
		alignItems: 'center',
		width: width,
	},
	contentLeft: {
		flex: 1,
		flexDirection: 'row',
		justifyContent: 'flex-start',
		alignItems: 'center',
		paddingTop: 20,
		paddingBottom: 20,
		paddingHorizontal: 10,
		borderBottomWidth: 1,
		borderColor: '#f4f4f4',

	},
	hr: {
		flexDirection: 'row',
		justifyContent: 'flex-end',
		alignItems: 'center',
	},
	imgStyle: {
		width: 65,
		height: 65,
		marginRight: 10,
		borderRadius: 50,
		flexDirection: 'column',
		justifyContent: 'center',
		alignItems: 'center',

	},
	img: {
		width: 65,
		height: 65,
	},
	listContent: {
		flexDirection: 'column',
		justifyContent: "space-around",
		alignItems: 'flex-start',
		flex: 1,
		height: 60,
	},
	btnAdd: {
		height: 28,
		width: 80,
		backgroundColor: '#24a090',
		borderRadius: 20,
		justifyContent: 'center',
		alignItems: 'center'
	},
	total: {
		flexDirection: 'column',
		justifyContent: 'center',
		alignItems: 'center',
		height: contentHeight,
	},
	operate: {
		flexDirection: 'row',
		alignItems: 'center',
		justifyContent: 'center',
		borderBottomWidth: 1,
		borderBottomColor: '#f4f4f4',
		width: width,
	},
	operateItem: {
		paddingVertical: 6,
		flex: 1,
		flexDirection: 'row',
		alignItems: 'center',
		justifyContent: 'center',
	},
	btnText: {
		fontSize: 12,
		color: '#fff',
	},
});
