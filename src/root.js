import React, {Component, } from 'react';
import { 
	Platform,
	DeviceEventEmitter,
	NetInfo,
	NativeModules,
	AppState,
} from 'react-native';
import {Provider, } from 'react-redux';
import configureStore from './reducers/configureStore';
import creatApp from './app';
import codePush from "react-native-code-push";
import { createAppContainer } from 'react-navigation'; 
import SplashScreen from "react-native-splash-screen";
import {PersistGate, } from 'redux-persist/lib/integration/react';
import * as cmd from './utils/ble/cmd';
import QRCode from './utils/ble/qrCode';
import { DFUEmitter, NordicDFU, } from "react-native-nordic-dfu";
import * as WeChat from 'react-native-wechat';
import RNFetchBlob from 'rn-fetch-blob';
import AliyunPush from 'react-native-aliyun-push';
import * as rootController from './rootController';
import BgPage from './common/bg/bg';

import { stopScan, clearAt, upGrade, upGrade_progress, upGrade_error, getAppNewBand,   } from './actions/device/bleActions'
import * as bleActions from "./actions/device/bleActions";
import { netWork, getUpdateStatus,  } from './actions/loginActions'
import * as webSocketActions from './actions/webSocketActions';
import * as userService from "./utils/network/userService";
import * as loginService from "./utils/network/loginService";
import BleModule from './utils/ble/bleModule';
import QBStorage from './utils/storage/storage';
const { persistor, store, } = configureStore();
let qrCode = new QRCode();

let BluetoothManager = new BleModule();

var allDevices = [];
// gets the current screen from navigation state
function getActiveRouteName(navigationState) 
{
	if (!navigationState) 
	{
		return null;
	}
	const route = navigationState.routes[navigationState.index];
	// dive into nested navigators
	if (route.routes) 
	{
		return getActiveRouteName(route);
	}
	return route.routeName;
}

class Root extends Component 
{
	// 构造
	constructor(props) 
	{
		super(props);
		// 初始状态
		//应用注册
		this.state = {
			dispalay: false,
		}
		this.deviceMap = new Map();
		this.searchMap = new Map();
		this.isReceiveStatus = "connected";
		this.isAirUpdata = true;
		this.navigator = {};
		this.siginal = 0;
		this.willConnectDevice = new Object();
		this.flage = false;
		this.imagefile = '';

	}
	codePushStatusDidChange(syncStatus) 
	{
		switch (syncStatus) 
		{
		case codePush.SyncStatus.CHECKING_FOR_UPDATE:
			
			break;
		case codePush.SyncStatus.DOWNLOADING_PACKAGE:
			
			store.dispatch(upGrade(true))
			store.dispatch(upGrade_error(0))

			break;
		case codePush.SyncStatus.AWAITING_USER_ACTION:
			

			break;
		case codePush.SyncStatus.INSTALLING_UPDATE:
			
			store.dispatch(upGrade(true))
			store.dispatch(upGrade_error(0))
			break;
		case codePush.SyncStatus.UP_TO_DATE:
		
			break;
		case codePush.SyncStatus.UPDATE_IGNORED:
			
			store.dispatch(upGrade(false))
			break;
		case codePush.SyncStatus.UPDATE_INSTALLED:
			
			setTimeout(() => {
				codePush.restartApp();
				store.dispatch(upGrade(false))
				store.dispatch(upGrade_error(1))
			}, 1000)
			break;
		case codePush.SyncStatus.UNKNOWN_ERROR:
			
			store.dispatch(upGrade_error(2))
			break;
		}
		console.log(this.state.syncMessage, "更新状态22211112")
	}
	codePushDownloadDidProgress(progress) 
	{
		console.log(progress, "更新的状态1112")
		store.dispatch(upGrade_progress(progress))
	}
	async getNewVersion(v)
	{
		const responseVersion = await loginService.isAppUpGrade({version: v, })
		console.log(responseVersion, "版本号信21111111")
		if (responseVersion.status == 1)
		{
			store.dispatch(getUpdateStatus(true))
			store.dispatch(getAppNewBand({version: v, }))
		}
		else
		{
			this.appUpLoad()
		}
	}
	
