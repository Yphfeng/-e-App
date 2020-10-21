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
	Image,
	TextInput, 
	BackHandler,
	TouchableOpacity,
	Alert,
	Platform,
	DeviceEventEmitter,
	NativeModules,
} from 'react-native'
import NavBar from '../../../common/NavBar'
import Picker from 'react-native-picker';
import SyanImagePicker from 'react-native-syan-image-picker';
import ImagePickerIOS from "react-native-image-picker";
import Toast, { DURATION, } from 'react-native-easy-toast'
import * as userService from '../../../utils/network/userService';
import { connect, } from 'react-redux'
import * as WeChat from 'react-native-wechat';
import * as userActions from '../../../actions/user/userActions';
import * as loginService from '../../../utils/network/loginService';
import QBStorage from "../../../utils/storage/storage";
import { fetchLogin, getImplement, isBindPhone, bindPhone, getLoginForRedurce, } from '../../../actions/loginActions';
import * as loginActions from '../../../actions/loginActions';
import * as bleActions from '../../../actions/device/bleActions';
import moment from 'moment';
import AliyunOSS from 'aliyun-oss-react-native';
import {statusBarHeight, height, width, } from '../../../utils/uiHeader';
import Icon from 'react-native-vector-icons/Ionicons'

//FontAwesome
class MineProfilePage extends Component
{
	static navigationOptions = {
		header: null,
	};

	constructor(props)
	{
		super(props)
		this.state = {
			userSexs: '男',
			birthday: [],
			disease_list: [],
			isVxBind: false,
			user: this.props.user,
		}
		this.AccessKeyId = ""
		this.AccessKeySecret = ""
		this.SecurityToken = ""
		this.FileProfix = ""
		this.openid = ""
		this.access_token = ""
		this.unionid = ""
	}

	componentWillMount()
	{
		BackHandler.addEventListener('hardwareBackPress', this.onBackAndroid);
		this.birthData = this.getDateList();
		if (Platform.OS == "android")
		{
			NativeModules.BridgeManager.getAppVersion((event) =>{
				this.setState({
					band: 'V' + event,
				})
			});
		}
		else
		{
			NativeModules.Upgrade.getAppVersion((error, res) => {
				console.log(res, "版本号11")
				if (error)
				{
					this.setState({
						band: '',
					})
				}
				else
				{
					this.setState({
						band: 'V' + res,
					})
				}
			})
		}
	}

	componentWillUnmount()
	{
		BackHandler.removeEventListener('hardwareBackPress', this.onBackAndroid);
		this.didBlurSubscription && this.didBlurSubscription.remove();
	}
	async componentDidMount()
	{
		this.didBlurSubscription = this.props.navigation.addListener(
			'willFocus',
			payload => {
				this.getUserInfo();
				this.getUploadVoucher();
				this.setState({
					androidVersion: this.props.androidVersion,
					apiVersion: WeChat.getApiVersion(),
					isWXAppSupportApi: WeChat.isWXAppSupportApi(),
					isWXAppInstalled: WeChat.isWXAppInstalled(),
				})
			}
		);
	}

	getUploadVoucher()
	{
		userService.getUploadVoucher()
			.then(res => {
				console.log(res,'获取阿里云oos')
				if(res.StatusCode == 200) {
					this.AccessKeyId = res.AccessKeyId,
					this.AccessKeySecret = res.AccessKeySecret
					this.SecurityToken = res.SecurityToken
					this.FileProfix = res.FileProfix
				}
			})
			.catch(err => {
				console.log(err,'获取阿里云oos')
			})
	}

