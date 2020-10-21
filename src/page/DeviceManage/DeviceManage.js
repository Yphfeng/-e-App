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
	Image,
	Alert,
	Platform,
	ImageBackground,
} from 'react-native'
import NavBar from '../../common/NavBar'
import Item from '../../common/Item'
import Toast, { DURATION, } from 'react-native-easy-toast'
import Icon from 'react-native-vector-icons/Ionicons';
import * as Utils from '../../utils/utils';
import { connect, } from 'react-redux'
import * as qbDate from "../../utils/qbDate";
import {statusBarHeight, height, width, } from '../../utils/uiHeader';
import * as webSocketActions from '../../actions/webSocketActions';
import * as deviceActions from '../../actions/device/deviceActions';
const contentHeight = height - NavBar.topbarHeight - statusBarHeight;

//FontAwesome
var _that;
class DeviceManage extends Component
{
	static navigationOptions = {
		header: null,
	}
	constructor(props)
	{
		super(props);
		this.state = {
			userDeviceList: [],
			display: false,
			user: this.props.user,
			socketMsg: this.props.socketMsg,
		}
		this.guardian = null;
	}
	componentWillMount()
	{
		BackHandler.addEventListener('hardwareBackPress', this.onBackAndroid);
	}
	componentDidMount()
	{

		_that = this;
		var guardian = this.props.navigation.state.params ? this.props.navigation.state.params.guardian : null;

		var dic = new Object();
		if (guardian)
		{
			this.guardian = guardian;
			dic.armariumScienceSession = guardian.userToken;
			this.guardian = guardian;
		}
		this.props.getUserDeviceList(dic, this.onFetchCallback);
		console.log(this.props, '收到的数据状态', guardian);


	}

	refresh = () => {
		console.log('刷新了恶趣味的')
		var dic = new Object();
		this.props.getUserDeviceList(dic, this.onFetchCallback);
	}

	onFetchCallback = res => {
		console.log(res, '用户的设备')
		this.setState({
			userDeviceList: res.data,
			display: true,
		})
	}

	shouldComponentUpdate(nextProps, nextState)
	{
		console.log(nextProps, nextState, this.state, this.props, '更新2312122')
		return true;
	}
	componentWillReceiveProps(nextProps)
	{
		console.log(nextProps, '收到的新属性12312312312')
		this.setState({
			user: nextProps.user,
			socketMsg: nextProps.socketMsg,
			connectedDevice: nextProps.connectedDevice,
		})
		if (nextProps.socketMsg && nextProps.socketMsg.sn == 7 && nextProps.socketMsg !== this.props.socketMsg)
		{
			if (nextProps.socketMsg.url == "设备管理1")
			{
				var index = nextProps.socketMsg.a;
				var item = this.state.userDeviceList[index];
				this.props.navigation.navigate("DeviceManageDetail", {item: item, refreshData: function ()
				{
					_that.refresh();//A页面的刷新方法
				},  });
			}
		}
	}


	componentWillUnmount()
	{
		BackHandler.removeEventListener('hardwareBackPress', this.onBackAndroid);
		this.didBlurSubscription && this.didBlurSubscription.remove();
	}

	onBackAndroid = () =>
	{
		this.props.navigation.goBack();
		return true;
	};

	back()
	{
		this.props.navigation.pop();
	}
	//弹出提示
	alert(text,callback)
	{
		Alert.alert('提示',text,[{ text:'确定',onPress:()=>{ callback()} },{text: '取消',onPress: () => {}}]);
	}
	addDevice()
	{
		if (this.guardian)
		{
			this.props.navigation.navigate("BleSearchResultPage", {guardian: this.guardian, })
			this.props.deviceSend(7, this.guardian.underGuardian, this.state.user.user_id, '绑定解绑设备', '设备管理2', 0);
			return;
		}
		this.props.navigation.navigate("BleAddMethodsPage")
	}