	appUpLoad()
	{
		codePush.checkForUpdate()
			.then((update) => 
			{
				console.log(update, "是否有更新11111")
				if (!update) 
				{
					console.log("The app is up to dat11111!");
					store.dispatch(getUpdateStatus(false))
				} 
				else 
				{
					store.dispatch(getUpdateStatus(true))
					console.log("An update is available!1 ?");
					codePush.sync({
						updateDialog: {
							title: "升级提醒",
							optionalUpdateMessage: "修复已知问题，优化使用体验～",
							optionalInstallButtonLabel: "马上更新",
							mandatoryContinueButtonLabel: '马上更新',
							mandatoryUpdateMessage: '修复已知问题，优化使用体验～',
							optionalIgnoreButtonLabel: "稍后再说",
							appendReleaseDescription: true,
						},
						// installMode: codePush.InstallMode.IMMEDIATE,
					},
					this.codePushStatusDidChange.bind(this),
					this.codePushDownloadDidProgress.bind(this),);
				}
			})
			.catch(err => 
			{
				console.log(err, "检查版本1111111")
			})
	}

	async componentWillMount()
	{
		await WeChat.registerApp('wxeccc6b147c943e6f'); //正式线
		// await WeChat.registerApp('wxff1ec1073eeb248d') //测试线

	}

	async componentDidMount() 
	{
		
		try 
		{
			//登录监听
			this.msgListener = DeviceEventEmitter.addListener('loginChange', (listenerMsg) => 
			{
				this.setState({
					isLogin: listenerMsg,
					dispalay: true,
				})
			}); 
			QBStorage.get('user')
				.then(res => 
				{
					if (res) 
					{
						this.setState({
							isLogin: true,
							dispalay: true,
						})
					}
					else
					{
						this.setState({
							isLogin: false,
							dispalay: true,
						})
					}
				})
			DeviceEventEmitter.addListener("isAppUpLoad", () => {
				this.appUpLoad()
			})
			/**判断应用在后台还是前台 */
			AppState.addEventListener('change', this._handleAppStateChange);


			//this.appUpLoad()
			if (Platform.OS == "android")
			{
				NativeModules.BridgeManager.getAppVersion((event) =>{
					this.getNewVersion(event)
				});
			}
			else
			{
				NativeModules.Upgrade.getAppVersion((error, res) => {
					console.log(res, "版本号11")
					if (error)
					{
	
					}
					else
					{
						this.getNewVersion(res)
					}
				})
			}
		} 
		catch (e) {}

	



		AliyunPush.setApplicationIconBadgeNumber(0);
		AliyunPush.addListener(this.handleAliyunPushMessage);
		this.ready = true;
		const msg = await AliyunPush.getInitialMessage();
		console.log('哦豁111', msg)
		if (msg)
		{
			console.warn(msg, 'sjshjshhshsdndndn')
			this.handleAliyunPushMessage(msg);
		}
		AliyunPush.getDeviceId()
			.then((deviceId)=>
			{
				console.log("deviceId:"+deviceId);
				this.savePushDeviceSn(deviceId)
			})
			.catch((error)=>{
				console.log("getDeviceId() failed");
			});
		DeviceEventEmitter.addListener("getUploadUrl",(url) => {
			this.isAirUpdata = true;
			RNFetchBlob.config({
				fileCache: true,
				appendExt: "zip",
			}).fetch("GET", url).then(res => {
				console.log("file saved to", res.path());
				this.imagefile = res.path();
			});
		})
		
		DFUEmitter.addListener("DFUProgress", ({ percent }) => {
			console.log("DFU progress:", percent);
			store.dispatch({
				type: 'DFU_PROGRESS',
				progress: percent,
			})
		});

		DeviceEventEmitter.addListener('DeviceSearch', () => {
			this.deviceMap = new Map();
			allDevices= [];
		})

		BluetoothManager.start();  //蓝牙初始化          
		this.updateStateListener = BluetoothManager.addListener('BleManagerDidUpdateState',this.handleUpdateState);//蓝牙状态改变的回调
		this.stopScanListener = BluetoothManager.addListener('BleManagerStopScan',this.handleStopScan);    //停止扫描的回调
		this.discoverPeripheralListener = BluetoothManager.addListener('BleManagerDiscoverPeripheral',this.handleDiscoverPeripheral);//发现设备的回调
		this.connectPeripheralListener = BluetoothManager.addListener('BleManagerConnectPeripheral',this.handleConnectPeripheral);//连接成功的回调
		this.disconnectPeripheralListener = BluetoothManager.addListener('BleManagerDisconnectPeripheral',this.handleDisconnectPeripheral);//断开连接的回调
		this.updateValueListener = BluetoothManager.addListener('BleManagerDidUpdateValueForCharacteristic', this.handleUpdateValue); //蓝牙数据的回调	
		
		setTimeout(() => {
			SplashScreen.hide();// 隐藏启动屏
		}, 500)
	}

