/**
 * @author lam
 */
'use strict';

import React, {Component,} from 'react'
import {
	Text,
	View,
	StyleSheet,
	BackHandler,
	Image,
	TouchableOpacity,
	Platform,
	Alert,
	Modal,
	TextInput,
	KeyboardAvoidingView,
	Keyboard,
	DeviceEventEmitter,
	PermissionsAndroid,
	ActivityIndicator,
} from 'react-native'
import Toast, { DURATION, } from 'react-native-easy-toast'
import NavBar from '../../common/NavBar'
import QBStorage from '../../utils/storage/storage';
import * as WeChat from 'react-native-wechat';
import * as javaBase from '../../utils/network/javaService';
import { URL, } from "../../utils/network/baseService";
import PullList from '../../common/pullPush/PullList';

import { connect, } from "react-redux";
import i18n from '../../utils/i18n';
import * as LoginService from '../../utils/network/loginService';
import { fetchLogin, getLogin, } from '../../actions/loginActions';
import {width, height, statusBarHeight, bottomToolsBarHeight, } from '../../utils/uiHeader';
const contentHeight = height - NavBar.topbarHeight - statusBarHeight - bottomToolsBarHeight;

//FontAwesome
class DynamicList extends Component 
{
	static navigationOptions = {
		tabBarLabel: '圈子',
		tabBarIcon: ({focused, }) => {
			if (focused)
			{
				return (
					<Image style={styles.tabBarIcon} source={require('../../img/home_tab_circle.png')}/>
				);
			}
			return (
				<Image style={styles.tabBarIcon} source={require('../../img/home_tab_circle_a.png')}/>
			);
		},
	}
	constructor(props) {
		super(props);
		this.state = {
			isShow: false,
			dataList: [],
			pageNum: 1,
			modalVisible: false,
			shareChild: {},
			keyboardHeight: 0,
			isShowInput: false,
			text: '',
			isLogin: this.props.isLogin,
			isLoginStatus: false,
			loginTitle: '',
			isWxLogin: true,
			codeTitle: '获取验证码',
			dataSource: [],
			isLoadingTail: true, // loading?
			isRefreshing: false, // refresh?
			isFooting: false,
			isMine: false,
		};
		this.myTextInput = null;
		this.isGet = false;
		this.codeNum = 0;
		this.commentInfo = null;
		this.isLoadingMore = false;
		this.topIndicatorRender = this.topIndicatorRender.bind(this);
		this.onPullRelease=this.onPullRelease.bind(this);
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
	async componentDidMount()
	{
		console.log(this.props.navigation, 'luyou11111')
		this.viewDidAppear = this.props.navigation.addListener('willFocus', async (obj)=>
		{
			this._fetchData(1);
		})

	}

	//自定义下拉刷新指示器
	topIndicatorRender(pulling, pullok, pullrelease)
	{
		const that = this;
		const hide = {position: 'absolute', left: 10000, };
		const show = {position: 'relative', left: 0, };
		setTimeout(() =>
		{
			if (pulling)
			{
				this.txtPulling && this.txtPulling.setNativeProps({style: show});
				this.txtPullok && this.txtPullok.setNativeProps({style: hide});
				this.txtPullrelease && this.txtPullrelease.setNativeProps({style: hide});
			}
			else if (pullok)
			{
				this.txtPulling && this.txtPulling.setNativeProps({style: hide});
				this.txtPullok && this.txtPullok.setNativeProps({style: show});
				this.txtPullrelease && this.txtPullrelease.setNativeProps({style: hide});
			}
			else if (pullrelease)
			{
				this.txtPulling && this.txtPulling.setNativeProps({style: hide});
				this.txtPullok && this.txtPullok.setNativeProps({style: hide});
				this.txtPullrelease && this.txtPullrelease.setNativeProps({style: show});
			}
		}, 1);
		return (
			<View style={{flexDirection: 'row', justifyContent: 'center', alignItems: 'center', height: 60,zIndex:1}}>
				<ActivityIndicator size="small" color="red" />
				<View ref={(c) => this.txtPulling = c}>
					<Text>下拉刷新</Text>
				</View>
				<View ref={(c) => this.txtPullok = c}>
					<Text>释放更新</Text>
				</View>
				<View ref={(c) => this.txtPullrelease = c}>
					<Text>更新中</Text>
				</View>
			</View>
		);
	}

	async onPullRelease()
	{
		this.setState({isRefreshing: true, pageNum: 1, });

		let that = this;
		var arr = [], state = new Object(), params = new Object();
		var user = await QBStorage.get("user");
		if (user)
		{
			params.token = user.token
		}
		state.method = "post"
		params.pageSize = 5
		params.pageNum = 1
		state.params = params
		javaBase.requestToken({
			path: '/Weixin/Circle/list',
			body: state,
		})
			.then((responseData)=>
			{
				console.log(responseData, '获得的数据')
				//根据接口返回结果得到数据数组
				if (responseData.code == 1)
				{
					arr = this.dealWithDataArrCallBack(responseData.data.data);
					this.setState({
						dataSource: arr,
						isFooting: false,
						isRefreshing: false,
					})

				}
				else
				{
					this.setState({
						dataSource: [],
						isFooting: true,
						isRefreshing: false,
					})
				}

			})
			.catch(err =>
			{
				this.setState({
					dataSource: [],
					isRefreshing: false,
				})

			})
	}

	_fetchData = async (page) =>
	{
		this.isLoadingMore = false;
		let that = this;
		var arr = [], state = new Object(), params = new Object();
		var user = await QBStorage.get("user");
		if (user)
		{
			params.token = user.token
		}
		state.method = "post"
		params.pageSize = 5
		params.pageNum = 1
		state.params = params
		javaBase.requestToken({
			path: '/Weixin/Circle/list',
			body: state,
		})
			.then((responseData)=>
			{
				console.log(responseData, '获得的数据')
				//根据接口返回结果得到数据数组
				if (responseData.code == 1)
				{
					arr = this.dealWithDataArrCallBack(responseData.data.data);
					this.setState({
						dataSource: arr,
						isFooting: false,
						pageNum: page,
					})

				}
				else
				{
					this.setState({
						dataSource: [],
						isFooting: true,
					})
				}
				this.isGet = true;

			})
			.catch(err =>
			{
				this.setState({
					dataSource: [],
				})

			})

	}

	componentWillReceiveProps(nextProps)
	{
		console.log(nextProps, '新的newprops')
		this.setState({
			isLogin: nextProps.isLogin,
		})
		if (nextProps.status == 10)
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

	componentWillUnmount()
	{
		Keyboard.dismiss();
		this.keyboardDidShowListener.remove();
		this.keyboardDidHideListener.remove();
		BackHandler.removeEventListener('hardwareBackPress', this.onBackAndroid);
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

	async _openWXApp()
	{
		try
		{
			console.log(this.state.apiVersion, this.state.isWXAppInstalled, "weixin")
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

	format(shijianchuo)
	{
		var thisTime = shijianchuo.replace(/-/g, '/');
		return thisTime;
	}
	add0(m) { return m < 10 ? '0' + m : m }

	onBackAndroid = () =>
	{
		if (this.lastBackPressed && this.lastBackPressed + 2000 >= Date.now())
		{
			//最近2秒内按过back键，可以退出应用。
			BackHandler.exitApp();
			return false;
		}
		this.lastBackPressed = Date.now();
		// return true;
		return true;
	};
	events()
	{
		// var key = this.props.navigation.state.
		console.log(this.props.navigation, 'luy111111');
		this.props.navigation.push("DynamicStatement")
	}

	detail(item)
	{
		this.setState({
			keyboardHeight: 0,
			isShowInput: false,
		})
		this.props.navigation.push("DynamicDetail", {item: item, })
	}
	mine()
	{
		// this.props.navigation.push("DynamicMine")
		this.setState({
			isMine: true,
		})
	}
	minePub = () => {
		this.setState({
			isMine: false,
		})
		this.props.navigation.navigate("DynamicMine")
	}
	mineComent = () => {
		this.setState({
			isMine: false,
		})
		this.props.navigation.navigate("CommentList")
	}

	async isWXAppInstalled()
	{
		return WeChat.isWXAppInstalled()
	}

	shareData = (item) =>
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
				shareChild: item,
				modalVisible: true,
			})
		}
	}

	share = async (type) =>
	{
		var time = (new Date()).valueOf();
		var user = await QBStorage.get("user")
		var mobile = user ? user.mobile : null;
		console.log(mobile, '分享111', this.state.shareChild);
		var shareUrl = URL + '/App/shareDetail.html?id=' + this.state.shareChild.id + '&time=' + time + '&mobile=' + mobile;
		this.setState({
			modalVisible: false,
		})
		console.log(type, '分享', shareUrl);
		if (type == 1)
		{
			WeChat.isWXAppInstalled()
				.then(isInstalled =>
				{
					console.log(isInstalled, '是否安装了微信')
					if (isInstalled)
					{
						WeChat.shareToSession({
							type: "news",
							title: this.state.shareChild.title,
							description: this.state.shareChild.content,
							thumbImage: this.state.shareChild.photoUrls[0],
							webpageUrl: shareUrl,
						})
							.then(res =>
							{
								//分享回调
								javaBase.request({
									path: 'Weixin/Circle/shareCallBack',
									body: {method: 'post', id: this.state.shareChild.id, }
								})
									.then(res => {
										if (res.code == 1)
										{
											this._renderArrayCallback("分享")
										}
									})
									.catch(err => {

									})

							}).catch(err =>
							{
								console.log(err, '123456')
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
							title: this.state.shareChild.content,
							description: "分享医疗商城",
							thumbImage: this.state.shareChild.photoUrls[0],
							webpageUrl: shareUrl,
						})
							.catch(err =>
							{
								console.warn(err)
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

	handleScrollEnd = (event) =>
	{
		const contentHeight = event.nativeEvent.contentSize.height;
		const scrollViewHeight = event.nativeEvent.layoutMeasurement.height;
		const scrollOffset = event.nativeEvent.contentOffset.y;

		const isEndReached = scrollOffset + scrollViewHeight >= contentHeight; // 是否滑动到底部
		const isContentFillPage = contentHeight >= scrollViewHeight; // 内容高度是否大于列表高度
		if (isContentFillPage && isEndReached) {}
	};

	didAlertComment = (item) =>
	{
		if (!this.state.isLogin)
		{
			this.setState({
				isLoginStatus: true,
				loginTitle: '登录后可评论',
			})
			return;
		}
		if (item.commentCount > 0)
		{
			this.props.navigation.navigate("DynamicDetail", {item: item, })
		}
		else
		{
			if (this.myTextInput !== null)
			{
				this.myTextInput.focus();
			}
			this.commentInfo = item;
		}

	}

	onText = (text) =>
	{
		console.log(text)
		this.setState({
			commentContent: text,
		})
	}
	onBlur = () =>
	{
		this.setState({
			keyboardHeight: 0,
			isShowInput: false,
		})
	}

	sendFComment = () =>
	{
		if (!this.state.commentContent)
		{
			this.refs.toast.show("评论不能为空");
		}
		else
		{
			var id = this.commentInfo.id;
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
						this._renderArrayCallback("评论")
						this.props.navigation.navigate("CommentSuccess")
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
	}

	/**
	 * 评论或分享后更新列表
	 */
	_renderArrayCallback = (type) =>
	{
		var count;
		var arr = this.state.dataSource;

		if (type == "评论")
		{
			var index = arr.findIndex(aItem => {
				return aItem.id === this.commentInfo.id
			})
			count = arr[index].commentCount
			count ++
			arr[index].commentCount = count;
		}
		else
		{
			index = arr.findIndex(aItem => {
				return aItem.id === this.state.shareChild.id
			})
			count = arr[index].shareCount;
			count ++
			arr[index].shareCount = count;
		}
		this.setState({
			dataSource: arr,
		})
		console.log(arr, '返回的值')

	}

	dealWithDataArrCallBack = (arr) =>
	{
		console.log(arr, '数据的数组');
		var len = arr.length;
		var disArr = [];
		if (len > 0)
		{
			for (var i = 0; i<len; i++)
			{
				var item = arr[i], didItem = new Object();
				if (item.photoUrls != null && typeof(item.photoUrls)=='string')
				{
					didItem.photoUrls = (item.photoUrls.split(','));
				}
				else if (item.photoUrls != null && typeof(item.photoUrls)=='object')
				{
					didItem.photoUrls = item.photoUrls
				}
				else
				{
					didItem.photoUrls = []
				}
				if (item.userName)
				{
					didItem.userName = item.userName
				}
				else
				{
					if (item.wxNickname)
					{
						didItem.userName = item.wxNickname
					}
					else
					{
						didItem.userName = "匿名用户"
					}
				}
				if (item.avatar)
				{
					didItem.avatar = item.avatar
				}
				else
				{
					if (item.wxAvatar)
					{
						didItem.avatar = item.wxAvatar
					}
					else
					{
						didItem.avatar = ""
					}
				}
				didItem.createTime = this.format(item.createTime)
				didItem.title = item.title
				didItem.id = item.id
				didItem.likeCount = item.likeCount
				didItem.shareCount = item.shareCount
				didItem.commentCount = item.commentCount
				didItem.content = item.context
				didItem.likeStatus = item.likeStatus ? item.likeStatus : 0
				didItem.labelName = item.labelName
				disArr.push(didItem);
			}
			console.log(disArr, '处理后的阿让人');
		}
		else
		{
			disArr = []
		}
		return disArr;
	}

	didLike = (item) =>
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
						var arr = this.state.dataSource;

						var index = arr.findIndex(aItem =>
						{
							return aItem.id === item.id
						})
						var status = arr[index].likeStatus
						var count = Number(arr[index].likeCount)
						if (status > 0)
						{
							arr[index].likeStatus = 0;
							arr[index].likeCount =  count - 1
						}
						else
						{
							this.refs.toast.show('点赞成功');
							arr[index].likeStatus = item.id
							arr[index].likeCount = count + 1
						}
						this.setState({
							dataSource: arr,
						})

					}
				})
				.catch(err =>
				{
					console.log(err)
				})
		}
	}


	renderRow = (item, index) =>
	{
		return (
			<View key={item.id} style={styles.listWhole}>
				<TouchableOpacity
					style={styles.item}
					onPress={this.detail.bind(this, item)}
				>
					<View style={styles.circleHead}>
						<View style={styles.user}>
							{ item.avatar ? <Image source={{uri: item.avatar, }} style={styles.userImg} resizeMode="cover"/>:
								<Image source={require("../../img/logo.png")} style={styles.userImg} resizeMode="cover"/>
							}
						</View>
						<View style={styles.userInfo}>
							<View style={{flexDirection: 'row', }}>
								<Text style={{fontSize: 16, }}>{item.userName}</Text>
							</View>
							<Text style={{color: '#999999', fontSize: 12, paddingTop: 5, }}>{item.createTime}</Text>
						</View>
					</View>
					<Text style={styles.content}>{item.title}</Text>
					{item.photoUrls.length > 0 && <View style={styles.imgContent}>
						{item.photoUrls.length > 0 && item.photoUrls.map((img, i) =>
						{
							return (<View key={img} style={styles.imgChild}>
								<Image source={{uri: img, }} style={styles.imgContentChild} resizeMode="cover"/>
							</View>)
						})}
					</View>}
					<View style={styles.taps}><Text>{item.labelName}</Text></View>
				</TouchableOpacity>
				<View style={styles.userOperate}>
					<TouchableOpacity
						style={[styles.shareItem, styles.operateItem, ]}
						onPress={this.shareData.bind(this, item)} >
						<Image source={require("../../img/share.png")} />
						<Text style={styles.voteText}>{item.shareCount == 0 ? '分享' : item.shareCount}</Text>
					</TouchableOpacity>
					<TouchableOpacity
						style={[styles.operateItem, styles.shareItem, ]}
						onPress={this.didAlertComment.bind(this, item)}
					>
						<Image source={require("../../img/info.png")} />
						<Text style={styles.voteText}>{item.commentCount == 0 ? '评论' : item.commentCount}</Text>
					</TouchableOpacity>
					<TouchableOpacity
						style={styles.operateItem}
						onPress={this.didLike.bind(this, item)}
					>
						<Image source={require("../../img/agree.png")} />
						{this.state.isLogin ?
							<Text style={[styles.voteText, {color: item.likeStatus > 0 ? '#24a090' : '#666', }]}>{item.likeCount == 0 ? '点赞' : item.likeCount}</Text>
							:
							<Text style={styles.voteText}>{item.likeCount == 0 ? '点赞' : item.likeCount}</Text>
						}
					</TouchableOpacity>
				</View>
			</View>
		)
	}

	refresh= async ()=>
	{
		this.isLoadingMore = false;
		this.setState({
			pageNum: 1,
			isRefreshing: true,
		})
		this.isGet = false;
		var arr = [], state = new Object(), obj = new Object() ;
		var user = await QBStorage.get("user");
		if (user)
		{
			obj.token = user.token
		}
		state.method = "post"
		obj.pageSize = 5
		obj.pageNum = 1
		state.params = obj
		console.log(state, '参数')
		javaBase.requestToken({
			path: '/Weixin/Circle/list',
			body: state,
		})
			.then((responseData)=>
			{
				console.log(responseData, '数据111111');
				//根据接口返回结果得到数据数组
				if (responseData.code == 1)
				{
					arr = this.dealWithDataArrCallBack(responseData.data.data);
					this.setState({
						isFooting: false,
					})
				}
				else
				{
					arr = []
					this.setState({
						isFooting: true,
					})
				}
				console.log(arr, '获取额数据')
				this.setState({
					dataSource: arr,
					isRefreshing: false,
				})

			})
			.catch(err =>
			{
				this.setState({
					dataList: [],
					isRefreshing: false,
				})
			})
	}

	loadMore= async (page)=>
	{
		console.log(this.state.isFooting, '底部没有数据111', this.isLoadingMore)
		if (this.state.isFooting)
		{
        	return;
		}

		if (this.isLoadingMore)
		{
			return;
		}
		this.isLoadingMore = true;

		console.log("加载更多1111111111", page)
		var arr = [], state = new Object(), params = new Object() ;
		var user = await QBStorage.get("user");
		if (user)
		{
			params.token = user.token
		}
		state.method = "post"
		params.pageSize = 5
		params.pageNum = page
		state.params = params
		javaBase.requestToken({
			path: '/Weixin/Circle/list',
			body: state,
		})
			.then((responseData)=>
			{
				console.log(responseData, '加载更多');
				//根据接口返回结果得到数据数组
				if (responseData.code == 1  && responseData.data.data.length > 0)
				{
					var dataSource = this.state.dataSource;
					arr = this.dealWithDataArrCallBack(responseData.data.data);
					for (var i = 0; i < arr.length; i++)
					{
						dataSource.push(arr[i])
					}
					this.setState({
						pageNum: page,
						dataSource: dataSource,
						isFooting: false,

					})
				}
				else
				{
					arr = []
					this.setState({
						isFooting: true,
					})
				}
				this.isLoadingMore = false;
			})
			.catch(err =>
			{
				console.log(err);
			})
	};

	renderNoMore=()=>
	{
		return (
			<View style={{justifyContent: 'center', alignItems: 'center'}}><Text>暂无更多分享</Text></View>
		);
	};

	renderEmpty=()=>
	{
		if (!this.isGet)
		{
			return null
		}
		return (<View style={{width: width, height: contentHeight, justifyContent: 'center', alignItems: 'center' }}>
			<Text>暂无数据</Text>
		</View>);
	}

	shouldComponentUpdate(newProps, newState)
	{
		console.log(newProps, this.props);
		return true;
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

		this.props.getLogin({status: 10, })

		Keyboard.dismiss();

	}

	_keyExtractor = (item, index) => item.id;

	renderPlaceholder()
	{
		return <View><Text></Text></View>
	}

	_onEndReached = () =>
	{
		var page = this.state.pageNum;
		this.setState({
			isFooterLoading: true,
		});
		console.log(page, '23123')
		this.loadMore(page + 1)
	}

	searchPage = () => {
		this.props.navigation.navigate("HotList")
	}


	render()
	{
		const { dataSource,  } = this.state;
		let behavior = Platform.OS == 'ios' ? 'position' : null

		return (
			<View style={{flex: 1, backgroundColor: "#f3f3f3", }}>
				<View style={styles.sBar} backgroundColor={"#24a090"} />
				<NavBar
					title="分享E疗"
					leftIcon="ios-search-outline"
					leftPress={this.searchPage}
					rightText="发布管理"
					rightPress={this.mine.bind(this)}
					style={{paddingHorizontal: 10, zIndex: 1,  }}
				/>
				<Modal
					visible={this.state.modalVisible}
					transparent={true}
					onRequestClose={() => this.setState({modalVisible: false,})}>
					<View>
						<TouchableOpacity onPress={()=>{this.setState({modalVisible: false})}} style={{width: width, height: height+height/15, backgroundColor: '#000', opacity: 0.4}}></TouchableOpacity>
						<View style={{backgroundColor: '#fff', alignItems: 'center', position: 'absolute', bottom: Platform.OS == "android" ? 45 : 0, left: 0, right: 0, height: 250, }}>
							<View style={{borderBottomWidth: 1, borderBottomColor: '#ccc', alignItems: 'center', justifyContent: 'center', width: width,}}>
								<Text style={{paddingVertical: 15, fontSize: 15}}>分享</Text>
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
							<TouchableOpacity onPress={()=>{this.setState({modalVisible: false})}} style={{alignItems: 'center', justifyContent: 'center', width: width,}}>
								<Text style={{paddingVertical: 25, fontSize: 15}}>取消</Text>
							</TouchableOpacity>
						</View>
					</View>
				</Modal>
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
				<Modal
					visible={this.state.isMine}
					transparent={true}
					onRequestClose={() => this.setState({isMine: false, })}>
					<View>
						<TouchableOpacity onPress={()=>{this.setState({isMine: false, })}} style={{width: width, height: height+height/15, backgroundColor: '#000', opacity: 0.4, }}></TouchableOpacity>
						<View style={{backgroundColor: '#fff', alignItems: 'center', justifyContent: 'space-around', position: 'absolute', bottom: height/2 + bottomToolsBarHeight - 70, left: 30, right: 30, height: 140, borderRadius: 20, }}>
							<TouchableOpacity style={styles.pub} onPress={this.minePub}>
								<Image source={require("../../img/pub.png")} resizeMode="cover" />
								<Text style={styles.mineText}>我的发布</Text>
							</TouchableOpacity>
							<TouchableOpacity style={styles.mineComent} onPress={this.mineComent}>
								<Image source={require("../../img/mineComent.png")} resizeMode="cover" />
								<Text style={styles.mineText}>我的评论</Text>
							</TouchableOpacity>


						</View>
					</View>
				</Modal>

				<KeyboardAvoidingView style={styles.container} behavior={behavior}>

					<View style={styles.listIntent}>

						<PullList
							//FlatList基本属性123
							data={dataSource}
							renderItem={({item, index, })=>this.renderRow(item, index)}
							keyExtractor={(item) => item.id}
							//PullList下拉刷新
							onPullRelease={this.onPullRelease}
							topIndicatorRender={this.topIndicatorRender}
							topIndicatorHeight={60}
							//控制下拉刷新状态的属性，为true时显示头部刷新组件，为false则隐藏
							isRefreshing={this.state.isRefreshing}
							onEndReached={ this._onEndReached }
							onEndReachedThreshold={0.05}
							ListFooterComponent={this.state.isFooting ? this.renderNoMore : null}
							ListEmptyComponent={this.renderEmpty}
						>
						</PullList>
					</View>

					{Platform.OS == "ios" ?
						<View style={[styles.comment, {marginBottom: this.state.isShowInput  ? 19 : -1000, }]} >
							<TextInput
								style={styles.commontInput}
								onChangeText = {(text) => this.onText(text)}
								ref={ (ref)=>this.myTextInput = ref }
								onBlur={() => this.onBlur()}
								keyboardType="default"
								returnKeyType="done"
								underlineColorAndroid="transparent"
							/>
							<TouchableOpacity
								style={styles.send}
								onPress={this.sendFComment.bind(this)}
							><Text style={{color: '#fff'}}>发送</Text></TouchableOpacity>
						</View> :
						<View style={[styles.comment, {marginBottom: this.state.isShowInput  ? this.state.keyboardHeight - 49 : -1000, }]} >
							<TextInput
								style={styles.commontInput}
								onChangeText = {(text) => this.onText(text)}
								ref={ (ref)=>this.myTextInput = ref }
								onBlur={() => this.onBlur()}
								keyboardType="default"
								returnKeyType="done"
								underlineColorAndroid="transparent"
							/>
							<TouchableOpacity
								style={styles.send}
								onPress={this.sendFComment.bind(this)}
							><Text style={{color: '#fff'}}>发送</Text></TouchableOpacity>
						</View>}

				</KeyboardAvoidingView>

				<TouchableOpacity style={styles.flut} onPress={this.events.bind(this)}>
					<Image source={require("../../img/flut.png")} />
				</TouchableOpacity>
				<Toast
					ref="toast"
					position="center"
				/>
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
	}
}

function mapDispatchToProps(dispatch)
{
	return {
		getLogin: (obj) => dispatch(getLogin(obj)),
		fetchLogin: (arg) => dispatch(fetchLogin(getLogin(arg))),
	}
}

export default connect(mapStateToProps, mapDispatchToProps)(DynamicList)


const cols = 3;
const boxW = (width - 60)/3;
const vMargin = (width - cols * boxW) / (cols + 1);
const hMargin = 15;
const styles = StyleSheet.create({
	container: {
		flex: 1,
		justifyContent: 'center',
		alignItems: 'center',
		width: width,
	},
	title: {
		paddingHorizontal: 15,
		paddingVertical: 8,
		color: "#666",
	},
	sBar: {
		height: statusBarHeight,
		width: width,
		zIndex: 1,
	},
	tabBarIcon: {
		width: 19,
		height: 19,
	},
	listWhole: {
		backgroundColor: '#fff',
		marginBottom: 10,
		width: width,
	},
	listIntent: {
		width: width,
		flex: 1,
		overflow: 'scroll',
	},
	item: {
		backgroundColor: '#fff',
	},
	circleHead: {
		flexDirection: "row",
		paddingHorizontal: 15,
		width: width,
		alignItems: 'center',
		justifyContent: 'flex-start',
		paddingVertical: 10,
	},
	userImg: {
		width: 40,
		height: 40,
		borderRadius: Platform.OS == 'android'?200:20,
	},
	userInfo: {
		height: 50,
		justifyContent: 'center',
		alignItems: 'flex-start',
		marginLeft: 10,
	},
	shareImg: {
		width: 30,
		height: 30,
	},
	content: {
		paddingHorizontal: 15,
	},
	imgContent: {
		flexDirection: 'row',
		flexWrap: 'wrap',
		alignItems: 'center',
		marginBottom: 15,
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
	userOperate: {
		flexDirection: 'row',
		justifyContent: 'space-around',
		alignItems: 'center',
		borderTopColor: 'rgba(216, 216, 216, 1)',
		borderTopWidth: 1,
		height: 40,
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
	comment: {
		width: width,
		height: 60,
		padding: 0,
		margin: 0,
		flexDirection: 'row',
		justifyContent: 'center',
		alignItems: 'center',
		backgroundColor: '#ccc',
		position: "absolute",
		bottom: 0,

	},
	commontInput: {
		width: width - 80,
		height: 40,
		borderRadius: 10,
		borderWidth: 1,
		borderColor: '#fff',
		backgroundColor: '#fff',
		paddingHorizontal: 15,
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
	pub: {
		borderBottomColor: '#ddd',
		borderBottomWidth: 1,
		flex: 1,
		width: width - 60,
		justifyContent: 'center',
		alignItems: 'center',
		flexDirection: 'row',
	},
	mineComent: {
		flex: 1,
		width: width - 60,
		justifyContent: 'center',
		alignItems: 'center',
		flexDirection: 'row',
	},
	mineText: {
		fontSize: 18,
		paddingLeft: 10,
	},
	taps: {
		paddingHorizontal: 15,
		paddingVertical: 10,
	},
});
