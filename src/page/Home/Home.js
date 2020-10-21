import React, {Component, } from 'react';
import {
	Image,
	StyleSheet,
	BackHandler,
	ToastAndroid,
	View,
	ScrollView,
	ActivityIndicator,
	StatusBar,
	Text,
	TouchableOpacity,
	NativeModules,
	Platform,
	Alert,
	DeviceEventEmitter,
	Modal,
	ProgressBarAndroid,
	UIManager,
	LayoutAnimation,
	ImageBackground,
} from 'react-native';
import {ProgressView} from "@react-native-community/progress-view";
import { connect, } from 'react-redux'
import Toast, { DURATION, } from 'react-native-easy-toast'
import Icon from 'react-native-vector-icons/Ionicons'
import { MarqueeHorizontal, MarqueeVertical, } from 'react-native-marquee-ab';
import PullView from '../../common/pullPush/PullView';
import PullList from '../../common/pullPush/PullList';
import * as untils from '../../utils/utils';
import * as webSocketActions from '../../actions/webSocketActions';
import QBStorage from '../../utils/storage/storage';
import BleModule from '../../utils/ble/bleModule';
import Spinner from 'react-native-loading-spinner-overlay';
import * as DeviceService from '../../utils/network/deviceService';
//导入屏幕分辨率的框架
import * as homeService from "../../utils/network/homeService";
import * as guardianService from '../../utils/network/guardianService';
import {loginOut, } from '../../actions/loginActions';
import {fetchUserCourse, airUpdating, connectionSucceeded, configuration, disconnect3, upGrade, upGrade_error, pointerShow, } from '../../actions/device/bleActions';
import * as notificationActions from "../../actions/notificationActions"
import * as bleActions from '../../actions/device/bleActions';
import * as appActions from '../../actions/appActions';
import * as bleDataHandle from '../../utils/ble/application/data/bleDataHandle';
import {statusBarHeight, height, width, bottomToolsBarHeight, } from '../../utils/uiHeader';
var Immutable = require("../../utils/seamless-immutable").static;

import * as HomeController from "./controller";
import * as Untils from '../../utils/utils';
const currentHeight = statusBarHeight;
const contentHeight = height - statusBarHeight - bottomToolsBarHeight - 45;
//定义一些全局的变量
//屏幕的宽度
var cols = 3;
var boxW = 80;
var vMargin = (width - cols*boxW)/(cols+1);
var hMargin = 10;
var _that;
var rCols = 4;
var rBoxW = 80;
var vrMargin = (width - rCols*rBoxW)/(rCols+1);
class HomePage extends Component 
{
	static navigationOptions =
	{
		tabBarLabel: '设备',
		header: null,
		tabBarIcon: ({focused, }) =>
		{

			if (focused)
			{
				return (<Image style={styles.tabBarIcon} source={require('../../img/home_tab_device.png')}/>);
			}
			return (<Image style={styles.tabBarIcon} source={require('../../img/home_tab_device_a.png')}/>);
		},
	};
	constructor(props)
	{
		super(props);
		_that = this;
		this.state = {
			dataProgressModal: false,
			dataProgress: this.props.dataProgress,
			width: width/3,
			userDeviceList: this.props.userDeviceList,
			selectIndex: [],
			isSetting: false,
			spinnerText: '正在搜索',
			user: {}, //用户信息
			lw: "",
			dataItems: [], //跑马灯列表
			isModal: false, //消息通知弹框显示与隐藏控制
			event: {}, //消息通知
			eventId: 0, //消息通知ID
			isupGrade: false,
			isupGradeBand: false,
			upProgress: {},
			upProgressText: "升级中...",
			pointerShow: 0, //指针功能的显示隐藏
			typeName: '性别',
			type: 0,
			showTypePop: false,
			typeArr: [],
			refreshData: [0, 1, ],
			isRefreshing: false,
			message: {title: '', content: ''},
			isMessageModal: false,
			remoteLoadingStatus: false,
			remoteLoadingText: '',
			remoteSpinnerText: '上传数据中...',
			willConnectDevice: new Object(),
			isConnecting: false, //是否正在连接中
			isDisconnect: false,
			deviceList: [],
			bleStatus: this.props.bleStatus,
			socketMsg: this.props.socketMsg,
			isHaveNews: false,
		}
		this.isSevaralDevice = false;
		this.topIndicatorRender = this.topIndicatorRender.bind(this);
		this.onPullRelease=this.onPullRelease.bind(this);
		if (Platform.OS == 'android')
		{
			UIManager.setLayoutAnimationEnabledExperimental && UIManager.setLayoutAnimationEnabledExperimental(true);
		}
	}

	//自定义下拉刷新指示器
	topIndicatorRender(pulling, pullok, pullrelease)
	{
		const hide = {position: 'absolute', left: 10000, };
		const show = {position: 'relative', left: 0, };
		setTimeout(() => {
			if (pulling) {
				this.txtPulling && this.txtPulling.setNativeProps({style: show,});
				this.txtPullok && this.txtPullok.setNativeProps({style: hide,});
				this.txtPullrelease && this.txtPullrelease.setNativeProps({style: hide});
			} else if (pullok) {
				this.txtPulling && this.txtPulling.setNativeProps({style: hide});
				this.txtPullok && this.txtPullok.setNativeProps({style: show});
				this.txtPullrelease && this.txtPullrelease.setNativeProps({style: hide});
			} else if (pullrelease) {
				this.txtPulling && this.txtPulling.setNativeProps({style: hide});
				this.txtPullok && this.txtPullok.setNativeProps({style: hide});
				this.txtPullrelease && this.txtPullrelease.setNativeProps({style: show});
			}
		}, 1);
		return (
			<View style={{flexDirection: 'row', justifyContent: 'center', alignItems: 'center', height: 60,zIndex:1}}>
				<ActivityIndicator size="small" color="red" />
				<View ref={(c) => {this.txtPulling = c;}}>
					<Text>继续下拉连接...</Text>
				</View>
				<View ref={(c) => {this.txtPullok = c;}}>
					<Text>松开连接......</Text>
				</View>
				<View ref={(c) => {this.txtPullrelease = c;}}>
					<Text>连接中......</Text>
				</View>
			</View>
		);
	}

	async onPullRelease(resolve)
	{
		this.setState({isRefreshing: true, });
		console.log("下拉刷新", this.state.bleStatus, this.state.connectStatus)
		//蓝牙变化时执行
		if (this.state.bleStatus !== 1)
		{
			this.refs.toast.show(
				<View style={{justifyContent: "center", alignItems: 'center'}}>
					<Icon name="ios-checkmark-outline" size={55} color="#fff"></Icon>
					<Text style={{color: '#fff', }}>蓝牙未开启</Text>
				</View>
			)
		}
		else
		{
			if (this.state.connectStatus !== 4)
			{
				this.setState({
					deviceList: [],
					isConnecting: true,
					isDeviceList: false,
				})
				this.isSevaralDevice = true;
				//判断绑定情况
				var bindingData = await HomeController.isBindDevice();
				if (bindingData.status === 1)
				{
					this.props.startConnectDevice(bindingData.deviceList,this.onConnectCallback)
				}
				else if (bindingData.status === 2)
				{
					this.props.startSeveralConnectDevice(bindingData.deviceList,this.onConnectCallback);
				}
				else
				{
					this.refs.toast.show(
						<View style={{justifyContent: "center", alignItems: 'center'}}>
							<Icon name="ios-checkmark-outline" size={55} color="#fff"></Icon>
							<Text style={{color: '#fff', }}>未绑定设备</Text>
						</View>
					)
					this.setState({
						isConnecting: false,
					})
				}

			}
		}

		//真实情况下，应在请求网络数据后的回调中修改isRefreshing
		setTimeout(() => {
			this.setState({isRefreshing: false, })
		}, 500)
	}

	events(res)
	{
		console.log(res, '添加111')
		var type = res.type;
		switch (type)
		{
		case 'connect':
			this.isSevaralDevice = true;
			this.setState({
				deviceList: [],

			})
			this.props.isBind(this.onBindCallback);
			break;
		case "disconnect":
			console.log(this.state.connectStatus, '断开11')
			if (this.state.connectStatus == 0)
			{
				return;
			}
			else
			{
				this.setState({
					isBackground: true,
					isDisconnect: true,
				})
			}
		}
	}

	onBindCallback = async res => {
		var status = res.status;

		if (status === 0)
		{
			this.refs.toast.show(
				<View style={{justifyContent: "center", alignItems: 'center'}}>
					<Icon name="ios-checkmark-outline" size={55} color="#fff"></Icon>
					<Text style={{color: '#fff', }}>蓝牙未开启</Text>
				</View>
			)
		}
		else if (status === 3)
		{
			//没有绑定设备
			var bg_close = await QBStorage.get('bg_close');
			var bleStatus = this.state.bleStatus;
			if (bg_close === 1)
			{
				if (bleStatus === 1)
				{
					DeviceEventEmitter.emit('bindLister', 3)
				}
				else
				{
					DeviceEventEmitter.emit('bindLister', 2)
				}
			}
			else
			{
				DeviceEventEmitter.emit('bindLister', 1)
			}
		}
		else
		{
			var bleStatus = this.state.bleStatus;
			console.warn(bleStatus, '蓝牙的状态')
			if (bleStatus !== 1)
			{
				this.refs.toast.show(
					<View style={{justifyContent: "center", alignItems: 'center'}}>
						<Icon name="ios-checkmark-outline" size={55} color="#fff"></Icon>
						<Text style={{color: '#fff', }}>蓝牙未开启</Text>
					</View>
				)
				return;
			}
			console.log('搜索中123123');
			this.setState({
				isBackground: false,
				isConnecting: true,
			})
			//绑定了设备
			if (status === 1)
			{
				//绑定了一台
				this.props.startConnectDevice(res.data, this.onClickConnectCallback)
			}
			else
			{
				//绑定了多台
				this.props.startSeveralConnectDevice(res.data, this.onClickConnectCallback);
			}
		}
	}

	onDisconnectCallback = res =>
	{
		this.setState({
			isConnecting: false,
		})
		console.log(res, '断开设备');
		this.refs.toast.show(
			<View style={{justifyContent: "center", alignItems: 'center'}}>
				<Icon name="ios-checkmark-outline" size={55} color="#fff"></Icon>
				<Text style={{color: '#fff', }}>断开成功</Text>
			</View>
		)
	}

	requestData=(dataLength)=>
	{
		var arr = [];
		let currentLength=this.state.refreshData.length;
		for (let i=currentLength;i<currentLength;i++)
		{
			arr.push(i)
		}
		this.setState({
			refreshData: arr,
		})
	}

	_renderAlias = () =>
	{
		if (this.state.eq)
		{
			eq = <Text style={{color: "#fff", paddingTop: 10, fontSize: 12, }}>设备电量：{this.props.eq}%</Text>
		}
		if (this.state.connectedDevice)
		{
			var connectedDevice = this.state.connectedDevice;
			if (connectedDevice.device_alias)
			{
				return (<View style={styles.viewCenter}>
					<Text style={[styles.deviceTitle, {fontSize: 22, }]}>{connectedDevice.device_alias}</Text>
					<Text style={[styles.deviceTitle, {paddingTop: 10,}]}>设备编号：{connectedDevice.device_sn}</Text>
					{eq}
				</View>)
			}
			else
			{
				return (<View style={styles.viewCenter}>
					<Text style={[styles.deviceTitle, {fontSize: 22, }]}>{connectedDevice.prevName}号{connectedDevice.isCicle ? '激光治疗手表' : '激光治疗手环'}</Text>
					<Text style={[styles.deviceTitle, {paddingTop: 10,}]}>设备编号：{connectedDevice.device_sn}</Text>
					{eq}
				</View>)
			}
		}
		else
		{
			return (<Text style={{color: "#fff", paddingTop: 10, }}></Text>);
		}
	}

