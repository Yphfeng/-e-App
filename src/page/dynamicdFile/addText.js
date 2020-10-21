
/**
 * @author lam
 */
'use strict';

import React, {Component,} from 'react'
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
	TextInput,
	DeviceEventEmitter,
	KeyboardAvoidingView,
	Keyboard,
	Alert,
} from 'react-native'
import NavBar from '../../common/NavBar'
import Toast, { DURATION } from 'react-native-easy-toast'
import { connect, } from 'react-redux'
import * as communityActions from '../../actions/communityActions';
import {statusBarHeight, height, width, } from '../../utils/uiHeader';
import Sound from 'react-native-sound';
import * as javaBase from '../../utils/network/javaService';
import * as userService from '../../utils/network/userService';

import QBStorage from '../../utils/storage/storage';
const contentHeight = height - NavBar.topbarHeight - statusBarHeight
const currentHeight = statusBarHeight;
function formatTime(second)
{
	let h = 0, i = 0, s = parseInt(second);
	if (s > 60)
	{
		i = parseInt(s / 60);
		s = parseInt(s % 60);
	}
	// 补零
	let zero = function (v) {
		return (v >> 0) < 10 ? "0" + v : v;
	};
	console.log([zero(h), zero(i), zero(s)].join(":"));
	return [zero(h), zero(i), zero(s)].join(":");
	// return zero(s);
}

var whoosh;