	getUserInfo()
	{
		var dic = new Object();
		var guardian = this.props.navigation.state.params ? this.props.navigation.state.params.guardian : null;
		console.log(guardian, '监护人。。。')
		var date = new Date();
		var year = date.getFullYear();
		var month = date.getMonth() + 1;
		var day = date.getDate();
		var userSexs;
		if (guardian)
		{
			dic.armariumScienceSession = guardian.userToken;

		}
		userService.getUserInfo(dic)
			.then(res => {
				console.log(res,'获取的用户信息')
				var userInfo = res.data.user_info;
				var wx_user_info = res.data.wx_user_info;
				if (res.status == 1)
				{
					if (userInfo.armarium_science_user_sex)
					{
						userSexs = userInfo.armarium_science_user_sex == 1 ? "男" : '女'
					}
					else
					{
						userSexs = wx_user_info.sex == 1 ? "男" : '女'
					}
					this.setState({
						userName: userInfo.armarium_science_user_name ? userInfo.armarium_science_user_name : wx_user_info.nickname,
						name: userInfo.armarium_science_user_name ? userInfo.armarium_science_user_name : wx_user_info.nickname,
						userHeight: userInfo.armarium_science_user_sg !== "0" ? userInfo.armarium_science_user_sg : '',
						userWeight: userInfo.armarium_science_user_tz !== "0" ? userInfo.armarium_science_user_tz : '',
						userPhone: userInfo.armarium_science_user_mobile,
						userSexs: userSexs,
						userBirthDay: userInfo.armarium_science_user_birthday ? userInfo.armarium_science_user_birthday : year+ '-'+ month + "-" + day,
						disease_list: res.data.disease_list ? res.data.disease_list : [],
						interest_list: res.data.interest_list,
						birthday: [year+'年', month+ '月', day+ '天', ],
						isSelectImg: userInfo.avatar ? userInfo.avatar : wx_user_info.avatar_url,
						ImgAvator: userInfo.avatar ? userInfo.avatar : wx_user_info.avatar_url,
						images: userInfo.avatar ? {uri: userInfo.avatar, } : {uri: wx_user_info.avatar_url, },
					})
					if (res.data.wx_user_info && res.data.wx_user_info.unique_id)
					{
						this.setState({
							isVxBind: true,
						})
					}
					else
					{
						this.setState({
							isVxBind: false,
						})
					}

				}
			})
			.catch(err => {

			})
	}
	onBackAndroid = () => {
		this.props.navigation.goBack();
		return true;
	};

	componentWillReceiveProps(newProps)
	{
		this.setState({
			disease_list: newProps.medicalList,
			user: newProps.user,
			connectStatus: newProps.connectStatus,
		})
	}

	back()
	{
		this.props.navigation.pop();
	}
	changeNameInput(name)
	{
		this.setState({
			name,
		})
	}
	changeUserNameInput(userName)
	{
		console.log(userName)
		this.setState({
			userName,
		})

	}
	changeHeightInput(userHeight)
	{
		this.setState({
			userHeight,
		})
	}
	changeWeightInput(userWeight)
	{
		this.setState({
			userWeight,
		})

	}

	chooseSix() {
		let data = ["男",'女'];
		Picker.init({
			pickerData: data,
			selectedValue: ["男"],
			pickerTitleText: "请选择性别",
			pickerConfirmBtnText: "确认",
			pickerCancelBtnText: "取消",
			pickerBg: [255,255,255,1],
			pickerConfirmBtnColor: [36,160,144,1],
			pickerCancelBtnColor: [36,160,144,1],
			onPickerConfirm: data => {
				console.log(data);
				this.setState({
					userSexs: data
				})
			},
			onPickerCancel: data => {
				console.log(data);
			},
			onPickerSelect: data => {
				console.log(data);
			}
		});
		Picker.show();
	}
	getDayNumber(year,month) {
		var d = new Date(year,month,0);
		return d.getDate()
	}
	getDateList() {
		const _this = this;
		let dataList = [],
			wapLayer = {},
			mouthList = [],
			yList = [],
			yListValue = [],
			mouthListValue = [],
			DayArrayList = [],
			DayArrayListValue = [],
			DayArrayLayer = {},
			mouthLayer = [];
			//当前日期减去18,直接展示成年后可选择的年份
		let licitYear = 2100;
		for (let i = licitYear; i >1900; i--) {
			yList.push(i);
			yListValue.push(i+'年');
		}
		yList.map(function(value)
		{
			for (let k = 0; k < 12; k++) {
				mouthList.push(k);
				mouthListValue.push(k+'月');
				if (mouthList.length == 12) {
					mouthList.map(function(values) {
						let dayNumber = _this.getDayNumber(value, values + 1); //传入当前年和当前月,获取当前月天数
						for (let j = 0; j < dayNumber; j++) {
							DayArrayList.push(j + 1);
							DayArrayListValue.push(j + 1+'日');
						}
						DayArrayLayer[values + 1 + '月'] = DayArrayListValue;
						mouthLayer.push(DayArrayLayer);
			            wapLayer[value + '年'] = mouthLayer;
			            mouthList = [];
			            DayArrayList = [];
			            DayArrayLayer = {};
			mouthListValue = [];
			DayArrayListValue = [];

			        });
	      }
	    }
	    dataList.push(wapLayer);
	    wapLayer = {};
	    mouthLayer = [];
	  });
	  return dataList;
		};

