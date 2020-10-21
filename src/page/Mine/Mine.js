import React, {Component} from 'react';
import {
	View,
	Text,
	Image,
	StyleSheet,
	Dimensions,
	RefreshControl,
	StatusBar,
	PixelRatio,
	TouchableOpacity,
	Alert,
	DeviceEventEmitter,
} from 'react-native';
import px2dp from "../../utils/px2dp";
import Item from "../../common/Item";
import NavBar from "../../common/NavBar";

import Icon from 'react-native-vector-icons/Ionicons'
import ImagePicker from "react-native-image-picker";
import { connect, } from 'react-redux'
import Toast, { DURATION, } from 'react-native-easy-toast'
import * as userActions from '../../actions/user/userActions';
import * as userService from '../../utils/network/userService';
import {statusBarHeight, height, width, } from '../../utils/uiHeader';
//屏幕的宽度
var cols = 4;
var boxW = 80;
var vMargin = (width - cols*boxW)/(cols+1);
var hMargin = 15;


class MinePage extends Component {
	static navigationOptions = {
		tabBarLabel: '我的',
		tabBarIcon: ({focused}) => {
			if (focused) {
				return (
					<Image style={styles.tabBarIcon} source={require('../../img/home_tab_mine.png')}/>
				);
			}
			return (
				<Image style={styles.tabBarIcon} source={require('../../img/home_tab_mine_a.png')}/>
			);
		},
	};

	constructor(props) {
		super(props);
		this.state = {
			isRefreshing: false,
			avatarSource: null,
			userName: '分享医疗',
			points: 0,

		};
	}


	goProfile() {
		this.props.navigation.navigate('UserProfile');
	}

	componentDidMount() {
		this.onLineListener = DeviceEventEmitter.addListener('onLine', (message) =>
		{
		//收到监听后想做的事情
			if (!message)
			{
				this.refs.toast.show("网络连接不可用，请稍后重试")
			}
		})
		this.didBlurSubscription = this.props.navigation.addListener(
			'willFocus',
			payload => {

				this.getUserInfo();
				this.getUserPoints();
			}
		);

		DeviceEventEmitter.addListener("getPointers",() => {

			this.getUserPoints();
		})
	}

	getUserInfo()
	{
		var date = new Date();
		var year = date.getFullYear();
		var month = date.getMonth() + 1;
		var day = date.getDate();
		userService.getUserInfo()
			.then(res => {
				console.log(res,'获取的用户信息')
				if (res.status == 1)
				{
					console.log(typeof res.disease_list);
					this.setState({
						userName: res.data.user_info.armarium_science_user_name ? res.data.user_info.armarium_science_user_name : res.data.wx_user_info.nickname,
						avatar: res.data.user_info.avatar ? res.data.user_info.avatar : res.data.wx_user_info.avatar_url,
					})

				}
			})
			.catch(err => {

			})
	}

	getUserPoints()
	{
		userService.getUserPoints()
			.then(res => {
				console.log(res,'获取积分')
				if (res.status == 1)
				{
					this.setState({
						points: res.points ? res.points : 0
					})

				}

			})
			.catch(err => {

			})
	}

	componentWillReceiveProps(nextProps)
	{
		console.log(nextProps, "qweqweq")
		this.setState({
			userName: nextProps.userInfo.name,
			avatar: nextProps.userInfo.avatar,
			points: nextProps.userInfo.points,
		})
	}

	componentWillUnmount()
	{
		this.didBlurSubscription.remove();
		this.onLineListener.remove();
	}