	renderItem = () =>
	{
		console.log(this.props, '状态')
		var btn;

		if (this.state.connectStatus !== 4)
		{
			//是否是进入页面首次连接
			btn = 	(<View style={styles.titleBtn}>
				{this.state.isConnecting ? <ImageBackground
					source={require('../../img/btn_connect.png')}
					style={styles.connect}
					resizeMode="cover"
				>
					<View style={styles.connectBtn_ing} >
						<Text style={styles.connectText}>连接中</Text>
						<Image source={require('../../img/home_loading.gif')} resizeMode="cover" style={styles.loading} />
					</View>
				</ImageBackground> :
					<ImageBackground
						source={require('../../img/btn_connect.png')}
						style={styles.connect}
						resizeMode="cover"
					>
						<TouchableOpacity
							onPress={this.events.bind(this, {type: 'connect', })}
							style={styles.connectBtn}
						>
							<Text style={styles.connectText}>点击连接</Text>
							<Text style={styles.connectText}>设备</Text>
						</TouchableOpacity>
					</ImageBackground>
				}
			</View>)
		}
		else
		{

			var connectedDevice = this.state.connectedDevice;
			btn = (<View style={styles.titleOnBtn}>
				<ImageBackground
					source={require('../../img/btn_connect.png')}
					style={styles.connected}
					resizeMode="cover"
				>
					<View
						style={styles.connectBtn}
					>
						<Text style={styles.connectedText}>已连接设备</Text>
					</View>
					<TouchableOpacity
						onPress={this.events.bind(this, {type: 'disconnect', })}
						style={styles.disConnectStyle}
					><Text style={{fontSize: 11, fontFamily: 'PingFangSC-Regular', color: '#fff',  }}>点击断开</Text></TouchableOpacity>
				</ImageBackground>
				<View style={styles.connectInfo}>
					{this._renderAlias()}
				</View>
			</View>)
		}




		return (
			<View style={{ backgroundColor: '#fff', flex: 1, }}>
				<StatusBar
					translucent={true}
					animated={true}
					backgroundColor={"#24a090"}
					barStyle={"light-content"}
				/>
				<ImageBackground
					style={[styles.header, {height: 230, paddingTop: statusBarHeight,}, ]}
					source={require('../../img/bg_home.png')}
				>
					{btn}
				</ImageBackground>
				{this.dataProgressView()}
				<View style={{flexDirection: "row", backgroundColor: '#fff', marginBottom: 2, }}>
					<View style={{flexDirection: 'column',justifyContent: 'center', alignItems: 'center', }}>
						<Image
							source = {require("../../img/notice-dot-ic.png")}
							style = {{width: 30, marginLeft: 12, }}
						/>
					</View>
					{
						this.state.dataItems.length < 1 ?
							<View style={{flex: 1,justifyContent: 'center', alignItems: 'flex-start', paddingLeft: 10, height: 34, }}><Text>暂无消息</Text></View> :
							<View style={{flex: 1, height: 34, }}>
								<MarqueeVertical
									textList = {this.state.dataItems}
									width = {width - 130}
									height = {34}
									delay = {5000}
									direction = {'up'}
									numberOfLines = {1}
									bgContainerStyle = {{backgroundColor: '#fff', }}
									textStyle = {{fontSize: 14, color: '#435B54', paddingLeft: 10, paddingRight: 10, }}
									viewStyle = {{justifyContent: 'center', alignItems: 'center', }}
									onTextClick = {(item) => {
										// alert(''+JSON.stringify(item));
										this.NewsDetail(item.sourceId, 'roll')
									}}
								/>
							</View>
					}

					{
						this.state.dataItems.length < 1 ? null :
						<View style={{width: 40, flexDirection: 'row', justifyContent: 'center', alignItems: 'center', }}>
							<TouchableOpacity onPress={this.newsList.bind(this)} style={{flexDirection: 'row',flex: 1, justifyContent: 'center', alignItems: 'center', }}><Icon name="ios-arrow-forward-outline" size={24} color="#666"></Icon></TouchableOpacity>
						</View>

					}

				</View>
				{this.state.pointerShow==1 && this.state.connectStatus== 4&&<TouchableOpacity onPress={this.pointerPage.bind(this)} style={{position: 'absolute', top: height/5.5, right: 10}}>
					<Image style={{width: 60, }} source={require('../../img/pointer.png')} resizeMode="contain" />
				</TouchableOpacity>}

				<View style={styles.listTitle}><Text style={styles.listTitleText}>健康数据</Text></View>
				<View style={styles.content}>
					<TouchableOpacity style={styles.itemSetRow} onPress={this.goAppication.bind(this,{type: 'sports'})} >
						<Image style={styles.icon} source={require('../../img/sports.png')} resizeMode="contain" />
						<Text style={styles.text}>行走记步</Text>
					</TouchableOpacity>
					<TouchableOpacity style={styles.itemSetRow} onPress={this.goAppication.bind(this,{type: 'heart'})}>
						<Image style={styles.icon} source={require('../../img/heart.png')} resizeMode="contain" />
						<Text style={styles.text}>心率监测</Text>
					</TouchableOpacity>
				
					<TouchableOpacity style={styles.itemSetRow} onPress={this.goAppication.bind(this,{type: 'laser'})}>
						<Image style={styles.icon} source={require('../../img/laser.png')} resizeMode="contain"  />
						<Text style={styles.text}>激光周期</Text>
					</TouchableOpacity>

					<TouchableOpacity style={styles.itemSetRow} onPress={this.goAppication.bind(this,{type: 'tiwen'})}>
						<Image style={styles.icon} source={require('../../img/laser.png')} resizeMode="contain"  />
						<Text style={styles.text}>体温监控</Text>
					</TouchableOpacity>
				</View>
				<View style={styles.listTitle}><Text style={styles.listTitleText}>设备功能</Text></View>
				<View style={styles.content}>
					<TouchableOpacity style={styles.itemRow} onPress={this.goAppication.bind(this,{type: 'useGuide'})} >
						<Image style={styles.icon} source={require('../../img/use_guide.png')} resizeMode="contain" />
						<Text style={styles.text}>使用指南</Text>
					</TouchableOpacity>

					<TouchableOpacity style={styles.itemRow} onPress={this.goAppication.bind(this,{type: 'deviceManage'})}>
						<Image style={styles.icon} source={require('../../img/deviceManage.png')} resizeMode="contain"  />
						<Text style={styles.text}>设备管理</Text>
					</TouchableOpacity>
					<TouchableOpacity style={styles.itemRow} onPress={this.goAppication.bind(this,{type: 'myCourse'})}>
						<Image style={styles.icon} source={require('../../img/courseManager.png')} resizeMode="contain" />
						<Text style={styles.text}>健康管理</Text>
					</TouchableOpacity>
					<TouchableOpacity style={styles.itemRow} onPress={this.goAppication.bind(this, {type: 'jianhuren', })}>
						<Image style={styles.icon} source={require('../../img/guardianManager.png')} resizeMode="contain" />
						<Text style={styles.text}>监护人</Text>
					</TouchableOpacity>
					<TouchableOpacity style={styles.itemRow} onPress={this.goAppication.bind(this,{type: 'bleTool'})}>
						<Image style={styles.icon} source={require('../../img/deviceApplication.png')} resizeMode="contain" />
						<Text style={styles.text}>设备应用</Text>
					</TouchableOpacity>
					<TouchableOpacity style={styles.itemRow} onPress={this.goAppication.bind(this, {type: 'jiankangyouping', })}>
						<Image style={styles.icon} source={require('../../img/shopManager.png')} resizeMode="contain" />
						<Text style={styles.text}>设备配件</Text>
					</TouchableOpacity>
					<TouchableOpacity style={styles.itemRow} onPress={this.goAppication.bind(this,{type: 'airUpdata'})}>
						<Image style={styles.icon} source={require('../../img/dfuManager.png')} resizeMode="contain"  />
						<Text style={styles.text}>空中升级</Text>
					</TouchableOpacity>
				</View>

			</View>

		);
	}

	async componentWillMount()
	{
		BackHandler.addEventListener('hardwareBackPress', this.onBackAndroid);
		this.upGrade && clearTimeout(this.upGrade );
		this.props.appLoad(); //初始化
		LayoutAnimation.spring();

	}