	setBirthDay() {

		Picker.init({
			pickerData: this.birthData,
			selectedValue: this.state.birthday,
			pickerTitleText: "请选择生日",
			pickerConfirmBtnText: "确认",
			pickerCancelBtnText: "取消",
			pickerBg: [255,255,255,1],
			pickerConfirmBtnColor: [36,160,144,1],
			pickerCancelBtnColor: [36,160,144,1],
			onPickerConfirm: data => {
				console.log(data);
				this.setState({
					birthday: data,
					userBirthDay: data[0].split('年')[0]+'-' + data[1].split('月')[0] + '-' + data[2].split('日')[0]
				})
			},
			onPickerCancel: data => {
				console.log(data);
			},
			onPickerSelect: data => {
				console.log(data);
			}
		});
		Picker.show();
	}
	goMedical()
	{
		console.log(this.props.navigation.state.params)
		var guardian = this.props.navigation.state.params ? this.props.navigation.state.params.guardian : '';

		this.props.navigation.navigate("MedicalPage", {guardian: guardian, diease: this.state.disease_list, callback: (()=> {
			this.getUserInfo();
		})})
	}
	alert(title, text)
	{
		Alert.alert(
			title,
			text,
			[
				{text: '确定', onPress: ()=> console.log('点击确定')}
			]
		);
	}
	/**
	 * [save 保存]
	 * @Author   袁进
	 * @DateTime 2019-01-16T09:49:36+0800
	 * @return   {[type]}                 [description]
	 */
	save()
	{
		if (!this.state.isSelectImg || this.state.isSelectImg == "''" || this.state.isSelectImg == this.state.ImgAvator){
			this.saveOthers();
			return;
		}
		this.startUpload(this.state.isSelectImg)
	}
	saveOthers()
	{
		var data = {
			name: this.state.userName,
			height: this.state.userHeight,
			birth: this.state.userBirthDay,
			weight: this.state.userWeight,
			sex: this.state.userSexs == "男" ? 1 : 0,
			avatar: this.state.isSelectImg,

		}
		var guardian = this.props.navigation.state.params ? this.props.navigation.state.params.guardian : null;
		console.log(guardian, '监护人。。。')
		if (guardian)
		{
			data.armariumScienceSession = guardian.userToken;

		}

		userService.updateUserInfo(data)
			.then( async res =>
			{
				if (res.status == 1)
				{
					DeviceEventEmitter.emit("getPointers", "")
					if (res.user_info_status == 1) {
						this.alert('提示',"恭喜您获得100积分,请在积分界面中查看")
						this.props.saveUserInfo(data);
						return;
					}
					this.alert("提示",'保存成功')
				}
				else
				{
					this.alert('提示',"保存成功",)
				}
				this.props.saveUserInfo(data);
			})
			.catch(err => {
				console.log(err);
				this.alert('提示',"修改失败")
			})
	}

/**
 * [startUpload 上传到阿里云]
 * @Author   袁进
 * @DateTime 2019-03-21T16:18:04+0800
 * @param    {[type]}                 uri [description]
 * @return   {[type]}                     [description]
 */
	startUpload(path)
	{
		const endPoint = 'oss-cn-shenzhen.aliyuncs.com';
		const configuration = {
			maxRetryCount: 3,
			timeoutIntervalForRequest: 30,
			timeoutIntervalForResource: 24 * 60 * 60,
		};

		//根据AliyunOss配置AccessKey
		AliyunOSS.initWithSecurityToken(this.SecurityToken,this.AccessKeyId, this.AccessKeySecret, endPoint, configuration);
		console.log(path,'上传路径oos')
		this.uploadOssFile(path)

	}