	render()
	{
		let image = null;
		if (this.state.avatar !== "''" && this.state.avatar)
		{
			console.log("   2w12312e1qwdqwdwefwefwef")
			image = (<Image
				style={styles.avatar}
				source={{uri: this.state.avatar, }}
			/>)
		}
		else
		{
			image = (<Image
				style={styles.avatar}
				source={require("../../img/logo.png")}
			/>)
		}
		return (
			<View style={{flex: 1, backgroundColor: "#f3f3f3"}}>
				<StatusBar
					translucent={true}
					animated={true}
					backgroundColor={"#24a090"}
				/>
				<View style={styles.sBar} backgroundColor={'#24a090'}/>
				<NavBar
					title="我的"
					// leftIcon="ios-notifications-outline"
					// leftPress={this.leftPress.bind(this)}
					// rightIcon="ios-settings-outline"
					// rightPress={this.rightPress.bind(this)}
					titleStyle={{paddingLeft:0}}
				/>
				<View style={styles.scrollView}>
					<View style={{
						height: height,
						paddingBottom: 60,
						backgroundColor: "#f3f3f3",
					}}>
						<View style={styles.userHead}>
							<TouchableOpacity onPress={this._onPress.bind(this)}>
								<View
									style={styles.avatarContainer}>
									{image}
								</View>
							</TouchableOpacity>
							<Text style={{
								color: "#fff",
								fontSize: px2dp(14),
							}}>{this.state.userName}</Text>
							<View style={{marginTop: px2dp(10), flexDirection: "row"}}>
								<Text style={{color: "#fff",fontSize: 13}}>积分：</Text>
								<Text style={{color: "#fff",fontSize: 13}}>{this.state.points}</Text>
							</View>
						</View>
						<View style={{paddingBottom: 10,backgroundColor: '#fff'}}><Image resizeMode={'cover'} style={styles.imageStyle}  source={require('../../img/self@2x_02.png')} />
						</View>
						{/*
							<View style={styles.subTitle}>
								<Text style={{color: '#000',fontSize: 16}}>我的订单</Text>
								<TouchableOpacity onPress={this.goAppication.bind(this,{type: 'shopping'})}><Text style={{color: '#7f8389',fontSize:12}}>查看全部订单</Text></TouchableOpacity>
							</View>

							<View style={[styles.content,{marginBottom: 10}]}>
								<TouchableOpacity style={styles.itemRow} onPress={this.goAppication.bind(this,{type: 'shopping'})} >
									<Image style={styles.icon} source={require('../../img/myself@2x_03.png')} />
									<Text style={styles.text}>待付款</Text>
								</TouchableOpacity>
								<TouchableOpacity style={styles.itemRow} onPress={this.goAppication.bind(this,{type: 'shopping'})}>
									<Image style={styles.icon} source={require('../../img/myself@2x_05.png')} />
									<Text style={styles.text}>待发货</Text>
								</TouchableOpacity>
								<TouchableOpacity style={styles.itemRow} onPress={this.goAppication.bind(this,{type: 'shopping'})}>
									<Image style={styles.icon} source={require('../../img/myself@2x_07.png')} />
									<Text style={styles.text}>待收货</Text>
								</TouchableOpacity>

								<TouchableOpacity style={styles.itemRow} onPress={this.goAppication.bind(this,{type: 'shopping'})}>
									<Image style={styles.icon} source={require('../../img/myself@2x_09.png')} />
									<Text style={styles.text}>已完成</Text>
								</TouchableOpacity>
							</View>
						*/}
						<View style={[styles.content,{marginBottom: 10}]}>
							<TouchableOpacity style={styles.itemRow} onPress={this.goAppication.bind(this,{type: 'integral'})} >
								<Image style={styles.icon} source={require('../../img/myself@2x_15.png')} />
								<Text style={styles.text}>积分管理</Text>
							</TouchableOpacity>
							<TouchableOpacity style={styles.itemRow} onPress={this.goAppication.bind(this,{type: 'mineProfile'})} >
								<Image style={styles.icon} source={require('../../img/myself@2x_16.png')} />
								<Text style={styles.text}>个人资料</Text>
							</TouchableOpacity>
							<TouchableOpacity style={styles.itemRow} onPress={this.goAppication.bind(this,{type: 'aboutMe'})} >
								<Image style={styles.icon} source={require('../../img/myself@2x_20.png')} />
								<Text style={styles.text}>关于我们</Text>
							</TouchableOpacity>
							<TouchableOpacity style={styles.itemRow} onPress={this.goAppication.bind(this,{type: 'qrCode'})}>
								<Image style={styles.icon} source={require('../../img/ericon.png')} />
								<Text style={styles.text}>二维码</Text>
							</TouchableOpacity>
						</View>
						<View style={styles.content}>

							{/*
								<TouchableOpacity style={styles.itemRow} onPress={this.goAppication.bind(this,{type: 'setting'})} >
								<Icon name="ios-settings-outline" size={35} color="#000"/>
								<Text style={styles.text}>设置</Text>
								</TouchableOpacity>
							*/}
						</View>
					</View>
				</View>
				<Toast ref="toast" />
			</View>
		)
	}