	async componentDidMount()
	{
		console.log(this.props, '出事11')
		this.DeviceSearch = DeviceEventEmitter.addListener('DeviceSearch', () => {
			this.setState({
				deviceList: [],
			})
		})
		//连接的监听
		this.connectBleListener = DeviceEventEmitter.addListener('connnectBleListener', item => {
			console.log(item, '连接的监听')
			//没有绑定设备时监听到连接的信息后连接设备
			this.setState({
				isDeviceList: false,
				isBackground: false,
				isConnecting: true,
				deviceList: [],
			})
			untils.NoDoublePress.onPress(() => {
				this.noConnectBle(item)
			})
		})
		//监听推送通知
		this.pushMessage = DeviceEventEmitter.addListener('pushMessage', (message) =>
		{
			console.warn(message, message.badge)
			if (message.actionIdentifier && message.actionIdentifier == 'opened')
			{
				if (message.type == 'notification')
				{
					// this.setState({
					// 	eventId: message.extras.event_id
					// })
					if (message.badge && message.badge == 1)
					{
						this.props.navigation.navigate("NotificationListPage");
					}
					else
					{
						console.log(message.extras.event_id, "通知的id1111111111111")
						this.props.navigation.push("NewsDetail", {id: message.extras.event_id, type: 'message'})
					}
				}
			}
			if (message.type == "message")
			{
				this.setState({
					isMessageModal: true,
					message: {title: message.title, content: message.body, },
				})
			}
		})
		//监听首页弹框
		this.bulletBox = DeviceEventEmitter.addListener('bulletBox', (message) =>
		{
			if (message != 1)
			{
				return
			}
			QBStorage.get('user')
				.then((user) =>
				{
					this.getPopMessageData(user.user_id)
				})
		})
		this.onLineListener = DeviceEventEmitter.addListener('onLine', (message) =>
		{
		//收到监听后想做的事情
			if (!message)
			{
				this.setState({
					netStatus: false,
				})
				this.refs.toast.show("网络连接不可用，请稍后重试")
			}
			else
			{
				this.setState({
					netStatus: true,
				})
			}
		})
		this.listener = DeviceEventEmitter.addListener('notification', (message) =>
		{
		//收到监听后想做的事情
			this.props.navigation.navigate(message)
		})

		DeviceEventEmitter.addListener('LOAD_PROGRESS', (msg)=>{
			let title = "当前下载进度：" + msg
			console.log(title, "下载进度")
			var upgrade = {
				receivedBytes: msg,
				totalBytes: 100,
			}

			this.setState({
				upProgress: upgrade,
				isupGrade: true,
				upProgressText: "更新中...",
			})
			if (msg == 100)
			{
				this.setState({
					upProgress: upgrade,
					upProgressText: "更新成功",
				})
				setTimeout(() => {
					this.setState({
						isupGrade: false,
					})
				}, 1000)
			}
		});
		// 添加监听
		this.viewDidAppear = this.props.navigation.addListener('willFocus', async (obj)=>
		{
			this.props.getUserMsgCount();
			setTimeout( async() =>
			{
				var bindingData = await HomeController.isBindDevice();
				if (bindingData.status !== 1 && bindingData.status !== 2)
				{
					//没有绑定设备。
					this.setState({
						isConnecting: false,
					})
					this.isSevaralDevice = true;
					var bg_close = await QBStorage.get('bg_close');
					if (bg_close !== 1)
					{
						DeviceEventEmitter.emit('bindLister', 1)
					}
				}
				else
				{
					if (this.state.connectStatus !== 4 && !this.state.isConnecting && !this.state.isDeviceList)
					{
						var bleStatus = this.props.bleStatus;
						if (bindingData.status === 1)
						{
							console.log(bleStatus, '是否蓝牙打开过')
							if (bleStatus !== 1)
							{

								this.refs.toast.show(<View style={{justifyContent: "center", alignItems: 'center'}}>
									<Icon name="ios-checkmark-outline" size={55} color="#fff"></Icon>
									<Text style={{color: '#fff', }}>蓝牙未开启</Text>
								</View>)
								return;
							}
							DeviceEventEmitter.emit('bindLister', 0)
							//绑定了一个设备，直接连接
							this.setState({
								isConnecting: true,
							})
							this.isSevaralDevice = true;
							this.props.startConnectDevice(bindingData.deviceList,this.onConnectCallback);
						}
						else if (bindingData.status === 2)
						{
							console.log(bleStatus, '是否蓝牙打开过')
							if (bleStatus !== 1)
							{

								return;
							}
							DeviceEventEmitter.emit('bindLister', 0)
							//绑定了多个设备,弹框
							this.setState({
								isConnecting: true,
							})
							this.isSevaralDevice = true;
							this.props.startSeveralConnectDevice(bindingData.deviceList,this.onConnectCallback);
						}
					}
				}

			}, 100)


			console.log(obj, "每次进入页面如果登录则设置长连接开启")
			QBStorage.get("user")
				.then(res => {
					console.log(res, '登录的信息')
					if (res.user_id) {
						this.props.connectSocket(res.user_id)
					}
				})
				.catch(err => {

				})
			//跑马灯列表
			QBStorage.get('user')
				.then((user) =>
				{
					this.getRollMessageListData(user.user_id)
				})
				.catch(err => {

				})
		})
		console.log(this.props, '收到的状态')
		QBStorage.get('user')
			.then((user) =>
			{
				this.setState({
					user: user,
				})
				this.getPopMessageData(user.user_id)
			})
			.catch(error =>
			{

			})
		//自动跳转新手引导判断
		// this.props.navigation.navigate('Novice');
		QBStorage.get('guide')
			.then((res)=>{
				console.log('@@@@@@', res)
				if (res == 'show')
				{
					//用户第一次进入首页，这时没有绑定过设备
					// this.props.navigation.navigate('Novice');
				}
			})

	}

	shouldComponentUpdate(nextProps, nextState)
	{
		return Immutable(nextProps) !== Immutable(this.props)
	}

	onConnectCallback = res =>
	{
		console.log(res, '返回的错误');
		var message = res.message;

		if (message === '没有绑定设备')
		{
			this.setState({
				isBackground: false,
				isConnecting: false,
			})
		}
		else if (message === '没有搜索到设备')
		{
			this.setState({
				isBackground: true,
				isOpt: true,
				isConnecting: false,
			})
		}
		else if (message === '未绑定搜索到多设备')
		{
			var isDeviceList = this.state.isDeviceList;
			console.log(isDeviceList, this.isSevaralDevice, '多设备2312')
			if (!isDeviceList && this.isSevaralDevice)
			{
				this.setState({
					isDeviceList: true,
					isBackground: true,
				})
				if (this.state.socketMsg)
				{
					this.props.bletoolSend(12, this.state.socketMsg.guardian, this.state.socketMsg.underGuardian, '连接设备', '连接设备', 3)
				}

			}
			console.log(res, '啊啊说未绑定搜索到多设备', this.state.deviceList)
			var device = res.device;
			var deviceList = this.state.deviceList;
			var findIndex = deviceList.findIndex(item => {
				return item.device_sn === device.device_sn;
			})

			if (findIndex < 0)
			{
				device.RSSI = device.siginal;
				deviceList.push(device);
				this.setState({
					deviceList: deviceList,
					spinner: false,
				})
				if (this.state.socketMsg)
				{
					console.log(this.state.socketMsg, '返回给监护人的设备')
					this.props.bletoolSend(12, this.state.socketMsg.guardian, this.state.socketMsg.underGuardian, '连接设备', '连接设备', 2, 0, deviceList)
				}
			}
		}
		else if (message === '连接失败')
		{
			this.setState({
				isBackground: true,
				isOpt: true,
				isConnecting: false,
			})
		}
		else if (message === '连接成功')
		{
			this.setState({
				isBackground: false,
				isOpt: false,
				isConnecting: false,
			})
			this.refs.toast.show(<View style={{justifyContent: "center", alignItems: 'center'}}>
				<Icon name="ios-checkmark-outline" size={55} color="#fff"></Icon>
				<Text style={{color: '#fff', }}>连接成功</Text>
			</View>)
		}
		else if (message === '上传超时')
		{
			this.setState({
				dataProgressModal: false,
			})
			this.refs.toast.show(<View style={{justifyContent: "center", alignItems: 'center'}}>
				<Icon name="ios-checkmark-outline" size={55} color="#fff"></Icon>
				<Text style={{color: '#fff', }}>上传超时</Text>
			</View>)

		}
	}
	//跑马灯列表
	getRollMessageListData(userId)
	{
		homeService.getRollMessageListData({user_id: userId, })
			.then((res)=>
			{
				if (res.status == 1)
				{
					var items = []
					for (var i=0; i<res.data.length; i++)
					{
						var item = {};
						item.label = String(i+1);
						item.value = res.data[i].title;
						item.sourceId = res.data[i].id
						items.push(item)
					}
					this.setState({
						dataItems: items,
					})
				}
				else
				{
					this.setState({
						dataItems: [],
					})
				}
			})
	}
	//消息弹框消息数据
	getPopMessageData(userId)
	{
		homeService.getPopMessageData({user_id: userId, })
			.then((res)=>
			{

				if (res.status == 1)
				{
					this.setState({
						isModal: true,
						event: res.data,
						eventId: res.data.event_id,
					})
				}
			})
	}
	async componentWillReceiveProps(nextProps)
	{
		console.log(nextProps, '新的属性11122233334444555', this.state.isConnecting)

		this.setState({
			width: nextProps.dataProgress * width/100,
			dataProgress: nextProps.dataProgress,
			connectStatus: nextProps.connectStatus,
			bleStatus: nextProps.bleStatus,
			user: nextProps.user,
			socketMsg: nextProps.socketMsg,
			remoteLoadingStatus: nextProps.remoteLoadingStatus,
			remoteLoadingText: nextProps.remoteLoadingText,
			firmWare: nextProps.firmWare,
			connectedDevice: nextProps.connectedDevice,
			guardianToken: nextProps.guardianToken,
			eq: nextProps.eq,
			userDeviceList: nextProps.userDeviceList,
		})
		if (nextProps.dataProgress == 100 && nextProps.dataProgress !== this.props.dataProgress)
		{
			this.setState({
				dataProgressModal: false,
			})
			if (nextProps.socketMsg)
			{
				this.props.sendSocketMessage(9, nextProps.socketMsg.guardian, nextProps.socketMsg.underGuardian, "上传数据成功")
			}
			this.props.getDataProgress(0);

		}

		//控制指针功能的显示隐藏
		if (nextProps.pointerStatus == 1&& nextProps.firmWare.productModle && (nextProps.firmWare.productModle.indexOf("HA05") > -1|| nextProps.firmWare.productModle.indexOf("HA06") > -1))
		{
			this.setState({
				pointerShow: 1,
			})
		}
		else
		{
			this.setState({
				pointerShow: 0,
			})
		}

		if (nextProps.upGrade_band && nextProps.upGrade_band !== this.props.upGrade_band)
		{
			this.setState({
				isupGradeBand: true,
				isupGradeBandData: nextProps.upGrade_band,
				upGrade_band: nextProps.upGrade_band,
			})
		}

		this.setState({
			isupGrade: nextProps.isupGrade,
			upProgress: nextProps.upProgress,
			upProgressText: "开始更新",
		})

		if (nextProps.upGrade_error == 2 && nextProps.upGrade_error !== this.props.upGrade_error)
		{
			this.setState({
				isupGrade: true,
				upProgressText: "网络连接不可用，请连接网络后升级！",
			})

		}
		else if (nextProps.upGrade_error == 3 && nextProps.upGrade_error !== this.props.upGrade_error)
		{
			this.setState({
				upProgressText: '更新中....',
				isupGrade: false,
				upProgress: nextProps.upProgress,
			})
			DeviceEventEmitter.emit("isAppUpLoad")
		}
		this.setState({
			upGrade_error: nextProps.upGrade_error,
		})

		if (Number(nextProps.upProgress.receivedBytes)/Number(nextProps.upProgress.totalBytes) == 1)
		{
			this.setState({
				upProgressText: "更新成功,正在重启...",
			})
			this.upGrade = setTimeout(() => {
				this.setState({
					isupGrade: false,
				})
			}, 500)
		}
		if (nextProps.connectStatus == 4 && nextProps.connectStatus !== this.props.connectStatus)
		{
			this.setState({
				dataProgressModal: true,
			})
			//连接成功后的上传数据
			if (nextProps.socketMsg && nextProps.socketMsg.sn == 12)
			{
				this.setState({
					device_alias: this.state.willConnectDevice.device_alias ? this.state.willConnectDevice.device_alias : this.state.willConnectDevice.device_sn,
				})
				setTimeout(() =>
				{
					this.props.sendSocketMessage(9, nextProps.socketMsg.guardian, nextProps.socketMsg.underGuardian, '连接成功');
				}, 1000)
			}

		}
		//socket信息
		var newSocketMsg = nextProps.socketMsg;
		var oldSocketMsg = this.props.socketMsg;
		if (nextProps.socketMsg && oldSocketMsg !== newSocketMsg)
		{
			console.log("socket", '远程1111', nextProps.socketMsg)
			var socketMsg = nextProps.socketMsg;
			if (socketMsg && socketMsg.sn == 1)
			{
				var name = socketMsg.guardianName;
				//申请弹框
				this.socketAlert("是否同意"+ name + "成为你的监护人", () => {
					guardianService.editInfo({
						type: 1,
						guardian_id: socketMsg.guardianUid,
						status: -1,
					}).then(res => {
						console.log(res, '拒绝成为监护人')
					}).catch(err => {

					})
				}, () => {
					guardianService.editInfo({
						type: 1,
						guardian_id: socketMsg.guardianUid,
						status: 1,
					}).then(res => {
						console.log(res, '同意成为监护人')
					}).catch(err => {

					})
				})

			}
			else if (socketMsg.sn == 2)
			{
				if (socketMsg.title == "数据上传")
				{
					console.log(socketMsg.title, nextProps.connectStatus, '上传数据')
					//数据上传
					if (this.props.connectStatus == 4)
					{
						// this.setState({
						// 	dataProgressModal: true,
						// })
						this.goAppication({type: 'upData', })

					}
					else
					{
						this.props.sendSocketMessage(9, socketMsg.guardian, socketMsg.underGuardian, "被监护人设备未连接")
					}
				}

			}
			else if (socketMsg.sn == 4)
			{
				if (!socketMsg.device_sn)
				{
					this.props.navigation.navigate("MyCourse", {tabIndex: 1});
				}
				else
				{
					DeviceEventEmitter.emit("socketMsg", socketMsg);
				}

			}
			else if (socketMsg.sn == 5)
			{
				if (socketMsg.url == "健康服务")
				{
					this.props.navigation.navigate("IsBuyCourse")
				}
			}
			else if (socketMsg.sn == 6)
			{
				if (socketMsg.type == 0 && socketMsg.title == "空中升级")
				{
					if (nextProps.connectStatus !== 4)
					{
						this.props.sendSocketMessage(9, socketMsg.guardian, socketMsg.underGuardian, "被监护人设备未连接");
					}
					if (socketMsg.title == "空中升级")
					{
						this.props.navigation.navigate("AirUpdata");
					}
				}
			}
			else if (socketMsg.sn == 7)
			{
				//绑定解绑设备
				if (socketMsg.url == "设备管理")
				{
					this.props.navigation.navigate("DeviceManage")
				}
				else if (socketMsg.url == "设备管理2")
				{
					this.props.navigation.navigate("BleSearchResultPage");
				}
				else if (socketMsg.title == "设备详情")
				{

				}
				else if (socketMsg.title == "搜索结果")
				{
					this.props.navigation.navigate("BleSearchResultPage")
				}
			}
			else if (socketMsg.sn == 8)
			{
				//绑定解绑设备
				if (socketMsg.url == "设备应用" && socketMsg.type == 0)
				{
					if (nextProps.connectStatus !== 4)
					{
						this.props.sendSocketMessage(9, socketMsg.guardian, socketMsg.underGuardian, "被监护人设备未连接")
					}
					this.props.navigation.navigate("BleTool")
				}
			}
			else if (socketMsg.sn == 12)
			{
				if (socketMsg.title == '连接设备' && socketMsg.type == 1 && !socketMsg.devices)
				{
					//远程连接设备
					if (nextProps.connectStatus == 4)
					{
						this.props.sendSocketMessage(9, socketMsg.guardian, socketMsg.underGuardian, "被监护人设备已连接")
						return;
					}
					console.log('远程连接设备1231')
					var bindStatus = await HomeController.isBindDevice();
					if (bindStatus.status === 3 || bindStatus.status === 0)
					{
						this.props.sendSocketMessage(9, socketMsg.guardian, socketMsg.underGuardian, '被监护人设备未绑定')
						return;
					}
					if (this.state.isConnecting && !this.state.isDeviceList)
					{
						return;
					}
					this.events({type: 'connect', })

				}
				if (socketMsg.type == 4)
				{
					this.connectBle(socketMsg.devices)
				}
				if (socketMsg.title == "没有搜索到设备")
				{
					this.props.remoteLoading(false);
					this.refs.toast.show(socketMsg.title)
				}

			}
		}
	}
	componentWillUnmount()
	{
		BackHandler.removeEventListener('hardwareBackPress', this.onBackAndroid);
		DeviceEventEmitter.remove()
		this.listener.remove()
		this.settingTimeOut && clearTimeout(this.settingTimeOut)
		this.successConnect && clearTimeout(this.successConnect)
		this.searchError && clearTimeout(this.searchError)
		this.connectTimeOutAt && clearTimeout(this.connectTimeOutAt)
		this.connectBleListener && this.connectBleListener.remove()
	}

