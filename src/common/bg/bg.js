/**
 * Created by lam on 2018/7/20.
 */

import React, {Component, } from 'react'
import {
	Text,
	View,
	Image,
	StyleSheet,
	TouchableOpacity,
	ImageBackground,
	StatusBar,
	ScrollView,
	DeviceEventEmitter,
	PermissionsAndroid,
	Platform,
} from 'react-native'
import {
	connect,
} from "react-redux";
import DeviceInfo from 'react-native-device-info';
import Toast, { DURATION, } from 'react-native-easy-toast'
import Icon from 'react-native-vector-icons/Ionicons'
import {width, height, statusBarHeight, bottomToolsBarHeight, } from '../../utils/uiHeader';
import Spinner from 'react-native-loading-spinner-overlay';
import * as bleActions from '../../actions/device/bleActions';
import QBStorage from '../../utils/storage/storage';

import CommonDialog from '../Modal';

class BgPage extends Component
{
	constructor(props)
	{
		super(props)
		this.state = {
			getSystemVersion: 0,
			isCode: 0,
			searchStatus: 0,
			loadingStatus: false,
			loadingText: '搜索中...',
			bleStatus: this.props.bleStatus,
		}
	}

	async componentDidMount()
	{
		const devicename = await DeviceInfo.getDeviceName();
		const getBrand = await DeviceInfo.getBrand();
		const getSystemName = await DeviceInfo.getSystemName();
		const getSystemVersion = await DeviceInfo.getSystemVersion();
		const getVersion = await DeviceInfo.getVersion();
		const getDeviceId = await DeviceInfo.getDeviceId();
		const getProduct = await DeviceInfo.getProduct();
		console.log(devicename, getBrand, getSystemName, getSystemVersion, getVersion, getDeviceId, getProduct, '获取设备信息' )
		this.systemName = getSystemName;
		var deviceId = getDeviceId.split(',')[0];
		if (getSystemName === 'iOS')
		{
			console.log(deviceId, 'asdasdasdas')
			this.getSystemVersion = deviceId.split('e')[1];
		}
		else
		{
			this.getSystemVersion = 0;
		}
		this.setState({
			getSystemVersion: this.getSystemVersion,
		})

		var isCode = this.state.isCode;

		DeviceEventEmitter.addListener('bindLister', status => {

			if (!status)
			{
				this.setState({
					isCode: 0,
				})

			}
			else if (status === 1)
			{
				this.setState({
					isCode: 1,
				})
			}
			else if (status === 2)
			{
				this.setState({
					isCode: 2,
				})
			}
			else
			{
				this.setState({
					isCode: 3,
				})
			}
		})

	}
	connectDevice = () =>
	{
		var bleStatus = this.state.bleStatus;
		if (bleStatus !== 1)
		{
			this.setState({
				isCode: 2,
			})
		}
		else
		{
			this.setState({
				isCode: 3,
			})
		}
	}

	componentWillReceiveProps(newProps)
	{
		console.log(newProps, '新的属性1231222')
		this.setState({
			bleStatus: newProps.bleStatus,
		})
		var isCode = this.state.isCode;
		if (newProps.bleStatus === 1 && newProps.bleStatus !== this.props.bleStatus && isCode === 2)
		{
			this.setState({
				isCode: 3,
			})
		}
	}

	back = () =>
	{
		this.setState({
			isCode: 3,
		})
	}
	back3 = () =>
	{
		this.setState({
			isCode: 1,
		})
	}

	confirmBtn = () =>
	{
		//判断是否打开位置权限
		if (Platform.OS === "android")
		{
			PermissionsAndroid.check(PermissionsAndroid.PERMISSIONS.ACCESS_COARSE_LOCATION)
				.then((data) =>
				{
					if (data)
					{
						this.setState({
							searchStatus: 1,
							loadingStatus: true,
							loadingText: '搜索中...',
						})
						this.props.searchDevices(this.searchCallback);

					}
					else
					{
						PermissionsAndroid.request(PermissionsAndroid.PERMISSIONS.ACCESS_COARSE_LOCATION)
							.then((granted) =>
							{
								if (granted === PermissionsAndroid.RESULTS.GRANTED) {
									this.setState({
										searchStatus: 1,
										loadingStatus: true,
										loadingText: '搜索中...',
									})
									this.props.searchDevices(this.searchCallback);

								}
							})
							.catch(errr =>
							{

							})

					}
				})
				.catch((error) =>
				{

				})
		}
		else
		{
			this.setState({
				searchStatus: 1,
				loadingStatus: true,
				loadingText: '搜索中...',
			})
			this.props.searchDevices(this.searchCallback);
		}
	}

