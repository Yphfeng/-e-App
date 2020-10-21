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
} from 'react-native'
import NavBar from '../../common/NavBar'
import Item from '../../common/Item'
import Toast, { DURATION, } from 'react-native-easy-toast'
import Icon from 'react-native-vector-icons/Ionicons';

import { connect, } from 'react-redux'
import {unbindDevice,unbindIng, disconnectBle, syncDisconnect, } from '../../actions/device/bleActions';
import * as deviceActions from '../../actions/device/deviceActions';

import {statusBarHeight, height, width, } from '../../utils/uiHeader';

const contentHeight = height - NavBar.topbarHeight - statusBarHeight;

//FontAwesome
class DeviceList extends Component
{
	static navigationOptions = {
		header: null,
	}
	constructor(props) {
		super(props);
		this.state = {
			display: false,
			userDeviceList: [],
		}
	}
	componentWillMount()
	{


		BackHandler.addEventListener('hardwareBackPress', this.onBackAndroid);
	}
	componentDidMount()
	{

		var dic = new Object();
		this.props.getUserDeviceList(dic, this.onFetchCallback);
		console.log(this.props, '收到的数据状态');

	}

	onFetchCallback = res =>
	{
		console.log(res, '获取的设备');
		this.setState({
			userDeviceList: res.data,
			display: true,
		})
	}

	componentWillUnmount() {
		BackHandler.removeEventListener('hardwareBackPress', this.onBackAndroid);
		this.didBlurSubscription && this.didBlurSubscription.remove();
	}

	onBackAndroid = () => {
		this.props.navigation.goBack();
		return true;
	};

	back() {
		this.props.navigation.pop();
	}
	//弹出提示
	alert(text,callback)
	{
		Alert.alert('提示',text,[{ text:'确定',onPress:()=>{ callback()} },{text: '取消',onPress: () => {}}]);
	}
	goData(res)
	{
		var type = this.props.navigation.state.params.type;
		var item = res.item;
		if (type === 'heart')
		{
			this.props.navigation.navigate("HeartObserve", {sn: item.device_sn, })
		}
		else if (type === 'laser')
		{
			this.props.navigation.navigate("LaserObserve", {sn: item.device_sn, })
		}
		else
		{
			this.props.navigation.navigate("SportsObserve", {sn: item.device_sn, })
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
			if (!this.state.userDeviceList)
			{
				list = (
					<View style={{height: contentHeight - 100,justifyContent:'center',alignItems:'center'}}>
						<Text>暂无绑定设备</Text>
					</View>)
			}
			else if (this.state.userDeviceList && this.state.userDeviceList.length < 1)
			{
				list = (
					<View style={{height: contentHeight - 100,justifyContent:'center',alignItems:'center'}}>
						<Text>暂无绑定设备</Text>
					</View>)
			}
			else
			{
				list = this.state.userDeviceList.map((item, index) => {
					if (this.props.connectStatus == 4)
					{
						if (item.device_sn === this.props.connectedDevice.device_sn)
						{
							connectText = (<Text style={{borderColor: '#24a090',borderRadius: 10,paddingHorizontal: 6,paddingVertical: 2,borderWidth: 1,color: '#24a090',fontSize: 12,fontWeight: 'bold',marginLeft: 5}}>已连接</Text>)
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
						<TouchableOpacity style={styles.list} key={item.device_sn} onPress={this.goData.bind(this, {item: item, })}>
							<View style={styles.contentLeft}>
								<View style={styles.imgStyle}>
									<Image source={item.isCicle ? require('../../img/D98F75F2422DFAA6EDECFB07E4EC6FEC.png') : require('../../img/4504C9A05948F7484AED647093D6F3A9.png')} roundAsCircle={true} style={styles.img} />
								</View>
								<View style={styles.listContent}>
									<View style={{flexDirection: 'row',justifyContent: 'center',alignItems: 'center'}}>
										<Text numberOfLines={1} style={{ color: '#000',fontSize: 18, }}>{item.prevName}号{item.device_alias ? item.device_alias : item.device_name }</Text>
										{connectText}
									</View>
									<Text style={{ color: '#7f8389',fontSize: 12}}>设备编号：{item.device_sn}</Text>
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
		}

		return (
			<View style={{flex: 1, backgroundColor: "#f3f3f3"}}>
				<View style={styles.sBar} backgroundColor={'#24a090'}/>
				<NavBar
					title="选择设备"
					leftIcon="ios-arrow-back"
					leftPress={this.back.bind(this)}
				/>
				<ScrollView style={{height: contentHeight - 100, }}>
					<View style={{flexDirection: 'column', backgroundColor: '#F5F5F5',marginTop: 10, }}>
						{list}
					</View>
				</ScrollView>
				<Toast ref="toast" />
			</View>
		)
	}
}

function mapStateToProps(state)
{
	console.log(state,'子组件的属性')
	return {
		msg: state.ble.deviceMsg,
		device_sn: state.ble.device_sn,
		deviceBindStatus: state.ble.deviceBindStatus,
		connectStatus: state.ble.connectStatus,
		untied: state.ble.untied,
		connectedDevice: state.ble.connectedDevice,
	}
}

function mapDispatchToProps(dispatch)
{
	return {
		getUserDeviceList: (dic, callback) => dispatch(deviceActions.getUserDeviceList(dic, callback)),
		unbindDevice: (device_sn) => dispatch(unbindDevice(device_sn)),
		disconnectBle: () => dispatch(disconnectBle()),
		syncDisconnect: () => dispatch(syncDisconnect())

	}
}

export default connect(mapStateToProps,mapDispatchToProps)(DeviceList)


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
		justifyContent: 'space-around',
		alignItems: 'flex-start',
		height: 65,
	},
	btnAdd: {
		height: 40,
		width: width - 40,
		backgroundColor: '#24a090',
		borderRadius: 20,
		justifyContent: 'center',
		alignItems: 'center',
	},
});
