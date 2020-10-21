
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
	Button,
	Image,
	Slider,
	Platform,
	Modal,
	Alert,
	TextInput,
	InteractionManager,
	Keyboard,
	KeyboardAvoidingView,
	Animated,
	Easing,
	DeviceEventEmitter,
	PermissionsAndroid,
} from 'react-native'
import NavBar from '../../common/NavBar'
import QBStorage from '../../utils/storage/storage';
import Video from 'react-native-video';
import Toast, { DURATION, } from 'react-native-easy-toast'
import Feather from 'react-native-vector-icons/Feather'
import { connect, } from 'react-redux'
import ShopCenterItem from '../../common/ShopCenterItem';
import * as LoginService from '../../utils/network/loginService';
import { fetchLogin, getLogin, } from '../../actions/loginActions';
import i18n from '../../utils/i18n';
import {statusBarHeight, height, width, bottomToolsBarHeight, } from '../../utils/uiHeader';
import Sound from 'react-native-sound';
import * as javaBase from '../../utils/network/javaService';
import ImageViewer from 'react-native-image-zoom-viewer';
import * as WeChat from 'react-native-wechat';
import { URL, } from "../../utils/network/baseService";

const contentHeight = height - NavBar.topbarHeight - statusBarHeight
const currentHeight = statusBarHeight;

function formatTime(second)
{
	let h = 0, i = 0, s = parseInt(second);
	if (s > 60) {
		i = parseInt(s / 60);
		s = parseInt(s % 60);
	}
	// 补零
	let zero = function (v)
	{
		return (v >> 0) < 10 ? "0" + v : v;
	};
	console.log([zero(h), zero(i), zero(s)].join(":"));
	return [zero(h), zero(i), zero(s)].join(":");
	// return zero(s);
}

var whoosh;

class dynamicDetail extends Component
{
	static navigationOptions = {
		header: null,
	}
	constructor(props)
	{
		super(props);
		this.state = {
			isRefreshing: false,
			avatarSource: null,
			video_url: '',
			rate: 1,
			volume: 1,
			muted: false,
			resizeMode: 'contain',
			duration: 0.0,
			currentTime: 0.0,
			paused: true,
			isFullScreen: false,
			videoWidth: width,
			videoHeight: width * 9/16,
			visible: true,
			newdata: {}, //圈子详情数据
			images: [], //图片列表
			audioStatus: 0, //音频按钮状态
			modalVisible: false,
			images1: [],
			modelIndex: -1,
			isShowInput: false,
			animatedMarginBottom: 0,
			isAnimate: false,
			avatar: '',
			title: '',
			comment: [],
			isLogin: this.props.isLogin,
			isLoginStatus: false,
			loginTitle: '',
			isWxLogin: true,
			codeTitle: '获取验证码',
			keyboardHeight: 0,
		};
		this.spinValue = new Animated.Value(0)
	}
	async componentWillMount()
	{
		BackHandler.addEventListener('hardwareBackPress', this.onBackAndroid);
		this.keyboardDidShowListener = Keyboard.addListener('keyboardDidShow', this._keyboardDidShow.bind(this));
		this.keyboardDidHideListener = Keyboard.addListener('keyboardDidHide', this._keyboardDidHide.bind(this));
		const apiVersion = await this.getApiVersion();
		const isWXAppInstalled = await this.isWXAppInstalled();
		this.setState({
			apiVersion: apiVersion,
			isWXAppInstalled: isWXAppInstalled,
		});
	}
	componentDidMount()
	{

		this.didFocusSubscription = this.props.navigation.addListener(
			'didFocus',
			payload => {
				var item = this.props.navigation.state.params.item;
				console.log("123123123123123123123123", item);
				this.setState({
					likeStatus: item.likeStatus ? true : false,
				})
				this.detail(item.id)
			}
		);

		this.willBlurSubscription = this.props.navigation.addListener(
			'willBlur',
			payload => {
				//如果在播放就都暂停
				if (!this.state.paused)
				{
					this.setState({
						paused: true,
					})
				}
				this.audioPause();
			}
		);
	}

	componentWillReceiveProps(nextProps)
	{
		console.log(nextProps, '新的newprops')
		this.setState({
			isLogin: nextProps.isLogin,
			user: nextProps.user,
		})
		if (nextProps.status == 15)
		{
			this.props.getLogin({status: 4, });
			this.requestReadPermission()
		}
		if (nextProps.status != this.props.status && nextProps.status == 1)
		{
			this.toMain();
		}
		if (nextProps.status !== this.props.status && nextProps.status == 2 && nextProps.code != 40310)
		{
			this.refs.toast.show("手机号或验证码错误")
		}
		if (nextProps.status !== this.props.status && nextProps.status == 2 && nextProps.code == 40310)
		{
			this.refs.toast.show("该用户未注册")
		}
	}
	async detail(id)
	{
		console.log(id, '详情的id');
		var self = this;
		var user = await QBStorage.get("user");
		var token = user.token ? user.token : '';
		javaBase.requestToken({
			path: 'weixin/circle/detail',
			body: {method: 'post', params: {id: id, token: token, }, },
		})
			.then((res) => {
				console.log(res, '详情数据')
				if (res.code==1)
				{
					var newdata = res.data;
					if (!newdata.armariumScienceUserName)
					{
						if (!newdata.wxData)
						{
							var userName = "匿名用户"
						}
						else
						{
							userName = newdata.wxData.nickname ? newdata.wxData.nickname : '匿名用户';
						}
					}
					else
					{
						userName = newdata.armariumScienceUserName;
					}
					if (newdata.avatar)
					{
						var avatar = newdata.avatar
					}
					else if (newdata.wxData)
					{
						avatar = newdata.wxData.avatarUrl
					}
					else
					{
						avatar = ""
					}
					//console.warn('圈子详情', newdata.wxHeadPortrait)
					self.setState({
						id: newdata.id,
						video_url: newdata.videoUrl,
						voiceUrl: newdata.voiceUrl,
						newdata: newdata,
						time: self.format(newdata.createTime),
						avatar: avatar,
						title: newdata.title,
						comment: newdata.comment,
						userName: userName,
					})
					if (newdata.photoUrls!=null)
					{
						var images = newdata.photoUrls.split(',');
						self.setState({
							images: images,
						})
						var imgmodel = []
						for (var i=0; i<images.length; i++)
						{
							imgmodel.push({url: images[i]})
						}
						self.setState({
							images1: imgmodel,
						})
					}
					whoosh = new Sound(newdata.voiceUrl, null, (error) => {
						if (error)
						{
							return console.log('资源加载失败', error);
						}
					})
				}
			})
			.catch(err => {
				//console.warn(err, 'errerr');
			})
	}

	format(shijianchuo)
	{
		var thisTime = shijianchuo.replace(/-/g, '/');
		return thisTime;
	}