	uploadOssFile = filepath => {

		const filetype = filepath ? filepath.substring(filepath.lastIndexOf('.')).toLowerCase() : '';
		//获取图片后缀
		const bucketname = 'bjy-dev';
		const currm = moment(new Date());
		const oo = Math.random();
		const objectKey = `avatar/${currm.format('YYYYMM')}/${this.FileProfix}%${currm}${oo}${filetype}`;
		console.log(objectKey,'路径')
		// 生成objectKey，作为自定义路径
		return AliyunOSS.asyncUpload(bucketname, objectKey, filepath)
			.then((res) =>
			{
				console.log(res, '上传成功打o偶爱云')
				this.setState({
					isSelectImg: objectKey,
				})
				this.saveOthers()
			})
			.catch(error => {
				console.log('=== error', error);
			});
	};



	openPhoto() {
		//打开系统相册
		const options = {
			title: "选择图片",
			cancelButtonTitle: "取消",
			chooseFromLibraryButtonTitle: "从相册中选择",
			takePhotoButtonTitle: "拍照",
			quality: 1.0,
			maxWidth: 500,
			maxHeight: 500,
			storageOptions: {
				skipBackup: true
			}
		};
		ImagePickerIOS.launchImageLibrary(options, (response)  => {
			//响应结果处理参考上面样例
			if (response.didCancel) {
				console.log('User cancelled photo picker');
			}
			else if (response.error) {
				console.log('ImagePicker Error: ', response.error);
			}
			else if (response.customButton) {
				console.log('User tapped custom button: ', response.customButton);
			}
			else {
				let source = {uri: response.uri};

				// You can also display the image using data:
				// let source = { uri: 'data:image/jpeg;base64,' + response.data };

				this.setState({
					isSelectImg: response.uri,
					images:{uri: response.uri}
				});
			}
		});
	}

	pickerVatar() {
		if(Platform.OS == "android"){
			// ImagePicker.openPicker({
			// 	width: 300,
			// 	height: 400,
			// 	cropping: true
			// }).then(image => {
			// 	console.log(image);
			// 	this.setState({
			// 		isSelectImg: image.path,
			// 		images: {uri: image.path,  mime: image.mime}
			// 	})

			// }).catch(err=> {
			// 	console.log(err)
			// })
			SyanImagePicker.showImagePicker({
				imageCount: 1,
			}, (err, selectedPhotos) => {
			if (err) {
				// 取消选择
				return;
			}
			// 选择成功，渲染图片
			// ...
				console.log('selectedPhotos', selectedPhotos)
				this.setState({
					isSelectImg: selectedPhotos[0].original_uri,
					images: {uri: selectedPhotos[0].original_uri}
				})
			})
		}else{
			this.openPhoto();
		}

	}