	onBackAndroid = () =>
	{
		if (this.lastBackPressed && this.lastBackPressed + 2000 >= Date.now())
		{
			//最近2秒内按过back键，可以退出应用。
			BackHandler.exitApp();
			return false;
		}
		this.lastBackPressed = Date.now();
		ToastAndroid.show('再按一次退出应用', ToastAndroid.SHORT);
		// return true;
		return true;
	};
	newsList(){
		this.props.navigation.push("NewsList")
	}
	NotificationDetail(id, type)
	{
		console.log(id, type, 'adqwdqw')
		this.setState({
			isModal: false,
		})
		this.props.navigation.push("NotificationDetail",{id: id, type: type})
	}

	NewsDetail = (id, type) =>
	{
		this.setState({
			isModal: false,
		})
		this.props.navigation.push("NewsDetail",{id: id, type: type, })
	}
	setModalVisible (s)
	{
		this.props.upGrade(s)
	}
	onRequestClose()
	{
		this.setState({
			isModal: false,
		});
		QBStorage.get('user')
			.then((user) =>
			{
				this.getPopMessageDetailsData(user.user_id)
			})
	}

	getPopMessageDetailsData(user_id)
	{
		//this.props.navigation.state.params.id
		homeService.getPopMessageDetailsData({user_id: user_id, event_id: this.state.eventId, })
			.then((res) =>
			{
				if (res.status == 1)
				{

				}
				else
				{
				}
			})
			.catch(err =>
			{
				console.log(err);
			})
	}

	upGrade()
	{
		if (!this.state.netStatus)
		{
			this.refs.toast.show("网络连接出错，请连接网络后重试！")
			return;
		}
		this.props.upGrade_isError(3)
	}
	upGradeBand()
	{
		if (!this.state.netStatus)
		{
			this.refs.toast.show("网络连接出错，请连接网络后重试！")
			return;
		}
		console.log(NativeModules, "参数111111")
		if (Platform.OS == "android")
		{
			var url = this.state.isupGradeBandData.download_url;
			NativeModules.upgrade.upgrade(url);
			this.setState({
				isupGradeBand: false,
			})
		}
		else
		{
			NativeModules.Upgrade.upgrade('1455068715', (msg) =>{
				if ('YES' == msg)
				{
					//跳转到APP Stroe
					NativeModules.Upgrade.openAPPStore('1455068715');
				}
				else
				{
					console.log("暂无最新版本")
				}
			})
		}
	}

	//首页数据上传进度条
	dataProgressView = () =>
	{
		if (this.state.dataProgressModal)
		{
			return (
				<View style={styles.upDataProgress}>
					<Image source={require("../../img/progress.gif")}  resizeMode={"cover"} style={{width: this.state.width, height: 5, }} />
					<View style={styles.progressContain}></View>
				</View>
			)
		}
		else
		{
			return null
		}
	}

	optCancel = () =>
	{
		this.setState({
			isBackground: false,
			isOpt: false,
		})
	}
	reConnect = async () =>
	{
		this.setState({
			isBackground: false,
			isOpt: false,
			deviceList: [],
			isConnecting: true,
		})
		var bindConnect = await DeviceService.getUserBindDeviceList();
		console.log(bindConnect, '绑定设被')
		this.isSevaralDevice = true;
		if (bindConnect.status === 1)
		{

			if (bindConnect.device_list)
			{
				if(bindConnect.device_list.length <  2)
				{
					this.props.startConnectDevice(bindConnect.device_list,this.onConnectCallback);
				}
				else
				{
					//绑定了多个
					this.props.startSeveralConnectDevice(bindConnect.device_list, this.onConnectCallback);
				}
			}
		}
		else
		{
			this.setState({
				isBackground: true,
			})
		}

	}

	//绑定了设备后的选择设备连接
	connectBle = devices =>
	{

		this.setState({
			isDeviceList: false,
			isBackground: false,
			isConnecting: true,
			deviceList: [],
		})
		this.isSevaralDevice = false;
		this.props.connectSecondBle(devices, this.onSecondBleCallback)
	}

	noConnectBle = devices =>
	{
		this.setState({
			isDeviceList: false,
			isBackground: false,
			isConnecting: true,
			deviceList: [],
		})
		this.isSevaralDevice = false;
		this.props.noConnectBle(devices, this.onSecondBleCallback)
	}

	onSecondBleCallback = res => {
		console.log(res, '返回的错误123123123');
		var message = res.message;

		if (message === '没有绑定设备')
		{
			this.setState({
				isBackground: false,
				isConnecting: false,
			})
		}
		else if (message === '没有搜索到设备')
		{
			this.setState({
				isBackground: true,
				isOpt: true,
				isConnecting: false,
			})
		}
		else if (message === '连接失败')
		{
			this.setState({
				isBackground: true,
				isOpt: true,
				isConnecting: false,
			})
		}
		else if (message === '连接成功')
		{
			this.setState({
				isBackground: false,
				isOpt: false,
				isConnecting: false,
			})
			_that.refs.toast.show(<View style={{justifyContent: "center", alignItems: 'center'}}>
				<Icon name="ios-checkmark-outline" size={55} color="#fff"></Icon>
				<Text style={{color: '#fff', }}>连接成功</Text>
			</View>)
		}
		else if (message === '上传超时')
		{
			this.setState({
				dataProgressModal: false,
			})
			_that.refs.toast.show(<View style={{justifyContent: "center", alignItems: 'center'}}>
				<Icon name="ios-checkmark-outline" size={55} color="#fff"></Icon>
				<Text style={{color: '#fff', }}>上传超时</Text>
			</View>)

		}
	}

	//🈚无绑定设备连接
	noBindConnect = () =>
	{
		var bleStatus = this.state.bleStatus;
		if (bleStatus !== 1)
		{
			this.refs.toast.show('蓝牙未连接');
			return;
		}
		this.setState({
			isBackground: false,
			spinner: true,
			spinnerText: '搜索中',
			isConnecting: true,
			deviceList: [],
		})
		this.props.clickConnectDevice(this.onClickConnectCallback);
	}

	onClickConnectCallback = res =>
	{
		console.log(res, '搜索到的设备');
		var message = res.message;
		if (message === '没有搜索到设备')
		{
			this.setState({
				isBackground: true,
				isOpt: true,
				isConnecting: false,
				spinner: false,
			})
			if (this.state.socketMsg)
			{
				this.props.multipleSend(9, this.state.socketMsg.guardian, this.state.socketMsg.underGuardian, "没有搜索到设备");
			}
		}
		else if (message === '未绑定搜索到多设备')
		{
			if (!this.state.isConnecting)
			{
				return;
			}
			if (!this.state.isDeviceList && this.isSevaralDevice)
			{
				this.setState({
					isDeviceList: true,
					isBackground: true,
				})
				if (this.state.socketMsg)
				{
					this.props.bletoolSend(12, this.state.socketMsg.guardian, this.state.socketMsg.underGuardian, '连接设备', '连接设备', 3)
				}

			}
			console.log(res, 'qweqweww')
			var device = res.device;
			var deviceList = this.state.deviceList;
			var findIndex = deviceList.findIndex(item => {
				return item.device_sn === device.device_sn;
			})

			if (findIndex < 0)
			{
				device.RSSI = device.siginal;
				deviceList.push(device);
				this.setState({
					deviceList: deviceList,
					spinner: false,
				})
				if (this.state.socketMsg)
				{
					console.log(this.state.socketMsg, '返回给监护人的设备')
					// this.props.multipleSend(12, this.state.socketMsg.guardian, this.state.socketMsg.underGuardian, "连接设备", '连接设备', 2, deviceList);
					this.props.bletoolSend(12, this.state.socketMsg.guardian, this.state.socketMsg.underGuardian, '连接设备', '连接设备', 2, 0, deviceList)
				}
			}
		}
		else if (message === '开始连接')
		{
			this.setState({
				isConnecting: true,
				spinner: false,
			})
		}
		else if (message === '连接失败')
		{
			this.setState({
				isBackground: true,
				isOpt: true,
				isConnecting: false,
				spinner: false,
			})
			if (this.state.socketMsg)
			{
				this.props.multipleSend(9, this.state.socketMsg.guardian, this.state.socketMsg.underGuardian, "连接失败");
			}
		}
		else if (message === '连接成功')
		{
			this.setState({
				isBackground: false,
				isOpt: false,
				isConnecting: false,
				spinner: false,
			})
			this.refs.toast.show(<View style={{justifyContent: "center", alignItems: 'center'}}>
				<Icon name="ios-checkmark-outline" size={55} color="#fff"></Icon>
				<Text style={{color: '#fff', }}>连接成功</Text>
			</View>)
			if (this.state.socketMsg)
			{
				this.props.multipleSend(9, this.state.socketMsg.guardian, this.state.socketMsg.underGuardian, "连接成功");
			}
		}
	}