	formatTime(shijianchuo)
	{
		//shijianchuo是整数，否则要parseInt转换
		var time = new Date(parseInt(shijianchuo)* 1000);
		var y = time.getFullYear();
		var m = time.getMonth() + 1;
		var d = time.getDate();
		var h = time.getHours();
		var mm = time.getMinutes();
		return y + '/' + this.add0(m) + '/' + this.add0(d) + ' ' + this.add0(h) + ':' + this.add0(mm);
	}
	add0(m) { return m < 10 ? '0' + m : m }

	componentWillUnmount()
	{
		Keyboard.dismiss();
		BackHandler.removeEventListener('hardwareBackPress', this.onBackAndroid);
		this.keyboardDidShowListener.remove();
		this.keyboardDidHideListener.remove();
		this.willBlurSubscription.remove();
		this.didFocusSubscription.remove();
	}

	async requestReadPermission()
	{
		console.log("123123123",this.mobile,this.code,this.uid)
		if (Platform.OS === "ios")
		{
			this.props.fetchLogin({ mobile: this.mobile, code: this.code, uuid: this.uid,  })
			return;
		}
		if (this.state.androidVersion < 23)
		{
			this.props.fetchLogin({ mobile: this.mobile, code: this.code, uuid: this.uid, });
			return;
		}
		try
		{
			//返回string类型
			const granted = await PermissionsAndroid.request(
				PermissionsAndroid.PERMISSIONS.WRITE_EXTERNAL_STORAGE
			)
			console.log(granted, '获取的权限', PermissionsAndroid.RESULTS.GRANTED)

			if (granted === PermissionsAndroid.RESULTS.GRANTED)
			{
				this.props.fetchLogin({ mobile: this.mobile, code: this.code, uuid: this.uid, })
			}
		}
		catch (err)
		{
			console.log(err, '报错')
		}
	}

	async getApiVersion()
	{
		return await WeChat.getApiVersion()
	}

	toMain()
	{
		console.log('111111111111111')
		this.refs.toast.show("登陆成功")
		this.props.navigation.navigate("Home")
		DeviceEventEmitter.emit("storage", false)
		this.myInterval && clearInterval(this.myInterval);
		this.setState({
			isLoginStatus: false,
		})

	}