class AddText extends Component
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
			selectedPhotos: [], //选择的图片列表
			audioUrl: '',
			audioTime: 0,
			audioPath: '',
			newImg: [],
			newAudio: '',
			imgIndex: 0,
			user: {},
			title: '',
			spinner: false,
			keyposition: 0,
			keyboardHeight: 0,
		};
		this.AccessKeyId = ""
		this.AccessKeySecret = ""
		this.SecurityToken = ""
		this.FileProfix = ""
		this.openid = ""
		this.access_token = ""
		this.unionid = ""
		this.aliyunUrl = "https://bjy-dev.oss-cn-shenzhen.aliyuncs.com/"
		this.img = [];
		this.allData= [];
	}
	componentWillMount() {

		BackHandler.addEventListener('hardwareBackPress', this.onBackAndroid);
	}
	componentDidMount() {
		console.log(this.props.navigation, 'luyou11111')
		// this.detail(47);
		this.getUploadVoucher();
		QBStorage.get('user')
            .then((user) =>
            {
                this.setState({
					user: user
				})
            })
            .catch(err => {

            })
		DeviceEventEmitter.addListener('audioMessage', (message)=>{
			console.warn(message);
			// this.startUpload(message.audioUrl);
			whoosh = new Sound(message.audioPath, null, (error) => {
				if (error) {
					return console.log('资源加载失败', error);
				}
			})
			this.setState({
				audioUrl: message.audioUrl,
				audioTime: message.time,
				audioPath: message.audioPath
			})
		})
		DeviceEventEmitter.addListener('webUrl', (message)=>{
			this.setState({
				video_url: message.url
			})
		})
		// this.setState({
		//     video_url: 'https://bjy-dev.oss-cn-shenzhen.aliyuncs.com/avatar/201911/c2d4HL0awIKKR2St60tlq79gR43ihy92F0_vLtWqYj37gA%15742337444980.6684852554982723.mp4'
		// })
		Keyboard.addListener('keyboardDidShow', (event) => {
			   this.setState({
				 keyposition: event.duration,
			   })
			})
			Keyboard.addListener('keyboardDidHide', (event) => {
				this.setState({
					keyposition: 0
				})
			})
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

	detail(id){
		var self = this;
		javaBase.requestToken({
			path: '/xcx/near/detail?id=' + id,
			body: {method: 'get'},
		})
			.then((res) => {
				if(res.code==1){
					var newdata = res.data;
					if (!newdata.wxUserName){
						newdata.wxUserName="匿名用户"
					}
					// console.warn('圈子详情', newdata)
					self.setState({
						id: newdata.id,
						video_url: newdata.videoUrl,
						voiceUrl: newdata.voiceUrl,
						newdata: newdata,
						time: self.format(newdata.createTime)
					})
					if (newdata.photoUrls!=null){
						var images = newdata.photoUrls.split(',');
						self.setState({
							images: images
						})
					}
					whoosh = new Sound(newdata.voiceUrl, null, (error) => {
						if (error) {
							return console.log('资源加载失败', error);
						}
					})
				}
			})
			.catch(err => {
				//console.warn(err, 'errerr');
			})
	}

	format(shijianchuo) {
		//shijianchuo是整数，否则要parseInt转换
		var time = new Date(shijianchuo);
		var y = time.getFullYear();
		var m = time.getMonth() + 1;
		var d = time.getDate();
		var h = time.getHours();
		var mm = time.getMinutes();
		return y + '/' + this.add0(m) + '/' + this.add0(d) + ' ' + this.add0(h) + ':' + this.add0(mm);
	}
	add0(m) { return m < 10 ? '0' + m : m }

	componentWillUnmount() {
		BackHandler.removeEventListener('hardwareBackPress', this.onBackAndroid);
	}

	onBackAndroid = () => {
		this.props.navigation.goBack();
		return true;
	};

	back() {
		this.props.navigation.pop();
	}

	onChangeTitle(text) {
		this.setState({
			title: text
		})
	}
	onFocus(){
		this.setState({
			keyboardHeight: 1,
		})
	}
	onBlur(){
		this.setState({
			keyboardHeight: 0,
		})
	}

	nextTo = () =>
	{
		if (!this.state.title)
		{
			this.refs.toast.show('请输入标题')
		}
		else
		{
			this.props.pbTitle(this.state.title)
			this.props.navigation.navigate("AddPicture");
		}
	}

	render() {

		let NavBarContent = null;
		let statusBar = null;

		NavBarContent = (<NavBar
			title="分享案例"
			leftIcon="ios-arrow-back"
			leftPress={this.back.bind(this)}
			rightText="下一步"
			rightPress={this.nextTo}
		/>)
		statusBar = (<StatusBar
			backgroundColor={"#24A090"}
			barStyle={this.props.barStyle || 'light-content'}
			translucent={true}
			style={styles.statusBarHeight}
		/>)

		return (
			<ScrollView style={{flex: 1,backgroundColor: "#FFF"}}>
				{statusBar}
				<View style={styles.statusBarHeight} backgroundColor={this.state.isFullScreen ? "#000" : '#24A090'}/>
				{NavBarContent}
				<View>
					<TextInput keyboardType="default" style={styles.inputText} onChangeText={this.onChangeTitle.bind(this)} maxLength={11} underlineColorAndroid="transparent" placeholder="请输入分享标题" />
				</View>
				<View style={styles.tips}>
					<Text>示例：使用了三个月的激光疗程，血压/血脂指标下降了！</Text>
				</View>
				<Toast ref="toast" />
			</ScrollView>
		)
	}
}

function mapStateToProps(state)
{
	console.log(state, '子组件的属性')
	return {

	}
}

function mapDispatchToProps(dispatch)
{
	return {
		pbTitle: (title) => dispatch(communityActions.pbTitle(title)),
	}
}

export default connect(mapStateToProps, mapDispatchToProps)(AddText)


const styles = StyleSheet.create({
	container: {
		flexDirection: 'column',
		flex: 1,
		justifyContent: 'flex-start',
		alignItems: 'center',
		backgroundColor: 'black',
		marginHorizontal: 10,
	},
	statusBarHeight: {
		height: statusBarHeight,
		width: width,
	},
	title: {
		paddingHorizontal: 16,
		paddingVertical: 8,
		color: "#666"
	},
	subTitle: {
		flexDirection: 'row',
		justifyContent: 'space-between',
		alignItems: 'center',
		paddingLeft: 10,
		paddingRight: 10,
		paddingBottom: 10,
		paddingTop: 20,
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
	inputText: {
		marginHorizontal: 20,
		fontSize: 16,
		marginBottom: 10,
		height: 50,
	},
	tips: {
		width: width - 30,
		marginLeft: 15,
	},
});