	searchCallback = res =>
	{
		var status = res.status;
		if (status === 2)
		{
			this.setState({
				searchStatus: 2,
				loadingStatus: false,
			})
			this.refs.toast.show(<View style={{justifyContent: "center", alignItems: 'center', flex: 1, }}>
				<Text style={{color: '#fff', fontSize: 16, }}>未找到设备</Text>
				<Text style={{color: '#fff', fontSize: 16, }}>请重新搜素</Text>
			</View>)
		}
		else
		{
			this.setState({
				isCode: 4,
				devices: res.devices,
				loadingStatus: false,
				searchStatus: 0,
			})
		}

	}

	renderSearchBtn = () =>
	{
		var searchStatus = this.state.searchStatus;
		if (searchStatus === 0)
		{
			return (
				<TouchableOpacity
					style={styles.confirm}
					onPress={this.confirmBtn}
				><Text style={styles.confirmText}>确定</Text></TouchableOpacity>
			)
		}
		else if (searchStatus === 1)
		{
			return (
				<View style={styles.searching}><Text style={styles.searchingText}>正在搜索</Text></View>
			)
		}
		else if (searchStatus === 2)
		{
			return (
				<TouchableOpacity
					style={styles.confirm}
					onPress={this.confirmBtn}
				><Text style={styles.confirmText}>重新搜索</Text></TouchableOpacity>
			)
		}
	}