	_handleAppStateChange = (nextAppState)=>{
		console.log(nextAppState, '判断应用在前台还是后台12131212', store.getState())
		if (nextAppState!= null && nextAppState === 'active')
		{
		//如果是true ，表示从后台进入了前台 ，请求数据，刷新页面。或者做其他的逻辑
			if (this.flage) 
			{
			//这里的逻辑表示 ，第一次进入前台的时候 ，不会进入这个判断语句中。
			// 因为初始化的时候是false ，当进入后台的时候 ，flag才是true ，
			// 当第二次进入前台的时候 ，这里就是true ，就走进来了。
			//测试通过
			// alert("从后台进入前台");
			// 这个地方进行网络请求等其他逻辑。
				var user = store.getState().loginIn.user; 
				if (!user)
				{
					return;
				}
				var id = user.user_id;
				store.dispatch(webSocketActions.connectWebsocket(id));
			}
			this.flage = false ;
		}
		else if (nextAppState != null && nextAppState === 'background')
		{
			this.flage = true;
		}
	}
	savePushDeviceSn(device_sn)
	{
		userService.savePushDeviceSn({
			client_system: Platform.OS === 'ios'? 2:1,
			device_sn: device_sn,
		})
			.then((res)=>
			{
				if (res.status == 1)
				{
					console.log(res)
				}
			})
	}

	componentWillReceiveProps(nextProps) 
	{
		console.log(nextProps, '新的根级属性1111111')
	}

	/**
	 * 关闭蓝牙功能
	 */
	closeBLE() 
	{
		console.log('关闭蓝牙连接')
		this.updateStateListener && this.updateStateListener.remove();
		this.stopScanListener && this.stopScanListener.remove();
		this.discoverPeripheralListener && this.discoverPeripheralListener.remove();
		this.connectPeripheralListener && this.connectPeripheralListener.remove();
		this.disconnectPeripheralListener && this.disconnectPeripheralListener.remove();
		this.updateValueListener && this.updateValueListener.remove();
	}

	componentWillUnmount() 
	{
		this.closeBLE();
		AliyunPush && AliyunPush.removeListener(this.handleAliyunPushMessage);
		AliyunPush && AliyunPush.removeAllListeners()
	}

	//蓝牙状态改变
	handleUpdateState=(args)=>
	{
		console.log('蓝牙的开启状态1132222:', args);
		BluetoothManager.bluetoothState = args.state; 
		var isOn = args.state == "on" ? 1 : 0;
		store.dispatch(bleActions.getBleStatus(isOn))
		DeviceEventEmitter.emit('bleChange', isOn);
		if ( args.state !== "on")
		{
			clearAt()
		}
	}