	disCancel = () =>
	{
		this.setState({
			isBackground: false,
			isDisconnect: false,
		})
	}

	disConnect = () =>
	{
		this.setState({
			isBackground: false,
			isDisconnect: false,
		})
		this.props.disconnectBle(this.onDisconnectCallback)//断开连接
	}

	closeDevice = () =>
	{
		this.setState({
			isBackground: false,
			isDeviceList: false,
			isConnecting: false,
			deviceList: [],
		})
		this.isSevaralDevice = false;
		this.props.stopScan();

		DeviceEventEmitter.emit('DeviceSearch', true);
	}

	renderBle = () =>
	{
		var isBleStatus = this.state.isBleStatus;
		var systemName = this.systemName;
		var systemVersion = this.systemVersion;
		if (isBleStatus)
		{
			return null;
		}
		if (systemName === 'iOS')
		{
			var renderElement = (<View style={styles.bgTop}>
				<View><Text>从屏幕底部向上轻滑打开蓝牙</Text></View>
				<View><Image source={require('../../img/up_1.gif')} resizeMode="cover" style={{width: width, height: 100,}} /></View>
			</View>)
			return renderElement;
		}
	}

	renderPullDown = () =>
	{
		if (Platform.OS === "android")
		{
			return (
				<View style={{height: height - 45, overflow: 'scroll' }}>
					<PullList
					//FlatList基本属性
						data={this.state.refreshData}
						renderItem={({item, index, })=>this.renderListItem(item, index)}
						keyExtractor={(item, index) => item.toString()}
						//PullList下拉刷新
						onPullRelease={this.onPullRelease}
						topIndicatorRender={this.topIndicatorRender}
						topIndicatorHeight={60}
						//控制下拉刷新状态的属性，为true时显示头部刷新组件，为false则隐藏
						isRefreshing={this.state.isRefreshing}
					>
					</PullList>
				</View>
			)
		}
		return (<View style={{flex: 1, backgroundColor: '#fff', }}>
				<PullView
					//PullList下拉刷新
					onPullRelease={this.onPullRelease}
					topIndicatorRender={this.topIndicatorRender}
					topIndicatorHeight={60}
					//控制下拉刷新状态的属性，为true时显示头部刷新组件，为false则隐藏
					isRefreshing={this.state.isRefreshing}
				>
					{this.renderItem()}
				</PullView>
			</View>
		)
	}

	setisMessageModalVisible = () =>
	{
		this.setState({isMessageModal: false, })
	}

	renderListItem = (item, index) =>
	{
		if (index == 0)
		{

			return <View style={{ height: 1, backgroundColor: "#24a090", }}><Text></Text></View>;

		}
		console.log(this.props, '状态')
		var btn;
		var eq;
		let progress = 0;
		let progressBtn = null;
		let progressBar = null;
		let newVersion = "";
		let event = this.state.event;
		let eventId = this.state.eventId;

		if (this.state.upProgress.receivedBytes)
		{
			var receivedBytes = Number(this.state.upProgress.receivedBytes)
			var totalBytes = Number(this.state.upProgress.totalBytes)
			progress = Number((receivedBytes/totalBytes).toFixed(2))
		}
		else
		{
			progress = 0
		}
		if (this.state.upGrade_error == 2)
		{
			progressBtn = (<TouchableOpacity onPress={this.upGrade.bind(this)} style={styles.upGradeBtn}><Text style={{color: '#fff', }}>升级</Text></TouchableOpacity>)
		}
		else
		{
			progressBtn = null;
		}
		console.log(progress, "升级的11111")

		if (Platform.OS == "android")
		{
			progressBar = (<ProgressBarAndroid
				styleAttr="Horizontal"
				indeterminate={false}
				progress={progress}
			/>)
		}
		else
		{
			progressBar = (<ProgressView
				progress={progress}
				progressTintColor="#24a090"
			/>)
		}

		if (this.state.upGrade_band)
		{
			newVersion = 'V' + this.state.upGrade_band.version.slice(0, 1) + "." + this.state.upGrade_band.version.slice(1, 2) + "." + this.state.upGrade_band.version.slice(2);
		}
		else
		{
			newVersion = ""
		}
		if (this.props.eq)
		{
			eq = <Text style={{color: "#fff", paddingTop: 10, }}>电量：{this.props.eq}%</Text>
		}

		if (this.state.connectStatus !== 4)
		{
			//是否是进入页面首次连接
			btn = 	(<View style={styles.titleBtn}>
				{this.state.isConnecting ? <ImageBackground
					source={require('../../img/btn_connect.png')}
					style={styles.connect}
					resizeMode="cover"
				>
					<View style={styles.connectBtn_ing} >
						<Text style={styles.connectText}>连接中</Text>
						<Image source={require('../../img/home_loading.gif')} resizeMode="cover" style={styles.loading} />
					</View>
				</ImageBackground> :
					<ImageBackground
						source={require('../../img/btn_connect.png')}
						style={styles.connect}
						resizeMode="cover"
					>
						<TouchableOpacity
							onPress={this.events.bind(this, {type: 'connect', })}
							style={styles.connectBtn}
						>
							<Text style={styles.connectText}>点击连接</Text>
							<Text style={styles.connectText}>设备</Text>
						</TouchableOpacity>
					</ImageBackground>
				}
			</View>)
		}
		else
		{

			var connectedDevice = this.state.connectedDevice;
			btn = (<View style={styles.titleOnBtn}>
				<ImageBackground
					source={require('../../img/btn_connect.png')}
					style={styles.connected}
					resizeMode="cover"
				>
					<View
						style={styles.connectBtn}
					>
						<Text style={styles.connectedText}>已连接设备</Text>
					</View>
					<TouchableOpacity
						onPress={this.events.bind(this, {type: 'disconnect', })}
						style={styles.disConnectStyle}
					><Text style={{fontSize: 11, fontFamily: 'PingFangSC-Regular', color: '#fff',  }}>点击断开</Text></TouchableOpacity>
				</ImageBackground>
				<View style={styles.connectInfo}>
					{this._renderAlias()}
				</View>
			</View>)
		}


		return (
			<View style={{backgroundColor: '#F4F4F4',width: width, }}>
				<StatusBar
					translucent={true}
					animated={true}
					backgroundColor={"#24a090"}
					barStyle={"light-content"}
				/>
				<ImageBackground
					style={[styles.header, {height: 230,paddingTop: statusBarHeight, }, ]}
					source={require('../../img/bg_home.png')}
				>
					{btn}
				</ImageBackground>
				{this.dataProgressView()}
				<View style={{flexDirection: "row", backgroundColor: '#fff', marginBottom: 2, }}>
					<View style={{flexDirection: 'column',justifyContent: 'center', alignItems: 'center', }}>
						<Image
							source = {require("../../img/notice-dot-ic.png")}
							style = {{width: 30, marginLeft: 12, }}
						/>
					</View>
					{
						this.state.dataItems.length < 1 ?
							<View style={{flex: 1,justifyContent: 'center', alignItems: 'flex-start', paddingLeft: 10, height: 34, }}><Text>暂无消息</Text></View> :
							<View style={{flex: 1, height: 34, }}>
								<MarqueeVertical
									textList = {this.state.dataItems}
									width = {width - 130}
									height = {40}
									delay = {5000}
									direction = {'up'}
									numberOfLines = {1}
									bgContainerStyle = {{backgroundColor: '#fff', }}
									textStyle = {{fontSize: 14, color: '#435B54', paddingLeft: 10, paddingRight: 10, }}
									viewStyle = {{justifyContent: 'center', alignItems: 'center', }}
									onTextClick = {(item) => {
										// alert(''+JSON.stringify(item));
										this.NewsDetail(item.sourceId, 'roll')
									}}
								/>
							</View>
					}

					{
						this.state.dataItems.length < 1 ? null :
							<View style={{width: 40, flexDirection: 'row', justifyContent: 'center', alignItems: 'center', }}>
								<TouchableOpacity onPress={this.newsList.bind(this)} style={{flexDirection: 'row',flex: 1, justifyContent: 'center', alignItems: 'center', }}><Icon name="ios-arrow-forward-outline" size={24} color="#666"></Icon></TouchableOpacity>
							</View>

					}

				</View>
				{this.state.pointerShow==1 && this.state.connectStatus== 4&&<TouchableOpacity onPress={this.pointerPage.bind(this)} style={{position: 'absolute', top: height/5.5, right: 10}}>
					<Image style={{width: 60, }} source={require('../../img/pointer.png')} resizeMode="contain" />
				</TouchableOpacity>}
				<Modal
					animationType="fade"
					transparent={true}
					visible={this.state.isupGrade}
					onRequestClose={() => {

					}}
				>
					<View style={styles.modalContent}>
						<View style={styles.modalinner}>
							<View style={styles.modalBody}>
								<View style={{width: width - 90, marginBottom: 20, }}>
									{progressBar}
								</View>
								<Text>{this.state.upProgressText}</Text>
							</View>
							{progressBtn}
						</View>
					</View>
				</Modal>
				<Modal
					animationType="fade"
					transparent={true}
					visible={this.state.isupGradeBand}
					onRequestClose={() => { }}
				>
					<View style={styles.modalContent}>
						<View style={styles.modalinner}>
							<View style={styles.modalBody}>
								<Text style={styles.hudTextStyle}>发现新版本</Text>
								<Text style={styles.subText}>{newVersion}</Text>
							</View>
							<View style={styles.modalBottom}>
								<TouchableOpacity style={[styles.optYes, styles.opt, ]}  onPress={this.upGradeBand.bind(this)}>
									<Text style={styles.textMid}>马上更新</Text>
								</TouchableOpacity>
								{/*<TouchableOpacity style={[styles.optNo, styles.opt, ]}  onPress={() => this.setState({isupGradeBand: !this.state.isupGradeBand, })}>
									<Text style={styles.textMid}>稍后再说</Text>
				</TouchableOpacity>*/}
							</View>
						</View>
					</View>
				</Modal>
				<View style={styles.listTitle}><Text style={styles.listTitleText}>健康数据</Text></View>
				<View style={[styles.content, {marginBottom: 2, }]}>
					<TouchableOpacity style={styles.itemRow} onPress={this.goAppication.bind(this,{type: 'sports'})} >
						<Image style={styles.icon} source={require('../../img/sports.png')} resizeMode="contain" />
						<Text style={styles.text}>行走记步</Text>
					</TouchableOpacity>
					<TouchableOpacity style={styles.itemRow} onPress={this.goAppication.bind(this,{type: 'heart'})}>
						<Image style={styles.icon} source={require('../../img/heart.png')} resizeMode="contain" />
						<Text style={styles.text}>心率监测</Text>
					</TouchableOpacity>

					<TouchableOpacity style={styles.itemRow} onPress={this.goAppication.bind(this,{type: 'laser'})}>
						<Image style={styles.icon} source={require('../../img/laser.png')} resizeMode="contain"  />
						<Text style={styles.text}>激光周期</Text>
					</TouchableOpacity>

					<TouchableOpacity style={styles.itemRow} onPress={this.goAppication.bind(this,{type: 'tiwen'})}>
						<Image style={styles.icon} source={require('../../img/laser.png')} resizeMode="contain"  />
						<Text style={styles.text}>体温监控</Text>
					</TouchableOpacity>
				</View>
				<View style={styles.listTitle}><Text style={styles.listTitleText}>设备功能</Text></View>
				<View style={styles.content}>
					<TouchableOpacity style={styles.itemRow} onPress={this.goAppication.bind(this,{type: 'useGuide'})} >
						<Image style={styles.icon} source={require('../../img/use_guide.png')} resizeMode="contain" />
						<Text style={styles.text}>使用指南</Text>
					</TouchableOpacity>

					<TouchableOpacity style={styles.itemRow} onPress={this.goAppication.bind(this,{type: 'deviceManage'})}>
						<Image style={styles.icon} source={require('../../img/deviceManage.png')} resizeMode="contain"  />
						<Text style={styles.text}>设备管理</Text>
					</TouchableOpacity>
					<TouchableOpacity style={styles.itemRow} onPress={this.goAppication.bind(this,{type: 'myCourse'})}>
						<Image style={styles.icon} source={require('../../img/courseManager.png')} resizeMode="contain" />
						<Text style={styles.text}>健康管理</Text>
					</TouchableOpacity>
					<TouchableOpacity style={styles.itemRow} onPress={this.goAppication.bind(this, {type: 'jianhuren', })}>
						<Image style={styles.icon} source={require('../../img/guardianManager.png')} resizeMode="contain" />
						<Text style={styles.text}>监护人</Text>
					</TouchableOpacity>
					<TouchableOpacity style={styles.itemRow} onPress={this.goAppication.bind(this,{type: 'bleTool'})}>
						<Image style={styles.icon} source={require('../../img/deviceApplication.png')} resizeMode="contain" />
						<Text style={styles.text}>设备应用</Text>
					</TouchableOpacity>
					<TouchableOpacity style={styles.itemRow} onPress={this.goAppication.bind(this, {type: 'jiankangyouping', })}>
						<Image style={styles.icon} source={require('../../img/shopManager.png')} resizeMode="contain" />
						<Text style={styles.text}>设备配件</Text>
					</TouchableOpacity>

					<TouchableOpacity style={styles.itemRow} onPress={this.goAppication.bind(this,{type: 'airUpdata'})}>
						<Image style={styles.icon} source={require('../../img/dfuManager.png')} resizeMode="contain"  />
						<Text style={styles.text}>空中升级</Text>
					</TouchableOpacity>
				</View>

			</View>

		);

	}