	goAppication(res)
	{
		var type = res.type;
		switch (type)
		{
		case 'integral':
			this.props.navigation.navigate("IntegralPage")
			break;
		case 'mineProfile':
			this.props.navigation.navigate("MineProfilePage")
			break;
		case 'aboutMe':
			this.props.navigation.navigate("AboutMePage")
			break;
		case 'qrCode':
			this.props.navigation.navigate("QrCodePage")
			break;
		case 'setting':
			this.props.navigation.navigate('Setting');
			break;
		case "shopping":
			this.alert("功能开发中...",() => {

			})
			break;
		}
	}

	//弹出提示
	alert(text, callback)
	{
		Alert.alert("提示",text,[{ text:"确认",onPress:()=>{ callback() } }]);
	}

	_onPress()
	{
		const options = {
			title: "选择图片",
			cancelButtonTitle: "取消",
			chooseFromLibraryButtonTitle: "从相册中选择",
			takePhotoButtonTitle: "拍照",
			quality: 1.0,
			maxWidth: 500,
			maxHeight: 500,
			storageOptions: {
				skipBackup: true,
			},
		};

		// ImagePicker.showImagePicker(options, (response) => {
		//     console.log('Response = ', response);

		//     if (response.didCancel) {
		//         console.log('User cancelled photo picker');
		//     }
		//     else if (response.error) {
		//         console.log('ImagePicker Error: ', response.error);
		//     }
		//     else if (response.customButton) {
		//         console.log('User tapped custom button: ', response.customButton);
		//     }
		//     else {
		//         let source = {uri: response.uri};

		//         // You can also display the image using data:
		//         // let source = { uri: 'data:image/jpeg;base64,' + response.data };

		//         this.setState({
		//             avatarSource: source
		//         });
		//     }
		// });
	}

	logout() {
		this.props.navigation.navigate('Login');
	}
}

function mapStateToProps(state) {
	console.log(state,'子组件的属性')
	return {
		userInfo: state.user.userInfo,
	}
}

function mapDispatchToProps(dispatch) {
	return {
	}
}

export default connect(mapStateToProps,mapDispatchToProps)(MinePage)


const styles = StyleSheet.create({
	subTitle: {
		flexDirection: 'row',
		justifyContent: 'space-between',
		alignItems: 'center',
		paddingHorizontal: 20,
		backgroundColor: '#fff',
		paddingBottom: 10

	},
	sBar: {
		height: statusBarHeight,
		width: width
	},
	scrollView: {
		marginBottom: px2dp(5),
		backgroundColor: "#1E82D2"
	},
	userHead: {
		flexDirection: "column",
		alignItems: 'center',
		justifyContent: 'center',
		backgroundColor: "#24a090",
		height: 150,

	},
	numbers: {
		flexDirection: "row",
		backgroundColor: "#fff",
		height: 74
	},
	numItem: {
		flex: 1,
		height: 74,
		justifyContent: "center",
		alignItems: "center"
	},
	tabBarIcon: {
		width: 19,
		height: 19
	},
	quitContainer: {
		flex: 1,
		flexDirection: 'column',
		justifyContent: 'center',
		backgroundColor: '#fff'
	},
	avatarContainer: {
		flexDirection:'row',
		justifyContent: 'center',
		alignItems: 'center',
		paddingHorizontal: px2dp(10),
		borderRadius: 50,
		overflow: 'hidden',
		width: 70,
		height: 70,
		marginBottom: 10,
	},
	avatar: {
		width: 70,
		height: 70,
		paddingHorizontal: 0,
		paddingBottom: 0,
		paddingRight: 0,
	},
	imageStyle: {
		width: width,
		height: 30
	},
	content:{
		backgroundColor: '#fff',
		flexWrap:'wrap',
		flexDirection: 'row',
	},
	itemRow: {
		alignItems:'center',
		justifyContent: 'center',
		width:boxW,
		height:boxW,
		marginLeft:vMargin
	},
	icon: {
		width: 30,
		height: 30,
		marginBottom: 10
	},
	flash: {
		flex: 1,
		flexDirection: 'row',
		alignItems: 'center'
	},
	tabBarIcon: {
		width: 19,
		height: 19,
	},
	text: {
		fontSize: 12
	}
});