	async isWXAppInstalled()
	{
		return WeChat.isWXAppInstalled()
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
		this.props.getLogin({status: 15, });
		var tokenData = await LoginService.getAccessTokenByCode({code: code, })
		console.log(tokenData, '123123')
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
			var userInfo = await LoginService.getUserInfo({openid: this.openid, access_token: this.access_token, });
			console.log(userInfo.unionid, '用户的unionid');
			var serviceUserInfo = await LoginService.getServiceUserInfo({openid: this.openid, });


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
				var saveData = await LoginService.saveUserInfo(dataParams);
				console.log(saveData, '保存用户信息')
				if (saveData.status == 1)
				{
					var getAlreadyData = await LoginService.getServiceUserInfo({openid: this.openid, });
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
						}
						this.props.getLogin(loginIn)
						QBStorage.save("user", loginIn);
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
				var saveData = await loginService.saveUserInfo(dataParams);
				console.log(saveData, '保存用户信息')
				if (saveData.status == 1)
				{
					var getAlreadyData = await LoginService.getServiceUserInfo({openid: this.openid, });
					console.log(getAlreadyData, '123');
					if (getAlreadyData.status == 1 && !getAlreadyData.data.mobile)
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
						}
						this.props.getLogin(loginIn)
						QBStorage.save("user", loginIn);
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
				}
				this.props.getLogin(loginInStatus)
				QBStorage.save("user", loginInStatus);
			}

		}
	}


	onBackAndroid = () =>
	{
		this.props.navigation.goBack();
		return true;
	};

	_keyboardDidShow(e)
	{
		console.log(e.startCoordinates, "高度", e.endCoordinates, e);
		var height = Platform.OS === "android" ? e.endCoordinates.height : e.startCoordinates.height;
		this.setState({
			keyboardHeight: height,
			isShowInput: this.state.isLogin ? true : false,
		})

	}

	_keyboardDidHide(e)
	{
		this.setState({
			keyboardHeight: 0,
			isShowInput: false,
		})
	}

	back() {
		this.props.navigation.pop();
	}

	audioPlay()
	{
		this.setState({
			audioStatus: 1,
		})
		var paused = this.state.paused;
		if (!paused)
		{
			this.audioPausedVideo();
		}
		whoosh.play(success => {
			console.log(success, '播放')
			if (success)
			{
				console.log('success - 播放成功')
				this.setState({
					audioStatus: 0,
				})
			}
			else
			{
				console.log('fail - 播放失败')
				this.setState({
					audioStatus: 0,
				})
			}
		})
	}
	audioPause()
	{
		this.setState({
			audioStatus: 0,
		})
		whoosh && whoosh.pause();
	}

	backfullScreen()
	{
		this.setState({
			isFullScreen: !this.state.isFullScreen,
			videoHeight: width * 9/16,
		})
	}
	onEnd = () => {
		this.video.seek(0)
		this.setState({
			paused: true,
			currentTime: 0,

		})
	};
	onLoad = (data)=> {
		console.log(data,'初始加载......')
		this.setState({
			duration: data.duration
		});
	};
	onAudioBecomingNoisy = () => {
		this.setState({paused: true})
	};

	onAudioFocusChanged = (event: { hasAudioFocus: boolean })=> {
		console.log(event,'qwqweqweqewqweqweqewqew')
		// this.setState({paused: !event.hasAudioFocus})
	};
	onProgress = (data) => {
		this.setState({currentTime: data.currentTime});
	};
	/// 屏幕旋转时宽高会发生变化，可以在onLayout的方法中做处理，比监听屏幕旋转更加及时获取宽高变化
	_onLayout = (event) => {
		//获取根View的宽高
		let {width, height} = event.nativeEvent.layout;
		console.log('通过onLayout得到的宽度：' + width);
		console.log('通过onLayout得到的高度：' + height);

		// 一般设备横屏下都是宽大于高，这里可以用这个来判断横竖屏
		let isLandscape = (height == height - NavBar.topbarHeight - currentHeight);
		if (isLandscape){
		this.setState({
			videoWidth: width,
			videoHeight: height - NavBar.topbarHeight - currentHeight,
			isFullScreen: true,
		})
		} else {
		this.setState({
			videoWidth: width,
			videoHeight: width * 9/16,
			isFullScreen: false,
		})
		}
	};
	// 点击了工具栏上的全屏按钮
	onControlShrinkPress() {
		if (this.state.isFullScreen) {
			this.setState({
				isFullScreen: !this.state.isFullScreen,
				videoHeight: width * 9/16,
			})
		}
		else
		{
			this.setState({
				isFullScreen: !this.state.isFullScreen,
				videoHeight: height - NavBar.topbarHeight - currentHeight,
			})
		}
	}
	//暂停
	onPaused = () =>
	{
		console.log(this.state.paused,"暂停吗暂停吗暂停吗暂停吗暂停吗暂停吗")
		var paused = this.state.paused;
		if (paused)
		{
			this.lay = setTimeout(() => {
				this.setState({
					visible: false,
				})
			}, 1000)
			this.audioPause();
		}
		this.setState({
			paused: !paused,
		})

	}

	audioPausedVideo = () =>
	{
		this.setState({
			paused: true,
		})
		console.log(this.state.paused,"暂停吗暂停吗暂停吗暂停吗暂停吗暂停吗")
		var paused = this.state.paused;
		if (paused)
		{
			this.lay = setTimeout(() => {
				this.setState({
					visible: false,
				})
			}, 1000)
		}
	}

	slider(value)
	{
		console.log(value,'12312313131')
		this.setState({
			currentTime: value,
		})
		this.video.seek(value)
	}

	setVisible =()=>
	{
		this.setState({
			visible: !this.state.visible,
		})
	}

	share = async (type) =>
	{
		var time = (new Date()).valueOf();
		var user = await QBStorage.get("user")
		var mobile = user ? user.mobile : null;
		var shareUrl = URL + '/App/shareDetail.html?id=' + this.state.id + '&time=' + time + '&mobile=' + mobile;

		this.setState({
			modalVisible: false,
		})
		if (type == 1)
		{
			WeChat.isWXAppInstalled()
				.then(isInstalled =>
				{
					console.warn(isInstalled)
					if (isInstalled)
					{
						WeChat.shareToSession({
							type: "news",
							title: this.state.newdata.title,
							description: this.state.newdata.context,
							thumbImage: this.state.images[0],
							webpageUrl: shareUrl,
						})
							.then(res => {
								//分享回调
								javaBase.request({
									path: 'Weixin/Circle/shareCallBack',
									body: {method: 'post', id: this.state.id, }
								})
									.then(res => {
										if (res.code == 1)
										{
											this.refs.toast.show('分享成功')
										}
									})
									.catch(err => {

									})
							}).catch(err =>
							{
								Alert.alert(err.message)
							})

					}
					else
					{
						Alert.alert("请安装微信")
					}
				})
		}
		else
		{
			WeChat.isWXAppInstalled()
				.then(isInstalled =>
				{
					if (isInstalled)
					{
						WeChat.shareToTimeline({
							type: "news",
							title: this.state.newdata.context,
							description: "分享医疗商城",
							thumbImage: this.state.images[0],
							webpageUrl: shareUrl,
						}).catch(err =>
						{
							Alert.alert(err.message)
						})

					}
					else
					{
						Alert.alert("请安装微信")
					}
				})
		}
	}
	offModal(index){
		this.setState({modalVisible: true, modelIndex: index})
	}

	shareData = () =>
	{
		if (!this.state.isLogin)
		{
			this.setState({
				isLoginStatus: true,
				loginTitle: '登陆后可分享',
			})
		}
		else
		{
			this.setState({
				modalVisible: true,
			})
		}
	}

	didLike = () =>
	{
		if (!this.state.isLogin)
		{
			this.setState({
				isLoginStatus: true,
				loginTitle: '登陆后可点赞',
			})
		}
		else
		{
			javaBase.request({
				path: 'Weixin/Circle/giveThumbsUp',
				body: {method: 'post', id: item.id, },
			})
				.then(res =>
				{
					if (res.code == 1)
					{
						this.refs.toast.show('点赞成功');
					}
				})
				.catch(err =>
				{
					console.log(err)
				})
		}
	}

	changeCode = value =>
	{
		this.code = value;
		if (value.length == 6)
		{
			//登陆
			this.nextEvent({type: 'phone', })
		}
	}

	changeMobile = (value) =>
	{
		this.mobile = value
		if (value)
		{
			this.setState({
				isWxLogin: false,
			})
		}
		else
		{
			this.setState({
				isWxLogin: true,
			})
		}
	}

	sendCodeEvent = () =>
	{
		Keyboard.dismiss();
		console.log(this.codeNum, this.mobile, this.myInterval)
		if (this.codeNum > 0)
		{
			return;
		}
		if (this.myInterval)
		{
			clearInterval(this.myInterval);
			this.myInterval;
		}

		if (this.mobile)
		{
			if (!(/^1[3|4|5|6|7|8|9][0-9]{9}$/.test(this.mobile)))
			{
				this.refs.toast.show("手机号码格式错误")
				return;
			}
			this.codeNum = 60;
			this.myInterval = setInterval(() =>
			{
				const codeNum = this.codeNum--;
				if (codeNum == 0)
				{
					this.setState({
						codeTitle: i18n.t('register.resendText')
					})
					clearInterval(this.myInterval);
					this.myInterval;
				}
				else
				{
					this.setState({
						codeTitle: codeNum,
					})
				}
			}, 1000);
			LoginService.sendMobileCode({ mobile: this.mobile, })
				.then((_responseJSON) => {
					console.log("请求成功", _responseJSON);
					if (_responseJSON.status == 1)
					{
						this.refs.toast.show(i18n.t('success'));

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
						this.refs.toast.show(i18n.t('failed'));
					}
				})
				.catch((err) => {
					this.setState({
						codeTitle: i18n.t('register.resendText')
					})
					clearInterval(this.myInterval);
					this.myInterval;
					this.codeNum = 0;
					this.refs.toast.show(i18n.t('networkError'));
					console.log('请求失败', err);
				});
		}

	}

	nextEvent(res)
	{
		var type = res.type;
		if (type == 'VX')
		{
			this.setState({
				isLoginStatus: false,
			})
			this._openWXApp();
			return;
		}
		if (!(/^1[3|4|5|6|7|8|9][0-9]{9}$/.test(this.mobile)))
		{
			this.refs.toast.show("手机号码格式错误")
			return;
		}
		console.log(this.mobile,this.code,this.uid,'参数11111111111')

		if (this.mobile == "18338299767" && this.code == "123456")
		{
			this.props.getLogin({status: 10, })
			return;
		}

		this.props.getLogin({status: 15, })

		Keyboard.dismiss();

	}

	/**
	 * 二级评论点赞
	 */
	secondAgree = async (item) =>
	{
		var likeStatus = item.likeStatus;
		var res = await javaBase.request({
			path: 'Weixin/Circle/giveThumbsUp',
			body: {id: item.id, type: 1, },
		})
		if (res.code == 1)
		{
			if (likeStatus == 0)
			{
				this.refs.toast.show('点赞成功');
			}
			this.detail(this.props.navigation.state.params.item.id)
		}
		else
		{
			this.refs.toast.show('点赞失败');
		}
	}


	popTopHome(url)
	{
		console.log(this.props.user, '用户信息')
		var mobile = this.props.user&&this.props.user.mobile  ? this.props.user.mobile : "";
		var shop_id = this.props.user&&this.props.user.shop_id  ? this.props.user.shop_id : 45;
		var shop_url = this.props.user&&this.props.user.shop_url  ? this.props.user.shop_url : '';
		this.props.navigation.navigate("Youzan", {phone: mobile, shop_id: shop_id, shop_url: shop_url, });
		// 执行回调函数跳转到商城详情页
		// this.props.popToHomeView(url);
	}

	renderCommentItem = () =>
	{
		//渲染评论列表
		var list = this.state.comment;
		var listComment = list.map((item, index) =>
		{
			var avatar = item.avatar;
			var secondaryComment = item.reply;
			if (secondaryComment.length > 0)
			{
				var secondCmment = secondaryComment.map(atem =>
				{
					var secondParams = {
						comment_id: item.id,
						reply_id: atem.id,
					};
					if (atem.avatar)
					{
						var avatar = atem.avatar
					}
					else if (atem.wxData && atem.wxData.avatarUrl)
					{
						avatar = atem.wxData.avatarUrl
					}
					else
					{
						avatar = ""
					}
					if (atem.armariumScienceUserName)
					{
						var armariumScienceUserName = atem.armariumScienceUserName
					}
					else if (atem.wxData && atem.wxData.nickname)
					{
						armariumScienceUserName = atem.wxData.nickName
					}
					else
					{
						armariumScienceUserName = "匿名用户"
					}
					if (atem.replyToUser && atem.replyToUser.avatar)
					{
						var replyAvatar = atem.replyToUser.avatar
					}
					else if (atem.replyToUser && atem.replyToUser.wxData && atem.replyToUser.wxData.avatarUrl)
					{
						replyAvatar = atem.replyToUser.wxData.avatarUrl
					}
					else
					{
						replyAvatar = ""
					}
					if (atem.replyToUser && atem.replyToUser.armariumScienceUserName)
					{
						var replyUserName = atem.replyToUser.armariumScienceUserName
					}
					else if (atem.replyToUser && atem.replyToUser.wxData && atem.replyToUser.wxData.nickname)
					{
						replyUserName = atem.replyToUser.wxData.nickName
					}
					else
					{
						replyUserName = "匿名用户"
					}
					return (
						<View key={atem.id} style={styles.commentSecond}>
							<View style={{flexDirection: 'row', justifyContent: "flex-start", alignItems: 'center', }}>
								<View style={{flexDirection: 'row', justifyContent: 'flex-start', alignItems: 'center', }}>
									<View style={styles.imgWhole}>
										{avatar ? <Image source={{uri: avatar, }} resizeMode="cover" style={styles.avatar} /> : <Image source={require("../../img/logo.png")} resizeMode="cover" style={styles.avatar}  />}
									</View>
									<Text>{armariumScienceUserName ? armariumScienceUserName : '匿名用户'}</Text>
								</View>
								<Feather name="chevron-right" color="#ccc" size={16}></Feather>
								<View style={{flexDirection: 'row', justifyContent: 'flex-start', alignItems: 'center', }}>
									<View style={styles.imgWhole}>
										{replyAvatar ? <Image source={{uri: replyAvatar, }} resizeMode="cover" style={styles.avatar} /> : <Image source={require("../../img/logo.png")} resizeMode="cover" style={styles.avatar} />}
									</View>
									<Text>{replyUserName ? replyUserName : '匿名用户'}</Text>
								</View>
							</View>
							<View style={[styles.commentContent, {paddingLeft: 55, paddingTop: 10, }, ]}><Text>{atem.content}</Text></View>
							<View style={{flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20, paddingLeft: 55, }}>
								<Text style={{color: '#808080'}}>{this.formatTime(atem.createTime)}</Text>
								<TouchableOpacity onPress={() => this.doComment("second", secondParams)}><Text style={{color: '#24A090'}}>回复</Text></TouchableOpacity>
							</View>
						</View>
					)
				})
			}
			var params = {comment_id: item.id, };
			return (<View style={styles.commentWhole} key={item.id}>
				{avatar ? <Image source={{uri: avatar, }} resizeMode="cover" style={styles.avatar} /> : <Image source={require("../../img/logo.png")} resizeMode="cover"  style={styles.avatar} /> }
				<View style={{flex: 1, }}>
					<View style={styles.commentTitle}>
						<Text>{item.armariumScienceUserName ? item.armariumScienceUserName : '匿名用户'}</Text>
						<TouchableOpacity
							style={{flexDirection: 'row', justifyContent: 'flex-start', alignItems: 'center', }}
							onPress={() => this.secondAgree(item)}
						>
							<Text style={{paddingRight: 5,color: item.likeStatus == 1 ? '#24A090' : '#666' }}>{item.likeCount}</Text>
							<Image source={require("../../img/agree.png")} />
						</TouchableOpacity>
					</View>
					<View style={styles.commentContent}>
						<Text>{item.content}</Text>
					</View>
					<View style={{flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20, }}>
						<Text style={{color: '#808080'}}>{this.formatTime(item.createTime)}</Text>
						<TouchableOpacity onPress={() => this.doComment("second", params)}><Text style={{color: '#24A090'}}>回复</Text></TouchableOpacity>
					</View>
					{secondCmment}
				</View>
			</View>)
		})
		return listComment
	}

	// 返回下部分所有的Item
	renderAllItem()
	{
		// 定义组件数组
		var itemArr = [
			{img: '../../img/shop_1.png', name: '激光治愈腕表', detailurl: 'www.baidu.com', smid: '128', price: '12888.00', },
			{img: '../../img/shop_2.png', name: '激光治愈腕表', detailurl: 'www.baidu.com', smid: '995', price: '9958.00', },
			{img: '../../img/shop_3.png', name: '激光治愈手环', detailurl: 'www.baidu.com', smid: '999', price: '999.00', },
		];
		// 取出数据

		// 创建组件装入数组
		var dataComponent = itemArr.map( (item, i) =>
		{
			return (
				<ShopCenterItem
					shopImage = {item.img}
					shopName = {item.name}
					detailurl = {item.detailurl}
					smid = {item.smid}
					price={item.price}
					key={i}
					index={i}
					// 将id再次封装传递下去
					popTopShopCenter = {(url)=>this.popTopHome(url)}
				/>
			);
		})

		// 返回
		return dataComponent;
	}

	doLike = () =>
	{
		if (!this.state.isLogin)
		{
			this.setState({
				isLoginStatus: true,
				loginTitle: '登录后可评论',
			})
		}
		else
		{
			var item = this.props.navigation.state.params.item;
			javaBase.request({
				path: 'Weixin/Circle/giveThumbsUp',
				body: {method: 'post', id: item.id, },
			})
				.then(res =>
				{
					console.log(res, '点赞111')
					if (res.code == 1)
					{
						var likeStatus = this.state.likeStatus;
						if (!likeStatus)
						{
							this.refs.toast.show("点赞成功")
						}
						this.setState({
							likeStatus: !likeStatus,
						})

					}
				})
				.catch(err =>
				{
					console.log(err)
				})
		}
	}

	doComment = (type, params) =>
	{
		console.log(type, params, '123123')
		if (!this.state.isLogin)
		{
			this.setState({
				isLoginStatus: true,
				loginTitle: '登录后可评论',
			})
		}
		else
		{
			if (this.myTextInput !== null)
			{
				this.commentType = type;
				this.commentParams = params;
				this.myTextInput.focus();
			}
		}
	}



	onText = (text) =>
	{
		console.log(text)
		this.setState({
			commentContent: text,
		})
	}
	onBlur = () => {
		this.setState({
			keyboardHeight: -100,
			inputHeight: 0,
		})
	}

	send = () => {
		if (!this.state.commentContent)
		{
			this.refs.toast.show("评论不能为空");
		}
		else
		{
			if (this.commentType == "all")
			{
				var id = this.state.id;
				var content = this.state.commentContent;
				javaBase.request({
					path: 'Weixin/Circle/discuss',
					body: {method: 'post', id: id, content: content, type: 0, },
				})
					.then(res =>
					{
						console.log(res, '评论结果')
						if (res.code == 1)
						{
							this.setState({
								commentContent: '',
							})
							Keyboard.dismiss();
							this.refs.toast.show("评论成功");
							this.detail(this.props.navigation.state.params.item.id)
							this.props.navigation.goBack();
							// this._renderArrayCallback("评论")
						}
						else
						{
							this.refs.toast.show("评论失败");
						}
					})
					.catch(err =>
					{

					})
			}
			else
			{
				//给评论回复
				var commentParams = this.commentParams;
				content = this.state.commentContent;
				commentParams.content = content;
				commentParams.type = 1;
				commentParams.id = this.commentParams.comment_id;
				javaBase.request({
					path: 'Weixin/Circle/discuss',
					body: commentParams,
				})
					.then(res =>
					{
						console.log(res, '回复评论结果')
						if (res.code == 1)
						{
							this.setState({
								commentContent: '',
							})
							Keyboard.dismiss();
							this.refs.toast.show("评论成功");
							this.detail(this.props.navigation.state.params.item.id)
							this.props.navigation.goBack();
							// this._renderArrayCallback("评论")
						}
						else
						{
							this.refs.toast.show("评论失败");
						}
					})
					.catch(err =>
					{

					})
			}
			this.props.navigation.navigate("CommentSuccess")

		}
	}

	/**
     * 滑动开始回调事件
     *
     * 注意：当刚刚开始滑动时，event.nativeEvent.contentOffset.y仍然是上次滑动的值，没有变化
     *
     * @param event
     * @private
     */
	_onScrollBeginDrag = (event) =>
	{
		//event.nativeEvent.contentOffset.y表示Y轴滚动的偏移量
		const offsetY = event.nativeEvent.contentOffset.y;
		//记录ScrollView开始滚动的Y轴偏移量
		this.scrollViewStartOffsetY = offsetY;
	};

	/**
     * ScrollView滑动回调事件
     * @param event
     * @private
     */
	_onScroll = (event) =>
	{

		if (this.state.isAnimate) {
			return;
		}
		this.setState({
			isAnimate: true,
		})
		const offsetY = event.nativeEvent.contentOffset.y;
		if (this.scrollViewStartOffsetY > offsetY)
		{
			//手势往下滑动，ScrollView组件往上滚动
			//console.log('手势往下滑动，ScrollView组件往上滚动');
			Animated.timing(                  // 随时间变化而执行动画
				this.spinValue,                       // 动画中的变量值
				{
					toValue: 0,                   // 透明度最终变为1，即完全不透明
					duration: 300,              // 让动画持续一段时间
					easing: Easing.in,
					useAnimatedDriver: true,
				}
			).start(() => this.setState({isAnimate: false, }));

		} else if (this.scrollViewStartOffsetY < offsetY) {
			//手势往上滑动，ScrollView组件往下滚动
			//console.log('手势往上滑动，ScrollView组件往下滚动');
			Animated.timing(                  // 随时间变化而执行动画
				this.spinValue,                       // 动画中的变量值
				{
					toValue: -100,                   // 透明度最终变为1，即完全不透明
					duration: 300,              // 让动画持续一段时间
					easing: Easing.in,
					useAnimatedDriver: true,
				}
			).start(() => this.setState({isAnimate: false, }));

		}
	}

	render()
	{
		console.log(this.state.video_url,'获取的数据')
		let video_url = this.state.video_url;
		let newdata = this.state.newdata;
		let images = this.state.images;
		let videoComponent = null;
		let pauseBtn = null;
		let autoTime = null;
		let sliderView  = null;
		let fullBtn = null;
		let NavBarContent = null;
		let statusBar = null;
		let titleComponent = null;
		let detailImgContent = null;
		let more = null;
		let audio = null;
		autoTime = (<View style={styles.volumeControl}>
			<Text style={{color: '#fff',fontSize: 12}}>{formatTime(this.state.duration - this.state.currentTime)}</Text>
		</View>)
		sliderView = (<View style={{flex: 1}}>
			<Slider
				minimumValue={0}
				maximumValue={this.state.duration}
				value={this.state.currentTime}
				onSlidingComplete={this.slider.bind(this)}
				style={{flex: 1}}
				maximumTrackTintColor={"#fff"}
			/>
		</View>)

		if (this.state.paused)
		{
			pauseBtn = (<Feather name="play" color="#fff" size={24}></Feather>)
		}
		else
		{
			pauseBtn = (<Feather name="pause" color="#fff" size={24}></Feather>)
		}
		if (!this.state.isFullScreen)
		{
			NavBarContent = (<NavBar
				title="分享详情"
				leftIcon="ios-arrow-back"
				leftPress={this.back.bind(this)}
				style={{zIndex: 1, }}
			/>)
			titleComponent = (<View>
				<View style={styles.circleHead}>
					{this.state.avatar?<Image source={{uri: this.state.avatar, }} style={styles.userImg} resizeMode="cover"/>:
						<Image source={require("../../img/logo.png")} style={styles.userImg} resizeMode="cover"/>}
					<View style={styles.userInfo}>
						<Text>{this.state.userName}</Text>
						<Text style={{fontSize: 12, color: '#999999', paddingTop: 5,}}>{this.state.time}</Text>
					</View>
				</View>
				<View style={styles.content}><Text style={{fontSize: 18, color: '#343434', }}>{this.state.title}</Text></View>
				<View style={styles.detailContent}><Text style={{color: '#343434', }}>{newdata.context}</Text></View>
			</View>)
			detailImgContent = (
				<View style={styles.detailImgContent}>
					{images.map((img, index) =>{
						return (<TouchableOpacity onPress={this.offModal.bind(this, index)} key={index} style={styles.imgChild}>
							<Image source={{uri: img, }} style={styles.imgContentChild} resizeMode="cover"/>
						</TouchableOpacity>)
					})}
				</View>
			)
			fullBtn = (<TouchableOpacity onPress={this.onControlShrinkPress.bind(this)} style={{width: 40,justifyContent: 'center',alignItems: 'center'}}>
				<Feather name="maximize" color="#fff" size={24}></Feather>
			</TouchableOpacity>)
			statusBar = (<StatusBar
				backgroundColor={"#24A090"}
				barStyle={this.props.barStyle || 'light-content'}
				translucent={true}
			/>)
			audio = (<View style={styles.audioComponent}>
				<View style={styles.audioImg}>
					<View style={styles.audioLeft}>
						{this.state.audioStatus==0?<View>
							<Image source={require("../../img/audioPause.png")} style={styles.shareImg}/>
						</View>:
							<View>
								<Image source={require("../../img/audioPlay.png")} style={styles.shareImg}/>
							</View>}
						<Text>{newdata.voiceDuration}s</Text>
					</View>
					{this.state.audioStatus == 0?<View style={styles.processing}></View>:
						<View style={styles.processing}>
							<Image source={require("../../img/iconVoice.png")} style={styles.shareImg}/>
							<Image source={require("../../img/iconVoice.png")} style={styles.shareImg}/>
							<Image source={require("../../img/iconVoice.png")} style={styles.shareImg}/>
						</View>}
				</View>
				{this.state.audioStatus == 0?<TouchableOpacity onPress={this.audioPlay.bind(this)} style={styles.audioBtn}>
					<Text>播放</Text>
				</TouchableOpacity>:
					<TouchableOpacity onPress={this.audioPause.bind(this)} style={styles.audioBtn}>
						<Text>暂停</Text>
					</TouchableOpacity>}
			</View>)
			more = (<Animated.View style={[styles.moreBtn, {marginBottom: this.spinValue, }]}>
				<View style={styles.userOperate}>
					<TouchableOpacity
						style={[styles.shareItem, styles.operateItem, ]}
						onPress={this.shareData.bind(this)} >
						<Image source={require("../../img/share.png")} />
						<Text style={styles.voteText}>分享</Text>
					</TouchableOpacity>
					<TouchableOpacity
						style={[styles.operateItem, styles.shareItem, ]}
						onPress={() => this.doComment("all")}
					>
						<Image source={require("../../img/info.png")} />
						<Text style={styles.voteText}>评论</Text>
					</TouchableOpacity>
					<TouchableOpacity
						style={styles.operateItem}
						onPress={this.doLike}
					>
						<Image source={require("../../img/agree.png")} />
						<Text style={[styles.voteText, {color: this.state.likeStatus ? '#24A090' : '#666',} ]}>点赞</Text>
					</TouchableOpacity>
				</View>
				<View style={styles.bottomToolsBarHeight} />
			</Animated.View>)
		}
		else
		{
			NavBarContent = !this.state.visible ? <View style={{height: NavBar.topbarHeight,backgroundColor: '#000' }}></View> : (<NavBar
				leftIcon="ios-arrow-back"
				leftPress={this.backfullScreen.bind(this)}
				style={{backgroundColor: '#000', zIndex: 1, }}
			/>);
			fullBtn = (<TouchableOpacity onPress={this.onControlShrinkPress.bind(this)} style={{width: 40,justifyContent: 'center',alignItems: 'center'}}>
				<Feather name="maximize" color="#fff" size={24}></Feather>
			</TouchableOpacity>)
			statusBar = (<StatusBar
				backgroundColor={"#000"}
				barStyle={this.props.barStyle || 'light-content'}
				translucent={true}
				hidden={this.state.visible ? false : true}
			/>)
		}
		if (!video_url)
		{
			videoComponent = null
		}
		else
		{
			videoComponent = (<Video
				ref={(ref: Video) => {
					this.video = ref
				}}
				/* For ExoPlayer */
				source={{uri: video_url}}
				style={{width: this.state.videoWidth,height: this.state.videoHeight, }}
				rate={this.state.rate}
				paused={this.state.paused}
				volume={this.state.volume}
				muted={this.state.muted}
				resizeMode={this.state.resizeMode}
				onLoad={this.onLoad}
				onProgress={this.onProgress}
				onEnd={this.onEnd}
				onAudioBecomingNoisy={this.onAudioBecomingNoisy}
				onAudioFocusChanged={this.onAudioFocusChanged}
				repeat={false}

			/>)
		}

		if (!this.state.visible)
		{
			pauseBtn = null;
			fullBtn = null;
			sliderView = null;autoTime = null;
		}

		let behavior = Platform.OS == 'ios' ? 'position' : null

		return (
			<View style={{flex: 1,backgroundColor: "#fff", }} onLayout={this._onLayout}>
				<Modal
					visible={this.state.modalVisible}
					transparent={true}
					onRequestClose={() => this.setState({modalVisible: false})}>
					{this.state.modelIndex!=(-1)?<ImageViewer
						imageUrls={this.state.images1}
						index= {this.state.modelIndex}
						saveToLocalByLongPress = {false}
						onClick={() => { // 图片单击事件
							this.setState({modalVisible: false, modelIndex: -1})
						}}>
					</ImageViewer>:
						<View>
							<TouchableOpacity onPress={()=>{this.setState({modalVisible: false, })}} style={{width: width, height: height+height/15, backgroundColor: '#000', opacity: 0.4}}></TouchableOpacity>
							<View style={{backgroundColor: '#fff', alignItems: 'center', position: 'absolute', bottom: Platform.OS == "ios" ? 0 : 49, left: 0, right: 0, height: 230,borderTopLeftRadius: 20, borderTopRightRadius: 20,}}>
								<View style={{borderBottomWidth: 1, borderBottomColor: '#ccc', alignItems: 'center', justifyContent: 'center', width: width, }}>
									<Text style={{paddingVertical: 15, fontSize: 15}}>分享到</Text>
								</View>
								<View style={{borderBottomWidth: 1, borderBottomColor: '#ccc', paddingVertical: 15, alignItems: 'center', width: width, flexDirection: 'row'}}>
									<TouchableOpacity onPress={this.share.bind(this, 1)} style={{paddingHorizontal: 15, justifyContent: 'center', alignItems: 'center'}}>
										<Image style={{width: 35, height: 35}} source={require("../../img/logo.png")} resizeMode="contain"/>
										<Text style={{paddingTop: 10}}>微信好友</Text>
									</TouchableOpacity>
									<TouchableOpacity onPress={this.share.bind(this, 2)} style={{paddingHorizontal: 15, justifyContent: 'center', alignItems: 'center'}}>
										<Image style={{width: 35, height: 35}} source={require("../../img/wx_row.jpg")} resizeMode="contain"/>
										<Text style={{paddingTop: 10}}>朋友圈</Text>
									</TouchableOpacity>
								</View>
								<TouchableOpacity onPress={()=>{this.setState({modalVisible: false})}} style={{alignItems: 'center', justifyContent: 'center', width: width}}>
									<Text style={{paddingVertical: 15, fontSize: 15}}>取消</Text>
								</TouchableOpacity>
							</View>
						</View>}
				</Modal>
				{statusBar}
				<View style={styles.sBar} backgroundColor={this.state.isFullScreen ? "#000" : '#24A090'}/>
				{NavBarContent}
				{this.state.isFullScreen ?
					<View style={styles.container}>
						<TouchableOpacity
							activeOpacity={1}
							onPress={this.setVisible}
							style={{width: this.state.videoWidth,height: this.state.videoHeight, }}>
							{videoComponent}
						</TouchableOpacity>
						<View style={styles.controls}>
							<TouchableOpacity style={styles.btn} onPress={this.onPaused.bind(this)}>
								{pauseBtn}
							</TouchableOpacity>
							<View style={styles.textStyle}>
								{autoTime}
							</View>
							{sliderView}
							{fullBtn}
						</View>
					</View>
					:
					<KeyboardAvoidingView style={styles.containerWhole} behavior={behavior}>
						<ScrollView
							style={styles.scrollView}
							onScroll={this._onScroll}
							onScrollBeginDrag={this._onScrollBeginDrag}
							onScrollEndDrag={this._onScrollEndDrag}
							scrollEventThrottle={16}    //设置16，一帧回调一次这个onScroll方法
						>
							{titleComponent}
							{audio}
							{detailImgContent}
							<View style={styles.container}>
								<TouchableOpacity
									activeOpacity={1}
									onPress={this.setVisible}
									style={{width: this.state.videoWidth,height: this.state.videoHeight}}>
									{videoComponent}
								</TouchableOpacity>
								<View style={styles.controls}>
									<TouchableOpacity style={styles.btn} onPress={this.onPaused.bind(this)}>
										{pauseBtn}
									</TouchableOpacity>
									<View style={styles.textStyle}>
										{autoTime}
									</View>
									{sliderView}
									{fullBtn}
								</View>
							</View>
							<View style={styles.subContent}>
								<View style={styles.subTitle}><Text style={{fontSize: 18, }}>热销商品</Text></View>
								<ScrollView
									style={styles.scrollViewStyle}
									horizontal={true} // 横向
									showsHorizontalScrollIndicator={false}  // 此属性为true的时候，显示一个水平方向的滚动条。
								>
									{this.renderAllItem()}
								</ScrollView>
							</View>
							<View style={styles.subContent}>
								<View style={styles.subTitle}>
									<Text style={{fontSize: 18, }}>全部评论</Text>
									<Text>({this.state.comment.length})</Text>
								</View>
								<ScrollView
									style={styles.scrollViewStyle}
									horizontal={false} // 横向
									showsHorizontalScrollIndicator={false}  // 此属性为true的时候，显示一个水平方向的滚动条。
								>
									{this.state.comment.length == 0 ?
										<View style={styles.noComment}><Text>暂无评论</Text></View>
										:
										<View>{this.renderCommentItem()}</View>
									}
								</ScrollView>
							</View>
						</ScrollView>
						{Platform.OS == "android" ?
							<View style={[styles.comment, {marginBottom: this.state.isShowInput  ? this.state.keyboardHeight : -1000, }]}>
								<TextInput
									style={styles.commontInput}
									onChangeText = {(text) => this.onText(text)}
									ref={ (ref)=>this.myTextInput = ref }
									onBlur={() => this.onBlur()}
									returnKeyType="done"
									underlineColorAndroid="transparent"
								/>
								<TouchableOpacity
									style={styles.send}
									onPress={this.send}
								><Text style={{color: '#fff'}}>发送</Text></TouchableOpacity>
							</View> :
							<View style={[styles.comment, {marginBottom: this.state.isShowInput  ? 0 : -1000, }]}>
								<TextInput
									style={styles.commontInput}
									onChangeText = {(text) => this.onText(text)}
									ref={ (ref)=>this.myTextInput = ref }
									onBlur={() => this.onBlur()}
									returnKeyType="done"
									underlineColorAndroid="transparent"
								/>
								<TouchableOpacity
									style={styles.send}
									onPress={this.send}
								><Text style={{color: '#fff'}}>发送</Text></TouchableOpacity>
							</View>}
					</KeyboardAvoidingView>
				}

				{ more }
				<Toast ref="toast" />
				<Modal
					visible={this.state.isLoginStatus}
					transparent={true}
					onRequestClose={() => this.setState({isLoginStatus: false, })}>
					<View>
						<TouchableOpacity onPress={()=>{this.setState({isLoginStatus: false, })}} style={{width: width, height: height+height/15, backgroundColor: '#000', opacity: 0.4, }}></TouchableOpacity>
						<View style={{backgroundColor: '#fff', alignItems: 'center', position: 'absolute', bottom: bottomToolsBarHeight + this.state.keyboardHeight, left: 0, right: 0, height: 250, }}>
							<View style={{alignItems: 'center', justifyContent: 'center', width: width, height: 50, }}>
								<Text style={{paddingVertical: 15, fontSize: 18, }}>{this.state.loginTitle}</Text>
							</View>
							<View style={{height: 40, width: width, paddingHorizontal: 15, marginTop: 20, justifyContent: 'center', }}>
								<TextInput
									placeholder="输入手机号"
									onChangeText={value => this.changeMobile(value)}
									style={styles.mobile}
									keyboardType="numeric"
									value={this.state.mobile}
									underlineColorAndroid="transparent"
								/>
							</View>
							{this.state.isWxLogin ?
								<View style={styles.wxLogin}>
									<TouchableOpacity
										style={{justifyContent: 'center', alignItems: 'center'}}
										onPress={this.nextEvent.bind(this, { 'type': 'VX' })}
									>
										<Image style={{width: 35, height: 35}} source={require("../../img/vxLogin.png")} resizeMode="contain"/>
									</TouchableOpacity>
								</View>
								:
								<View style={styles.codeWhole}>
									<TextInput
										placeholder="输入验证码"
										keyboardType="numeric"
										value={this.state.code}
										onChangeText={value => this.changeCode(value)}
										underlineColorAndroid="transparent"
										style={styles.code}

									/>
									<TouchableOpacity
										style={styles.sendCode}
										onPress={this.sendCodeEvent}
									><Text>{this.state.codeTitle}</Text></TouchableOpacity>
								</View>

							}
						</View>
					</View>
				</Modal>
			</View>
		)
	}
}