	/**
	 * 绑定微信
	 */
	async _openWXApp()
	{
		try
		{
			if (!this.state.isWXAppInstalled){
				this.refs.toast.show("请先安装微信")
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
			console.log(tokenData, 'tken')
			this.access_token = tokenData.data.access_token;
			this.openid = tokenData.data.openid;
			console.log(this.access_token, '获取的token1111')
			var userInfo = await loginService.getUserInfo({openid: this.openid, access_token: this.access_token});
			console.log('1212123eqwe',userInfo);
			this.unionid = userInfo.unionid;
			var serviceUserInfo = await loginService.getServiceUserInfo({openid: this.openid, });

			console.log(userInfo, '获取的微信信', serviceUserInfo)
			var dataParams = {
				openid: this.openid,
				source: 1,
				unique_id: userInfo.unionid,
				avatarUrl: userInfo.headimgurl,
				nickName: userInfo.nickname,
				gender: userInfo.sex,
				province: userInfo.province,
				country: userInfo.country,
				city: userInfo.city,
				language: userInfo.language,
				mobile: this.state.userPhone
			}
			if (serviceUserInfo.status == 1 && !serviceUserInfo.data.mobile)
			{//微信用户需绑定手机
				this.props.bindPhone(dataParams, this.loginCallback);
			}
			else if (serviceUserInfo.status == 2 && serviceUserInfo.code == "40316")
			{
				this.props.bindPhone(dataParams, this.loginCallback);
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
						this.props.bindPhone(dataParams, this.loginCallback);
					}
					else if (getAlreadyData.status == 2 && getAlreadyData.code == "40316")
					{
						this.props.bindPhone(dataParams, this.loginCallback);
					}
					else
					{
						var loginIn = {
							token: getAlreadyData.data.token,
							code: getAlreadyData.code,
							msg: getAlreadyData.msg,
							status: getAlreadyData.status,
							user_id: getAlreadyData.data.user_id,
							shop_id: getAlreadyData.data.shop_id,
							shop_url: getAlreadyData.data.shop_url,
							mobile: this.state.userPhone,
						}
						this.props.getLoginForRedurce(loginIn)
						QBStorage.save("user", loginIn);
					}

				}
				else if (saveData.status == 2 && saveData.code == 40316)
				{
					//微信登陆需绑定手机
					this.props.bindPhone(dataParams, this.loginCallback);
				}
			}
			else if (serviceUserInfo.status == 2 && serviceUserInfo.code == "40334")
			{//未查询到该微信用户需要调用保存微信信息接口
				var dataParams = {
					openid: this.openid,
					source: 1,
					unique_id: userInfo.unionid,
					avatarUrl: userInfo.headimgurl,
					nickName: userInfo.nickname,
					gender: userInfo.sex,
					province: userInfo.province,
					country: userInfo.country,
					city: userInfo.city,
					language: userInfo.language,
					mobile: this.state.userPhone,
				}
				console.log(dataParams,'保存的参数')
				var saveData = await loginService.saveUserInfo(dataParams);
				console.log(saveData, '保存用户信息')
				if (saveData.status == 1)
				{
					var getAlreadyData = await loginService.getServiceUserInfo({openid: this.openid, });
					console.log(getAlreadyData, '获取信息')
					if (getAlreadyData.status == 1 && !getAlreadyData.data.mobile)
					{
						this.props.bindPhone(dataParams, this.loginCallback);
					}
					else
					{
						var loginIn = {
							token: serviceUserInfo.data.token,
							code: serviceUserInfo.code,
							msg: serviceUserInfo.msg,
							status: serviceUserInfo.status,
							user_id: getAlreadyData.data.user_id,
							shop_id: getAlreadyData.data.shop_id,
							shop_url: getAlreadyData.data.shop_url,
							mobile: this.state.userPhone,
						}
						this.props.getLoginForRedurce(loginIn)
						QBStorage.save("user", loginIn);
						this.refs.toast.show("绑定成功")
						this.setState({
							isVxBind: true,
						})
					}

				}

			}
			else
			{
				if (!serviceUserInfo.data)
				{
					this.refs.toast.show(serviceUserInfo.msg)
					return;
				}
				if (serviceUserInfo.status == 1 && serviceUserInfo.data.mobile !== this.state.userPhone )
				{
					this.alert("温馨提示", "此第三方账号已绑定其他手机号,无法再与此手机号绑定",() => {

					})
				}
			}
		}
	}

	loginCallback = (res) =>
	{
		if (res.status === 1)
		{
			this.getUserInfo();
			this.refs.toast.show(res.message)
			this.setState({
				isVxBind: true,
			})
		}
		else
		{
			this.refs.toast.show(res.message)
		}
	}

	setVx() {
		if (this.state.isVxBind)
		{
			return;
		}
		this._openWXApp();

	}

	logout()
	{
		QBStorage.delete('bg_close');
		this.props.fetchLoginOut(this.loginOutCallback)
	}
	loginOutCallback = res =>
	{
		this.refs.toast.show(<View style={{justifyContent: "center", alignItems: 'center'}}>
			<Icon name="ios-checkmark-outline" size={55} color="#fff"></Icon>
			<Text style={{color: '#fff', }}>{res.message}</Text>
		</View>);
		setTimeout(() =>
		{
			if (this.state.connectStatus === 4)
			{
				//断开设备
				this.props.disconnectBle(this.onDisCallback);
			}
			DeviceEventEmitter.emit('loginChange', false)
		}, 1000)
	}
	checkBand()
	{
		console.log("检查版本")
	}

	onDisCallback = res => {

	}

	render() {
		let list = null;
		let imgVatar = null;
		let vxView = null;
		if (this.state.disease_list && this.state.disease_list.length > 0)
		{
			list = this.state.disease_list.map((item,index) => {
				return (<View key={index} style={styles.diseaseItem}><Text style={styles.text}>{item.disease_name}</Text></View>)
			})
		}
		else
		{
			list = null
		}
		if (this.state.isSelectImg && this.state.isSelectImg !== "''")
		{
			imgVatar = (<TouchableOpacity onPress={this.pickerVatar.bind(this)} style={styles.avatarContainer}>
				<Image source={this.state.images} style={styles.imgVatar} />
			</TouchableOpacity>)
		}
		else
		{
			imgVatar = (<TouchableOpacity onPress={this.pickerVatar.bind(this)}>
				<Text>请选择头像</Text>
			</TouchableOpacity>)
		}
		if (this.state.isVxBind)
		{
			vxView = (<View style={[styles.item]} >
				<Text>微信号:</Text>
				<View  style={{flexDirection: 'row',justifyContent: 'center',alignItems: 'center'}}><Text>已绑定</Text></View>
			</View>)
		}
		else
		{
			vxView = (<TouchableOpacity style={[styles.item]} onPress={this.setVx.bind(this)}>
				<Text>微信号:</Text>
				<View  style={{flexDirection: 'row',justifyContent: 'center',alignItems: 'center'}}><Text>未绑定</Text></View>
			</TouchableOpacity>)
		}

		return (
			<View style={{flex: 1, backgroundColor: "#f3f3f3"}}>
				<View style={styles.sBar} backgroundColor={'#24a090'}/>
				<NavBar
					title="我的信息"
					leftIcon="ios-arrow-back"
					leftPress={this.back.bind(this)}
				/>
				<ScrollView style={styles.container}>
					<View style={styles.item}>
						<Text>头像:</Text>
						{imgVatar}
					</View>
					<View style={[styles.item,{marginBottom: 20,borderBottomWidth: 0}]}>
						<Text>用户名: </Text>
						<TextInput
							style={[styles.textInput,{width: 95,textAlign:"right"}]}
							placeholder="请输入用户名"
							underlineColorAndroid="transparent"
							onChangeText={this.changeUserNameInput.bind(this)}
							defaultValue={this.state.name}

						/>
					</View>
					<View style={styles.item}>
						<Text>身高:</Text>
						<View style={{flexDirection: 'row',alignItems: 'center',justifyContent: 'center'}}>
							<TextInput
								style={styles.textInput}
								placeholder="请输入身高"
								maxLength={3}
								keyboardType="numeric"
								underlineColorAndroid='transparent'
								onChangeText={this.changeHeightInput.bind(this)}
								value={this.state.userHeight}
							/>
							<Text>cm</Text>
						</View>
					</View>
					<View style={styles.item}>
						<Text>体重:</Text>
						<View style={{flexDirection: 'row',alignItems: 'center',justifyContent: 'center'}}>
							<TextInput
								style={styles.textInput}
								placeholder="请输入体重"
								maxLength={3}
								keyboardType="numeric"
								underlineColorAndroid='transparent'
								onChangeText={this.changeWeightInput.bind(this)}
								value={this.state.userWeight}
							/>
							<Text>kg</Text>
						</View>
					</View>
					<TouchableOpacity style={styles.item} onPress={this.chooseSix.bind(this)}>
						<Text>性别:</Text>
						<Text>{this.state.userSexs}></Text>
					</TouchableOpacity>
					<TouchableOpacity style={styles.item} onPress={this.setBirthDay.bind(this)}>
						<Text>生日:</Text>
						<Text>{this.state.userBirthDay}></Text>
					</TouchableOpacity>
					<TouchableOpacity style={[styles.item,{borderBottomWidth: 0}]} onPress={this.goMedical.bind(this)}>
						<Text>病史:</Text>
						<View style={{flexDirection: 'row',justifyContent: 'center',alignItems: 'center'}}>{list}</View>
					</TouchableOpacity>
					<View style={[styles.item,{marginTop: 10}]}>
						<Text>手机:</Text>
						<Text>{this.state.userPhone}</Text>
					</View>
					{vxView}
					<TouchableOpacity style={[styles.item,{borderBottomWidth: 0}]} onPress={this.checkBand.bind(this)}  >
						<Text>版本号:</Text>
						<View  style={{flexDirection: 'row',justifyContent: 'center',alignItems: 'center'}}><Text>{this.state.band}</Text></View>
					</TouchableOpacity>

					<TouchableOpacity style={[styles.item,{borderBottomWidth: 0,marginTop: 10,justifyContent: "center"}]} onPress={this.logout.bind(this)}>
						<Text style={{color: '#FF4F43'}}>切换账号</Text>
					</TouchableOpacity>
				</ScrollView>
				<View style={styles.saveContent}>
					<TouchableOpacity style={styles.save} onPress={this.save.bind(this)}>
						<Text style={{fontSize: 14,color: '#fff'}}>保存</Text>
					</TouchableOpacity>
				</View>
				<Toast
					ref="toast"
					position="center"
					style={{justifyContent: 'center', alignItems: 'center'}}
				/>
			</View>
		)
	}
}


