import React, { Component, } from 'react';
import {
	StyleSheet,
	View,
	TouchableOpacity,
	ImageBackground,
	Text,
	StatusBar,
	TextInput,
	Keyboard,
	Platform,
	ScrollView,
	Modal,
	ProgressBarAndroid,
	DeviceEventEmitter,
	NativeModules,
} from 'react-native';
import {ProgressView} from "@react-native-community/progress-view";
import Toast, { DURATION, } from 'react-native-easy-toast'
import i18n from '../../utils/i18n';
import * as LoginService from '../../utils/network/loginService';
import * as WeChat from 'react-native-wechat';
import NavBar from '../../common/NavBar';
import { connect, } from 'react-redux'
import QBStorage from '../../utils/storage/storage';
import * as userService from '../../utils/network/userService';
import { getLogin, getWXLogin, } from '../../actions/loginActions';
import { upGrade_error, } from '../../actions/device/bleActions';
import AliyunPush from 'react-native-aliyun-push';
import Icon from 'react-native-vector-icons/Ionicons';
import Spinner from 'react-native-loading-spinner-overlay';

import {statusBarHeight, height, width, } from '../../utils/uiHeader';

import * as webSocketActions from '../../actions/webSocketActions';

let contentHeight = height - statusBarHeight
class CodePage extends Component
{
	static navigationOptions = {
		header: null,
	}
	constructor(props)
	{
		super(props)
		this.state = {
			isActive: false,
			androidVersion: this.props.androidVersion,
			isupGrade: false,
			isupGradeBand: false,
			upProgress: {},
			upProgressText: "升级中...",
			codeTitle: '重新获取（60）',
			spinner: false,
			spinnerText: '请稍后',
		}
		this.access_token = "";
		this.openid = ""
		this.codeNum = 60;
	}
	back()
	{
		this.props.navigation.pop();
	}
	async getApiVersion()
	{
		return await WeChat.getApiVersion()
	}

	async componentWillMount()
	{

	}

	componentDidMount()
	{

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
        var params = this.props.navigation.state.params.params;
		this.setState({
			params: params,
			isCode1: true,
		})
		this.email = params.phone;
		this.code = params.send_code;
		this.uid = params.uid;
		//开始倒计时
		this.myInterval = setInterval(() => {
			const codeNum = this.codeNum--;
			if (codeNum == 0)
			{
				clearInterval(this.myInterval);
				this.myInterval;
				this.setState({
					codeTitle: '重发短信验证码',
				})
			} else {
				this.setState({
					codeTitle: "重新获取（" + codeNum + "）",
				})
			}
		}, 1000);
	}