function mapStateToProps(state)
{
	console.log(state, '子组件的属性')
	return {
		title: state.community.title,
		photoUrls: state.community.photoUrls,
		videoUrl: state.community.video_url,
		audioUrl: state.community.audioUrl,
		audioDuration: state.community.audioDuration,
		content: state.community.content,
		isLogin: state.loginIn.user ? true : false,
		status: state.loginIn.status,
		user: state.loginIn.user,
	}
}

function mapDispatchToProps(dispatch)
{
	return {
		getLogin: (obj) => dispatch(getLogin(obj)),
		fetchLogin: (arg) => dispatch(fetchLogin(getLogin(arg))),
	}
}

export default connect(mapStateToProps, mapDispatchToProps)(dynamicDetail)


const cols = 3;
const boxW = (width - 60)/3;
const vMargin = (width - cols * boxW) / (cols + 1);
const hMargin = 15;
const styles = StyleSheet.create({
	scrollView: {
		height: height - NavBar.topbarHeight - statusBarHeight - bottomToolsBarHeight,
		paddingBottom: bottomToolsBarHeight + 40,
	},
	subContent: {
		paddingHorizontal: 15,
		backgroundColor: '#fff',
		marginTop: 10,
	},
	containerWhole: {
		flexDirection: 'column',
		flex: 1,
		justifyContent: 'flex-start',
		alignItems: 'center',
	},
	container: {
		flexDirection: 'column',
		flex: 1,
		justifyContent: 'flex-start',
		alignItems: 'center',
		backgroundColor: 'black',
	},
	sBar: {
		height: statusBarHeight,
		width: width,
		zIndex: 1,
	},
	title: {
		paddingHorizontal: 16,
		paddingVertical: 8,
		color: "#666",
	},
	subTitle: {
		flexDirection: 'row',
		justifyContent: "flex-start",
		alignItems: 'center',
		paddingLeft: 15,
		paddingRight: 15,
		marginBottom: 10,
		marginTop: 10,
		borderLeftColor: '#24A090',
		borderLeftWidth: 2,
	},
	textStyle: {
		alignItems: 'center',
		justifyContent: 'center',
		flexDirection: 'column',
		width: 60,
	},
	btn: {
		height: 20,
		width: 40,
		justifyContent: 'center',
		alignItems: 'center',
	},
	controls: {
		backgroundColor: 'transparent',
		flexDirection: 'row',
		justifyContent: 'space-around',
		alignItems: 'center',
		position: 'absolute',
		bottom: 10,
		left: 0,
		width: '100%',
		paddingLeft: 15,
		paddingRight: 15,
	},
	volumeControl: {
		flex: 1,
		flexDirection: 'column',
		justifyContent: 'center',
		alignItems: 'center',
	},
	commonent: {
		flexDirection: 'row',
		justifyContent: 'center',
		alignItems: 'center',
		marginTop: 20,
		marginBottom: 20,
	},
	commonentBtn: {
		flexDirection: 'row',
		justifyContent: 'center',
		alignItems: 'center',
		borderRadius: 15,
		paddingTop: 10,
		paddingLeft: 40,
		paddingRight: 40,
		paddingBottom: 10,
		borderWidth: 1,
		borderColor: '#8b8e9c',
	},
	imageUp: {
		width: 30,
		height: 30,
	},
	imgContent: {
		marginTop: 10,
	},
	imgStyle: {
		width: width,
		resizeMode: 'cover',
		minHeight: 300,
	},
	circleHead: {
		flexDirection: "row",
		paddingHorizontal: 15,
		width: width,
		alignItems: 'center',
		justifyContent: 'flex-start',
		paddingVertical: 10,
		backgroundColor: '#fff',
	},
	userImg: {
		width: 40,
		height: 40,
		borderRadius: Platform.OS == 'android'?200:20,
	},
	userInfo: {
		paddingLeft: 20,
	},
	share: {
		flex: 0.5,
	},
	shareImg: {
		width: 30,
		height: 30,
	},
	content: {
		paddingHorizontal: 15,
		backgroundColor: '#fff',
	},
	detailImgContent: {
		flexDirection: 'row',
		flexWrap: 'wrap',
		alignItems: 'center',
		paddingBottom: 10,
	},
	imgChild: {
		width: boxW,
		height: boxW,
		marginLeft: vMargin,
		marginTop: hMargin,
	},
	imgContentChild: {
		flex: 1,
	},
	detailContent: {
		paddingHorizontal: 15,
		paddingVertical: 20,
		backgroundColor: '#fff',
	},
	moreBtn: {
		position: 'absolute',
		bottom: 0,
		left: 0,
		right: 0,
		backgroundColor: '#fff',
		alignItems: 'center',
		justifyContent: 'center',
	},
	btnFont: {
		color: '#FFF',
		fontSize: 18,
	},


	audioComponent: {
		backgroundColor: '#fff',
		paddingHorizontal: 15,
		paddingBottom: 20,
		flexDirection: 'row',
		alignItems: 'center',
	},
	audioImg: {
		flexDirection: 'row',
		alignItems: 'center',
		width: width - 90,
		backgroundColor: '#24a090',
		borderRadius: 20,
		paddingRight: 20,
	},
	audioBtn: {
		width: 60,
		justifyContent: 'flex-end',
		alignItems: "flex-end",
	},
	audioLeft: {
		flexDirection: 'row',
		alignItems: 'center',
		flex: 1,
	},
	processing: {
		flexDirection: 'row',
		alignItems: 'center',
		justifyContent: 'flex-end',
		marginRight: 15,
		flex: 3,
	},
	operateItem: {
		height: 25,
		flexDirection: 'row',
		justifyContent: 'center',
		alignItems: 'center',
		width: (width - 30) / 3,
	},
	shareItem: {
		borderRightColor: '#d8d8d8',
		borderRightWidth: 1,
	},
	voteText: {
		paddingLeft: 3,
	},
	text: {
		color: '#808080',
	},
	flut: {
		position: 'absolute',
		right: 15,
		bottom: 15,
	},
	bottomToolsBarHeight: {
		height: bottomToolsBarHeight,
	},
	userOperate: {
		flexDirection: 'row',
		justifyContent: 'space-around',
		alignItems: 'center',
		height: 40,
	},
	comment: {
		width: width,
		height: 60,
		padding: 0,
		margin: 0,
		flexDirection: 'row',
		justifyContent: 'center',
		alignItems: 'center',
		position: "absolute",
		bottom: 0,
		backgroundColor: '#ccc',
	},
	commontInput: {
		width: width - 80,
		height: 40,
		borderRadius: 10,
		borderWidth: 1,
		borderColor: '#ccc',
		paddingHorizontal: 10,
		backgroundColor: '#fff',
	},
	send: {
		width: 50,
		backgroundColor: '#24a090',
		height: 38,
		borderRadius: 5,
		marginLeft: 10,
		justifyContent: 'center',
		alignItems: 'center',
	},
	noComment: {
		height: 100,
		width: width,
		justifyContent: 'center',
		alignItems: 'center',
	},
	commentWhole: {
		flexDirection: 'row',
		flex: 1,
		marginLeft: 15,
		width: width - 60,
	},
	avatar: {
		width: 45,
		height: 45,
		borderRadius: 45,
		overflow: 'hidden',
	},
	imgWhole: {
		width: 45,
		height: 45,
		borderRadius: 45,
		overflow: 'hidden',
		marginRight: 10,
	},
	commentTitle: {
		flex: 1,
		flexDirection: 'row',
		justifyContent: "space-between",
		alignItems: "center",
		width: width - 115,
		height: 45,
		marginBottom: 15,
	},
	commentContent: {
		marginBottom: 10,
	},
	mobile: {
		height: 40,
		borderBottomColor: '#ccc',
		borderBottomWidth: 1,
		flex: 1,
		textAlign: 'center',
		fontSize: 16,
	},
	wxLogin: {
		justifyContent: 'center',
		height: 140,
		alignItems: 'center',
	},
	codeWhole: {
		width: width - 30,
		marginHorizontal: 15,
		borderBottomColor: '#ccc',
		borderBottomWidth: 1,
		flexDirection: 'row',
		marginTop: 20,
	},
	code: {
		width: width - 30,
		height: 40,
		textAlign: 'center',
	},
	sendCode: {
		position: 'absolute',
		right: 0,
		top: 0,
		height: 40,
		justifyContent: 'center',
		alignItems: 'center',
		minWidth: 50,
	},

});

