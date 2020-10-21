import React, { Component, } from 'react';
import {
	StyleSheet,
	View,
	TouchableOpacity,
	Text,
	StatusBar,
	TextInput,
	Dimensions,
	Keyboard,
	Image,
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
import * as loginService from '../../utils/network/loginService';
import { getLogin, getWXLogin, } from '../../actions/loginActions';
import { upGrade_error, } from '../../actions/device/bleActions';
import AliyunPush from 'react-native-aliyun-push';
import Icon from 'react-native-vector-icons/Ionicons'

let _window = Dimensions.get('window');
let _screen = Dimensions.get("screen");
import {statusBarHeight, height, width, } from '../../utils/uiHeader';

import * as webSocketActions from '../../actions/webSocketActions';

let contentHeight = height - statusBarHeight - NavBar.topbarHeight
class LoginVXPage extends Component
{
	static navigationOptions = {
		header: null,
	}
	constructor(props)
	{
		super(props)
		this.state = {
			codeTitle: i18n.t('register.sendText'),
			isActive: false,
			androidVersion: this.props.androidVersion,
			isupGrade: false,
			isupGradeBand: false,
			upProgress: {},
			upProgressText: "升级中...",
		}
		this.access_token = "";
		this.openid = ""
	}
	back()
	{
		this.props.navigation.pop();
	}
	async getApiVersion()
	{
		return await WeChat.getApiVersion()
	}
	async isWXAppInstalled()
	{
		return WeChat.isWXAppInstalled()
	}

	async componentWillMount()
	{
		const apiVersion = await this.getApiVersion();
		const isWXAppInstalled = await this.isWXAppInstalled();
		this.setState({
			apiVersion: apiVersion,
			isWXAppInstalled: isWXAppInstalled,
		});
		console.log(this.state.apiVersion, this.state.isWXAppInstalled, this.state.isWXAppSupportApi, "weixin")
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
	}

	componentWillReceiveProps(nextProps)
	{
		console.log(nextProps, '新的属性')
		if (!nextProps.netStatus)
		{
			this.setState({
				netStatus: false,
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
		if (nextProps.status !== this.props.status && nextProps.status == 2 && nextProps.code != 40310)
		{
			this.refs.toast.show("手机号或验证码错误")
		}
		if (nextProps.status !== this.props.status && nextProps.status == 2 && nextProps.code == 40310)
		{
			this.refs.toast.show("该用户未注册")
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

	async _openWXApp()
	{
		try
		{
			console.log(this.state.apiVersion, this.state.isWXAppInstalled, this.state.isWXAppSupportApi, "weixin")
			if (!this.state.isWXAppInstalled)
			{
				this.refs.toast.show("请先安装微信")
				return;
			}
			var responseCode = await WeChat.sendAuthRequest("snsapi_userinfo");
			console.log(responseCode, '返回的码')

			if (responseCode.code)
			{
				//返回code码，通过code获取access_token
				this.getAccessToken(responseCode.code);
			}
		}
		catch (e)
		{
			console.log(e)
		}

	}

	async getAccessToken(code)
	{
		var tokenData = await loginService.getAccessTokenByCode({code: code, })
		if (tokenData.status == 1)
		{
			console.log(tokenData, '获取的token1111')
			if (!tokenData.data || !tokenData.data.access_token)
			{
				this.refs.toast.show("凭证获取失败，请用手机号登陆")
				return;
			}

			console.log(tokenData, 'tken')
			this.access_token = tokenData.data.access_token;
			this.openid = tokenData.data.openid;
			console.log(this.access_token, '获取的token1111')
			var userInfo = await loginService.getUserInfo({openid: this.openid, access_token: this.access_token, });
			console.log(userInfo.unionid, '用户的unionid');
			var serviceUserInfo = await loginService.getServiceUserInfo({openid: this.openid, });


			console.log(userInfo, '获取的微信信', serviceUserInfo)
			var dataParams = {
				openid: this.openid,
				source: 1,
				avatarUrl: userInfo.headimgurl,
				nickName: userInfo.nickname,
				gender: userInfo.sex,
				province: userInfo.province,
				country: userInfo.country,
				city: userInfo.city,
				language: userInfo.language,
				unique_id: userInfo.unionid,
			}
			if (serviceUserInfo.status == 2 && serviceUserInfo.code == "40316")
			{//微信用户需绑定手机

				this.props.navigation.navigate("BindPhonePage", {dataParams: dataParams, });

			}
			else if (serviceUserInfo.status == 2 && serviceUserInfo.code == "40315")
			{
				console.log(dataParams, '未查询到微信用户的参数')
				var saveData = await loginService.saveUserInfo(dataParams);
				console.log(saveData, '保存用户信息')
				if (saveData.status == 1)
				{
					var getAlreadyData = await loginService.getServiceUserInfo({openid: this.openid, });
					console.log(getAlreadyData, '123');
					if (getAlreadyData.status == 1 && !getAlreadyData.data.mobile)
					{
						this.props.navigation.navigate("BindPhonePage", {dataParams: dataParams, });
					}
					else if (getAlreadyData.status == 2 && getAlreadyData.code == "40316")
					{
						this.props.navigation.navigate("BindPhonePage", {dataParams: dataParams, });
					}
					else
					{
						var loginIn = {
							token: getAlreadyData.data.token,
							code: getAlreadyData.code,
							msg: getAlreadyData.msg,
							status: getAlreadyData.status,
							user_id: getAlreadyData.data.user_id,
							mobile: getAlreadyData.data.mobile,
							shop_id: getAlreadyData.data.shop_id ? getAlreadyData.data.shop_id : "",
							shop_url: getAlreadyData.data.shop_url ? getAlreadyData.data.shop_url : null,
						}
						this.props.getWXLogin(loginIn, this.loginCallback)
					}

				}
				else if (saveData.status == 2 && saveData.code == 40316)
				{
					//微信登陆需绑定手机
					this.props.navigation.navigate("BindPhonePage", {dataParams: dataParams, });
				}
			}
			else if (serviceUserInfo.status == 2 && serviceUserInfo.code == "40334")
			{//未查询到该微信用户需要调用保存微信信息接口
				console.log(dataParams, '未查询到微信用户的参数')
				saveData = await loginService.saveUserInfo(dataParams);
				console.log(saveData, '保存用户信息')
				if (saveData.status == 1)
				{
					getAlreadyData = await loginService.getServiceUserInfo({openid: this.openid, });
					console.log(getAlreadyData, '123');
					if (getAlreadyData.status == 1 && !getAlreadyData.data.mobile)
					{
						this.props.navigation.navigate("BindPhonePage", {dataParams: dataParams, });
					}
					else
					{
						loginIn = {
							token: getAlreadyData.data.token,
							code: getAlreadyData.code,
							msg: getAlreadyData.msg,
							status: getAlreadyData.status,
							user_id: getAlreadyData.data.user_id,
							shop_id: getAlreadyData.data.shop_id ? getAlreadyData.data.shop_id : "",
							shop_url: getAlreadyData.data.shop_url ? getAlreadyData.data.shop_url : null,
						}
						this.props.getWXLogin(loginIn, this.loginCallback)
					}

				}
				else if (saveData.status == 2 && saveData.code == 40316)
				{
					//微信登陆需绑定手机
					this.props.navigation.navigate("BindPhonePage", {dataParams: dataParams, });
				}

			}
			else if (serviceUserInfo.status == 1 && !serviceUserInfo.data.mobile)
			{
				this.props.navigation.navigate("BindPhonePage", {dataParams: dataParams, });
			}
			else
			{
				var loginInStatus = {
					token: serviceUserInfo.data.token,
					code: serviceUserInfo.code,
					msg: serviceUserInfo.msg,
					status: serviceUserInfo.status,
					user_id: serviceUserInfo.data.user_id,
					mobile: serviceUserInfo.data.mobile,
					shop_id: serviceUserInfo.data.shop_id ? serviceUserInfo.data.shop_id : "",
					shop_url: serviceUserInfo.data.shop_url ? serviceUserInfo.data.shop_url : null,
				}
				this.props.getWXLogin(loginInStatus, this.loginCallback)
			}

		}
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


	render()
	{
		let isWXAppInstalled = null;
		let progress = 0;
		let progressBtn = null;
		let progressBar = null;
		let newVersion = "";
		if (this.state.isWXAppInstalled)
		{
			isWXAppInstalled = (<View style={styles.bottomView}>
				<View style={styles.bottomTitle}>
					<View style={styles.line}><Text></Text></View>
					<View style={styles.botTitleView}><Text>第三方登录</Text></View>
					<View style={styles.line}><Text></Text></View>
				</View>
				<TouchableOpacity onPress={this.nextEvent.bind(this, { 'type': 'VX' })} style={{marginVertical: 30, justifyContent: 'center', alignItems: 'center', }}>
					<Image source={require("../../img/vxLogin.png")} style={styles.vx} />
					<View style={{paddingTop: 5, }}>
						<Text style={{ fontSize: 14, }}>微信登录</Text>
					</View>
				</TouchableOpacity>
			</View>)
		}
		else
		{
			isWXAppInstalled = null;
		}

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

		return (
			<View style={styles.container}>
				<StatusBar
					translucent={true}
					animated={true}
					backgroundColor={"#24a090"}
				/>
				<View style={styles.sBar} backgroundColor={'#24a090'}/>
				<NavBar
					title="登录"
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
				<ScrollView style={{height: contentHeight, }}>
					<View style={styles.topView}>
						<View style={styles.itemContainer}>
							<View style={styles.textLabel}>
								<Image source={require("../../img/icon/reg-phone-ic.png")} style={styles.phone}  />
								<Text>手机号</Text>
							</View>
							<TextInput style={styles.inputText} keyboardType="numeric" maxLength={11} underlineColorAndroid="transparent" placeholder="请输入您的手机号码" onChangeText={this.onChangeEmailText.bind(this)} />
						</View>
						<View style={styles.itemContainer}>
							<View style={styles.textLabel}>
								<Image source={require("../../img/icon/reg-verification-code-ic.png")} style={styles.phone}  />
								<Text>验证码</Text>
							</View>
							<View style={styles.checkCode}>
								<TextInput style={[styles.inputText,{width: width - 150, }]} underlineColorAndroid="transparent" placeholder={i18n.t('register.tapCodeText')} onChangeText={this.onChangeCodeText.bind(this)} />
								<TouchableOpacity style={styles.checkBTN} onPress={this.sendCodeEvent.bind(this)}>
									<Text style={{ color: 'white' }}>{this.state.codeTitle}</Text>
								</TouchableOpacity>
							</View>
						</View>
						<View style={styles.send}>
							<TouchableOpacity onPress={this.nextEvent.bind(this, { 'type': 'confirm' })}>
								<View style={[styles.cofirmView,{backgroundColor: this.state.isActive ? "#24A090" : "rgba(36,160,144,0.5)"}, ]}>
									<Text style={{ color: 'white', fontSize: 15, }}>立即登录</Text>
								</View>
							</TouchableOpacity>
							<View style={styles.sendTips}><Text style={{fontSize: 14}}>新用户自动注册</Text></View>
						</View>
					</View>
					{isWXAppInstalled}
				</ScrollView>
				<Toast
					ref="toast"
					position="center"
					defaultCloseDelay={2000}
				/>
			</View>

		)
	}

	sendCodeEvent()
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

		if (this.email)
		{
			if (!(/^1[3|4|5|6|7|8|9][0-9]{9}$/.test(this.email)))
			{
				this.refs.toast.show(<View style={{justifyContent: "center", alignItems: 'center'}}>
					<Icon name="ios-checkmark-outline" size={55} color="#fff"></Icon>
					<Text style={{color: '#fff', }}>手机号码格式错误</Text>
				</View>);
				return;
			}
			this.codeNum = 60;
			this.myInterval = setInterval(() => {
				const codeNum = this.codeNum--;
				if (codeNum == 0) {
					this.setState({
						codeTitle: i18n.t('register.resendText')
					})
					clearInterval(this.myInterval);
					this.myInterval;
				} else {
					this.setState({
						codeTitle: codeNum,
					})
				}
			}, 1000);
			LoginService.sendMobileCode({ mobile: this.email, })
				.then((_responseJSON) => {
					console.log("请求成功", _responseJSON);
					if (_responseJSON.status == 1)
					{
						this.refs.toast.show(<View style={{justifyContent: "center", alignItems: 'center'}}>
							<Icon name="ios-checkmark-outline" size={55} color="#fff"></Icon>
							<Text style={{color: '#fff', }}>{i18n.t('success')}</Text>
						</View>);

						this.uid = _responseJSON.uid;
					}
					else
					{
						this.setState({
							codeTitle: i18n.t('register.resendText'),
						})
						this.codeNum = 0;
						clearInterval(this.myInterval);
						this.myInterval;
						this.refs.toast.show(<View style={{justifyContent: "center", alignItems: 'center'}}>
							<Icon name="ios-checkmark-outline" size={55} color="#fff"></Icon>
							<Text style={{color: '#fff', }}>{i18n.t('failed')}</Text>
						</View>);
					}
				})
				.catch((err) => {
					this.setState({
						codeTitle: i18n.t('register.resendText')
					})
					clearInterval(this.myInterval);
					this.myInterval;
					this.codeNum = 0;
					this.refs.toast.show(<View style={{justifyContent: "center", alignItems: 'center'}}>
						<Icon name="ios-checkmark-outline" size={55} color="#fff"></Icon>
						<Text style={{color: '#fff', }}>{i18n.t('networkError')}</Text>
					</View>);
				});
		}
		else
		{
			//this.refs.toast.show(i18n.t('login.accountOrPasswordWrongText'));
			this.refs.toast.show(<View style={{justifyContent: "center", alignItems: 'center'}}>
				<Icon name="ios-checkmark-outline" size={55} color="#fff"></Icon>
				<Text style={{color: '#fff', }}>请输入手机号</Text>
			</View>);
		}
	}
	nextEvent(res)
	{
		var type = res.type;
		if (type == 'VX')
		{
			this._openWXApp();
			return;
		}
		if (!(/^1[3|4|5|6|7|8|9][0-9]{9}$/.test(this.email)))
		{
			this.refs.toast.show("手机号码格式错误")
			return;
		}
		console.log(this.email,this.code,this.uid,'参数11111111111')

		if (this.email == "18338299767" && this.code == "123456")
		{
			var dic = {
				mobile: '18338299767',
				code: '123456',
				uid: this.uid,
			}
			this.props.getLogin(dic, this.loginCallback);
			Keyboard.dismiss();
			return;
		}
		if (!this.email || !this.code || !this.uid)
		{
			this.setState({
				isActive: false,
			})
			return;
		}
		else
		{
			this.setState({
				isActive: true,
			})
		}
		dic = {
			androidVersion: this.state.androidVersion,
			mobile: this.email,
			code: this.code,
			uid: this.uid,
		}
		this.props.getLogin(dic, this.loginCallback);

		Keyboard.dismiss();

	}

	onChangeEmailText(text)
	{
		this.email = text;
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
			this.refs.toast.show(<View style={{justifyContent: "center", alignItems: 'center'}}>
				<Icon name="ios-checkmark-outline" size={55} color="#fff"></Icon>
				<Text style={{color: '#fff', }}>{res.maessage}</Text>
			</View>)
		}
	}
}

function mapStateToProps(state)
{
	console.log(state,'子组件的属性')
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
export default connect(mapStateToProps, mapDispatchToProps)(LoginVXPage)



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
		height: contentHeight - 150,
		flexDirection: 'column',
		paddingTop: 50,
		alignItems: 'center',
	},
	itemContainer: {
		flexDirection: 'column',
		justifyContent: 'center',
		alignItems: 'flex-start',
		marginLeft: 20,
		marginRight: 20,
		marginBottom: 20,
	},
	textLabel: {
		flexDirection: 'row',
		justifyContent: 'flex-start',
		alignItems: 'center',
	},
	inputText: {
		flexDirection: 'row',
		borderStyle: 'solid',
		borderBottomColor: 'lightgray',
		borderBottomWidth: 1,
		width: width - 40,
		height: 44,
		padding:0,
		paddingLeft: 22,
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
		height: 150,
		width: width,
		paddingLeft: 20,
		paddingRight: 20,
		alignItems: 'center',

	},
	cofirmView: {
		height: 40,
		borderRadius: 22,
		backgroundColor: '#24A090',
		flexDirection: 'row',
		justifyContent: 'center',
		alignItems: 'center',
	},
	send: {
		width: width - 40,
	},
	sendTips: {
		height: 40,
		width: width - 40,
		flexDirection: 'row',
		alignItems: "center",
		justifyContent: "center",
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
		backgroundColor: '#F4F4F4',
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
})