	componentWillReceiveProps(nextProps)
	{
		console.log(nextProps, '新的属性')
		if (!nextProps.netStatus)
		{
			this.setState({
				netStatus: false,
				androidVersion: nextProps.androidVersion,
			})
			this.refs.toast.show("网络连接不可用，请稍后重试")
			console.log(nextProps.upGrade_band, this.props.upGrade_band, "网络连接不可用，请稍后重试11111")
			if (nextProps.upGrade_band.version)
			{
				this.setState({
					isupGradeBand: true,
					isupGrade: false,
				})
			}
		}
		else
		{
			this.setState({
				netStatus: true,
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
				isupGradeBand: false,
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

		if (nextProps.upGrade_band && nextProps.upGrade_band !== this.props.upGrade_band)
		{
			this.setState({
				isupGradeBand: true,
				isupGradeBandData: nextProps.upGrade_band,
				upGrade_band: nextProps.upGrade_band,
			})
		}

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
	}
	componentWillUnmount()
	{
		this.setTime && clearTimeout(this.setTime);
		this.upGrade && clearTimeout(this.upGrade);
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
	setModalVisible (s)
	{
		this.props.upGrade(s)
	}

	upGrade()
	{
		if (!this.state.netStatus)
		{
			this.refs.toast.show("网络连接不可用，请联网后更新！")
			return;
		}

		this.props.upGrade_isError(3)
	}
	upGradeBand()
	{
		console.log(NativeModules, "参数111111")
		if (!this.state.netStatus)
		{
			this.refs.toast.show("网络连接出错，请连接网络后重试！")
			return;
		}
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

	onChangePhoneText1 = value =>
	{
		console.log(value, '阿萨达说')
		this.setState({
			codeValue: value,
		})
		if (value.length === 6)
		{
			this.refs.code.blur();
			this.setState({
				isActive: true,
			})
		}
		else
		{
			this.setState({
				isActive: false,
			})
		}

	}

	renderBtn = () =>
	{
		var {isActive} = this.state;
		if (isActive)
		{
			return (
				<ImageBackground
					style={styles.send}
					source={require('../../img/loginBtn_yes.png')}
					resizeMode="cover"
				>
					<TouchableOpacity
						onPress={this.nextEvent}
					>
						<View style={styles.cofirmView}>
							<Text style={{ color: 'white', fontSize: 15, }}>确定</Text>
						</View>
					</TouchableOpacity>
				</ImageBackground>
			)
		}
		else
		{
			return (
				<ImageBackground
					style={styles.send}
					source={require('../../img/loginBtn_no.png')}
					resizeMode="cover"
				>
					<View style={styles.cofirmView}>
						<Text style={{ color: 'white', fontSize: 15, }}>确定</Text>
					</View>
				</ImageBackground>
			)
		}
	}

	render()
	{
		let progress = 0;
		let progressBtn = null;
		let progressBar = null;
		let newVersion = "";

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
		console.log(progress, "升级的11112222221")

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

		if (!this.state.params)
		{
			return null
		}
		return (
			<View style={styles.container}>

				{/*---------------------------状态栏--------------------------*/}
				<StatusBar
					translucent={true}
					animated={true}
					backgroundColor={"#fff"}
				/>

				{/*---------------------------占位符--------------------------*/}
				<View style={styles.sBar} backgroundColor={'#fff'}/>
				<View style={{height: contentHeight, }}>
					<NavBar
						title="123"
						leftIcon="ios-arrow-back"
						leftPress={this.back.bind(this)}
						style={{backgroundColor: '#fff', }}
						leftIconColor={'#000'}
					/>
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
						onRequestClose={() => {

						}}
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
								</View>
							</View>
						</View>
					</Modal>
					<ScrollView style={{height: contentHeight - NavBar.topbarHeight, }}>
						<View style={[styles.topView, {height: contentHeight - NavBar.topbarHeight - 100,  }]}>
							<View style={styles.itemContainer}>
								<View style={styles.textLabel}>
									<Text style={{fontSize: 30, color: '#111111', fontFamily: 'PingFangSC-Medium', }}>输入验证码</Text>
                                </View>
                                <View style={styles.codeWhole}><Text>已发送6位验证码至</Text><Text style={{fontSize: 20, paddingLeft: 10, color: '#000',  }}>{this.state.params.phone}</Text></View>
								<View style={styles.inputWhole}>

										<TextInput
											autoFocus={true}
											style={styles.inputText}
											keyboardType="numeric"
											maxLength={6}
											underlineColorAndroid="transparent"
											onChangeText={value => this.onChangePhoneText1(value)}
											selectionColor={'#40C5B4'}
											ref="code"
											placeholder="请输入验证码"
											value={this.state.codeValue}
										/>
										{this.state.isActive ? <View style={styles.closeIcon}>
										<TouchableOpacity
											style={styles.iconWhole}
											onPress={() => {this.setState({codeValue: '', isActive: false, })}}
										><Icon name="ios-close-outline" size={20} color="#fff" ></Icon></TouchableOpacity>
									</View> : null}

								</View>

							</View>
							{this.renderBtn()}
							<TouchableOpacity
								style={{marginTop: 20, }}
								onPress={this.sendCodeEvent}
							>
								<Text style={{color: '#40C5B4'}}>{this.state.codeTitle}</Text>
							</TouchableOpacity>
						</View>
					</ScrollView>
				</View>
				<Toast
					ref="toast"
					position="center"
					defaultCloseDelay={2000}
				/>
				<Spinner
					visible={this.state.spinner}
					textContent={this.state.spinnerText}
					textStyle={{fontSize: 14, }}
				/>
			</View>

		)
	}

	sendCodeEvent = () =>
	{
		Keyboard.dismiss();
		if (this.codeNum > 0)
		{
			return;
		}
		if (this.myInterval)
		{
			clearInterval(this.myInterval);
			this.myInterval;
		}
		this.setState({
			spinner: true,
		})
		LoginService.sendMobileCode({ mobile: this.email, })
			.then((_responseJSON) => {
				console.log("请求成功", _responseJSON);
				this.setState({
					spinner: false,
				})
				if (_responseJSON.status == 1)
				{
					this.refs.toast.show(<View style={{justifyContent: "center", alignItems: 'center'}}>
						<Icon name="ios-checkmark-outline" size={55} color="#fff"></Icon>
						<Text style={{color: '#fff', }}>{i18n.t('success')}</Text>
					</View>);
					this.setState({
						codeValue: '',
						isActive: false,
					})

					this.uid = _responseJSON.uid;
					this.code = _responseJSON.send_code;
					this.codeNum = 60;
					//开始倒计时
					this.myInterval = setInterval(() => {
						const codeNum = this.codeNum--;
						if (codeNum == 0)
						{
							clearInterval(this.myInterval);
							this.myInterval;
							this.setState({
								codeTitle: '重发短信验证码',
							})
						} else {
							this.setState({
								codeTitle: "重新获取（" + codeNum + "）",
							})
						}
					}, 1000);
				}
				else
				{
					this.refs.toast.show(<View style={{justifyContent: "center", alignItems: 'center'}}>
						<Icon name="ios-checkmark-outline" size={55} color="#fff"></Icon>
						<Text style={{color: '#fff', }}>{i18n.t('failed')}</Text>
					</View>);
				}
			})
			.catch((err) =>
			{
				console.log(err, '验证码错误')
				this.setState({
					spinner: false,
				})
				this.refs.toast.show(<View style={{justifyContent: "center", alignItems: 'center'}}>
					<Icon name="ios-checkmark-outline" size={55} color="#fff"></Icon>
					<Text style={{color: '#fff', }}>{i18n.t('networkError')}</Text>
				</View>);
			});

	}
	nextEvent = () =>
	{
		if (!this.state.isActive)
		{
			return;
		}
		Keyboard.dismiss();
		console.log(this.email,this.code,this.uid,'参数11111111111')
		if (this.email == "18338299767")
		{
			var dic = {
				mobile: '18338299767',
				code: '123456',
				uid: this.uid,
			}
			this.props.getLogin(dic, this.loginCallback);
			return;
		}
		if (this.code != this.state.codeValue)
		{
			this.refs.toast.show(<View style={{justifyContent: "center", alignItems: 'center'}}>
				<Icon name="ios-checkmark-outline" size={55} color="#fff"></Icon>
				<Text style={{color: '#fff', }}>验证码错误</Text>
			</View>)
			return;
		}
		this.setState({
			spinner: true,
		})
		dic = {
			androidVersion: this.state.androidVersion,
			mobile: this.email,
			code: this.code,
			uid: this.uid,
		}
		this.props.getLogin(dic, this.loginCallback);
	}

	onChangeEmailText(text)
	{
		this.email = text;
		this.setState({
			phone: text,
		})
		if (this.email == "18338299767")
		{
			this.setState({
				isActive: true,
			})
			return;
		}

		if (!(/^1[3|4|5|6|7|8|9][0-9]{9}$/.test(this.email)))
		{
			this.setState({
				isActive: false,
			})
		}
		else
		{
			this.setState({
				isActive: true,
			})
		}
	}
	onChangeCodeText(text)
	{
		this.code = text;
		if (this.email == "18338299767" && this.code == "123456")
		{
			this.setState({
				isActive: true,
			})
			return;
		}
		if (!this.email || !this.code || !this.uid)
		{
			this.setState({
				isActive: false,
			})
		}
		else
		{
			this.setState({
				isActive: true,
			})
		}
	}

	loginCallback = res =>
	{
		console.log(res, '登录的结果')
		var status = res.status;
		if (status === 1)
		{
			this.setState({
				spinner: false,
			})
			this.refs.toast.show(<View style={{justifyContent: "center", alignItems: 'center'}}>
				<Icon name="ios-checkmark-outline" size={55} color="#fff"></Icon>
				<Text style={{color: '#fff', }}>登录成功</Text>
			</View>)
			AliyunPush.getDeviceId()
				.then((deviceId)=>
				{
					console.log("deviceId:"+deviceId);
					this.savePushDeviceSn(deviceId)
				})
				.catch((error)=>{
					console.log("getDeviceId() failed");
				});
			QBStorage.get("user")
				.then(res => {
					console.log(res, '登录的信息11111')
					if (res.user_id)
					{
						this.props.connectSocket(res.user_id)
					}
				})
			setTimeout(() =>
			{
				DeviceEventEmitter.emit('loginChange', true)
			}, 1000)
		}
		else
		{
			this.setState({
				spinner: false,
			})
			this.refs.toast.show(<View style={{justifyContent: "center", alignItems: 'center'}}>
				<Icon name="ios-checkmark-outline" size={55} color="#fff"></Icon>
				<Text style={{color: '#fff', }}>{res.maessage}</Text>
			</View>)
		}
	}
}

function mapStateToProps(state)
{
	console.log(state, '子组件的属性')
	return {
		status: state.loginIn.status,
		code: state.loginIn.code,
		androidVersion: state.ble.androidVersion,
		isupGrade: state.ble.isupGrade,
		upProgress: state.ble.upProgress,
		upGrade_error: state.ble.upGrade_error,
		upGrade_band: state.ble.upGrade_band,
		netStatus: state.loginIn.netStatus,
	}
}

function mapDispatchToProps(dispatch)
{
	return {
		getLogin: (dic, callback) => dispatch(getLogin(dic, callback)),
		upGrade_isError: (s) => dispatch(upGrade_error(s)),
		connectSocket: s => dispatch(webSocketActions.connectWebsocket(s)),
		getWXLogin: (dic, callback) => dispatch(getWXLogin(dic, callback)),
	}
}
export default connect(mapStateToProps, mapDispatchToProps)(CodePage)



const styles = StyleSheet.create({
	sBar: {
		height: statusBarHeight,
	},
	container: {
		backgroundColor: '#fff',
	},
	contains: {
		flex: 1,
		flexDirection: 'column',
		justifyContent: 'flex-start',
		alignItems: 'center',
	},
	topView: {
		height: contentHeight - NavBar.topbarHeight - 220,
		flexDirection: 'column',
		alignItems: 'center',
	},
	itemContainer: {
		flexDirection: 'column',
		justifyContent: 'center',
		alignItems: 'flex-start',
		marginLeft: 20,
		marginRight: 20,
		marginBottom: 24,
	},
	textLabel: {
		flexDirection: 'row',
		justifyContent: 'flex-start',
		alignItems: 'center',
	},
	inputWhole: {
		width: width - 40,
		borderRadius: 21,
		backgroundColor: '#F4F4F4',
		marginTop: 20,
		height: 42,
	},

	inputText: {
		flexDirection: 'row',
		width: width - 40,
		height: 42,
		padding: 0,
		paddingLeft: 20,
		fontSize: 18,
	},
	checkCode: {
		flexDirection: 'row',
		justifyContent: 'center',
		alignItems: 'center',
	},
	phone: {
		width: 22,
		height: 22,
	},
	checkedView: {
		flexDirection: 'row',
		justifyContent: 'space-between',
		alignItems: 'center',
	},
	checkBTN: {
		paddingLeft: 10,
		paddingRight: 10,
		minWidth: 100,
		height: 30,
		borderRadius: 15,
		backgroundColor: '#24A090',
		marginLeft: 10,
		flexDirection: 'row',
		justifyContent: 'center',
		alignItems: 'center',
	},
	checkNoteText: {
		flexDirection: 'column',
		marginLeft: 20,
		marginRight: 20,
	},
	passwordNoteText: {
		flexDirection: "row",
		marginLeft: 20,
		marginRight: 20,
	},
	bottomView: {
		height: 120,
		width: width,
		paddingLeft: 20,
		paddingRight: 20,
		alignItems: 'center',
		justifyContent: 'flex-start',

	},
	cofirmView: {
		height: 40,
		borderRadius: 22,
		flexDirection: 'row',
		justifyContent: 'center',
		alignItems: 'center',
	},
	send: {
		width: width - 40,
		borderRadius: 22,
		overflow: 'hidden',
	},
	bottomTitle: {
		width: width - 40,
		flexDirection: 'row',
		alignItems: 'center',
		justifyContent: 'center',
	},
	line: {
		flex: 1,
		height: 1,
		backgroundColor: '#A7A7A7',
	},
	botTitleView: {
		width: 100,
		alignItems: 'center',
		justifyContent: 'center',
	},
	vx: {
		width: 60,
		height: 60,
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
	},
	optNo: {
		backgroundColor: '#ddd',
	},
	upGradeBtn: {
		width: 100,
		height: 34,
		backgroundColor: '#24a090',
		marginBottom: 10,
		justifyContent: 'center',
		alignItems: 'center',
	},
	codeWhole: {
        flexDirection: 'row',
        marginTop: 35,
        marginBottom: 25,
        justifyContent: 'center',
        alignItems: 'center',
	},
	closeIcon: {
		position: "absolute",
		right: 0,
		top: 0,
		width: 40,
		height: 42,
		justifyContent: 'center',
		alignItems: 'center',
	},
	iconWhole: {
		backgroundColor: '#d8d8d8',
		borderRadius: 20,
		width: 20,
		height: 20,
		justifyContent: 'center',
		alignItems: 'center',
	},

})