	handleAliyunPushMessage = (e) => 
	{
		if (!this.ready)
		{
			return false;
		}
		console.log("Message Received. " + JSON.stringify(e));
		DeviceEventEmitter.emit('pushMessage', e)
	
		//e结构说明:
		//e.type: "notification":通知 或者 "message":消息
		//e.title: 推送通知/消息标题
		//e.body: 推送通知/消息具体内容
		//e.actionIdentifier: "opened":用户点击了通知, "removed"用户删除了通知, 其他非空值:用户点击了自定义action（仅限ios）
		//e.extras: 用户附加的{key:value}的对象
	
	};
	

	//搜索到一个新设备监听
	handleDiscoverPeripheral = async (data)=>
	{
		const _this = this;
		if (!data.rssi)
		{
			return;
		}
		if (!data.advertising)
		{
			return;
		}
		console.log(data, '搜索到的新设')
		var isConnectORsearch = store.getState().ble.isConnectORsearch;
		var userDeviceList = store.getState().user.userDeviceList;
		if (isConnectORsearch == 4)
		{
			if (data.name == "DfuTarg" && this.isAirUpdata)
			{
				this.deviceMap.set(data.id, data);
				this.isAirUpdata = false;
				console.log(rootController, 'DFU函数', this.imagefile)
				NordicDFU.startDFU({
					deviceAddress: data.id,
					filePath: this.imagefile,
				})
					.then(res => console.log("Transfer done:", res))
					.catch(err => {
						DeviceEventEmitter.emit('dfu_UpLoad', {message: '升级失败', })
					});
			}
			return;
		}
		var _bytes;
		if (Platform.OS == 'android') 
		{
		//_bytes = data.advertising.bytes;
			_bytes = data.advertising.manufacturerData.bytes;
		} 
		else if (Platform.OS == 'ios' && data.advertising.manufacturerData) 
		{
			_bytes = data.advertising.manufacturerData.bytes;
		} 
		else 
		{
			return;
		}
		if (!_bytes) 
		{
			return;
		}

		console.log(_bytes, '字段信息111111111')
		let deviceSN = qrCode.resolvingBroadcastInformation(_bytes);
		var deviceArray = store.getState().ble.deviceArray;
		isDevice = deviceArray.find(item => 
		{
			return item.firmware_code === data.name
		})
		console.log(isDevice, '判断设备是否11111111111111', deviceSN)
		var item = {
			device_sn: deviceSN,
			id: data.id,
			siginal: data.rssi,
			device_code: data.name,
		}
		var searchDevices = {
			device_sn: deviceSN,
			id: data.id,
			bleId: data.id,
			device_code: data.name,
		}
		console.log(item, '搜索到的新设备', isDevice);
		if (deviceSN == false || !isDevice) { return; }
		var device_name = data.name;
		if (device_name.indexOf("HA05") > -1|| device_name.indexOf("HA06") > -1) 
		{
			item.isCicle = 1;
			searchDevices.isCicle = 1;
			item.device_name = "激光治疗手表"
			searchDevices.device_name = "激光治疗手表"
		} 
		else 
		{
			item.isCicle = 0;
			searchDevices.isCicle = 0;
			item.device_name = "激光治疗手环"
			searchDevices.device_name = "激光治疗手环"
		}
		item.prevName = item.device_sn.substring(13);
		searchDevices.prevName = searchDevices.device_sn.substring(13);
		deviceSN = deviceSN.toUpperCase();
		var bleAction = store.getState().ble.bleAction;
		console.log(userDeviceList, '用户绑定的设备', bleAction, allDevices);
		if (bleAction !== 'search')
		{

			if (userDeviceList && userDeviceList.length > 0) 
			{
				if (userDeviceList.length === 1) 
				{
					//单设备
					findValue = userDeviceList.find((value, index) => 
					{
						return value.device_sn.toUpperCase() == deviceSN
					})
					console.log(findValue, '过滤的值')
					if (!findValue)
					{
						return;
					}
					device_name = findValue.device_code;
					if (device_name.indexOf("HA05") > -1|| device_name.indexOf("HA06") > -1) 
					{
						findValue.isCicle = 1;
					} 
					else 
					{
						findValue.isCicle = 0;
					}
					findValue.prevName = findValue.device_sn.substring(13);
					findValue.bleId = data.id;
					findValue.siginal = item.siginal;
					this.deviceMap.set(deviceSN, findValue);
					allDevices = [...this.deviceMap.values()];
					var signalData = rootController.deviceSimpleSignal(findValue);
					store.dispatch({
						type: 'CONNECT_BIND_ONE',
						device: signalData,
					})

					return;
				}
				//多设备
				findValue = userDeviceList.find((value, index) => 
				{
					return value.device_sn.toUpperCase() == deviceSN
				})
				console.log(findValue, '过滤的值')
				if (!findValue)
				{
					return;
				}
				device_name = findValue.device_code;
				if (device_name.indexOf("HA05") > -1|| device_name.indexOf("HA06") > -1) 
				{
					findValue.isCicle = 1;
					if (findValue.device_name.length < 5) {
						findValue.device_name = "激光治疗手表"
					}
				} 
				else 
				{
					findValue.isCicle = 0;
					if (findValue.device_name.length < 5) {
						findValue.device_name = "激光治疗手环"
					}
				}
				
				findValue.prevName = findValue.device_sn.substring(13);
				findValue.bleId = data.id;
				findValue.siginal = item.siginal;
				this.deviceMap.set(deviceSN, findValue);
				allDevices = [...this.deviceMap.values()];
				signalData = rootController.deviceSimpleSignal(findValue);
				store.dispatch({
					type: 'MANY_CONNECT_OR_SEARCH_RESULT',
					device: signalData,
				})

			} 
			else 
			{
				findValue = item;
				findValue.bleId = data.id;
				findValue.prevName = findValue.device_sn.substring(13);
				// this.deviceMap.set(deviceSN, findValue);
				// allDevices = [...this.deviceMap.values()];
				// len = allDevices.length;
				signalData = rootController.deviceSimpleSignal(findValue);
				console.log(signalData, '无绑定搜索的设备111')
				store.dispatch({
					type: 'MANY_CONNECT_OR_SEARCH_RESULT',
					device: signalData,
				})

			}
			return;
		} 
		else 
		{
			this.deviceMap.set(deviceSN, searchDevices);
		}
	}
	//蓝牙设备已连接监听 
	handleConnectPeripheral=(args)=>
	{
		console.log('BleManagerConnectPeripheral:', args);
		store.dispatch(stopScan())
	}
	//蓝牙设备已断开连接
	handleDisconnectPeripheral=(args)=>{
		console.log('BleManagerDisconnectPeripheral:1111111111111111111111', args);
		this.isReceiveStatus = 'connected';
		this.deviceMap = new Map();
		allDevices= [];
		store.dispatch({
			type: 'DISCONNECT',
		})
	}
	//蓝牙接收到新数据的监听
	handleUpdateValue=(data)=>
	{
		//ios接收到的是小写的16进制，android接收的是大写的16进制，统一转化为大写16进制          
		BluetoothManager.receiveData(cmd, data.value, (_0bj)=> 
		{
			console.log(_0bj,'收到的数据123123')
			if (store.getState().ble.isConnectORsearch === 1) 
			{
				//dataFromConnect(_0bj, store.getState().ble.deviceId, store.getState().ble.device_sn)
				//连接的指令操作
				store.dispatch({
					type: 'CONNECT_CMD',
					dataObject: _0bj,
				});
				return;
			}
			else if (store.getState().ble.isConnectORsearch == 2)
			{
				//isConnectORsearch === 2 时为我的疗程逻辑
				//购买疗程后写入疗程时的逻辑
				store.dispatch({
					type: 'MY_COURSE',
					dataObject: _0bj,
				})
			} 
			else if (store.getState().ble.isConnectORsearch == 3)
			{
				//设备绑定解绑
				store.dispatch({
					type: 'DEVICE_BIND',
					dataObject: _0bj,
				});
			}
			else if (store.getState().ble.isConnectORsearch == 4) 
			{
				//空中升级的操作
				store.dispatch({
					type: 'AIR_CALLBACK',
					dataObject: _0bj,
				});
			}
			else if (store.getState().ble.isConnectORsearch == 5) 
			{
				//已购疗程的逻辑
				store.dispatch({
					type: 'BUY_COURSE',
					dataObject: _0bj,
				})
			}
			else if (store.getState().ble.isConnectORsearch === 6)
			{
				//进入设备应用界面的指令初始化操作
				store.dispatch({
					type: 'DEVICE_APPLICATION',
					dataObject: _0bj,
				})
				// store.dispatch(bleActions.dataFromApplication(_0bj, store.getState().ble.deviceId, store.getState().ble.device_sn));

			}
			else if (store.getState().ble.isConnectORsearch === 7)
			{
				//进入设备应用界面的指令初始化操作
				store.dispatch({
					type: 'DEVICE_DATA_OBSERVE',
					dataObject: _0bj,
				})
				// store.dispatch(bleActions.dataFromApplication(_0bj, store.getState().ble.deviceId, store.getState().ble.device_sn));

			}

		})
	}