	render()
	{
		let progress = 0;
		let progressBtn = null;
		let progressBar = null;
		let newVersion = "";
		let event = this.state.event;
		let eventId = this.state.eventId;

		if (this.state.upProgress.receivedBytes)
		{
			var receivedBytes = Number(this.state.upProgress.receivedBytes)
			var totalBytes = Number(this.state.upProgress.totalBytes)
			progress = Number((receivedBytes/totalBytes).toFixed(2))
		}
		else
		{
			progress = 0
		}
		if (this.state.upGrade_error == 2)
		{
			progressBtn = (<TouchableOpacity onPress={this.upGrade.bind(this)} style={styles.upGradeBtn}><Text style={{color: '#fff', }}>升级</Text></TouchableOpacity>)
		}
		else
		{
			progressBtn = null;
		}
		console.log(progress, "升级的11111")

		if (Platform.OS == "android")
		{
			progressBar = (<ProgressBarAndroid
				styleAttr="Horizontal"
				indeterminate={false}
				progress={progress}
			/>)
		}
		else
		{
			progressBar = (<ProgressView
				progress={progress}
				progressTintColor="#24a090"
			/>)
		}

		if (this.state.upGrade_band)
		{
			newVersion = 'V' + this.state.upGrade_band.version.slice(0, 1) + "." + this.state.upGrade_band.version.slice(1, 2) + "." + this.state.upGrade_band.version.slice(2);
		}
		else
		{
			newVersion = ""
		}

		return (
			<View style={{height: height - 45, }}>
				{this.renderPullDown()}
				<Toast
					ref="toast"
					position="center"
				/>
				<Spinner
					visible={this.state.remoteLoadingStatus}
					textContent={this.state.remoteLoadingText}
					textStyle={{fontSize: 14, }}
				/>
				<Spinner
					visible={this.state.spinner}
					textContent={this.state.spinnerText}
					textStyle={{fontSize: 14, }}
				/>

				<Modal
					visible={this.state.isMessageModal}
					transparent={true}
					onRequestClose={this.setisMessageModalVisible}
				>
					<View style={styles.messageAll}></View>
					<View style={styles.messageContent}>
						<View style={{position: 'absolute', right: 10, top: 25, zIndex: 9999}}>
							<TouchableOpacity onPress={this.setisMessageModalVisible}>
								<Image source = {require("../../img/cancel.png")} style = {{width: 18, height: 18,  }} resizeMode="cover"/>
							</TouchableOpacity>
						</View>
						<View style={{width: '100%', alignItems: 'center', justifyContent: 'center', height: 50, }}>
							<Text style={{fontSize: 20, color: '#000'}}>{this.state.message.title}</Text>
						</View>
						<ScrollView style={{width: '100%', height: 100, }}>
							<Text style={{fontSize: 16, color: '#999'}}>{this.state.message.content}</Text>
						</ScrollView>
					</View>
				</Modal>
				<Modal
					visible={this.state.isModal}
					transparent={true}
					onRequestClose={() => {this.onRequestClose()}}
				>
					<View style={styles.messageAll}></View>
					<View style={styles.messageContent}>
						<View style={{position: 'absolute', right: 10, top: 25, zIndex: 9999}}>
							<TouchableOpacity onPress={this.onRequestClose.bind(this)}>
								<Image source = {require("../../img/cancel.png")} style = {{width: 18, height: 18 }} resizeMode="cover"/>
							</TouchableOpacity>
						</View>
						<View style={{width: '100%', alignItems: 'center', justifyContent: 'center', height: 50,}}>
							<Text style={{fontSize: 20, color: '#000'}}>{event.title}</Text>
						</View>
						<ScrollView style={{width: '100%',height: 100, }}>
							<Text style={{fontSize: 16, color: '#999'}}>{event.content}</Text>
						</ScrollView>
						<View style={{width: '100%', alignItems: 'center', justifyContent: 'center', flex: 1}}>
							<TouchableOpacity onPress={this.NewsDetail.bind(this, eventId, 'messageBox')} style={{backgroundColor: '#24a090', width: 120, height: 25, alignItems: 'center', justifyContent: 'center', borderRadius: 30}}>
								<Text style={{color: '#fff'}}>去查看</Text>
							</TouchableOpacity>
						</View>
					</View>
				</Modal>
				<Modal
					animationType="fade"
					transparent={true}
					visible={this.state.isupGrade}
					onRequestClose={() => {

					}}
				>
					<View style={styles.modalContent}>
						<View style={styles.modalinner}>
							<View style={styles.modalBody}>
								<View style={{width: width - 90, marginBottom: 20, }}>
									{progressBar}
								</View>
								<Text>{this.state.upProgressText}</Text>
							</View>
							{progressBtn}
						</View>
					</View>
				</Modal>

				{/*----------------------------------------*/}
				<Modal
					animationType="fade"
					transparent={true}
					visible={this.state.isupGradeBand}
					onRequestClose={() => { }}
				>
					<View style={styles.modalContent}>
						<View style={styles.modalinner}>
							<View style={styles.modalBody}>
								<Text style={styles.hudTextStyle}>发现新版本</Text>
								<Text style={styles.subText}>{newVersion}</Text>
							</View>
							<View style={styles.modalBottom}>
								<TouchableOpacity style={[styles.optYes, styles.opt, ]}  onPress={this.upGradeBand.bind(this)}>
									<Text style={styles.textMid}>马上更新</Text>
								</TouchableOpacity>
								{/*<TouchableOpacity style={[styles.optNo, styles.opt, ]}  onPress={() => this.setState({isupGradeBand: !this.state.isupGradeBand, })}>
									<Text style={styles.textMid}>稍后再说</Text>
				</TouchableOpacity>*/}
							</View>
						</View>
					</View>
				</Modal>
				{this.state.isBackground ? <View style={styles.background}></View> : null}
				{this.state.isDisconnect ? <View style={styles.disModal}>
					<View style={styles.disContent}><Text style={{fontSize: 16, }}>您确定要断开设备吗？</Text></View>
					<View style={styles.disFooter}>
						<TouchableOpacity
							style={[styles.disOpt, {borderRightColor: '#ddd', borderRightWidth: 1, }]}
							onPress={this.disCancel}
						><Text>取消</Text></TouchableOpacity>
						<TouchableOpacity
							style={styles.disOpt}
							onPress={this.disConnect}
						><Text>确定</Text></TouchableOpacity>
					</View>
				</View> : null }
				{this.state.searchEd ? <View><Text>设备列表</Text></View> : null}
				{this.state.isOpt ? <View style={styles.optModal}>
					<View style={styles.optTitle}><Text style={{fontSize: 18}}>操作指导</Text></View>
					<View style={styles.optContent}>
						<View style={styles.optItem}><Text style={{color: '#666'}}>1.请确认蓝牙已经正常打开</Text></View>
						<View style={styles.optItem}><Text style={{color: '#666'}}>2.请确认按压设备上的激活按钮</Text></View>
					</View>
					<View style={styles.optBootom}>
						<TouchableOpacity
							style={styles.optCan}
							onPress={this.optCancel}
						>
							<Text style={{fontSize: 16, }}>取消操作</Text>
						</TouchableOpacity>
						<TouchableOpacity
							style={styles.optCan}
							onPress={this.reConnect}
						>
							<Text style={{fontSize: 16, color: '#02BB00', }}>再次连接</Text>
						</TouchableOpacity>
					</View>
				</View> : null}
				{this.state.isDeviceList ? <View style={styles.searchDevicesModal}>
					<View style={styles.activeTitle}>
						<Text>请选择您要连接的设备</Text>
						<TouchableOpacity
							style={styles.modalIcon}
							onPress={this.closeDevice}
						>
							<Icon name="ios-close-outline" size={36} color="#000"></Icon>
						</TouchableOpacity>
					</View>
					<ScrollView style={styles.searchDevicesContent}>
						<View style={styles.deviceContent}>
							{this.renderDeviceList()}
						</View>
					</ScrollView>
				</View> : null}
			</View>
		);
	}