	goDetail(res)
	{
		var _that = this;
		var user = this.state.user;
		var guardian = this.props.navigation.state.params ? this.props.navigation.state.params.guardian : null;

		this.props.navigation.navigate("DeviceManageDetail", {item: res.item, guardian: guardian, refreshData: function ()
		{
			_that.refresh();//A页面的刷新方法
		},  });
		if (guardian)
		{
			this.props.deviceSend(7, guardian.underGuardian, user.user_id, '绑定解绑设备', '设备管理1', 0, res.a )
		}

	}

	render()
	{
		let list = null, connectText = null;
		if (!this.state.display)
		{
			list = null
		}
		else
		{
			console.log(this.state.userDeviceList, '123123122我去我企鹅')
			if (!this.state.userDeviceList || (this.state.userDeviceList && this.state.userDeviceList.length < 1))
			{
				return (
					<View style={{flex: 1, backgroundColor: "#fff"}}>
						<View style={styles.sBar} backgroundColor={'#24a090'}/>
						<NavBar
							title="设备列表"
							leftIcon="ios-arrow-back"
							leftPress={this.back.bind(this)}
						/>
						<View style={styles.bg}>
							<Image
								source={require('../../img/bg.png')}
								style={{height: 220, width: width, }}
								resizeMode="center" />
							<Text>暂无设备信息</Text>
							<Text>请进行添加设备</Text>
						</View>
						<View style={{height: 100, justifyContent: 'center', alignItems: 'center', }}>
							<TouchableOpacity style={styles.btnAdd} onPress={this.addDevice.bind(this)}>
								<Text style={{color: '#fff'}}>添加绑定</Text>
							</TouchableOpacity>
						</View>

						<Toast ref="toast" />
					</View>
				)
			}
			list = this.state.userDeviceList.map((item, index) =>
			{
				var time = qbDate.DateFormat(item.bind_time, 0);
				if (this.props.connectStatus == 4)
				{
					if (item.device_sn == this.props.connectedDevice.device_sn)
					{
						connectText = (<Text style={{borderColor: '#24a090', borderRadius: 10, paddingHorizontal: 6,paddingVertical: 2,borderWidth: 1,color: '#24a090',fontSize: 12,fontWeight: 'bold',marginLeft: 5}}>已连接</Text>)
					}
					else
					{
						connectText = null;
					}
				}
				else
				{
					connectText = null;
				}
				return (
					<TouchableOpacity style={styles.list} key={item.device_sn} onPress={this.goDetail.bind(this, {item: item, index: index, })}>
						<View style={styles.contentLeft}>
							<View style={styles.imgStyle}>
								<Image source={item.isCicle ? require('../../img/D98F75F2422DFAA6EDECFB07E4EC6FEC.png') : require('../../img/4504C9A05948F7484AED647093D6F3A9.png')} roundAsCircle={true} style={styles.img} />
							</View>
							<View style={styles.listContent}>
								<View style={{flexDirection: 'row',justifyContent: 'center',alignItems: 'center'}}>
									<Text style={styles.textTitle}>{item.prevName}号</Text>
									<Text numberOfLines={1} style={{ color: '#000', fontSize: 18, }}>{item.device_alias ? item.device_alias : item.device_name }</Text>
									{connectText}
								</View>
								<Text style={{ paddingVertical: 8, fontSize: 12, }}>设备编号：{item.device_sn}</Text>
								<View style={{flexDirection: "row", }}>
									<Text style={{ paddingRight: 8, fontSize: 12, }}>绑定时间：{time}</Text>
								</View>
							</View>
						</View>
						<View><Icon name="ios-arrow-forward" size={24} color="#B1B1B1"></Icon></View>
						{/*<TouchableOpacity style={{paddingVertical: 10,width: width,justifyContent: "center",alignItems: 'center'}} onPress={this.unBind.bind(this)}>
							<Text style={{fontSize: 12}}>解除绑定</Text>
				</TouchableOpacity>*/}
					</TouchableOpacity>
				)
			})

		}

		return (
			<View style={{flex: 1, backgroundColor: "#f3f3f3"}}>
				<View style={styles.sBar} backgroundColor={'#24a090'}/>
				<NavBar
					title="设备列表"
					leftIcon="ios-arrow-back"
					leftPress={this.back.bind(this)}
				/>
				<ScrollView style={{height: contentHeight - 100, }}>
					<View style={{flexDirection: 'column', backgroundColor: '#F5F5F5',marginTop: 10, }}>
						{list}
					</View>
				</ScrollView>
				<View style={{height: 100, justifyContent: 'center', alignItems: 'center', }}>
					<TouchableOpacity style={styles.btnAdd} onPress={this.addDevice.bind(this)}>
						<Text style={{color: '#fff'}}>添加绑定</Text>
					</TouchableOpacity>
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
		msg: state.ble.deviceMsg,
		connectStatus: state.ble.connectStatus,
		user: state.loginIn.user,
		socketMsg: state.webSocketReducer.socketMsg,
		connectedDevice: state.ble.connectedDevice,
	}
}

function mapDispatchToProps(dispatch)
{
	return {
		getUserDeviceList: (dic, callback) => dispatch(deviceActions.getUserDeviceList(dic, callback)),
		deviceSend: (a, b, c, d, e, f, g, h) => dispatch(webSocketActions.deviceSend(a, b, c, d, e, f, g, h)),
		remoteLoading: (status, text) => dispatch(webSocketActions.remoteLoading(status, text)),

	}
}

export default connect(mapStateToProps,mapDispatchToProps)(DeviceManage)


const styles = StyleSheet.create({
	title: {
		paddingHorizontal: 16,
		paddingVertical: 8,
		color: "#666",
	},
	sBar: {
		height: statusBarHeight,
		width: width,
	},
	list: {
		flexDirection: 'row',
		justifyContent: 'space-around',
		alignItems: 'center',
		width: width - 20,
		marginLeft: 10,
		marginRight: 10,
		marginBottom: 10,
		backgroundColor: '#fff',
		paddingHorizontal: 10,
		borderRadius: 8,
	},
	contentLeft: {
		flex: 1,
		flexDirection: 'row',
		justifyContent: 'flex-start',
		alignItems: 'center',
		paddingTop: 20,
		paddingBottom: 20,
		borderColor: '#f4f4f4',

	},
	hr: {
		flexDirection: 'row',
		justifyContent: 'flex-end',
		alignItems: 'center',
	},
	imgStyle: {
		width: 65,
		height: 65,
		marginRight: 10,
		borderRadius: 50,
		borderWidth: 1,
		borderColor: '#ccc',
		flexDirection: 'column',
		justifyContent: 'center',
		alignItems: 'center',

	},
	img: {
		width: 65,
		height: 65,
	},
	listContent: {
		flexDirection: 'column',
		justifyContent: 'center',
		alignItems: 'flex-start',
		flex: 1,
	},
	btnAdd: {
		height: 44,
		width: width - 40,
		backgroundColor: '#24a090',
		borderRadius: 20,
		justifyContent: 'center',
		alignItems: 'center',
	},
	textTitle: {
		fontSize: 18,
		color: '#000',
	},
	bg: {
		width: width,
		height: height - statusBarHeight - 100 - NavBar.topbarHeight,
		justifyContent: 'center',
		alignItems: 'center',
	}
});


class List extends Component {
	constructor(props){
		super(props)
		this.state = {

		}
	}

	shouldComponentUpdate(nextProps, nextState)
	{
		if (this.props.userDeviceList == nextProps.userDeviceList)
		{
			return false
		}
		return true
	}

	render(){
		const { userDeviceList, } = this.props
		return (
			<div>
			{
				data.map((item,i)=>
					<div key={i}>
						<span>{item.name}</span>
						<span>{item.age}</span>
					</div>
				)
			}
			</div>
		)
	}

}