	//扫描结束监听
	handleStopScan=()=>
	{
		const _this = this;
		console.log('BleManagerStopScan:','Scanning is stopped');
		var bleAction = store.getState().ble.bleAction;
		if (bleAction === 'search') 
		{
			
			var dataService = [...this.deviceMap.values()]
			var signalData = rootController.deviceSignal(dataService);
			var returnService;
			if ( signalData.length > 0)
			{
				returnService =  signalData.sort((a, b) => 
				{
					return a.siginal > b.siginal
				});
			}
			else
			{
				returnService = [];
			}
			console.log('qweqweqwqwwww')
			store.dispatch({type: 'SEARCH_RESULT', devices: returnService, })
		}
		else
		{
			dataService = [...this.deviceMap.values()]
			store.dispatch({
				type: 'CONNECT_OR_SEARCH_RESULT',
				devices: dataService,
			})
			this.deviceMap = new Map();
			allDevices= [];
			console.log(allDevices, '涉恶缺乏的')
		}
	

	}

	async handleNavigationChange(prevState, currentState) 
	{
		const _this = this;
		const currentScreen = getActiveRouteName(currentState);
		const prevScreen = getActiveRouteName(prevState);
		console.log(prevScreen,'旧的路由状态')
		console.log(currentScreen,'新的路由状态', store.getState().ble.netStatus);
		if (currentScreen !== prevScreen) 
		{
			DeviceEventEmitter.emit('bulletBox', 1)
			if (store.getState().loginIn.netStatus)
			{
				const isNet = await userService.getNetInfo();
				console.log(isNet, '123123123123')
				// if (isNet.status !== 1)
				// {
				// 	DeviceEventEmitter.emit("storage", true)
				// }
			}
		}

	}

	render() 
	{
		let AppComponent = null;
		var {isLogin, dispalay, } = this.state;
		const prefix = Platform.OS == 'android' ? 'mychat://mychat/' : 'mychat://';
		// console.warn(prefix)
		if (!dispalay)
		{
			return null;
		}
		var App = createAppContainer(creatApp(isLogin));
		AppComponent = (<App
			uriPrefix={prefix}
			onNavigationStateChange={this.handleNavigationChange}
			onRef={nav => {this.navigator = nav;}} />)
		return (
			// 实现app和store的关联，等于整个系统的组件都被包含住了
			<Provider store={store}>
				<PersistGate persistor={persistor}>
					{AppComponent}
					{isLogin ? <BgPage /> : null}
				</PersistGate>
			</Provider>
		)
	}
}

let codePushOptions = { checkFrequency: codePush.CheckFrequency.MANUAL, }
export default codePush(codePushOptions)(Root)