	renderDeviceList = () =>
	{
		if (!this.state.deviceList)
		{
			return null;
		}
		var deviceList = this.state.deviceList;
		var viewList = deviceList.map(item =>
		{
			if (item.livel == 1)
			{
				signal = <Image style={styles.siginal} source={require("../../img/blueToolth_strong.png")} />
			}
			else if (item.livel == 2)
			{
				signal = <Image style={styles.siginal} source={require("../../img/blueToolth_middle.png")} />
			}
			else
			{
				signal = <Image style={styles.siginal} source={require("../../img/blueToolth_small.png")} />
			}
			return (<View key={item.id} style={styles.deviceList}>
				<View style={styles.deviceWholeicon}>
					<Image source={item.isCicle ? require('../../img/D98F75F2422DFAA6EDECFB07E4EC6FEC.png') : require('../../img/4504C9A05948F7484AED647093D6F3A9.png')} resizeMode="contain" style={styles.deviceIcon} />
				</View>
				<View style={{height: 60, justifyContent: 'space-around',}}>
					<View style={styles.proName}><Text style={{fontSize: 16, }}>{item.prevName}号{item.device_name}</Text>{signal}</View>
					<View><Text style={{fontSize: 14, }}>编号：{item.device_sn}</Text></View>
				</View>
				<TouchableOpacity
					style={styles.connectBtnPress}
					onPress={() => this.connectBle(item)}
				>
					<Text style={{color: '#fff'}}>连接</Text>
				</TouchableOpacity>
			</View>)
		})
		return viewList
	}

	connectDirect = (i, s) =>
	{
		this.setState({
			willConnectDevice: s,
		});
		this.props.getConnectORsearch(1)


	}

	pointerPage = () =>
	{
		this.props.navigation.navigate('Test', {productModle: this.state.firmWare.productModle, });
	}
	goAppication = async (res) =>
	{
		console.log(res, '传递的参数13123123')
		var type = res.type;
		switch (type) {
		case 'useGuide' :
			this.props.navigation.navigate('UseGuide');
			break;
		case 'bleTool':
			this.props.navigation.navigate('BleTool');
			break;
		case 'deviceManage':
			if (this.props.bindStatus == 8 )
			{
				this.props.navigation.navigate("BindPhonePage");
			}
			else
			{
				this.props.navigation.navigate('DeviceManage');
			}
			break;
		case 'myCourse':
			this.props.navigation.navigate("CourseManager")
			break;
		case 'buyCourse':
			this.props.navigation.navigate("IsBuyCourse")
			break;
		case "dataObserve":
			if (this.props.untied == 8 && this.props.connectStatus == 4)
			{
				this.alert("设备数据正在上传，成功后可查看最新数据", () => {

				})
			}
			if (this.props.userDeviceList.length == 1 )
			{
				this.props.navigation.navigate("DataObserve", {sn: this.props.userDeviceList[0].device_sn, })
				return;
			}
			this.props.navigation.navigate("DeviceList")
			break;
		case "upData":
			if (this.props.connectStatus !== 4)
			{
				this.refs.toast.show(<View style={{justifyContent: "center", alignItems: 'center'}}>
					<Icon name="ios-checkmark-outline" size={55} color="#fff"></Icon>
					<Text style={{color: '#fff', }}>请连接设备</Text>
				</View>)
				return;
			}
			if (this.state.dataProgress > 0)
			{
				this.refs.toast.show(<View style={{justifyContent: "center", alignItems: 'center'}}>
					<Icon name="ios-checkmark-outline" size={55} color="#fff"></Icon>
					<Text style={{color: '#fff', }}>数据上传中</Text>
				</View>)
				return;
			}
			this.setState({
				dataProgressModal: true,
				spinner: true,
				spinnerText: '上传中',
			})
			//首页上传数据
			this.props.upData(this.onUpdataCallback);
			break;
		case "contact":
			this.alert("功能待开发中...", () => {

			})
			break;
		case "airUpdata":
			var connectStatus = this.state.connectStatus;
			if (connectStatus !== 4)
			{
				this.refs.toast.show(<View style={{justifyContent: "center", alignItems: 'center'}}>
					<Icon name="ios-checkmark-outline" size={55} color="#fff"></Icon>
					<Text style={{color: '#fff', }}>请连接设备</Text>
				</View>)
				return;
			}
			this.props.navigation.navigate("AirUpdata")
			break;
		case "jiankangyouping":
			console.log(this.props.user, '新的1111')
			var mobile = this.props.user&&this.props.user.mobile  ? this.props.user.mobile : "";
			if (!mobile)
			{
				this.refs.toast.show('用户手机号不存在')
				return;
			}
			var shop_id = this.props.user&&this.props.user.shop_id  ? this.props.user.shop_id : 45;
			var shop_url = this.props.user&&this.props.user.shop_url  ? this.props.user.shop_url : '';
			this.props.navigation.navigate("Youzan", {phone: mobile, shop_id: shop_id, shop_url: shop_url, });
			// this.alert("微信搜索公众号：养米科技，关注并进入商城购买", () => {

			// })
			break;
		case "shopp":
			console.log(this.props.user, '新的1111')
			mobile = this.props.user&&this.props.user.mobile  ? this.props.user.mobile : "";
			if (!mobile)
			{
				this.refs.toast.show('用户手机号不存在')
				return;
			}
			this.props.navigation.navigate("Youzan", {phone: mobile, });
			break;
		case "jianhuren":
			this.props.navigation.navigate("GuardianChoose")
			break;
		case "sports":
			console.log(this.state.userDeviceList, '用户绑定的设备')
			var bindingData = await HomeController.isBindDevice();
			var connectStatus = this.state.connectStatus;
			if (connectStatus === 4)
			{
				this.props.navigation.navigate("SportsObserve", {sn: this.state.connectedDevice.device_sn,});
				return;
			}
			if (bindingData.status == 1)
			{
				this.props.navigation.navigate("SportsObserve", {sn: bindingData.deviceList[0].device_sn,})
				return;
			}
			this.props.navigation.navigate("DeviceList", {type: 'sports', })
			break;
		case "heart":
			var bindingData = await HomeController.isBindDevice();
			var connectStatus = this.state.connectStatus;
			if (connectStatus === 4)
			{
				this.props.navigation.navigate("HeartObserve", {sn: this.state.connectedDevice.device_sn,});
				return;
			}
			if (bindingData.status == 1 )
			{
				this.props.navigation.navigate("HeartObserve", {sn: bindingData.deviceList[0].device_sn, })
				return;
			}
			this.props.navigation.navigate("DeviceList", {type: 'heart', })
			break;
		case "laser":
			var bindingData = await HomeController.isBindDevice();
			var connectStatus = this.state.connectStatus;
			if (connectStatus === 4)
			{
				this.props.navigation.navigate("LaserObserve", {sn: this.state.connectedDevice.device_sn,});
				return;
			}
			if (bindingData.status == 1 )
			{
				this.props.navigation.navigate("LaserObserve", {sn: bindingData.deviceList[0].device_sn, })
				return;
			}
			this.props.navigation.navigate("DeviceList", {type: 'laser', })
			break;
		case 'tiwen':
			var bindingData = await HomeController.isBindDevice();
			var connectStatus = this.state.connectStatus;
			if (connectStatus === 4)
			{
				this.props.navigation.navigate("TiwenObserve", {sn: this.state.connectedDevice.device_sn,});
				return;
			}
			if (bindingData.status == 1 )
			{
				this.props.navigation.navigate("TiwenObserve", {sn: bindingData.deviceList[0].device_sn, })
				return;
			}
			this.props.navigation.navigate("DeviceList", {type: 'tiwen', })
			break;
		}
	}
	//上传数据的回调
	onUpdataCallback = res =>
	{
		console.log(res, '数据上传的')
		var status = res.status;
		this.setState({
			dataProgressModal: false,
			spinner: false,
		})
		if (status === 1)
		{
			var content = '上传成功'
		}
		else
		{
			content = '上传失败'
		}
		this.refs.toast.show(<View style={{justifyContent: "center", alignItems: 'center'}}>
			<Icon name="ios-checkmark-outline" size={55} color="#fff"></Icon>
			<Text style={{color: '#fff', }}>{content}</Text>
		</View>)
	}
	//弹出提示
	alert(text, callback)
	{
		Alert.alert("提示", text, [{ text:"确认",onPress:()=>{ callback() } }]);
	}
	socketAlert(text, cancel, callback)
	{
		Alert.alert("监护申请", text, [
			{ text: "拒绝", onPress:()=>{ cancel()  } },
			{ text: "确定", onPress:()=>{ callback() } }
		])
	}
	DFUAlert(text, content, callback, cancel)
	{
		Alert.alert(text, content,[
			{ text:"取消",onPress:()=>{ cancel() } },
			{ text:"升级",onPress:()=>{ callback() } }] )
	}
}

function mapStateToProps(state)
{
	console.log(state, '子组件的属性')
	return {
		guardianToken: state.guardian.token,
		firmWare: state.ble.firmWare,
		connectStatus: state.ble.connectStatus,
		connectedDevice: state.ble.connectedDevice,
		userDeviceList: state.user.userDeviceList,
		deviceMsg: state.ble.deviceMsg,
		bleStatus: state.ble.bleStatus,
		eq: state.ble.eq,
		airUpdataStatus: state.ble.airUpdataStatus,
		isConnectORsearch: state.ble.isConnectORsearch,
		deviceInformation: state.ble.deviceInformation,
		untied: state.ble.untied,
		pointerStatus: state.ble.pointerStatus,
		isupGrade: state.ble.isupGrade,
		upProgress: state.ble.upProgress,
		upGrade_error: state.ble.upGrade_error,
		upGrade_band: state.ble.upGrade_band,
		netStatus: state.loginIn.netStatus,
		user_id: state.loginIn.user ? state.loginIn.user.user_id : '',
		token: state.loginIn.user ? state.loginIn.user.token : '',
		userSearchedList: state.ble.userSearchedList,
		searchStatus: state.ble.searchStatus,
		dataProgress: state.ble.dataProgress,
		appUpdateStatus: state.loginIn.appUpdateStatus,
		user: state.loginIn.user,
		phone: state.loginIn.user ? state.loginIn.user.mobile: '',
		socketMsg: state.webSocketReducer.socketMsg,
		remoteLoadingStatus: state.webSocketReducer.remoteLoadingStatus,
		remoteLoadingText: state.webSocketReducer.remoteLoadingText,
	}
}