	connectBle = item =>
	{
		this.setState({
			isCode: 0,
		})
		console.log(item, '点击连接的信息')
		DeviceEventEmitter.emit('connnectBleListener', item);

	}
	renderDeviceList = () =>
	{
		if (!this.state.devices)
		{
			return null;
		}
		var deviceList = this.state.devices;
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
				<View style={{height: 60, justifyContent: 'space-around', }}>
					<View style={{flexDirection: 'row', }}><Text style={{fontSize: 16, }}>{item.prevName}号{item.device_name}</Text>{signal}</View>
					<View><Text style={{fontSize: 12, }}>编号：{item.device_sn}</Text></View>
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

	close_bg = () =>
	{
		this.refs.dConfirm.show({
			thide: true,
			messText: '您将关闭“新手连接设备引导”，直接跳转至首页',
			messBoxStyle: {paddingHorizontal: 20, justifyContent: 'center', alignItems: 'center'},
			messTextStyle: {fontSize: 18, color: '#000', textAlign: 'center', lineHeight: 20, },
			buttons: [
				{txt: '取消操作', onpress: this.cancel.bind(this), txtStyle: {fontSize: 18, }, },
				{txt: '确定跳转', txtStyle: {fontSize: 18, }, onpress: this.confirmGo.bind(this), },
			],
		})

	}

	cancel()
	{
		this.refs.dConfirm.hide();
	}

	confirmGo()
	{
		QBStorage.save('bg_close', 1);
		this.setState({
			isCode: 0,
		})
	}

	render()
	{
		var {isCode, } = this.state;
		console.log(this.systemName, this.state.getSystemVersion, 'asdasdasdasdas1231222')

		if (isCode === 1)
		{
			return (
				<View style={[styles.bgContent, styles.bgBindContent, ]}>
					<StatusBar
						translucent={true}
						animated={true}
						backgroundColor={"#24a090"}
						barStyle={"light-content"}
					/>
					<View style={styles.head}>
						<TouchableOpacity
							style={styles.close_bg}
							onPress={this.close_bg}
						><Icon name="ios-close-outline" color="#fff" size={28}></Icon><Text style={styles.clostText}>关闭</Text>
						</TouchableOpacity>
						<ImageBackground
							source={require('../../img/btn_connect.png')}
							style={styles.connect}
							resizeMode="cover"
						>
							<TouchableOpacity
								onPress={this.connectDevice}
								style={styles.connectBtn}
							>
								<Text style={styles.connectText}>点击连接</Text>
								<Text style={styles.connectText}>设备</Text>
							</TouchableOpacity>
						</ImageBackground>
					</View>
					<View style={styles.pownWhole}>
						<Image source={require('../../img/pown.gif')} resizeMode="cover" style={styles.pown} />
						<ImageBackground
							style={[styles.dotTips, {width: width - 40}]}
							source={require('../../img/dot_tips.png')}
							resizeMode="contain"
						>
							<Text style={styles.clickText}>点击“点击连接设备”按钮</Text>
						</ImageBackground>
					</View>
					<CommonDialog types={'confirm'} ref="dConfirm" />
				</View>
			)
		}
		else if (isCode === 2)
		{
			if (this.systemName === "iOS")
			{
				if (this.state.getSystemVersion >= 11)
				{
					return (
						<View style={[styles.bgDownContent, styles.bgContent, ]}>
							<View style={styles.imgContent}><Image source={require('../../img/downDong.gif')} resizeMode="cover" style={styles.bgImg} /> </View>
							<ImageBackground
								style={[styles.bgTips, {marginBottom: 50}]}
								source={require('../../img/dot_tips.png')}
								resizeMode="contain"
							>
								<Text style={{color: '#fff', fontSize: 22, }}>从屏幕顶部向下轻滑打开蓝牙</Text>
								<Image source={require('../../img/blue.png')} resizeMode="cover" style={styles.blue} />
							</ImageBackground>
						</View>
					)
				}
				else
				{
					return (
						<View style={[styles.bgUpContent, styles.bgContent, ]}>
							<ImageBackground
								style={[styles.bgTips, {marginTop: 50}]}
								source={require('../../img/dot_tips.png')}
								resizeMode="contain"
							>
								<Text style={{color: '#fff', fontSize: 22, }}>从屏幕底部向上轻滑打开蓝牙</Text>
								<Image source={require('../../img/blue.png')} resizeMode="cover" style={styles.blue} />
							</ImageBackground>
							<View style={styles.imgUpContent}><Image source={require('../../img/up_1.gif')} resizeMode="cover" style={styles.bgImg} /></View>
						</View>
					)

				}
			}
			else
			{
				return (
					<View style={[styles.bgDownContent, styles.bgContent, ]}>
						<View style={styles.imgContent}>
							<Image source={require('../../img/downDong.gif')} resizeMode="cover" style={styles.bgImg} />
						</View>
						<ImageBackground
							style={styles.bgTips}
							source={require('../../img/dot_tips.png')}
							resizeMode="cover"
						>
							<Text style={{color: '#fff', fontSize: 22, }}>从屏幕顶部向下轻滑打开蓝牙</Text>
							<Image source={require('../../img/blue.png')} resizeMode="cover" style={styles.blue} />
						</ImageBackground>
					</View>
				)
			}
		}
		else if (isCode === 3)
		{
			return (
				<View style={styles.bgContent}>
					<TouchableOpacity
						style={styles.close_bg}
						onPress={this.close_bg}
					><Icon name="ios-close-outline" color="#fff" size={28}></Icon><Text style={styles.clostText}>关闭</Text>
					</TouchableOpacity>
					<View style={styles.circleContent}>
						<View style={styles.circleTitle}><Text style={styles.circleTitleText}>激活设备指导图</Text></View>
						<View style={styles.circle}>
							<Image source={require('../../img/circle_1.gif')} resizeMode="contain" style={styles.circleImg} />
							<View style={styles.circleTips}><Text style={{color: '#999', fontSize: 16,}}>手环激活方式</Text></View>
						</View>
						<View style={styles.dot}>
							<Image source={require('../../img/dot_bg.png')} resizeMode="cover" style={styles.dot_img} />
						</View>
						<View style={styles.circle}>
							<Image source={require('../../img/circle_2.gif')} resizeMode="contain" style={styles.circleImg_2} />
							<View style={styles.circleTips_2}><Text style={{color: '#999',  fontSize: 16,}}>手表激活方式</Text></View>
						</View>
						<View style={{width: width - 100, justifyContent: 'center', alignItems: 'center' }}>
							<Text style={{color: '#000', fontSize: 16, fontWeight: 'bold' }}>将激光治疗仪佩戴在左手手腕内侧</Text>
							<Text style={{color: '#000', fontSize: 16, fontWeight: 'bold' }}>连接设备时，请“按一下”治疗仪按钮</Text>
						</View>
						{this.renderSearchBtn()}
						<Spinner
							visible={this.state.loadingStatus}
							textContent={this.state.loadingText}
							textStyle={{fontSize: 14, }}
						/>
					</View>
					<Toast
						ref="toast"
						position="center"
						positionValue={height/2 - 60}
						style={{width: 120, height: 120, }}
					/>
					<CommonDialog types={'confirm'} ref="dConfirm" />
				</View>
			);
		}
		else if (isCode === 4)
		{
			return (
				<View style={styles.bgContent}>
					<TouchableOpacity
						style={styles.back}
						onPress={this.back}
					>
						<Icon name="ios-arrow-back" color="#fff" size={24}></Icon><Text style={{color: '#fff', fontSize: 16, paddingLeft: 10, }}>上一步</Text>
					</TouchableOpacity>
					<View style={styles.searchDevicesModal}>
						<View style={styles.activeTitle}>
							<Text>请选择您要连接的设备</Text>
						</View>
						<ScrollView style={styles.searchDevicesContent}>
							<View style={styles.deviceContent}>
								{this.renderDeviceList()}
							</View>
						</ScrollView>
					</View>
					<ImageBackground
						style={styles.deviceTips}
						source={require('../../img/dot_tips.png')}
						resizeMode="stretch"
					>
						<View style={{justifyContent: 'center', alignItems: 'center'}}>
							<Text style={styles.tipsText}>核对设备编号信息</Text>
							<Text style={styles.tipsText}>然后点击"连接"按钮</Text>
						</View>

					</ImageBackground>
					<Image source={require('../../img/choose.gif')} resizeMode="cover" style={styles.chooseGif} />
					<Image source={require('../../img/choosePoint.png')} resizeMode="stretch" style={styles.choosePointGif} />
					<Toast
						ref="toast"
						position="center"
						positionValue={height/2 - 60}
						style={{width: 120, height: 120, }}
					/>
				</View>
			)
		}
		else
		{
			return null;
		}



	}
}

const styles = StyleSheet.create({
	bgContent: {
		position: 'absolute',
		left: 0,
		top: 0,
		width: width,
		height: height,
		backgroundColor: 'rgba(0,0,0,.7)',
		alignItems: 'center',
		justifyContent: 'center',
	},
	back: {
		position: 'absolute',
		top: statusBarHeight + 10,
		left: 15,
		justifyContent: 'flex-start',
		alignItems: 'center',
		flexDirection: 'row',
	},
	circleContent: {
		width: width - 80,
		height: height - statusBarHeight - bottomToolsBarHeight - 100,
		backgroundColor: '#fff',
		borderRadius: 20,
		alignItems: 'center',
		paddingBottom: 20,
	},
	bgBindContent: {
		alignItems: 'flex-end',
		justifyContent: 'flex-start',
	},
	bgUpContent: {
		justifyContent: 'flex-end',
	},
	bgDownContent: {
		justifyContent: 'flex-start',
	},
	imgContent: {
		position: 'absolute',
		top: 0,
		left: 50,
	},
	imgUpContent: {
		position: 'absolute',
		bottom: 0,
		left: 0,
	},
	bgImg: {
		width: width,
		height: 200,
	},
	bgTips: {
		width: width - 40,
		height: 60,
		borderRadius: 8,
		justifyContent: 'center',
		alignItems: 'center',
		flexDirection: 'row',
	},
	dotTips: {
		width: width - 80,
		height: 60,
		borderRadius: 8,
		justifyContent: 'center',
		alignItems: 'center',
		flexDirection: 'row',
	},
	blue: {
		width: 26,
		height: 30,
	},
	pownWhole: {
		position: 'absolute',
		width: width,
		top: 170,
		zIndex: 1,
		justifyContent: 'center',
		alignItems: 'center',
	},
	pown: {
		height: 350,
		width: width,
	},
	head: {
		height: 230,
		width: width,
		justifyContent: 'center',
		alignItems: 'center',
		paddingTop: statusBarHeight,
	},
	connectBtn: {
		justifyContent: 'center',
		alignItems: 'center',
		borderRadius: 400,
	},
	connect: {
		width: 200,
		height: 200,
		justifyContent: 'center',
		alignItems: 'center',
	},
	connectText: {
		fontSize: 24,
		color: '#fff',
		fontWeight: 'bold',
	},
	clickText: {
		color: '#fff',
		fontSize: 22,
	},
	circleTitle: {
		height: 50,
		justifyContent: 'center',
	},
	circleTitleText: {
		fontSize: 18,
		fontWeight: 'bold',
		color: '#000',
	},
	circle: {
		width: width - 120,
		flex: 1,
		justifyContent: 'center',
		alignItems: 'center',
	},
	circleImg: {
		width: width - 120,
		flex: 1,
	},
	circleImg_2: {
		width: width - 120,
		flex: 1,
	},
	circleTips: {
		position: 'absolute',
		left: 0,
		bottom: 30,
	},
	circleTips_2: {
		position: 'absolute',
		left: 0,
		bottom: 55,
	},
	dot: {
		width: width - 120,
		height: 1,
		justifyContent: 'center',
		alignItems: 'center',
	},
	dot_img: {
		width: width - 100,
		height: 1,
	},
	confirm: {
		width: 140,
		height: 44,
		borderRadius: 44,
		backgroundColor: '#2AA293',
		marginTop: 20,
		justifyContent: 'center',
		alignItems: 'center',
	},
	confirmText: {
		fontSize: 18,
		color: '#fff',
	},
	searching: {
		width: 120,
		height: 44,
		borderRadius: 44,
		marginTop: 20,
		justifyContent: 'center',
		alignItems: 'center',
		backgroundColor: '#e4e4e4',
	},
	searchingText: {
		color: '#aaa',
	},
	searchDevicesModal: {
		width: width - 80,
		height: 400,
		backgroundColor: '#fff',
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
		flex: 1,
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
	connectBtnPress: {
		backgroundColor: '#24a090',
		borderRadius: 20,
		width: 60,
		height: 30,
		justifyContent: 'center',
		alignItems: 'center',
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
	deviceTips: {
		position: 'absolute',
		top: height/2 + 210,
		left: 50,
		flexDirection: 'column',
		width: width - 100,
		justifyContent: 'center',
		alignItems: 'center',
		paddingVertical: 10,
	},
	tipsText: {
		color: '#fff',
		fontSize: 22,
	},
	chooseGif: {
		position: 'absolute',
		zIndex: 9,
		width: 70,
		height: 60,
		top: height/2 - 130,
		right: 0,
	},
	choosePointGif: {
		position: 'absolute',
		zIndex: 9,
		width: 30,
		height: 330,
		top: height/2 - 70,
		right: 10,
	},
	close_bg: {
		position: 'absolute',
		left: 30,
		top: statusBarHeight,
		flexDirection: 'row',
		justifyContent: 'center',
		alignItems: 'center',
		height: 40,
	},
	clostText: {
		color: '#fff',
		fontSize: 18,
		paddingLeft: 10,
	},
	clostIcon: {
		marginRight: 10,
		fontSize: 22,
		color: '#fff',
	}
})

const mapStateToProps = state => ({
	bleStatus: state.ble.bleStatus,
})

const  mapDispatchToProps = dispatch => ({
	searchDevices: callback => dispatch(bleActions.bgSearchDevices(callback)),
})


export default connect(mapStateToProps, mapDispatchToProps)(BgPage);