function mapStateToProps(state) {
	console.log(state,'子组件的属性')
	return {
		androidVersion: state.ble.androidVersion,
		msg: state.loginIn.msg,
		implementStatus: state.loginIn.implementStatus,
		connectStatus: state.ble.connectStatus,
		isBindPhoneStatus: state.loginIn.isBindPhone,
		user: state.loginIn.user,
	}
}

function mapDispatchToProps(dispatch) {
	return {
		saveUserInfo: (data) => dispatch(userActions.saveUserInfo(data)),
		fetchLoginOut: callback => dispatch(loginActions.fetchLoginOut(callback)),
		getImplement: (s) => dispatch(getImplement(s)),
		getLoginForRedurce: (obj) => dispatch(getLoginForRedurce(obj)),
		isBindPhone: (s) => dispatch(isBindPhone(s)),
		fetchLogin: (arg) => dispatch(fetchLogin(getLoginForRedurce(arg))),
		bindPhone: (s, callback) => dispatch(bindPhone(s, callback)),
		disconnectBle: s => dispatch(bleActions.disconnectBle(s)),
	}
}

export default connect(mapStateToProps,mapDispatchToProps)(MineProfilePage)



const styles = StyleSheet.create({
	title: {
		paddingHorizontal: 16,
		paddingVertical: 8,
		color: "#666"
	},
	sBar: {
		height: statusBarHeight,
		width: width,
	},
	container: {
		height: height - statusBarHeight - 100,
	},
	item: {
		flexDirection: 'row',
		justifyContent: 'space-between',
		alignItems: 'center',
		backgroundColor: '#fff',
		paddingHorizontal: 15,
		height: 40,
		borderBottomWidth: 1,
		borderBottomColor: '#ddd',
	},
	textInput: {
		minWidth: 100,
		textAlign: "right",
	},
	saveContent: {
		height: 100,
		justifyContent: 'center',
		alignItems: 'center',
	},
	save: {
		marginLeft: 20,
		marginRight: 20,
		height: 35,
		width: width - 40,
		backgroundColor: '#24a090',
		borderRadius: 15,
		justifyContent: 'center',
		alignItems: 'center',
	},
	imgVatar: {
		width: 30,
		height: 30,
	},
	avatarContainer: {
		width: 30,
		height: 30,
		borderRadius: 50,
		overflow: 'hidden',
	},
	diseaseItem: {
		borderWidth: 1,
		borderColor: '#24a090',
		paddingHorizontal: 5,
		paddingVertical: 3,
		justifyContent: 'center',
		alignItems: 'center',
		marginLeft: 5,
		borderRadius: 15,
	},
	text: {
		fontSize: 10,
		color: '#24a090',
	}
});