function mapDispatchToProps(dispatch)
{
	return {
		stopScan: () => dispatch(bleActions.stopScan()),
		upData: callback => dispatch(bleActions.upData(callback)), //上传数据
		startConnectDevice: (devices, callback) => dispatch(bleActions.startConnectDevice(devices, callback)),
		startSeveralConnectDevice: (devices, callback) => dispatch(bleActions.startSeveralConnectDevice(devices, callback)),
		clickNoBindConnectDevice: callback => dispatch(bleActions.clickNoBindConnectDevice(callback)),
		isBind: callback => dispatch(bleActions.isBind(callback)),
		disconnectBle: callback => dispatch(bleActions.disconnectBle(callback)),
		noConnectBle: (devices, callback) => dispatch(bleActions.noConnectBle(devices, callback)), //没有绑定时点击直接连接
		connectSecondBle: (devices, callback) => dispatch(bleActions.connectSecondBle(devices, callback)),
		fetchUserCourse: (device_sn) => dispatch(fetchUserCourse(device_sn)),
		airUpdating: (s) => dispatch(airUpdating(s)),
		connectionSucceeded: (s) => dispatch(connectionSucceeded(s)),
		configuration: (device_sn, obj, msg) => dispatch(configuration(device_sn, obj, msg)),
		loginOut: (s) => dispatch(loginOut(s)),
		getUntied: (s) => dispatch(bleDataHandle.untied(s)),
		upGrade: (s) => dispatch(upGrade(s)),
		upGrade_isError: (s) => dispatch(upGrade_error(s)),
		pointerShow: (s) => dispatch(pointerShow(s)),
		getConnectORsearch: (s) => dispatch(bleActions.getConnectORsearch(s)),
		eableBlue: () => dispatch(bleActions.eableBlue()),
		getDataProgress: (s) => dispatch(bleActions.getDataProgress(s)),
		connectSocket: (id) => dispatch(webSocketActions.connectWebsocket(id)),
		sendSocketMessage: (a, b, c, d, e, f) => dispatch(webSocketActions.sendMessage(a, b, c, d, e, f)),
		multipleSend: (a, b, c, d, e, f, g) => dispatch(webSocketActions.multipleSend(a, b, c, d, e, f, g)),
		remoteLoading: (status, text) => dispatch(webSocketActions.remoteLoading(status, text)),
		bletoolSend: (a, b, c, d, e, f, g, h) => dispatch(webSocketActions.bletoolSend(a, b, c, d, e, f, g, h)),
		getUserMsgCount: () => dispatch(notificationActions.getUserMsgCount()),
		appLoad: () => dispatch(appActions.appLoad()),
	}
}

export default connect(mapStateToProps, mapDispatchToProps)(HomePage)


const styles = StyleSheet.create({
	wholeBleModal: {
		justifyContent: 'center',
		alignItems: 'center',
	},
	bleModal: {
		width: width - 40,
		height: 200,
		backgroundColor: '#fff',
		justifyContent: 'center',
		alignItems: 'center',
	},
	// container: {
	// 	marginTop: statusBarHeight,
	// },
	header: {
		backgroundColor: '#24a090',
		flexDirection: 'column',
		justifyContent: 'center',
		alignItems: 'center',
	},
	proImg: {
		borderRadius: 35,
		overflow: 'hidden',
		width: 80,
		height: 80,
	},
	loadingImg: {
		overflow: 'hidden',
		width: 100,
		height: 30,
	},
	connect: {
		width: 200,
		height: 200,
		justifyContent: 'center',
		alignItems: 'center',
	},
	connected: {
		width: 180,
		height: 180,
		justifyContent: 'center',
		alignItems: 'center',
	},
	titleBtn: {
		flexDirection: 'column',
		justifyContent: 'center',
		alignItems: 'center',
	},
	titleOnBtn: {
		flexDirection: 'row',
	},
	content:{
		backgroundColor: '#fff',
		flexWrap:'wrap',
		flexDirection: 'row',
		paddingBottom: 15,
	},
	itemRow: {
		alignItems:'center',
		justifyContent: 'center',
		width: boxW,
		height: boxW,
		marginLeft: vMargin,
		marginTop: hMargin,
	},
	itemSetRow: {
		alignItems:'center',
		justifyContent: 'center',
		width: rBoxW,
		height: rBoxW,
		marginLeft: vrMargin,
		marginTop: hMargin,
	},
	icon: {
		width: 48,
		height: 48,
		marginBottom: 6,
	},
	flash: {
		flex: 1,
		flexDirection: 'row',
		alignItems: 'center',
	},
	tabBarIcon: {
		width: 19,
		height: 19,
	},
	text: {
		fontSize: 16,
	},
	linearLine: {
		width: 2,
		height: 40,
	},
	linearGradient: {
		flex: 1,
	},
	messageAll: {
		justifyContent: 'center',
		alignItems: 'center',
		height: '100%',
		width: '100%',
		backgroundColor: '#000',
		opacity: 0.4,
		position: 'absolute',
	},
	messageContent: {
		position: 'absolute',
		top: '35%',
		bottom: '35%',
		left: '15%',
		right: '15%',
		backgroundColor: '#fff',
		borderRadius: 10,
		alignItems: 'center',
		paddingHorizontal: 10,
		paddingVertical: 10,
	},
	textMid: {
		fontSize: 14,
		color: '#fff',
	},
	modalContent: {
		justifyContent: "center",
		alignItems: 'center',
		height: height,
		backgroundColor: 'rgba(111,87,87,.4)',
	},
	modalinner: {
		width: width - 50,
		marginLeft: 25,
		marginRight: 25,
		height: 250,
		backgroundColor: '#fff',
		justifyContent: 'center',
		alignItems: 'center',
		borderRadius: 4,
	},
	modalProgressInner: {
		width: width - 100,
		marginLeft: 25,
		marginRight: 25,
		height: 200,
		backgroundColor: '#fff',
		justifyContent: 'center',
		alignItems: 'center',
		borderRadius: 4,
	},
	modalBody: {
		paddingHorizontal: 20,
		justifyContent: 'center',
		alignItems: 'center',
		width: width - 50,
		flex: 1,
	},
	modalBottom: {
		flexDirection: 'row',
		justifyContent: "space-around",
		alignItems: 'center',
		height: 80,
		width: width - 50,
	},
	hudTextStyle: {
		color: "#24a090",
		fontSize: 18,
		fontWeight: "bold",
	},
	subText: {
		color: '#24a090',
		fontSize: 14,
	},
	opt: {
		width: (width - 50)/2 - 50,
		height: 34,
		borderRadius: 4,
		justifyContent: 'center',
		alignItems: 'center',
	},
	optYes: {
		backgroundColor: '#24a090',
		width: (width - 100)/2 - 50,
		height: 34,
		borderRadius: 20,
		justifyContent: 'center',
		alignItems: 'center',
	},
	optNo: {
		width: (width - 100)/2 - 50,
		height: 34,
		borderRadius: 20,
		justifyContent: 'center',
		alignItems: 'center',
		borderColor: '#7f8389',
		borderWidth: 1,

	},
	upGradeBtn: {
		width: 100,
		height: 34,
		backgroundColor: '#24a090',
		marginBottom: 10,
		justifyContent: 'center',
		alignItems: 'center',
	},
	upDataProgress: {
		width: width,
		height: 5,
	},
	progressContain: {
		position: 'absolute',
		left: 0,
		top: 0,
		width: width,
		height: 5,
		justifyContent: 'center',
		alignItems: 'center',
	},
	failUpdateYes: {
		backgroundColor: '#24a090',
	},
	background: {
		backgroundColor: "rgba(0, 0 ,0, .4)",
		width: width,
		height: height,
		position: 'absolute',
		left: 0,
		top: 0,
		zIndex: 1,
	},
	activeDevice: {
		borderRadius: 10,
		backgroundColor: '#fff',
		width: width - 100,
		height: width - 100,
		position: 'absolute',
		top: height/2 - (width - 100)/2,
		marginLeft: 50,
		zIndex: 2,
		alignItems: 'center',
	},
	activeImg: {
		width: 89,
		height: 140,
	},
	activeTitle: {
		height: 50,
		justifyContent: 'center',
		alignItems: 'center',
	},
	optModal: {
		position: 'absolute',
		width: width - 100,
		height: 150,
		backgroundColor: '#fff',
		top: height/2 - 75,
		marginLeft: 50,
		zIndex: 2,
		borderRadius: 5,
	},
	optTitle: {
		height: 60,
		justifyContent: 'center',
		alignItems: 'center',
	},
	optItem: {
		justifyContent: 'center',
		alignItems: "flex-start",
		marginLeft: 50,
		marginBottom: 5,
	},
	optContent: {
		flex: 1,
		justifyContent: 'center',
		alignItems: "flex-start",
	},
	optBootom: {
		flexDirection: 'row',
		height: 50,
	},
	optCan: {
		flex: 1,
		justifyContent: 'center',
		alignItems: 'center',
	},
	searchDevicesModal: {
		position: 'absolute',
		width: width - 40,
		height: 400,
		top: height/2 - 200,
		marginLeft: 20,
		backgroundColor: '#fff',
		zIndex: 2,
		borderRadius: 10,
		paddingBottom: 40,
	},
	searchDevicesContent: {
		height: 150,
	},
	modalIcon: {
		position: 'absolute',
		height: 60,
		justifyContent: 'center',
		alignItems: 'center',
		right: 10,
		top: 0,
	},
	deviceWholeicon: {
		height: 60,
		justifyContent: 'center',
		alignItems: 'center',
	},
	deviceIcon: {
		width: 60,
		height: 60,
	},
	deviceList: {
		flexDirection: 'row',
		justifyContent: 'space-between',
		alignItems: 'center',
		marginBottom: 15,
		height: 60,
	},
	deviceContent: {
		paddingHorizontal: 10,
	},
	connectBtn: {
		justifyContent: 'center',
		alignItems: 'center',
	},
	connectBtn_ing: {
		flexDirection: 'row',
		justifyContent: 'center',
		alignItems: 'center',
	},
	connectBtnPress: {
		backgroundColor: '#24a090',
		borderRadius: 8,
		width: 50,
		height: 25,
		justifyContent: 'center',
		alignItems: 'center',
	},
	connectText: {
		fontSize: 24,
		color: '#fff',
		fontWeight: 'bold',
	},
	connectedText: {
		fontSize: 20,
		color: '#fff',
		fontFamily: 'PingFangSC-Medium',
	},
	connectInfo: {
		justifyContent: 'center',
		alignItems: 'flex-start',
	},
	disConnectStyle: {
		marginTop: 10,
		width: 66,
		height: 20,
		justifyContent: 'center',
		alignItems: 'center',
		borderColor: '#fff',
		borderWidth: 1,
		borderRadius: 100,
	},
	disModal: {
		position: 'absolute',
		zIndex: 9999,
		width: width - 40,
		marginLeft: 20,
		top: height / 2 - 75,
		height: 150,
		backgroundColor: '#fff',
		borderRadius: 10,
	},
	disContent: {
		flex: 1,
		justifyContent: 'center',
		alignItems: 'center',
	},
	disFooter: {
		height: 50,
		flexDirection: 'row',
		borderTopColor: '#ddd',
		borderTopWidth: 1,
	},
	disOpt: {
		flex: 1,
		justifyContent: 'center',
		alignItems: 'center',
	},
	bindConnect: {
		width: 100,
		height: 30,
		backgroundColor: '#24a090',
		borderRadius: 6,
		justifyContent: 'center',
		alignItems: 'center',
		marginTop: 5,
	},
	whiteColor: {
		color: '#fff',
	},
	deviceTitle: {
		color: "#fff",
		fontFamily: 'PingFangSC-Medium',
		fontSize: 12,
	},
	viewCenter: {
		justifyContent: 'center',
		alignItems: 'flex-start',
	},

	proName: {
		flexDirection: 'row',
	},
	siginal: {
		marginLeft: 5,
	},
	listTitle: {
		backgroundColor: '#fff',
		paddingHorizontal: 20,
		paddingTop: 10,
		borderTopColor: '#f4f4f4',
		borderTopWidth: 2,
	},
	listTitleText: {
		fontSize: 18,
		color: '#111111',
		fontWeight: 'bold',
	},
	bgTop: {
		position: "absolute",
		top: 0,
		left: 0,
		width: width,
		height: height,
		backgroundColor: 'rgba(0, 0, 0, .5)',
	},
	loading: {
		width: 40,
		height: 40,
	}

});
