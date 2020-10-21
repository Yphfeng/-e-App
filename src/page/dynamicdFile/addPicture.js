
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
import Item from '../../common/Item'
import Toast, { DURATION } from 'react-native-easy-toast'
import Feather from 'react-native-vector-icons/Feather'
import { connect, } from 'react-redux'
import * as communityActions from '../../actions/communityActions';
import {statusBarHeight, height, width, } from '../../utils/uiHeader';
import * as CircleService from '../../utils/network/circleService';
import Sound from 'react-native-sound';
import * as javaBase from '../../utils/network/javaService';
import SyanImagePicker from 'react-native-syan-image-picker';
import ImagePicker from "react-native-image-picker";
import * as userService from '../../utils/network/userService';
import moment from 'moment';
import AliyunOSS from 'aliyun-oss-react-native';
import QBStorage from '../../utils/storage/storage';
import Spinner from 'react-native-loading-spinner-overlay';

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

class AddPicture extends Component
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
		if(this.state.voiceUrl){
			this.audioPause();
		}
	}

	onBackAndroid = () => {
		this.props.navigation.goBack();
		return true;
	};

	back() {
		this.props.navigation.pop();
	}

	setVisible =()=> {
		this.setState({
			visible: !this.state.visible
		})
	}

	deleteImg(index)
	{
		var photos = this.state.selectedPhotos;
		photos.splice(index, 1);
		this.setState({
			selectedPhotos: photos,
		})
	}
	openPicker()
	{
		var photos = this.state.selectedPhotos;
		SyanImagePicker.showImagePicker({
			imageCount: 8 - photos.length,
		}, (err, selectedPhotos) => {
			if (err) {
				// 取消选择
				return;
			}
			// 选择成功，渲染图片
			// ...
			console.warn('selectedPhotos', selectedPhotos)
			this.setState({
				selectedPhotos: photos.concat(selectedPhotos)
			})
			for (var i = 0; i<selectedPhotos.length; i++){
				// this.startUpload(selectedPhotos[i].uri)
				// this.upImg(selectedPhotos[i].uri)
			}
		})
	}

	nextTo = () =>
	{
		var photos = this.state.selectedPhotos;
		if (photos.length < 1)
		{
			this.refs.toast.show("请添加图片");
		}
		else
		{
			this.props.pbImg(photos);
			this.props.navigation.navigate("AddVideo");
		}
	}

	render()
	{

		console.log(this.state.video_url,'获取的数据')
		let NavBarContent = null;
		let statusBar = null;
		let img = null; //添加图片

		NavBarContent = (<NavBar
			title="添加图片"
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
		img = (this.state.selectedPhotos.length==0?
			<View style={styles.noPictrue}><TouchableOpacity onPress={this.openPicker.bind(this)} style={styles.addImg}>
				<Image source={require('../../img/addPicture.png')} />
				<Text style={{fontSize: 20, color: '#505050', paddingTop: 10, paddingBottom: 20, }}>添加图片</Text>
				<Text style={{fontSize: 14, color: '#64505050'}}>最多添加9张，单张图片不超过10M</Text>
			</TouchableOpacity></View>:
			<View style={styles.imgContent}>
				{this.state.selectedPhotos.map((item, i)=>
				{
					return (<View key={i} style={[styles.imgContentChild, {marginRight: (i+1)%3==0 ? 0 : 10, }]}>
						<Image source={{uri: item.uri, }} resizeMode="cover" style={styles.imgStyle}/>
						<TouchableOpacity onPress={this.deleteImg.bind(this, i)} style={{position: 'absolute', top: 0, right: 10}}>
							<Image source={require("../../img/delete.png")} style={{width: 25, height: 25, }} resizeMode="cover"/>
						</TouchableOpacity>
					</View>)
				})}
				{this.state.selectedPhotos.length<8?<TouchableOpacity onPress={this.openPicker.bind(this)} style={styles.imgContentChild1}>
					<Text>添加图片</Text>
				</TouchableOpacity>:null}
			</View>)

		return (
			<View style={{flex: 1,backgroundColor: "#FFF"}}>
				{statusBar}
				<View style={styles.statusBarHeight} backgroundColor={this.state.isFullScreen ? "#000" : '#24A090'}/>
				{NavBarContent}
				<View>
					{img}
				</View>

				<Toast ref="toast" />
			</View>
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
		pbImg: (photos) => dispatch(communityActions.pbImg(photos)),
	}
}

export default connect(mapStateToProps, mapDispatchToProps)(AddPicture)


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
	noPictrue: {
		width: width,
		height: height - statusBarHeight - NavBar.topbarHeight,
		justifyContent: 'center',
		alignItems: 'center',
	},
	addImg: {
		justifyContent: 'center',
		alignItems: 'center',
	},
	imgContent: {
		paddingHorizontal: 15,
		flexDirection: 'row',
		flexWrap: 'wrap',
		alignItems: 'center',
		paddingVertical: 20,
	},
	imgContentChild: {
		width: (width - 50) / 3,
		height: (width - 50) / 3,
		marginBottom: 10,
	},
	imgStyle: {
		flex: 1,
	},
	imgContentChild1: {
		width: (width - 50) / 3,
		height: (width - 50) / 3,
		marginRight: 0,
		marginBottom: 10,
		borderColor: '#666',
		borderWidth: 1,
		justifyContent: 'center',
		alignItems: 'center',
	},
	imgItem: {

	},
});
